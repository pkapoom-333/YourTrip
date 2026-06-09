"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Search, Star, MapPin, SlidersHorizontal, X, LayoutGrid, List, ArrowUpDown, Users, UserPlus, UserCheck, Bookmark } from "lucide-react";
import { toggleSavePlace } from "@/server/actions/savedPlaces";
import type { PlaceListItem } from "@/server/actions/places";
import { searchUsers, followUser, unfollowUser, type UserCard } from "@/server/actions/profile";
import { Avatar } from "@/components/shared/Avatar";
import { useToast } from "@/components/shared/Toast";

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

type SortKey = "rating" | "reviews" | "price_asc" | "price_desc" | "nearby";

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "K" : String(n);
}

function PlaceCard({ place, saved, onToggleSave }: {
  place: PlaceListItem;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const img = place.coverImage ??
    "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:shadow-gray-200/80 dark:hover:shadow-slate-900/80 transition-all duration-300">
      <Link href={`/place/${place.slug}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={img} alt={place.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {priceSymbol(place.priceRange)}
          </span>
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
      </Link>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/place/${place.slug}`} className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm truncate">{place.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#398AB9] flex-shrink-0" />
              <span className="text-[11px] text-gray-400 dark:text-slate-500 truncate">
                {place.province ?? place.country}
              </span>
            </div>
          </Link>
          <button
            onClick={() => onToggleSave(place.id)}
            className={`flex-shrink-0 p-1.5 rounded-lg transition ${
              saved
                ? "text-[#398AB9] bg-[#398AB9]/10"
                : "text-gray-300 hover:text-[#398AB9] hover:bg-[#398AB9]/5"
            }`}
            title={saved ? "ลบออกจาก wishlist" : "บันทึก"}>
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          <span className="text-[10px] bg-[#398AB9]/8 text-[#398AB9] px-2 py-0.5 rounded-full font-medium">
            {regionLabels[place.region] ?? place.region}
          </span>
          {place.hasWifi && (
            <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-full">WiFi</span>
          )}
        </div>
      </div>
    </div>
  );
}

const AVATAR_COLORS = [
  "bg-[#398AB9]", "bg-emerald-500", "bg-violet-500",
  "bg-orange-400", "bg-pink-400", "bg-amber-500",
];

