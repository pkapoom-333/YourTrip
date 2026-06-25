import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { Search, Bell, TrendingUp } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export const metadata: Metadata = {
  title: "ฟีด",
  description: "ดูโพสต์จากนักเดินทางทั่วโลก แชร์ประสบการณ์ และสร้างแรงบันดาลใจในการเดินทาง",
  alternates: { canonical: `${SITE_URL}/feed` },
};
import { type PostCardData } from "@/components/features/PostCard";
import { getFeed, getTrendingHashtags, getActiveUsers, type ActiveUser } from "@/server/actions/posts";
import { getPlaces } from "@/server/actions/places";
import { getPublicTrips } from "@/server/actions/trips";
import { MapPin as MapPinIcon } from "lucide-react";
import { FeedPostsClient } from "./FeedPostsClient";
import SuggestedUsers from "@/components/features/SuggestedUsers";

const STORY_BG_COLORS = [
  "bg-orange-400", "bg-pink-400", "bg-emerald-400",
  "bg-violet-400", "bg-amber-400", "bg-sky-400",
  "bg-rose-400",   "bg-teal-400",  "bg-indigo-400",
  "bg-lime-500",   "bg-cyan-400",  "bg-fuchsia-400",
];



const fmtTime = (d: Date) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
};

export default async function FeedPage() {
  const [
    { data: dbPosts, nextCursor, hasMore },
    { data: featuredPlaces },
    { data: communityTrips },
    { data: trendingHashtags },
    { data: activeUsers },
  ] = await Promise.all([
    getFeed(),
    getPlaces({ featured: true, take: 3 }),
    getPublicTrips(3),
    getTrendingHashtags(6),
    getActiveUsers(12),
  ]);

  const feedPosts: PostCardData[] = dbPosts.map((p) => ({
    id: p.id,
    caption: p.content,
    img: p.images?.[0] ?? undefined,
    images: p.images ?? [],
    user: {
      id: p.user?.id ?? undefined,
      name: p.user?.name ?? "YourTrip User",
      avatarUrl: p.user?.avatarUrl ?? undefined,
      location: p.location ?? undefined,
    },
    likes: p.likesCount,
    comments: p.commentsCount,
    liked: p.likedByMe ?? false,
    saved: p.savedByMe ?? false,
    time: fmtTime(p.createdAt),
    tags: p.tags ?? [],
    place: p.place ?? null,
  }));

  return (
    <AppShell>
      {/* ─── TOP BAR (mobile only) ─── */}
      <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-[#398AB9]">Your Trip</span>
          <div className="flex items-center gap-2">
            <Link href="/explore" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-slate-700">
              <Search className="w-5 h-5 text-gray-500 dark:text-slate-400" />
            </Link>
            <Link href="/notifications" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-slate-700 relative">
              <Bell className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4F4F] rounded-full" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-0 md:px-6 py-0 md:py-6">
        <div className="flex gap-6">
          {/* ─── MAIN FEED ─── */}
          <div className="flex-1 min-w-0">

            {/* Desktop page title */}
            <div className="hidden md:flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">หน้าหลัก</h1>
              <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-[#398AB9] transition">
                <Bell className="w-4 h-4" />
                การแจ้งเตือน
              </button>
            </div>

            {/* Stories — active travelers row */}
            <div className="bg-white dark:bg-slate-800 md:rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-4 mb-3">
              <div className="flex gap-4 overflow-x-auto scrollbar-none">
                {/* Add story button */}
                <Link href="/create" className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-700 border-2 border-dashed border-gray-300 dark:border-slate-600">
                    <span className="font-bold text-sm text-gray-400 dark:text-slate-500">+</span>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 w-14 text-center truncate">เพิ่มโพสต์</span>
                </Link>

                {/* Real active users */}
                {activeUsers.length > 0
                  ? activeUsers.map((u: ActiveUser, i: number) => {
                      const initials = (u.name ?? u.username ?? "U")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();
                      const bg = STORY_BG_COLORS[i % STORY_BG_COLORS.length];
                      const href = `/profile/${u.id}`;
                      const label = u.name ?? u.username ?? "Traveler";
                      return (
                        <Link key={u.id} href={href} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                          <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#398AB9] to-[#1C658C]">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={label}
                                className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-800"
                              />
                            ) : (
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 ${bg}`}>
                                <span className="font-bold text-sm text-white">{initials}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-slate-400 w-14 text-center truncate">{label}</span>
                        </Link>
                      );
                    })
                  : /* Fallback mock when DB has no recent posts */
                    (["free people", "shy girl", "wanderer", "travelmate", "adventurer", "nomad"] as const).map((name, i) => {
                      const bg = STORY_BG_COLORS[i];
                      const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                      return (
                        <button key={name} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                          <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#398AB9] to-[#1C658C]">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 ${bg}`}>
                              <span className="font-bold text-sm text-white">{initials}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-slate-400 w-14 text-center truncate">{name}</span>
                        </button>
                      );
                    })
                }
              </div>
            </div>

            {/* Posts — client component with infinite scroll */}
            <FeedPostsClient
              initialPosts={feedPosts}
              initialCursor={nextCursor}
              initialHasMore={dbPosts.length > 0 ? (hasMore ?? false) : false}
            />
          </div>

          {/* ─── RIGHT PANEL (desktop only) ─── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            {/* Trending */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[#398AB9]" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">กำลังฮิต</h3>
              </div>
              <div className="space-y-3">
                {trendingHashtags.map((t, i) => {
                  const fmtCount = t.count >= 1000 ? (t.count / 1000).toFixed(1).replace(".0","") + "K" : String(t.count);
                  return (
                    <Link key={t.tag} href={`/tags/${encodeURIComponent(t.tag)}`}
                      className="flex items-center justify-between group hover:opacity-80 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 dark:text-slate-500 w-4">{i + 1}</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-200 group-hover:text-[#398AB9] transition">#{t.tag}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-slate-500">{fmtCount} โพสต์</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Suggested users to follow */}
            <div className="mb-4">
              <SuggestedUsers />
            </div>

            {/* Community Trips — from DB */}
            {communityTrips.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">ทริปชุมชน</h3>
                  <Link href="/trips" className="text-[11px] text-[#398AB9] hover:underline">ดูทั้งหมด →</Link>
                </div>
                <div className="space-y-2.5">
                  {communityTrips.slice(0, 3).map((t) => (
                    <Link key={t.id} href={`/trips/${t.id}`}
                      className="flex gap-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 -mx-2 px-2 py-1.5 rounded-xl transition group">
                      <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
                        <img
                          src={t.coverImage ?? `https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=200&q=80&sig=${t.id}`}
                          alt={t.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 truncate">{t.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPinIcon className="w-2.5 h-2.5 text-[#398AB9] flex-shrink-0" />
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{t.destination}</span>
                        </div>
                        {t.itemCount > 0 && (
                          <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-0.5">{t.itemCount} จุดหมาย</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested places — from DB */}
            {featuredPlaces.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">สถานที่แนะนำ</h3>
                <div className="space-y-3">
                  {featuredPlaces.map((p) => (
                    <Link key={p.id} href={`/place/${p.slug}`}
                      className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 -mx-2 px-2 py-1.5 rounded-xl transition">
                      {p.coverImage ? (
                        <img src={p.coverImage} alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          loading="lazy" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#398AB9]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-base">🗺️</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 capitalize">
                          {p.category === "attraction" ? "สถานที่เที่ยว"
                            : p.category === "cafe" ? "คาเฟ่"
                            : p.category === "restaurant" ? "ร้านอาหาร"
                            : p.category}
                          {p.province ? ` · ${p.province}` : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/explore"
                  className="block mt-3 text-center text-xs text-[#398AB9] font-medium hover:underline">
                  ดูสถานที่ทั้งหมด →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
