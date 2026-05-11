"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { Search, Star, MapPin, SlidersHorizontal, X, LayoutGrid, List, ArrowUpDown } from "lucide-react";

/* ── data ──────────────────────────────────────────────── */
const categories = [
  { id: "all",       label: "ทั้งหมด",        emoji: "🌍" },
  { id: "nature",    label: "สถานที่เที่ยว",   emoji: "🏔️" },
  { id: "food",      label: "ร้านอาหาร",      emoji: "🍜" },
  { id: "cafe",      label: "คาเฟ่",          emoji: "☕" },
  { id: "hotel",     label: "ที่พัก",          emoji: "🏨" },
  { id: "activity",  label: "กิจกรรม",         emoji: "🤿" },
];

const regions = ["ทั้งหมด", "ภาคเหนือ", "ภาคกลาง", "ภาคใต้", "ภาคอีสาน", "ต่างประเทศ"];

const places = [
  {
    slug: "doi-ang-khang", name: "ดอยอ่างขาง", category: "nature",
    location: "เชียงใหม่", region: "ภาคเหนือ",
    rating: 4.8, reviews: 2840, price: "฿฿", isOpen: true,
    tags: ["ธรรมชาติ", "อากาศเย็น"],
    img: "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "bali-terraces", name: "นาขั้นบันไดบาหลี", category: "nature",
    location: "บาหลี, อินโดนีเซีย", region: "ต่างประเทศ",
    rating: 4.9, reviews: 5120, price: "฿฿", isOpen: true,
    tags: ["UNESCO", "ไร่นา"],
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "swiss-alps", name: "Swiss Alps", category: "nature",
    location: "สวิตเซอร์แลนด์", region: "ต่างประเทศ",
    rating: 4.9, reviews: 8760, price: "฿฿฿฿", isOpen: true,
    tags: ["Hiking", "หิมะ"],
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "santorini", name: "ซานโตรีนี", category: "nature",
    location: "กรีซ", region: "ต่างประเทศ",
    rating: 4.8, reviews: 12400, price: "฿฿฿", isOpen: true,
    tags: ["ทะเล", "โรแมนติก"],
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "phuket-beach", name: "หาดกะรน", category: "nature",
    location: "ภูเก็ต", region: "ภาคใต้",
    rating: 4.6, reviews: 3200, price: "฿฿", isOpen: true,
    tags: ["ทะเล", "ดำน้ำ"],
    img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "halong-bay", name: "ฮาลองเบย์", category: "nature",
    location: "เวียดนาม", region: "ต่างประเทศ",
    rating: 4.7, reviews: 6890, price: "฿฿฿", isOpen: true,
    tags: ["ล่องเรือ", "UNESCO"],
    img: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "khao-yai", name: "เขาใหญ่", category: "nature",
    location: "นครราชสีมา", region: "ภาคกลาง",
    rating: 4.7, reviews: 4100, price: "฿฿", isOpen: true,
    tags: ["ป่า", "น้ำตก"],
    img: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "ramen-chiangmai", name: "Ramen Ichiban", category: "food",
    location: "เชียงใหม่", region: "ภาคเหนือ",
    rating: 4.5, reviews: 891, price: "฿฿", isOpen: true,
    tags: ["ราเมน", "ญี่ปุ่น"],
    img: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "cafe-amazon", name: "Cafe Amazon", category: "cafe",
    location: "ทั่วประเทศ", region: "ภาคกลาง",
    rating: 4.3, reviews: 15600, price: "฿", isOpen: true,
    tags: ["กาแฟ", "ทั่วไป"],
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "forest-cafe", name: "Forest Café", category: "cafe",
    location: "เชียงใหม่", region: "ภาคเหนือ",
    rating: 4.7, reviews: 1240, price: "฿฿", isOpen: false,
    tags: ["คาเฟ่", "ธรรมชาติ"],
    img: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "beach-resort", name: "Amanpuri Resort", category: "hotel",
    location: "ภูเก็ต", region: "ภาคใต้",
    rating: 4.9, reviews: 2100, price: "฿฿฿฿", isOpen: true,
    tags: ["ลักชัวรี่", "ริมทะเล"],
    img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "diving-koh-tao", name: "ดำน้ำเกาะเต่า", category: "activity",
    location: "สุราษฎร์ธานี", region: "ภาคใต้",
    rating: 4.8, reviews: 3400, price: "฿฿฿", isOpen: true,
    tags: ["ดำน้ำ", "PADI"],
    img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "phu-kradueng", name: "ภูกระดึง", category: "nature",
    location: "เลย", region: "ภาคอีสาน",
    rating: 4.7, reviews: 2900, price: "฿฿", isOpen: true,
    tags: ["Hiking", "ป่า"],
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "mekong-sunset", name: "ชมพระอาทิตย์ตกแม่น้ำโขง", category: "nature",
    location: "หนองคาย", region: "ภาคอีสาน",
    rating: 4.6, reviews: 1200, price: "฿", isOpen: true,
    tags: ["พระอาทิตย์ตก", "แม่น้ำโขง"],
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "sam-phan-bok", name: "สามพันโบก", category: "nature",
    location: "อุบลราชธานี", region: "ภาคอีสาน",
    rating: 4.5, reviews: 890, price: "฿", isOpen: true,
    tags: ["แกรนด์แคนยอน", "แม่น้ำโขง"],
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "ayutthaya", name: "อยุธยา", category: "nature",
    location: "พระนครศรีอยุธยา", region: "ภาคกลาง",
    rating: 4.7, reviews: 8200, price: "฿฿", isOpen: true,
    tags: ["ประวัติศาสตร์", "วัด"],
    img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "isaan-food-korat", name: "ร้านส้มตำตำมั่ว", category: "food",
    location: "นครราชสีมา", region: "ภาคอีสาน",
    rating: 4.6, reviews: 2100, price: "฿", isOpen: true,
    tags: ["ส้มตำ", "อาหารอีสาน"],
    img: "https://images.unsplash.com/photo-1567982047351-76b6f93e38ee?auto=format&fit=crop&w=600&q=80",
  },
];

