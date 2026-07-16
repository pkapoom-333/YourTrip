"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Search, Star, MapPin, SlidersHorizontal, X, LayoutGrid, List, ArrowUpDown, Users, UserPlus, UserCheck, Bookmark, Map, ArrowRight, TrendingUp, Loader2, Navigation } from "lucide-react";
import { toggleSavePlace } from "@/server/actions/savedPlaces";
import { searchPlaces } from "@/server/actions/places";
import type { PlaceListItem } from "@/server/actions/places";
import { searchUsers, followUser, unfollowUser, getSuggestedUsers, type UserCard } from "@/server/actions/profile";
import { Avatar } from "@/components/shared/Avatar";
import { useToast } from "@/components/shared/Toast";
import { NearMeWidget } from "@/components/features/NearMeWidget";
import { TrendingTagsWidget } from "@/components/features/TrendingTagsWidget";
import { PlaceOfDayCard } from "@/components/features/PlaceOfDayCard";

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
                : "text-gray-300 dark:text-slate-600 hover:text-[#398AB9] hover:bg-[#398AB9]/5"
            }`}
            title={saved ? "ลบออกจาก wishlist" : "บันทึก"}>
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          <span className="text-[10px] bg-[#398AB9]/8 text-[#398AB9] px-2 py-0.5 rounded-full font-medium">
            {regionLabels[place.region] ?? place.region}
          </span>
          {place.reviewCount > 0 && place.rating >= 4.5 && (
            <span className="flex items-center gap-0.5 text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
              <TrendingUp className="w-2.5 h-2.5" />
              ดีเยี่ยม
            </span>
          )}
          {place.reviewCount > 0 && place.rating >= 4.0 && place.rating < 4.5 && (
            <span className="text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
              แนะนำ
            </span>
          )}
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
  const [suggested, setSuggested] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  // Load suggested users on mount (shown when no query)
  useEffect(() => {
    getSuggestedUsers(10).then(({ data }) => {
      setSuggested(data);
      const map: Record<string, boolean> = {};
      data.forEach((u) => { map[u.id] = u.isFollowing; });
      setFollowing((prev) => ({ ...map, ...prev }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setUsers([]); return; }
    setLoading(true);
    searchUsers(query, 20).then(({ data }) => {
      setUsers(data);
      const map: Record<string, boolean> = {};
      data.forEach((u) => { map[u.id] = u.isFollowing; });
      setFollowing((prev) => ({ ...prev, ...map }));
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-[#398AB9]" />
            แนะนำให้ติดตาม
          </h3>
          <span className="text-xs text-gray-400 dark:text-slate-500">นักท่องเที่ยวที่น่าสนใจ</span>
        </div>
        {suggested.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-8">
            <Users className="w-10 h-10 text-gray-200 dark:text-slate-700 mb-3" />
            <p className="text-gray-400 dark:text-slate-500 text-sm">พิมพ์ชื่อเพื่อหาเพื่อนนักท่องเที่ยว</p>
          </div>
        ) : (
          suggested.map((u) => {
            const isFollowing = following[u.id] ?? false;
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
          })
        )}
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
        <p className="text-gray-500 dark:text-slate-400 font-medium">ไม่พบผู้ใช้ที่ตรงกับ &ldquo;{query}&rdquo;</p>
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

// ── Recently Viewed Places ──────────────────────────────────────────
const RECENT_PLACES_KEY = "yt_recent_places";
type RecentPlaceEntry = { slug: string; name: string; coverImage: string | null; category: string };
function loadRecentPlaces(): RecentPlaceEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_PLACES_KEY) ?? "[]") as RecentPlaceEntry[]; } catch { return []; }
}

type ServerPlaceItem = { id: string; slug: string; name: string; category: string; province: string | null; coverImage: string | null; rating: number };

function ServerPlaceCard({ place }: { place: ServerPlaceItem }) {
  const img = place.coverImage ??
    "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=600&q=80";
  const catEmoji: Record<string, string> = { attraction: "🏔️", restaurant: "🍜", cafe: "☕", hotel: "🏨", activity: "🤿" };
  return (
    <Link href={`/place/${place.slug}`}
      className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:shadow-gray-200/80 dark:hover:shadow-slate-900/80 transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={img} alt={place.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 right-3">
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
            {catEmoji[place.category] ?? "📍"}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 line-clamp-1">{place.name}</p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#398AB9]" />
            <span className="text-xs text-gray-400 dark:text-slate-500 line-clamp-1">{place.province ?? ""}</span>
          </div>
          {place.rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{place.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ExploreClient({ initialPlaces, initialSaved = [] }: { initialPlaces: PlaceListItem[]; initialSaved?: string[] }) {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("places");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSaved));
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const { success, error: toastError } = useToast();

  const [recentPlaces, setRecentPlaces] = useState<RecentPlaceEntry[]>([]);

  // Load recent searches + recently viewed places from localStorage on mount
  useEffect(() => {
    setRecentSearches(loadRecent());
    setRecentPlaces(loadRecentPlaces());
  }, []);

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
  const [activeTags, setActiveTags] = useState<string[]>([]);
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
  // Server-side search (hits all DB places, not just the 50 pre-loaded)
  const [serverResults, setServerResults] = useState<ServerPlaceItem[]>([]);
  const [serverLoading, setServerLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setServerResults([]); setServerLoading(false); return; }
    setServerLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { places } = await searchPlaces(q, 24);
        setServerResults(places);
      } catch { /* silent */ } finally {
        setServerLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);
  // ref holds latest filtered so marker-refresh effect can read it without TDZ issue
  const filteredRef = useRef<typeof initialPlaces>([]);
  // incremented after filtered changes to trigger marker refresh
  const [mapRefreshKey, setMapRefreshKey] = useState(0);

  // Category colors for map pins (static constant — no deps issue)
  const CATEGORY_COLORS: Record<string, { bg: string; emoji: string }> = {
    attraction: { bg: "#22c55e", emoji: "🏔" },
    restaurant:  { bg: "#f97316", emoji: "🍜" },
    cafe:        { bg: "#f59e0b", emoji: "☕" },
    hotel:       { bg: "#3b82f6", emoji: "🏨" },
    activity:    { bg: "#a855f7", emoji: "🤿" },
  };

  // Helper: populate markers from filteredRef
  const refreshMarkers = useCallback(async () => {
    if (!markersLayerRef.current || !leafletMapRef.current) return;
    const L = (await import("leaflet")).default;
    markersLayerRef.current.clearLayers();
    const withCoords = filteredRef.current.filter((p: typeof initialPlaces[0]) => p.lat && p.lng);
    withCoords.forEach((p: typeof initialPlaces[0]) => {
      const cat = CATEGORY_COLORS[p.category] ?? { bg: "#6b7280", emoji: "📍" };
      const icon = L.divIcon({
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:${cat.bg};transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:13px;">${cat.emoji}</span></div>`,
      });
      L.marker([p.lat!, p.lng!], { icon }).addTo(markersLayerRef.current)
        .bindPopup(`<div style="min-width:160px"><a href="/place/${p.slug}" style="font-weight:700;color:#398AB9;font-size:13px;text-decoration:none">${p.name}</a><div style="font-size:11px;color:#888;margin-top:2px">${cat.emoji} ${p.province ?? p.country ?? ""}</div>${p.rating ? `<div style="font-size:11px;margin-top:4px">&#9733; ${p.rating.toFixed(1)}</div>` : ""}</div>`);
    });
    if (withCoords.length > 0) {
      leafletMapRef.current.fitBounds(
        L.latLngBounds(withCoords.map((p: typeof initialPlaces[0]) => [p.lat!, p.lng!] as [number, number])),
        { padding: [30, 30], maxZoom: 12 }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Init (or destroy) map when entering/leaving map mode
  useEffect(() => {
    if (viewMode !== "map") {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      markersLayerRef.current = null;
      return;
    }
    const container = mapContainerRef.current;
    if (!container) return;

    let cancelled = false;
    const init = async () => {
      const L = (await import("leaflet")).default;
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (cancelled || !container || leafletMapRef.current) return;
      const map = L.map(container).setView([13.0, 101.0], 6);
      leafletMapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap", maxZoom: 18,
      }).addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      await refreshMarkers();
    };
    init();
    return () => { cancelled = true; };
  }, [viewMode, refreshMarkers]);

  // Refresh markers when mapRefreshKey increments (triggered after filters change in map mode)
  useEffect(() => {
    if (mapRefreshKey === 0) return; // skip initial mount
    refreshMarkers();
  }, [mapRefreshKey, refreshMarkers]);

  const filtered = initialPlaces
    .filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const matchReg = activeRegion === "all" || p.region === activeRegion;
      const matchQ = !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.nameEn ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (p.province ?? "").toLowerCase().includes(query.toLowerCase());
      const matchTags = activeTags.length === 0 || activeTags.every((t) => p.tags.includes(t));
      return matchCat && matchReg && matchQ && matchTags;
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

  // Keep filteredRef in sync and trigger map marker refresh when in map mode
  filteredRef.current = filtered;
  // Reset display count when filters change
  const filterKey = `${query}|${activeCategory}|${activeRegion}|${sortKey}|${activeTags.join(",")}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setDisplayCount(PAGE_SIZE);
    // Refresh map markers when filters change while in map mode
    if (viewMode === "map") {
      setMapRefreshKey((k) => k + 1);
    }
  }

  const displayedPlaces = filtered.slice(0, displayCount);
  const hasMore = filtered.length > displayCount;
  const hasFilter = query || activeCategory !== "all" || activeRegion !== "all" || activeTags.length > 0;

  // Deduplicate server results — only show places NOT already in local filtered list
  const localIds = new Set(filtered.map((p) => p.id));
  const serverExtra = serverResults.filter((p) => !localIds.has(p.id));

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
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">สำรวจ</h1>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
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
                  <Search className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
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

      {/* Region + tag filter — places only */}
      {showFilter && searchMode === "places" && (
        <div className="mb-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 space-y-3">
          <div>
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
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">สิ่งอำนวยความสะดวก</p>
            <div className="flex flex-wrap gap-2">
              {["WiFi", "ที่จอดรถ", "แอร์", "มังสวิรัติ", "ผู้พิการ", "แนะนำ"].map((tag) => {
                const active = activeTags.includes(tag);
                return (
                  <button key={tag} onClick={() =>
                    setActiveTags((prev) => active ? prev.filter((t) => t !== tag) : [...prev, tag])
                  }
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                      active
                        ? "bg-[#398AB9] text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }`}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Places section */}
      {searchMode === "places" && <>

      {/* Place of the Day */}
      {!query.trim() && (
        <div className="mb-5">
          <PlaceOfDayCard />
        </div>
      )}

      {/* Near Me Widget — only when not searching */}
      {!query.trim() && (
        <div className="mb-5 -mx-4">
          <NearMeWidget compact />
        </div>
      )}

      {/* Trending Tags — only when not searching */}
      {!query.trim() && (
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">แท็กยอดนิยม</p>
          <TrendingTagsWidget compact />
        </div>
      )}

      {/* Submit place banner */}
      {!query.trim() && (
        <Link href="/place/submit" className="flex items-center gap-3 bg-[#398AB9]/5 dark:bg-[#398AB9]/10 border border-[#398AB9]/20 rounded-2xl p-3.5 mb-5 hover:bg-[#398AB9]/10 transition group">
          <div className="w-9 h-9 bg-[#398AB9] rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">📍</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#398AB9]">แนะนำสถานที่ใหม่</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">รู้จักสถานที่ดีๆ? แนะนำให้ชุมชนได้เลย</p>
          </div>
          <svg className="ml-auto w-4 h-4 text-[#398AB9] group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      )}

      {/* Near Me GPS button — prominent shortcut */}
      {searchMode === "places" && (
        <button
          onClick={() => { if (sortKey === "nearby" && userLat) { setSortKey("rating"); setUserLat(null); setUserLng(null); } else requestGeolocation(); }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl mb-4 text-sm font-medium transition-all border ${
            sortKey === "nearby" && userLat
              ? "bg-[#398AB9] text-white border-[#398AB9] shadow-md shadow-[#398AB9]/30"
              : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-[#398AB9] hover:text-[#398AB9]"
          }`}
        >
          {geoLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังระบุตำแหน่ง...</>
            : sortKey === "nearby" && userLat
            ? <><Navigation className="w-4 h-4" /> ใกล้ฉัน (เปิดอยู่ — แตะเพื่อปิด)</>
            : <><Navigation className="w-4 h-4" /> สถานที่ใกล้ฉัน</>
          }
        </button>
      )}

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

      {/* ── Recently Viewed Places — only shown when not actively searching */}
      {!query.trim() && recentPlaces.length > 0 && searchMode === "places" && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">ดูล่าสุด</p>
            <button
              onClick={() => { try { localStorage.removeItem(RECENT_PLACES_KEY); } catch {} setRecentPlaces([]); }}
              className="text-[10px] text-gray-400 dark:text-slate-500 hover:text-[#398AB9] dark:hover:text-[#398AB9] transition">
              ล้าง
            </button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            {recentPlaces.slice(0, 8).map((p) => {
              const catEmoji: Record<string, string> = { attraction: "🏔️", restaurant: "🍜", cafe: "☕", hotel: "🏨", activity: "🤿" };
              const fallback = "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=400&q=80";
              return (
                <Link key={p.slug} href={`/place/${p.slug}`}
                  className="group flex-shrink-0 relative w-20 h-24 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <img src={p.coverImage ?? fallback} alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = fallback; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <p className="text-white text-[9px] font-semibold leading-tight line-clamp-2">{p.name}</p>
                  </div>
                  <div className="absolute top-1.5 right-1.5 text-[10px] leading-none">
                    {catEmoji[p.category] ?? "📍"}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Destination Spotlight ── only shown with no active filters */}
      {!query && activeCategory === "all" && activeRegion === "all" && searchMode === "places" && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">จุดหมายยอดนิยม</p>
            <Link href="/explore" className="text-xs text-[#398AB9] hover:underline flex items-center gap-0.5">
              สำรวจเพิ่มเติม <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            {[
              { province: "เชียงใหม่", label: "เชียงใหม่", sub: "ภาคเหนือ", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=400&q=80", color: "from-emerald-800/70" },
              { province: "กรุงเทพมหานคร", label: "กรุงเทพฯ", sub: "เมืองหลวง", img: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80", color: "from-blue-900/70" },
              { province: "กระบี่", label: "กระบี่", sub: "ภาคใต้", img: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?auto=format&fit=crop&w=400&q=80", color: "from-cyan-800/70" },
              { province: "ภูเก็ต", label: "ภูเก็ต", sub: "เกาะมุก", img: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=400&q=80", color: "from-orange-800/70" },
              { province: "เชียงราย", label: "เชียงราย", sub: "ล้านนา", img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80", color: "from-purple-800/70" },
              { province: "พระนครศรีอยุธยา", label: "อยุธยา", sub: "โบราณสถาน", img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=400&q=80", color: "from-amber-900/70" },
            ].map(({ province, label, sub, img, color }) => {
              const count = initialPlaces.filter((p) => p.province?.includes(label.replace("ฯ", ""))).length;
              return (
                <Link
                  key={province}
                  href={`/explore/${encodeURIComponent(province)}`}
                  className="group relative flex-shrink-0 w-36 h-44 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <img
                    src={img}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=400&q=80"; }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent`} />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight">{label}</p>
                    <p className="text-white/70 text-[10px] mt-0.5">{sub}</p>
                    {count > 0 && (
                      <span className="inline-block mt-1.5 text-[9px] font-semibold bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                        {count} สถานที่
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Province quick-links — only shown when not searching or filtering */}
      {!query && activeCategory === "all" && activeRegion === "all" && searchMode === "places" && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              ท่องเที่ยวตามจังหวัด
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {[
              { name: "เชียงใหม่", emoji: "🌿" },
              { name: "กรุงเทพ", emoji: "🏙️" },
              { name: "ภูเก็ต", emoji: "🏖️" },
              { name: "กระบี่", emoji: "🌊" },
              { name: "เชียงราย", emoji: "⛰️" },
              { name: "อยุธยา", emoji: "🏛️" },
              { name: "หัวหิน", emoji: "🌅" },
              { name: "ขอนแก่น", emoji: "🌻" },
            ].map(({ name, emoji }) => (
              <Link
                key={name}
                href={`/explore/${encodeURIComponent(name)}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-full text-sm text-gray-600 dark:text-slate-300 hover:border-[#398AB9] hover:text-[#398AB9] transition"
              >
                {emoji} {name}
              </Link>
            ))}
          </div>
        </div>
      )}

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
            <button onClick={() => setViewMode("map")}
              className={`p-1.5 ${viewMode === "map" ? "bg-[#398AB9] text-white" : "text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700"}`}>
              <Map className="w-3.5 h-3.5" />
            </button>
          </div>
          {hasFilter && (
            <button onClick={() => { setQuery(""); setActiveCategory("all"); setActiveRegion("all"); setActiveTags([]); }}
              className="text-xs text-[#398AB9] hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> ล้าง
            </button>
          )}
        </div>
      </div>

      {/* Map View */}
      {viewMode === "map" && (
        <div className="mb-4">
          <div ref={mapContainerRef} className="w-full h-[60vh] min-h-[360px] rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 bg-gray-100 dark:bg-slate-800" />
          {/* Category legend */}
          <div className="flex flex-wrap gap-2 mt-2 px-1">
            {[
              { cat: "attraction", color: "#22c55e", emoji: "🏔️", label: "สถานที่เที่ยว" },
              { cat: "restaurant",  color: "#f97316", emoji: "🍜", label: "ร้านอาหาร" },
              { cat: "cafe",        color: "#f59e0b", emoji: "☕", label: "คาเฟ่" },
              { cat: "hotel",       color: "#3b82f6", emoji: "🏨", label: "ที่พัก" },
              { cat: "activity",    color: "#a855f7", emoji: "🤿", label: "กิจกรรม" },
            ].map(({ cat, color, emoji, label }) => {
              const count = filtered.filter((p) => p.lat && p.lng && p.category === cat).length;
              if (count === 0) return null;
              return (
                <span key={cat} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 px-2 py-1 rounded-full">
                  <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: color }} />
                  {emoji} {label} ({count})
                </span>
              );
            })}
          </div>
          {filtered.filter((p) => p.lat && p.lng).length === 0 && (
            <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-2">ไม่มีสถานที่ที่มีพิกัดในผลการค้นหา</p>
          )}
        </div>
      )}

      {/* Places Results */}
      {filtered.length > 0 && viewMode !== "map" ? (
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
                  className="flex gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3 hover:shadow-md transition-shadow group">
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden">
                    <img src={img} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 dark:text-slate-200 text-sm">{p.name}</p>
                      {p.isFeatured && (
                        <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#398AB9]/10 text-[#398AB9]">
                          แนะนำ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#398AB9]" />
                      <span className="text-xs text-gray-400 dark:text-slate-500">{p.province ?? p.country}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                          {p.rating > 0 ? p.rating.toFixed(1) : "–"}
                        </span>
                        {p.reviewCount > 0 && (
                          <span className="text-[10px] text-gray-400 dark:text-slate-500">({fmt(p.reviewCount)})</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-slate-500">{priceSymbol(p.priceRange)}</span>
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      <span className="text-[10px] bg-[#398AB9]/8 text-[#398AB9] px-2 py-0.5 rounded-full">
                        {regionLabels[p.region] ?? p.region}
                      </span>
                      {p.reviewCount > 0 && p.rating >= 4.5 && (
                        <span className="flex items-center gap-0.5 text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                          <TrendingUp className="w-2.5 h-2.5" />
                          ดีเยี่ยม
                        </span>
                      )}
                      {p.reviewCount > 0 && p.rating >= 4.0 && p.rating < 4.5 && (
                        <span className="text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                          แนะนำ
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      ) : viewMode !== "map" ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-3xl">
            🔍
          </div>
          <p className="font-semibold text-gray-700 dark:text-slate-200 mb-1">ไม่พบสถานที่ที่ค้นหา</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mb-5">ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง</p>
          <button
            onClick={() => { setQuery(""); setActiveCategory("all"); setActiveRegion("all"); setActiveTags([]); }}
            className="text-sm text-[#398AB9] font-medium border border-[#398AB9]/30 px-4 py-2 rounded-xl hover:bg-[#398AB9]/5 transition"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : null}

      {/* Server search results — places beyond the pre-loaded 50 */}
      {searchMode === "places" && query.trim().length >= 2 && viewMode !== "map" && (serverLoading || serverExtra.length > 0) && (
        <div className="mt-6 border-t border-gray-100 dark:border-slate-700 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-3.5 h-3.5 text-[#398AB9]" />
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              ผลจากฐานข้อมูลทั้งหมด
            </p>
            {serverLoading && <Loader2 className="w-3.5 h-3.5 text-[#398AB9] animate-spin ml-1" />}
          </div>
          {serverExtra.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {serverExtra.map((p) => (
                <ServerPlaceCard key={p.id} place={p} />
              ))}
            </div>
          ) : !serverLoading && (
            <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">ไม่พบสถานที่เพิ่มเติม</p>
          )}
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
          <p className="text-sm text-gray-400 dark:text-slate-500">แสดงทั้งหมด {filtered.length} สถานที่ แล้ว</p>
        )}
      </div>

      </> /* end places section */}
    </div>
  );
}
