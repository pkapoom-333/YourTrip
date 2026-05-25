import { getPlaceBySlug, type PlaceDetail } from "@/server/actions/places";
import PlaceDetailClient, { type PlaceData } from "./PlaceDetailClient";

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

// ─── Mock fallback (shown when DB not configured) ─────────────────────────────
const MOCK_PLACES: Record<string, PlaceData> = {
  "doi-ang-khang": {
    id: "mock-doi-ang-khang",
    name: "ดอยอ่างขาง", category: "สถานที่เที่ยว", categoryEn: "Nature & Scenic",
    location: "อำเภออางขาง, เชียงใหม่", rating: 4.8, reviewCount: 2840,
    priceRange: "฿฿", priceNote: "ค่าเข้าชม 50฿ / คัน", isOpen: true, openUntil: "18:00",
    phone: "053-450-107", website: "doiangkhang.com",
    description: "ดอยอ่างขาง เป็นดอยที่อยู่บนเทือกเขาแดนลาวในอำเภออางขาง จังหวัดเชียงใหม่ ความสูงจากระดับน้ำทะเลประมาณ 1,400-1,928 เมตร อากาศหนาวเย็นตลอดปี โดยเฉพาะช่วงฤดูหนาว อุณหภูมิอาจลดลงต่ำกว่า 0°C",
    descriptionEn: "Doi Ang Khang is a mountain in Ang Khang District, Chiang Mai Province, with elevation of 1,400–1,928 m. Known for cool weather year-round and beautiful flower gardens at the Royal Agricultural Station.",
    hours: [{ day: "จันทร์–อาทิตย์", time: "06:00–18:00" }],
    images: [
      "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
    ],
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30552.07!2d99.0356!3d19.4954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30d86ef9e8be1d15%3A0x9a17e2aeefd4ca75!2z4Lio4Liy4Lij4LiH4LiI4Lin4Lix4LiH!5e0!3m2!1sth!2sth!4v1600000000000",
    transport: {
      car: "จากเชียงใหม่ใช้เส้นทาง 107 (เชียงใหม่–ฝาง) ถึงอำเภอฝาง แล้วเลี้ยวซ้ายเข้าทาง 1249 ขึ้นดอยอ่างขาง ระยะทางประมาณ 153 กม.",
      motorcycle: "ถนนเป็นทางคดเคี้ยวและชัน ไม่แนะนำมอเตอร์ไซค์สำหรับผู้ขับขี่ไม่ชำนาญ",
      bus: "นั่งรถทัวร์จากอาเขตเชียงใหม่ไปฝาง แล้วต่อสองแถวขึ้นดอย",
      songthaew: "สองแถวท้องถิ่นจากตัวอำเภอฝาง ราคาประมาณ 80–120 บาท/คน",
    },
    caution: [
      "ถนนขึ้นดอยคดเคี้ยวและชัน ควรขับรถช้าๆ และระวังรถสวนทาง",
      "ช่วงฤดูหนาว (พ.ย.–ก.พ.) อากาศหนาวมาก ควรเตรียมเสื้อกันหนาวหนาๆ",
      "ห้ามนำสุนัขหรือสัตว์เลี้ยงเข้าพื้นที่สถานีเกษตรหลวง",
    ],
    parking: { available: true, spaces: "มีลานจอดรถกว้างขวาง", fee: "ฟรี (รวมในค่าเข้าชม)" },
    facilities: { wifi: false, ac: false, vegetarian: true, accessibility: false },
    tags: ["เที่ยวเหนือ", "ธรรมชาติ", "ดอกไม้", "อากาศเย็น"],
    nearby: [
      { name: "ดอยอินทนนท์", category: "สถานที่เที่ยว", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=400&q=70", slug: "doi-inthanon" },
      { name: "วัดร่องขุ่น", category: "สถานที่เที่ยว", img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=70", slug: "chiang-rai-white-temple" },
    ],
    reviews: [
      { id: 1, user: "free people", bg: "bg-orange-400", initials: "FP", rating: 5, time: "2 วันที่แล้ว", text: "สวยมากๆ อากาศดีเย็นสบาย ดอกไม้บานสวยงาม แนะนำให้ไปช่วงเช้าตรู่ ❄️", likes: 24, photos: 3 },
      { id: 2, user: "wanderer", bg: "bg-emerald-400", initials: "W", rating: 5, time: "1 สัปดาห์ที่แล้ว", text: "มาแล้วต้องมาอีก ทิวทัศน์สุดสวย การขับรถขึ้นดอยเป็นประสบการณ์ที่น่าตื่นเต้น", likes: 18, photos: 5 },
    ],
  },
  "bali-ubud-terraces": {
    id: "mock-bali-ubud-terraces",
    name: "นาขั้นบันไดบาหลี", category: "สถานที่เที่ยว", categoryEn: "Cultural & Heritage",
    location: "อูบุด, บาหลี, อินโดนีเซีย", rating: 4.9, reviewCount: 5120,
    priceRange: "฿฿", priceNote: "เข้าชมฟรี / ค่าไกด์ประมาณ 200,000 IDR", isOpen: true, openUntil: "17:00",
    phone: "+62-361-971-716", website: "baliwisata.com",
    description: "นาขั้นบันได Tegalalang เป็นหนึ่งในภาพที่โด่งดังที่สุดของบาหลี ได้รับการขึ้นทะเบียนเป็นมรดกโลกของยูเนสโก",
    descriptionEn: "Tegalalang Rice Terraces near Ubud is one of Bali's most iconic landscapes. A UNESCO World Heritage Site.",
    hours: [{ day: "ทุกวัน", time: "08:00–17:00" }],
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
    ],
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.5!2d115.2776!3d-8.4313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23d4b44aaa667%3A0x2b2b2b2b2b2b2b2b!2sTegalalang!5e0!3m2!1sth!2sth!4v1600000000000",
    transport: {
      car: "เช่ารถหรือใช้บริการ driver จากอูบุด ระยะทางประมาณ 10 กม.",
      motorcycle: "เช่ามอเตอร์ไซค์ในอูบุดราคาประมาณ 60,000–80,000 IDR/วัน",
      bus: "ไม่มีบริการรถสาธารณะโดยตรง แนะนำใช้ Grab หรือ Gojek",
      songthaew: "ใช้ Grab/Gojek จากอูบุด ราคาประมาณ 30,000–50,000 IDR",
    },
    caution: [
      "ระวังพ่อค้าแม่ค้าที่อาจเรียกเก็บค่าเดินเข้าพื้นที่",
      "สวมเสื้อผ้าที่เหมาะสม อาจต้องคลุมสะโพกเมื่อเข้าพื้นที่ศักดิ์สิทธิ์",
    ],
    parking: { available: true, spaces: "มีลานจอดรถเล็กๆ ใกล้ทางเข้า", fee: "5,000–10,000 IDR" },
    facilities: { wifi: true, ac: false, vegetarian: true, accessibility: false },
    tags: ["บาหลี", "ต่างประเทศ", "UNESCO"],
    nearby: [
      { name: "Sacred Monkey Forest", category: "สถานที่เที่ยว", img: "https://images.unsplash.com/photo-1549477123-6b0a3fcfc15f?auto=format&fit=crop&w=400&q=70", slug: "monkey-forest" },
    ],
    reviews: [
      { id: 1, user: "shy girl", bg: "bg-pink-400", initials: "SG", rating: 5, time: "3 วันที่แล้ว", text: "สวยงามมาก ต้องไปเช้าๆ แสงสวยมาก แนะนำ!", likes: 41, photos: 6 },
    ],
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try DB first
  const { data: dbPlace } = await getPlaceBySlug(slug);

  const placeData: PlaceData = dbPlace
    ? mapToPlaceData(dbPlace)
    : (MOCK_PLACES[slug] ?? MOCK_PLACES["doi-ang-khang"]);

  return <PlaceDetailClient place={placeData} slug={slug} />;
}
