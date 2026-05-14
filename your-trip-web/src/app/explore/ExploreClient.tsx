"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Star, MapPin, SlidersHorizontal, X, LayoutGrid, List, ArrowUpDown } from "lucide-react";
import type { PlaceListItem } from "@/server/actions/places";

/* ── static data ── */
const categories = [
  { id: "all",        label: "ทั้งหมด",      emoji: "🌍" },
  { id: "attraction", label: "สถานที่เที่ยว", emoji: "🏔️" },
  { id: "restaurant", label: "ร้านอาหาร",    emoji: "🍜" },
  { id: "cafe",       label: "คาเฟ่",        emoji: "☕" },
  { id: "hotel",      label: "ที่พัก",        emoji: "🏨" },
  { id: "activity",   label: "กิจกรรม",      emoji: "🤿" },
];

const regionLabels: Record<string, string> = {
  all: "ทั้งหมด",
  north: "ภาคเหนือ",
  central: "ภาคกลาง",
  south: "ภาคใต้",
  east: "ภาคตะวันออก",
  west: "ภาคตะวันตก",
  international: "ต่างประเทศ",
};
const regions = Object.keys(regionLabels);

const priceSymbol = (n: number) => "฿".repeat(n);

type SortKey = "rating" | "reviews" | "price_asc" | "price_desc";

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "K" : String(n);
}

function PlaceCard({ place }: { place: PlaceListItem }) {
  const img = place.coverImage ??
    "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=600&q=80";

  return (
    <Link href={`/place/${place.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/80 transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={img} alt={place.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {priceSymbol(place.priceRange)}
        </div>
        {place.isFeatured && (
          <div className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#398AB9]/90 text-white">
            แนะนำ
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-white text-xs font-bold">
            {place.rating > 0 ? place.rating.toFixed(1) : "–"}
          </span>
          {place.reviewCount > 0 && (
            <span className="text-white/70 text-[10px]">({fmt(place.reviewCount)})</span>
          )}
        </div>
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm truncate">{place.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-[#398AB9] flex-shrink-0" />
          <span className="text-[11px] text-gray-400 truncate">
            {place.province ?? place.country}
          </span>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          <span className="text-[10px] bg-[#398AB9]/8 text-[#398AB9] px-2 py-0.5 rounded-full font-medium">
            {regionLabels[place.region] ?? place.region}
          </span>
          {place.hasWifi && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">WiFi</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ExploreClient({ initialPlaces }: { initialPlaces: PlaceListItem[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeRegion, setActiveRegion] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = initialPlaces
    .filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const matchReg = activeRegion === "all" || p.region === activeRegion;
      const matchQ = !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.nameEn ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (p.province ?? "").toLowerCase().includes(query.toLowerCase());
      return matchCat && matchReg && matchQ;
    })
    .sort((a, b) => {
      if (sortKey === "rating") return b.rating - a.rating;
      if (sortKey === "reviews") return b.reviewCount - a.reviewCount;
      if (sortKey === "price_asc") return a.priceRange - b.priceRange;
      if (sortKey === "price_desc") return b.priceRange - a.priceRange;
      return 0;
    });

  const hasFilter = query || activeCategory !== "all" || activeRegion !== "all";

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
      {/* desktop title */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">สำรวจสถานที่</h1>
      </div>

      {/* Search bar */}
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
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl border transition ${
            showFilter || activeRegion !== "all"
              ? "bg-[#398AB9] border-[#398AB9] text-white"
              : "bg-white border-gray-200 text-gray-500 hover:border-[#398AB9]"
          }`}>
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Region filter */}
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
                {regionLabels[r]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
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

      {/* Results + controls */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <p className="text-sm text-gray-500">
          พบ <span className="font-semibold text-gray-900">{filtered.length}</span> สถานที่
          {activeRegion !== "all" && <span className="text-[#398AB9]"> ใน{regionLabels[activeRegion]}</span>}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1.5">
            <ArrowUpDown className="w-3 h-3 text-gray-400" />
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-xs text-gray-600 bg-transparent outline-none cursor-pointer">
              <option value="rating">คะแนนสูงสุด</option>
              <option value="reviews">รีวิวมากสุด</option>
              <option value="price_asc">ราคา ต่ำ→สูง</option>
              <option value="price_desc">ราคา สูง→ต่ำ</option>
            </select>
          </div>
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode("grid")}
              className={`p-1.5 ${viewMode === "grid" ? "bg-[#398AB9] text-white" : "text-gray-400 hover:bg-gray-50"}`}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={`p-1.5 ${viewMode === "list" ? "bg-[#398AB9] text-white" : "text-gray-400 hover:bg-gray-50"}`}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          {hasFilter && (
            <button onClick={() => { setQuery(""); setActiveCategory("all"); setActiveRegion("all"); }}
              className="text-xs text-[#398AB9] hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> ล้าง
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((p) => <PlaceCard key={p.id} place={p} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const img = p.coverImage ??
                "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=600&q=80";
              return (
                <Link key={p.id} href={`/place/${p.slug}`}
                  className="flex gap-3 bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-md transition-shadow group">
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden">
                    <img src={img} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                      {p.isFeatured && (
                        <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#398AB9]/10 text-[#398AB9]">
                          แนะนำ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#398AB9]" />
                      <span className="text-xs text-gray-400">{p.province ?? p.country}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-gray-700">
                          {p.rating > 0 ? p.rating.toFixed(1) : "–"}
                        </span>
                        {p.reviewCount > 0 && (
                          <span className="text-[10px] text-gray-400">({fmt(p.reviewCount)})</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{priceSymbol(p.priceRange)}</span>
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      <span className="text-[10px] bg-[#398AB9]/8 text-[#398AB9] px-2 py-0.5 rounded-full">
                        {regionLabels[p.region] ?? p.region}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
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
  );
}
