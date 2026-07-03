import AppShell from "@/components/AppShell";
import { getPlaces } from "@/server/actions/places";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Star, ChevronLeft, ArrowRight, Plane } from "lucide-react";
import { WeatherWidget } from "@/components/features/WeatherWidget";

const PROVINCE_EMOJI: Record<string, string> = {
  "เชียงใหม่": "🌿", "กรุงเทพ": "🏙️", "กรุงเทพมหานคร": "🏙️",
  "ภูเก็ต": "🏖️", "เกาะสมุย": "🌴", "กระบี่": "🌊",
  "เชียงราย": "⛰️", "อยุธยา": "🏛️", "พัทยา": "🎡",
  "หัวหิน": "🌅", "ขอนแก่น": "🌻",
};

const CATEGORY_LABEL: Record<string, string> = {
  attraction: "สถานที่เที่ยว",
  restaurant: "ร้านอาหาร",
  cafe: "คาเฟ่",
  hotel: "ที่พัก",
  activity: "กิจกรรม",
};

function priceSymbol(n: number) {
  return "฿".repeat(n);
}

export async function generateMetadata(
  { params }: { params: Promise<{ province: string }> }
): Promise<Metadata> {
  const { province } = await params;
  const decoded = decodeURIComponent(province);
  return {
    title: `ที่เที่ยว${decoded} `,
    description: `สถานที่ท่องเที่ยว ร้านอาหาร และคาเฟ่ใน${decoded} รีวิวโดยนักเดินทาง YourTrip`,
    alternates: { canonical: `/explore/${province}` },
  };
}

export default async function ProvincePage(
  { params }: { params: Promise<{ province: string }> }
) {
  const { province } = await params;
  const decoded = decodeURIComponent(province);

  const [attractionsRes, restaurantsRes, cafesRes] = await Promise.all([
    getPlaces({ province: decoded, category: "attraction", take: 8 }),
    getPlaces({ province: decoded, category: "restaurant", take: 6 }),
    getPlaces({ province: decoded, category: "cafe", take: 6 }),
  ]);

  const attractions = attractionsRes.data;
  const restaurants = restaurantsRes.data;
  const cafes = cafesRes.data;
  const allPlaces = [...attractions, ...restaurants, ...cafes];
  const emoji = PROVINCE_EMOJI[decoded] ?? "📍";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1C658C] to-[#398AB9] px-6 pt-10 pb-8 text-white">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-white/70 text-sm mb-4 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
            สำรวจทั้งหมด
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{emoji}</span>
            <h1 className="text-2xl font-bold">{decoded}</h1>
          </div>
          <p className="text-white/80 text-sm mb-4">
            {allPlaces.length} สถานที่ · รีวิวโดยนักเดินทาง YourTrip
          </p>
          <Link
            href={`/trips/new?destination=${encodeURIComponent(decoded)}`}
            className="inline-flex items-center gap-2 bg-white text-[#1C658C] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/90 transition"
          >
            <Plane className="w-4 h-4" />
            วางแผนทริป{decoded}
          </Link>
        </div>

        {/* Weather */}
        <div className="px-4 pt-4">
          <WeatherWidget destination={decoded} />
        </div>

        <div className="px-4 py-6 space-y-8">
          {/* Attractions */}
          {attractions.length > 0 && (
            <Section
              title="🗺️ สถานที่เที่ยว"
              places={attractions}
              province={decoded}
              category="attraction"
            />
          )}

          {/* Restaurants */}
          {restaurants.length > 0 && (
            <Section
              title="🍜 ร้านอาหาร"
              places={restaurants}
              province={decoded}
              category="restaurant"
            />
          )}

          {/* Cafes */}
          {cafes.length > 0 && (
            <Section
              title="☕ คาเฟ่"
              places={cafes}
              province={decoded}
              category="cafe"
            />
          )}

          {allPlaces.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl mb-4 block">🔍</span>
              <p className="text-sm">ยังไม่มีสถานที่ใน{decoded}</p>
              <p className="text-xs mt-1 text-gray-300">ลองดูจังหวัดอื่นหรือค้นหาเพิ่มเติม</p>
              <Link
                href="/explore"
                className="inline-block mt-4 text-sm text-[#398AB9] font-medium hover:underline"
              >
                ดูสถานที่ทั้งหมด →
              </Link>
            </div>
          )}

          {/* Nearby Provinces CTA */}
          <div className="bg-[#398AB9]/5 border border-[#398AB9]/15 rounded-2xl px-4 py-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
              จังหวัดยอดนิยม
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PROVINCE_EMOJI)
                .filter(([p]) => p !== decoded && p !== "กรุงเทพมหานคร")
                .slice(0, 8)
                .map(([p, em]) => (
                  <Link
                    key={p}
                    href={`/explore/${encodeURIComponent(p)}`}
                    className="flex items-center gap-1.5 text-sm bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded-full hover:border-[#398AB9] hover:text-[#398AB9] transition"
                  >
                    {em} {p}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ─── Section component ────────────────────────────────────────────────────────

function Section({
  title,
  places,
  province,
  category,
}: {
  title: string;
  places: Awaited<ReturnType<typeof getPlaces>>["data"];
  province: string;
  category: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800 dark:text-slate-200">{title}</h2>
        <Link
          href={`/explore?province=${encodeURIComponent(province)}&category=${category}`}
          className="flex items-center gap-1 text-xs text-[#398AB9] font-medium hover:underline"
        >
          ดูทั้งหมด <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {places.slice(0, 4).map((place) => (
          <Link
            key={place.id}
            href={`/place/${place.slug}`}
            className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="aspect-[4/3] bg-gray-100 dark:bg-slate-700 overflow-hidden relative">
              {place.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={place.coverImage}
                  alt={place.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  {PROVINCE_EMOJI[province] ?? "📍"}
                </div>
              )}
              {place.isFeatured && (
                <span className="absolute top-2 left-2 text-[10px] font-bold bg-amber-400 text-white px-1.5 py-0.5 rounded-full">
                  ⭐ แนะนำ
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-2.5">
              <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 line-clamp-1">
                {place.name}
              </p>
              <div className="flex items-center justify-between mt-1">
                {place.rating > 0 ? (
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[11px] font-medium text-gray-600 dark:text-slate-400">
                      {place.rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-0.5">
                      ({place.reviewCount})
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-400 dark:text-slate-500">ใหม่</span>
                )}
                <span className="text-[11px] text-amber-500 font-medium">
                  {priceSymbol(place.priceRange || 1)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate">
                  {CATEGORY_LABEL[place.category] ?? place.category}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
