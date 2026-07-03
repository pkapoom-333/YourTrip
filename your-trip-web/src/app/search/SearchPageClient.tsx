
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, FileText, Users, Star, X, Clock, ArrowRight } from "lucide-react";
import { searchPlaces } from "@/server/actions/places";
import { searchPosts, PostSearchResult } from "@/server/actions/posts";
import { searchUsersForDM } from "@/server/actions/messages";

type Tab = "all" | "places" | "posts" | "users";

const TAB_ITEMS: { id: Tab; label: string; icon: typeof Search }[] = [
  { id: "all", label: "ทั้งหมด", icon: Search },
  { id: "places", label: "สถานที่", icon: MapPin },
  { id: "posts", label: "โพสต์", icon: FileText },
  { id: "users", label: "คน", icon: Users },
];

const CATEGORY_LABEL: Record<string, string> = {
  attraction: "🏛️", restaurant: "🍽️", cafe: "☕", hotel: "🏨", activity: "🎯",
};

const RECENT_KEY = "yt_recent_searches";
function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[]; } catch { return []; }
}
function saveRecent(q: string) {
  try {
    const prev = getRecent().filter((s) => s !== q);
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 8)));
  } catch {}
}
function clearRecent() {
  try { localStorage.removeItem(RECENT_KEY); } catch {}
}

export default function SearchPageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const [query, setQuery] = useState(sp.get("q") ?? "");
  const [tab, setTab] = useState<Tab>((sp.get("tab") as Tab) ?? "all");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const [places, setPlaces] = useState<Array<{ id: string; slug: string; name: string; category: string; province: string | null; coverImage: string | null; rating: number }>>([]);
  const [posts, setPosts] = useState<PostSearchResult[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string | null; username: string | null; avatarUrl: string | null }>>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecent(getRecent());
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string, t: Tab) => {
    if (!q.trim()) {
      setPlaces([]); setPosts([]); setUsers([]);
      return;
    }
    setLoading(true);
    try {
      const [placeRes, postRes, userRes] = await Promise.all([
        (t === "all" || t === "places") ? searchPlaces(q, 6) : Promise.resolve({ places: [] }),
        (t === "all" || t === "posts") ? searchPosts(q, 6) : Promise.resolve({ data: [] }),
        (t === "all" || t === "users") ? searchUsersForDM(q) : Promise.resolve({ data: [] }),
      ]);
      setPlaces(placeRes.places);
      setPosts(postRes.data);
      setUsers(userRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(q, tab), 350);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecent(query.trim());
    setRecent(getRecent());
    doSearch(query, tab);
    router.replace(`/search?q=${encodeURIComponent(query)}&tab=${tab}`, { scroll: false });
  }

  function pickRecent(q: string) {
    setQuery(q);
    doSearch(q, tab);
  }

  function handleTabChange(t: Tab) {
    setTab(t);
    doSearch(query, t);
  }

  const hasResults = places.length > 0 || posts.length > 0 || users.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={handleInput}
          placeholder="ค้นหาสถานที่ โพสต์ หรือคน..."
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#398AB9]/30"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setPlaces([]); setPosts([]); setUsers([]); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-slate-700/50 p-1 rounded-xl">
        {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => handleTabChange(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all ${tab === id ? "bg-white dark:bg-slate-700 text-[#398AB9] shadow-sm" : "text-gray-500 dark:text-slate-400"}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Recent searches */}
      {!query && recent.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">ค้นหาล่าสุด</span>
            <button onClick={() => { clearRecent(); setRecent([]); }} className="text-xs text-[#398AB9] hover:underline">ล้าง</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button key={r} onClick={() => pickRecent(r)}
                className="flex items-center gap-1.5 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                <Clock className="w-3 h-3 text-gray-400" />
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="space-y-6">
          {/* Places */}
          {places.length > 0 && (tab === "all" || tab === "places") && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#398AB9]" /> สถานที่
                </h2>
                {tab === "all" && (
                  <button onClick={() => handleTabChange("places")} className="text-xs text-[#398AB9] hover:underline flex items-center gap-0.5">
                    ดูทั้งหมด <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {places.map((p) => (
                  <Link key={p.id} href={`/place/${p.slug}`}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-[#398AB9]/30 transition-colors">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-700">
                      {p.coverImage && <Image src={p.coverImage} alt={p.name} fill className="object-cover" sizes="48px" />}
                      {!p.coverImage && <span className="absolute inset-0 flex items-center justify-center text-xl">{CATEGORY_LABEL[p.category] ?? "📍"}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.province ?? "—"}</p>
                    </div>
                    {p.rating > 0 && (
                      <div className="flex items-center gap-0.5 text-xs text-gray-500 dark:text-slate-400 flex-shrink-0">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {p.rating.toFixed(1)}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Posts */}
          {posts.length > 0 && (tab === "all" || tab === "posts") && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#398AB9]" /> โพสต์
                </h2>
                {tab === "all" && (
                  <Link href={`/search/posts?q=${encodeURIComponent(query)}`} className="text-xs text-[#398AB9] hover:underline flex items-center gap-0.5">
                    ดูทั้งหมด <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
              <div className="space-y-2">
                {posts.map((p) => (
                  <Link key={p.id} href={`/post/${p.id}`}
                    className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-[#398AB9]/30 transition-colors">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-700">
                      {p.user.avatarUrl
                        ? <Image src={p.user.avatarUrl} alt="" width={40} height={40} className="object-cover" />
                        : <div className="w-full h-full bg-[#398AB9] flex items-center justify-center text-white text-xs font-bold">{(p.user.name ?? "U")[0]}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{p.user.name ?? p.user.username ?? "ผู้ใช้"}</p>
                      <p className="text-sm text-gray-800 dark:text-slate-100 line-clamp-2">{p.content}</p>
                      {p.tags.length > 0 && (
                        <p className="text-xs text-[#398AB9] mt-0.5 truncate">{p.tags.slice(0, 3).map(t => `#${t}`).join(" ")}</p>
                      )}
                    </div>
                    {p.images[0] && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={p.images[0]} alt="" fill className="object-cover" sizes="48px" />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Users */}
          {users.length > 0 && (tab === "all" || tab === "users") && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#398AB9]" /> ผู้ใช้
                </h2>
                {tab === "all" && (
                  <Link href={`/search/users?q=${encodeURIComponent(query)}`} className="text-xs text-[#398AB9] hover:underline flex items-center gap-0.5">
                    ดูทั้งหมด <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <Link key={u.id} href={`/profile/${u.id}`}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-[#398AB9]/30 transition-colors">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-700">
                      {u.avatarUrl
                        ? <Image src={u.avatarUrl} alt="" width={40} height={40} className="object-cover" />
                        : <div className="w-full h-full bg-[#398AB9] flex items-center justify-center text-white text-sm font-bold">{(u.name ?? u.username ?? "U")[0]}</div>
                      }
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{u.name ?? "ไม่ระบุชื่อ"}</p>
                      {u.username && <p className="text-xs text-gray-400">@{u.username}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && query && !hasResults && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-slate-600" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">ไม่พบผลลัพธ์สำหรับ &quot;{query}&quot;</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">ลองค้นหาด้วยคำอื่น</p>
        </div>
      )}
    </div>
  );
}
