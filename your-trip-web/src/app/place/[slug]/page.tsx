import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlaceBySlug, getNearbyPlaces, getUserCheckInStatus, type PlaceDetail } from "@/server/actions/places";
import { getSavedPlaceIds } from "@/server/actions/savedPlaces";
import PlaceDetailClient, { type PlaceData } from "./PlaceDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const { data: place } = await getPlaceBySlug(slug);
  if (!place) return { title: "สถานที่ท่องเที่ยว" };

  const title = `${place.name} — ${place.province ?? "ท่องเที่ยว"}`;
  const description = place.description?.slice(0, 160) ??
    `ข้อมูลสถานที่ ${place.name} รีวิว เวลาเปิด ราคา และการเดินทาง`;
  const coverImage = place.images[0]?.url;
  const avgRating = place.reviews?.length
    ? place.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / place.reviews.length
    : 0;

  // Branded OG image via /api/og
  const ogParams = new URLSearchParams({
    title: place.name,
    subtitle: description,
    category: place.category ?? "",
    province: place.province ?? "",
    rating: avgRating > 0 ? avgRating.toFixed(1) : "",
    type: "place",
    ...(coverImage ? { image: coverImage } : {}),
  });
  const ogImage = `${BASE_URL}/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/place/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/place/${slug}`,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: place.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// ─── Category labels ──────────────────────────────────────────────────────────
const CAT_TH: Record<string, string> = {
  attraction: "สถานที่เที่ยว", restaurant: "ร้านอาหาร",
  cafe: "คาเฟ่", hotel: "ที่พัก", activity: "กิจกรรม",
};
const CAT_EN: Record<string, string> = {
  attraction: "Attraction", restaurant: "Restaurant",
  cafe: "Café", hotel: "Hotel", activity: "Activity",
};
const PRICE_LABEL = ["", "฿", "฿฿", "฿฿฿", "฿฿฿฿"];

// ─── Country name (basic) ─────────────────────────────────────────────────────
const COUNTRY_TH: Record<string, string> = {
  TH: "ไทย", ID: "อินโดนีเซีย", JP: "ญี่ปุ่น", KR: "เกาหลี",
  CH: "สวิตเซอร์แลนด์", GR: "กรีซ", VN: "เวียดนาม", SG: "สิงคโปร์",
};

// ─── is-open helper ───────────────────────────────────────────────────────────
function checkOpen(openTime: string | null, closeTime: string | null) {
  if (!openTime || !closeTime) return { isOpen: true, openUntil: closeTime ?? "" };
  const now = new Date();
  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  return { isOpen: nowMins >= openMins && nowMins < closeMins, openUntil: closeTime };
}