function PeopleTab({ query }: { query: string }) {
  const [users, setUsers] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!query.trim()) { setUsers([]); return; }
    setLoading(true);
    searchUsers(query, 20).then(({ data }) => {
      setUsers(data);
      const map: Record<string, boolean> = {};
      data.forEach((u) => { map[u.id] = u.isFollowing; });
      setFollowing(map);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [query]);

  async function toggleFollow(userId: string) {
    const was = following[userId];
    setFollowing((f) => ({ ...f, [userId]: !was }));
    if (was) {
      unfollowUser(userId).catch(() => setFollowing((f) => ({ ...f, [userId]: was })));
    } else {
      followUser(userId).catch(() => setFollowing((f) => ({ ...f, [userId]: was })));
    }
  }

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <Users className="w-12 h-12 text-gray-200 mb-4" />
        <p className="text-gray-500 font-medium">ค้นหาชื่อหรือ username</p>
        <p className="text-sm text-gray-400 mt-1">พิมพ์ชื่อเพื่อหาเพื่อนนักท่องเที่ยว</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">👤</div>
        <p className="text-gray-500 font-medium">ไม่พบผู้ใช้ที่ตรงกับ &ldquo;{query}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((u) => {
        const color = AVATAR_COLORS[(u.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
        const initials = (u.name ?? "U").charAt(0).toUpperCase();
        const isFollowing = following[u.id] ?? u.isFollowing;
        return (
          <div key={u.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
            <Link href={`/profile/${u.id}`}>
              <Avatar src={u.avatarUrl} name={u.name ?? "U"} className="w-12 h-12" />
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${u.id}`}
                className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-[#398AB9] transition">
                {u.name}
              </Link>
              {u.username && <p className="text-xs text-gray-400 dark:text-slate-500">@{u.username}</p>}
              {u.bio && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{u.bio}</p>}
            </div>
            <button
              onClick={() => toggleFollow(u.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                isFollowing
                  ? "border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  : "bg-[#398AB9] text-white hover:bg-[#1C658C]"
              }`}>
              {isFollowing
                ? <><UserCheck className="w-3.5 h-3.5" /> ติดตามอยู่</>
                : <><UserPlus className="w-3.5 h-3.5" /> ติดตาม</>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

type SearchMode = "places" | "people";

const PAGE_SIZE = 12;

const RECENT_KEY = "yourtrip_recent_searches";
const MAX_RECENT = 8;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[]; } catch { return []; }
}

function saveRecent(q: string) {
  if (!q.trim()) return;
  const prev = loadRecent().filter((s) => s !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
}

export default function ExploreClient({ initialPlaces, initialSaved = [] }: { initialPlaces: PlaceListItem[]; initialSaved?: string[] }) {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("places");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSaved));
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const { success, error: toastError } = useToast();

  // Load recent searches from localStorage on mount
  useEffect(() => { setRecentSearches(loadRecent()); }, []);

  async function toggleSave(id: string) {
    const wasSaved = savedIds.has(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    try {
      await toggleSavePlace(id);
      if (!wasSaved) success("บันทึกสถานที่แล้ว ✓");
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
      toastError("ไม่สามารถบันทึกได้ กรุณาลองใหม่");
    }
  }
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeRegion, setActiveRegion] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  function requestGeolocation() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setSortKey("nearby");
        setGeoLoading(false);
      },
      () => { setGeoLoading(false); setSortKey("rating"); },
      { timeout: 8000 }
    );
  }
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
      // "nearby" — sort by Haversine distance from user's location
      if (sortKey === "nearby" && userLat !== null && userLng !== null) {
        const dA = (a.lat && a.lng) ? distanceKm(userLat, userLng, a.lat, a.lng) : Infinity;
        const dB = (b.lat && b.lng) ? distanceKm(userLat, userLng, b.lat, b.lng) : Infinity;
        return dA - dB;
      }
      return b.rating - a.rating;
    });

  // Reset display count when filters change
  const filterKey = `${query}|${activeCategory}|${activeRegion}|${sortKey}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setDisplayCount(PAGE_SIZE);
  }

  const displayedPlaces = filtered.slice(0, displayCount);
  const hasMore = filtered.length > displayCount;
  const hasFilter = query || activeCategory !== "all" || activeRegion !== "all";

  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current) {
          setDisplayCount((n) => n + PAGE_SIZE);
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
      {/* desktop title */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">สำรวจ</h1>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                saveRecent(query.trim());
                setRecentSearches(loadRecent());
                setSearchFocused(false);
              }
            }}
            placeholder={searchMode === "places" ? "ค้นหาสถานที่, ร้านอาหาร, คาเฟ่..." : "ค้นหาชื่อ หรือ @username..."}
            className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10 transition"
          />
          {query && (
            <button onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Recent searches dropdown */}
          {searchFocused && !query && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-50 dark:border-slate-700">
                <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">ค้นหาล่าสุด</span>
                <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecentSearches([]); }}
                  className="text-[11px] text-[#398AB9] hover:underline">ล้าง</button>
              </div>
              {recentSearches.map((s) => (
                <button key={s} onClick={() => { setQuery(s); setSearchFocused(false); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                  <Search className="w-3.5 h-3.5 text-gray-300" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        {searchMode === "places" && (
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition ${
              showFilter || activeRegion !== "all"
                ? "bg-[#398AB9] border-[#398AB9] text-white"
                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-[#398AB9]"
            }`}>
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search mode toggle */}
      <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1 mb-4">
        {([
          { key: "places", label: "สถานที่", emoji: "🗺️" },
          { key: "people", label: "ผู้ใช้",  emoji: "👥" },
        ] as const).map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setSearchMode(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
              searchMode === key
                ? "bg-white dark:bg-slate-600 text-[#398AB9] shadow-sm"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}>
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* People tab content */}
      {searchMode === "people" && <PeopleTab query={query} />}

      {/* Region filter — places only */}
      {showFilter && searchMode === "places" && (
        <div className="mb-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">ภูมิภาค</p>
          <div className="flex flex-wrap gap-2">
            {regions.map((r) => (
              <button key={r} onClick={() => setActiveRegion(r)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                  activeRegion === r
                    ? "bg-[#398AB9] text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}>
                {regionLabels[r]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Places section */}
      {searchMode === "places" && <>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none mb-5 pb-1">
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium flex-shrink-0 transition ${
              activeCategory === c.id
                ? "bg-[#398AB9] text-white shadow-sm shadow-[#398AB9]/30"
                : "bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-600 hover:border-[#398AB9] hover:text-[#398AB9]"
            }`}>
            <span>{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Results + controls */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          พบ <span className="font-semibold text-gray-900 dark:text-slate-100">{filtered.length}</span> สถานที่
          {activeRegion !== "all" && <span className="text-[#398AB9]"> ใน{regionLabels[activeRegion]}</span>}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-2 py-1.5">
            <ArrowUpDown className="w-3 h-3 text-gray-400 dark:text-slate-500" />
            <select value={sortKey} onChange={(e) => {
                const val = e.target.value as SortKey;
                if (val === "nearby") requestGeolocation();
                else setSortKey(val);
              }}
              className="text-xs text-gray-600 dark:text-slate-300 bg-transparent dark:bg-transparent outline-none cursor-pointer">
              <option value="rating">คะแนนสูงสุด</option>
              <option value="reviews">รีวิวมากสุด</option>
              <option value="price_asc">ราคา ต่ำ→สูง</option>
              <option value="price_desc">ราคา สูง→ต่ำ</option>
              <option value="nearby">{geoLoading ? "กำลังระบุตำแหน่ง..." : userLat ? "ใกล้ฉัน ✓" : "ใกล้ฉัน"}</option>
            </select>
          </div>
          <div className="flex bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode("grid")}
              className={`p-1.5 ${viewMode === "grid" ? "bg-[#398AB9] text-white" : "text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700"}`}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={`p-1.5 ${viewMode === "list" ? "bg-[#398AB9] text-white" : "text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700"}`}>
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

      {/* Places Results */}
      {filtered.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {displayedPlaces.map((p) => (
              <PlaceCard key={p.id} place={p} saved={savedIds.has(p.id)} onToggleSave={toggleSave} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedPlaces.map((p) => {
              const img = p.coverImage ??
                "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=600&q=80";
              return (
                <Link key={p.id} href={`/place/${p.slug}`}
                  className="flex gap-3 bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-md transition-shadow group">
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden">
                    <img src={img} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
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

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="mt-6 flex justify-center py-4" aria-hidden>
        {hasMore && (
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#398AB9]/40 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
        {!hasMore && filtered.length > PAGE_SIZE && (
          <p className="text-sm text-gray-400">แสดงทั้งหมด {filtered.length} สถานที่ แล้ว</p>
        )}
      </div>

      </> /* end places section */}
    </div>
  );
}