type SortKey = "rating" | "reviews" | "price_asc" | "price_desc";

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "K" : String(n);
}

function PlaceCard({ place }: { place: typeof places[0] }) {
  return (
    <Link href={`/place/${place.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/80 transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={place.img} alt={place.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* price badge */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {place.price}
        </div>

        {/* open/close */}
        <div className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          place.isOpen ? "bg-emerald-500/90 text-white" : "bg-gray-500/90 text-white"
        }`}>
          {place.isOpen ? "เปิดอยู่" : "ปิด"}
        </div>

        {/* rating overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-white text-xs font-bold">{place.rating}</span>
          <span className="text-white/70 text-[10px]">({fmt(place.reviews)})</span>
        </div>
      </div>

      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm truncate">{place.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-[#398AB9] flex-shrink-0" />
          <span className="text-[11px] text-gray-400 truncate">{place.location}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {place.tags.map((t) => (
            <span key={t} className="text-[10px] bg-[#398AB9]/8 text-[#398AB9] px-2 py-0.5 rounded-full font-medium">
              #{t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

/* ── page ──────────────────────────────────────────────── */
export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeRegion, setActiveRegion] = useState("ทั้งหมด");
  const [showFilter, setShowFilter] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = places
    .filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const matchReg = activeRegion === "ทั้งหมด" || p.region === activeRegion;
      const matchQ = !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.location.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      return matchCat && matchReg && matchQ;
    })
    .sort((a, b) => {
      if (sortKey === "rating") return b.rating - a.rating;
      if (sortKey === "reviews") return b.reviews - a.reviews;
      const priceLen = (s: string) => s.length;
      if (sortKey === "price_asc") return priceLen(a.price) - priceLen(b.price);
      if (sortKey === "price_desc") return priceLen(b.price) - priceLen(a.price);
      return 0;
    });

  return (
    <AppShell>
      {/* mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <span className="text-lg font-bold text-[#398AB9]">สำรวจ</span>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">

        {/* desktop title */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">สำรวจสถานที่</h1>
        </div>

        {/* ── Search bar ── */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาสถานที่, ร้านอาหาร, คาเฟ่..."
              className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10 transition"
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilter(!showFilter)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition ${
              showFilter || activeRegion !== "ทั้งหมด"
                ? "bg-[#398AB9] border-[#398AB9] text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-[#398AB9]"
            }`}>
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* ── Region filter (collapsible) ── */}
        {showFilter && (
          <div className="mb-4 bg-white border border-gray-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">ภูมิภาค</p>
            <div className="flex flex-wrap gap-2">
              {regions.map((r) => (
                <button key={r} onClick={() => setActiveRegion(r)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                    activeRegion === r
                      ? "bg-[#398AB9] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Category tabs ── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none mb-5 pb-1">
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium flex-shrink-0 transition ${
                activeCategory === c.id
                  ? "bg-[#398AB9] text-white shadow-sm shadow-[#398AB9]/30"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-[#398AB9] hover:text-[#398AB9]"
              }`}>
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* ── Results + controls ── */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <p className="text-sm text-gray-500">
            พบ <span className="font-semibold text-gray-900">{filtered.length}</span> สถานที่
            {activeRegion !== "ทั้งหมด" && <span className="text-[#398AB9]"> ใน{activeRegion}</span>}
          </p>
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1.5">
              <ArrowUpDown className="w-3 h-3 text-gray-400" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="text-xs text-gray-600 bg-transparent outline-none cursor-pointer"
              >
                <option value="rating">คะแนนสูงสุด</option>
                <option value="reviews">รีวิวมากสุด</option>
                <option value="price_asc">ราคา ต่ำ→สูง</option>
                <option value="price_desc">ราคา สูง→ต่ำ</option>
              </select>
            </div>
            {/* View toggle */}
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 ${viewMode === "grid" ? "bg-[#398AB9] text-white" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 ${viewMode === "list" ? "bg-[#398AB9] text-white" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
            {(query || activeCategory !== "all" || activeRegion !== "ทั้งหมด") && (
              <button onClick={() => { setQuery(""); setActiveCategory("all"); setActiveRegion("ทั้งหมด"); }}
                className="text-xs text-[#398AB9] hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> ล้าง
              </button>
            )}
          </div>
        </div>

        {/* ── Grid / List view ── */}
        {filtered.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((p) => (
                <PlaceCard key={p.slug} place={p} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <Link key={p.slug} href={`/place/${p.slug}`}
                  className="flex gap-3 bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-md transition-shadow group">
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                      <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.isOpen ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                        {p.isOpen ? "เปิด" : "ปิด"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#398AB9]" />
                      <span className="text-xs text-gray-400">{p.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-gray-700">{p.rating}</span>
                        <span className="text-[10px] text-gray-400">({fmt(p.reviews)})</span>
                      </div>
                      <span className="text-xs text-gray-400">{p.price}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] bg-[#398AB9]/8 text-[#398AB9] px-2 py-0.5 rounded-full">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 font-medium">ไม่พบสถานที่ที่ค้นหา</p>
            <p className="text-sm text-gray-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