// ─── Map Prisma PlaceDetail → PlaceData ──────────────────────────────────────
function mapToPlaceData(p: PlaceDetail): PlaceData {
  const { isOpen, openUntil } = checkOpen(p.openTime, p.closeTime);
  const countryName = COUNTRY_TH[p.country] ?? p.country;
  const location = [p.province, p.country !== "TH" ? countryName : null]
    .filter(Boolean).join(", ") || countryName;

  // Generate embed URL from lat/lng or use provided URL
  let mapEmbed = "";
  if (p.lat && p.lng) {
    mapEmbed = `https://maps.google.com/maps?q=${p.lat},${p.lng}&z=14&output=embed`;
  } else if (p.googleMapsUrl?.includes("embed")) {
    mapEmbed = p.googleMapsUrl;
  }

  // Build hours array
  const hours: PlaceData["hours"] =
    p.openDays.length > 0 && (p.openTime || p.closeTime)
      ? p.openDays.map((d) => ({ day: d, time: `${p.openTime ?? ""}–${p.closeTime ?? ""}` }))
      : [];

  // Map reviews
  const fmtReviewTime = (d: Date) => {
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return "วันนี้";
    if (days < 7) return `${days} วันที่แล้ว`;
    return `${Math.floor(days / 7)} สัปดาห์ที่แล้ว`;
  };

  const reviews: PlaceData["reviews"] = p.reviews.map((r, i) => ({
    id: r.id,
    user: r.user?.name ?? "นักเดินทาง",
    bg: ["bg-orange-400", "bg-pink-400", "bg-emerald-400", "bg-violet-400", "bg-sky-400"][i % 5],
    initials: (r.user?.name ?? "U").charAt(0).toUpperCase(),
    rating: r.rating,
    time: fmtReviewTime(r.createdAt),
    text: r.content ?? "",
    likes: r.likes,
    photos: 0,
    avatarUrl: r.user?.avatarUrl,
  }));

  return {
    id: p.id,
    province: p.province ?? undefined,
    name: p.name,
    category: CAT_TH[p.category] ?? p.category,
    categoryEn: CAT_EN[p.category] ?? p.category,
    location,
    rating: p.rating,
    reviewCount: p.reviewCount,
    priceRange: PRICE_LABEL[p.priceRange] ?? "฿",
    priceNote: p.entryFee != null
      ? `ค่าเข้าชม ${p.entryFee.toLocaleString()}฿`
      : "ฟรี",
    isOpen,
    openUntil,
    phone: p.phone ?? "",
    website: p.website ?? "",
    description: p.description ?? "",
    descriptionEn: p.descriptionEn ?? "",
    hours,
    images: p.images.map((img) => img.url),
    mapEmbed,
    transport: { car: "—", motorcycle: "—", bus: "—", songthaew: "—" },
    caution: [],
    parking: {
      available: p.hasParking,
      spaces: p.parkingSpots ? `${p.parkingSpots} ที่จอด` : (p.hasParking ? "มีที่จอดรถ" : ""),
      fee: p.parkingFee != null ? `${p.parkingFee}฿/ชั่วโมง` : (p.hasParking ? "ฟรี" : "ไม่มี"),
    },
    facilities: {
      wifi: p.hasWifi,
      ac: p.hasAC,
      vegetarian: p.isVegetarian,
      accessibility: p.isAccessible,
    },
    tags: [],
    nearby: [],
    reviews,
  };
}


// ─── JSON-LD schema type per category ────────────────────────────────────────
const SCHEMA_TYPE: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "CafeOrCoffeeShop",
  hotel: "LodgingBusiness",
  attraction: "TouristAttraction",
  activity: "TouristAttraction",
};

function buildJsonLd(place: PlaceData, slug: string): Record<string, unknown> {
  const type = SCHEMA_TYPE[place.categoryEn?.toLowerCase() ?? ""] ?? "TouristAttraction";
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    name: place.name,
    description: place.description || undefined,
    url: `${BASE_URL}/place/${slug}`,
    image: place.images[0] ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: place.location,
      addressCountry: "TH",
    },
  };
  if (place.rating && place.reviewCount) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: place.rating,
      reviewCount: place.reviewCount,
      bestRating: 5,
    };
  }
  if (place.hours.length > 0) {
    ld.openingHoursSpecification = place.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day,
      opens: h.time.split("–")[0]?.trim(),
      closes: h.time.split("–")[1]?.trim(),
    }));
  }
  return ld;
}


// ─── Page ─────────────────────────────────────────────
export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch place first, then nearby + saved in parallel (replaces expensive getPlaces({ take: 50 }))
  const { data: dbPlace } = await getPlaceBySlug(slug);

  if (dbPlace) {
    const [{ data: nearbyRaw }, savedIds, checkInStatus] = await Promise.all([
      getNearbyPlaces({ excludeSlug: slug, region: dbPlace.region, category: dbPlace.category }),
      getSavedPlaceIds().catch(() => [] as string[]),
      getUserCheckInStatus(dbPlace.id).catch(() => ({ hasCheckedIn: false, totalCheckIns: 0 })),
    ]);

    const nearbyPlaces = nearbyRaw.map((p) => ({
      name: p.name,
      category: p.category,
      img: p.coverImage ?? "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=400&q=70",
      slug: p.slug,
    }));

    const placeData = { ...mapToPlaceData(dbPlace), nearby: nearbyPlaces };
    const jsonLd = buildJsonLd(placeData, slug);
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PlaceDetailClient place={placeData} slug={slug} initialSaved={savedIds.includes(dbPlace.id)} />
      </>
    );
  }

  notFound();
}
