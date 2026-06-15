"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { Settings, MapPin, Grid3X3, Bookmark, Heart, Star, Map, Camera, Activity, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getProfile, getUserPosts, getUserSavedPosts, getRecentActivity, type PostGridItem, type ActivityItem } from "@/server/actions/profile";
import { getSavedPlaces, type SavedPlaceItem } from "@/server/actions/savedPlaces";
import { getUserTrips } from "@/server/actions/trips";
import { Star as StarIcon } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { Avatar } from "@/components/shared/Avatar";

function getTravelStyle(tripsCount: number, totalTripDays: number, placesVisited: number): { label: string; emoji: string; color: string } {
  const avgDays = tripsCount > 0 ? totalTripDays / tripsCount : 0;
  if (placesVisited >= 20) return { label: "Explorer", emoji: "🌍", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  if (avgDays >= 7) return { label: "Slow Traveler", emoji: "🏝️", color: "text-blue-600 bg-blue-50 border-blue-200" };
  if (tripsCount >= 5) return { label: "Frequent Flyer", emoji: "✈️", color: "text-violet-600 bg-violet-50 border-violet-200" };
  if (tripsCount >= 1) return { label: "Adventure Seeker", emoji: "🎒", color: "text-amber-600 bg-amber-50 border-amber-200" };
  return { label: "New Traveler", emoji: "🗺️", color: "text-gray-600 bg-gray-50 border-gray-200" };
}

function TravelStatsCard({ totalTripDays, placesVisited, tripsCount }: {
  totalTripDays: number;
  placesVisited: number;
  tripsCount: number;
}) {
  const style = getTravelStyle(tripsCount, totalTripDays, placesVisited);
  const avgDays = tripsCount > 0 ? Math.round(totalTripDays / tripsCount) : 0;

  return (
    <div className="mt-4 rounded-2xl border border-gray-100 dark:border-slate-700 bg-gradient-to-br from-[#398AB9]/5 to-[#1C658C]/5 dark:from-[#398AB9]/10 dark:to-[#1C658C]/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">สถิติการเดินทาง</p>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${style.color}`}>
          {style.emoji} {style.label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-[#398AB9]">{totalTripDays}</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">วันเดินทาง</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-[#398AB9]">{placesVisited}</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">สถานที่ในแผน</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-[#398AB9]">{avgDays}</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">วัน/ทริป เฉลี่ย</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const [tab, setTab] = useState<"posts" | "trips" | "saved" | "reviews" | "activity">("posts");
  const [profile, setProfile] = useState({
    id: "" as string,
    name: "",
    username: "",
    bio: "",
    location: "",
    avatarUrl: null as string | null,
    isGuide: false,
    isVerifiedGuide: false,
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    tripsCount: 0,
    placesVisited: 0,
    totalTripDays: 0,
  });
  const [myPosts, setMyPosts] = useState<PostGridItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostGridItem[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceItem[]>([]);
  const [myTrips, setMyTrips] = useState<Array<{
    id: string; title: string; destination: string;
    coverImage: string | null; isPublic: boolean;
    days: Array<{ items: Array<unknown> }>;
  }>>([]);
  const [savedSubTab, setSavedSubTab] = useState<"posts" | "places">("places");
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    getProfile().then(({ data }) => {
      if (!data) return;
      setProfile({
        id: data.id ?? "",
        name: data.name ?? "Your Trip User",
        username: data.username ?? "",
        bio: data.bio ?? "",
        location: data.location ?? "",
        avatarUrl: data.avatarUrl ?? null,
        isGuide: data.isGuide ?? false,
        isVerifiedGuide: data.isVerifiedGuide ?? false,
        postsCount: data.postsCount,
        followersCount: data.followersCount,
        followingCount: data.followingCount,
        tripsCount: data.tripsCount ?? 0,
        placesVisited: data.placesVisited ?? 0,
        totalTripDays: (data as { totalTripDays?: number }).totalTripDays ?? 0,
      });
    });
    getUserPosts().then(({ data }) => {
      setMyPosts(data);
    });
    getUserSavedPosts().then(({ data }) => setSavedPosts(data));
    getSavedPlaces().then(({ data }) => setSavedPlaces(data));
    getUserTrips().then(({ data }) => setMyTrips(data.map((t) => ({
      id: t.id, title: t.title, destination: t.destination,
      coverImage: t.coverImage, isPublic: t.isPublic,
      days: t.days,
    }))));
    getRecentActivity().then(({ data }) => setActivityItems(data));
  }, []);

  return (
    <AppShell>
      <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-bold text-[#398AB9]">โปรไฟล์</span>
        <Link href="/settings">
          <Settings className="w-5 h-5 text-gray-500 dark:text-slate-400" />
        </Link>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* ── Profile header ── */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 md:px-6 pt-4 pb-5 md:rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <Avatar src={profile.avatarUrl} name={profile.name} className="w-20 h-20 text-2xl" />
            <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 text-center justify-end">
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{profile.postsCount}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">โพสต์</p>
              </div>
              <Link href="/trips" className="hover:opacity-80 transition">
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{profile.tripsCount}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">ทริป</p>
              </Link>
              {profile.placesVisited > 0 && (
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{profile.placesVisited}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">สถานที่</p>
                </div>
              )}
              {user?.id ? (
                <Link href={`/profile/${user.id}/followers`} className="hover:opacity-80 transition">
                  <p className="text-xl font-bold text-gray-900 dark:text-slate-100">
                    {profile.followersCount >= 1000
                      ? (profile.followersCount / 1000).toFixed(1).replace(".0","") + "K"
                      : profile.followersCount}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">ผู้ติดตาม</p>
                </Link>
              ) : (
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-slate-100">
                    {profile.followersCount >= 1000
                      ? (profile.followersCount / 1000).toFixed(1).replace(".0","") + "K"
                      : profile.followersCount}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">ผู้ติดตาม</p>
                </div>
              )}
              {user?.id ? (
                <Link href={`/profile/${user.id}/following`} className="hover:opacity-80 transition">
                  <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{profile.followingCount}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">กำลังติดตาม</p>
                </Link>
              ) : (
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{profile.followingCount}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">กำลังติดตาม</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-900 dark:text-slate-100">{profile.name}</p>
              {profile.isVerifiedGuide && (
                <span className="text-[11px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full font-semibold">
                  🏅 มัคคุเทศก์ที่ได้รับการรับรอง
                </span>
              )}
              {profile.isGuide && !profile.isVerifiedGuide && (
                <span className="text-[11px] bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  ⏳ รอการยืนยันเป็นมัคคุเทศก์
                </span>
              )}
            </div>
            {profile.username && (
              <p className="text-xs text-gray-400 dark:text-slate-500">@{profile.username}</p>
            )}
            {profile.location && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-[#398AB9]" />
                <span className="text-xs text-gray-400 dark:text-slate-500">{profile.location}</span>
              </div>
            )}
            {profile.bio && (
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* achievements — real counts */}
          <div className="flex gap-3 mt-3 overflow-x-auto scrollbar-none">
            {[
              { icon: "📸", label: "Photographer", count: `${profile.postsCount} โพสต์` },
              { icon: "🗺️", label: "Explorer", count: `${savedPlaces.length} สถานที่บันทึก` },
              { icon: "👥", label: "Social", count: `${profile.followersCount} ผู้ติดตาม` },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 px-3 py-2 rounded-xl flex-shrink-0">
                <span className="text-base">{b.icon}</span>
                <div>
                  <p className="text-[10px] font-semibold text-gray-700 dark:text-slate-300">{b.label}</p>
                  <p className="text-[9px] text-gray-400 dark:text-slate-500">{b.count}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Travel Stats Card ── */}
          <TravelStatsCard
            totalTripDays={profile.totalTripDays}
            placesVisited={profile.placesVisited}
            tripsCount={profile.tripsCount}
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => router.push("/profile/edit")}
              className="flex-1 py-2 bg-[#398AB9] text-white text-sm font-semibold rounded-xl hover:bg-[#1C658C] transition">
              แก้ไขโปรไฟล์
            </button>
            <button
              onClick={() => navigator.share?.({ title: profile.name, url: window.location.href }).catch(() => {})}
              className="flex-1 py-2 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              แชร์โปรไฟล์
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex overflow-x-auto scrollbar-none bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
          {[
            { key: "posts",    icon: Grid3X3,  label: "โพสต์" },
            { key: "trips",    icon: Map,      label: `ทริป${myTrips.length > 0 ? ` (${myTrips.length})` : ""}` },
            { key: "saved",    icon: Bookmark, label: "บันทึก" },
            { key: "reviews",  icon: Star,     label: "รีวิว" },
            { key: "activity", icon: Activity, label: "กิจกรรม" },
          ].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key as typeof tab)}
              className={`flex-none flex flex-col items-center gap-1 px-4 py-3 border-b-2 transition ${
                tab === key ? "border-[#398AB9] text-[#398AB9]" : "border-transparent text-gray-400 dark:text-slate-500"
              }`}>
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Posts grid ── */}
        {tab === "posts" && (
          <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-slate-700">
            {myPosts.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center px-8 bg-white dark:bg-slate-800">
                <Grid3X3 className="w-12 h-12 text-gray-200 dark:text-slate-600 mb-4" />
                <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่มีโพสต์</p>
                <Link href="/create" className="mt-4 text-sm text-[#398AB9] font-medium hover:underline">
                  สร้างโพสต์แรก
                </Link>
              </div>
            ) : (
              myPosts.map((p) => (
                <Link key={p.id} href={`/post/${p.id}`} className="relative aspect-square bg-gray-200 dark:bg-slate-700 overflow-hidden group block">
                  {p.images[0] ? (
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                      <Grid3X3 className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-1 text-white font-semibold text-sm">
                      <Heart className="w-4 h-4 fill-white" />
                      {p.likesCount}
                    </div>
                    <div className="flex items-center gap-1 text-white font-semibold text-sm">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      {p.commentsCount}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {tab === "trips" && (
          <div className="p-4 bg-white dark:bg-slate-800">
            {myTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                <Map className="w-12 h-12 text-gray-200 dark:text-slate-600 mb-4" />
                <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่มีทริป</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">สร้างแผนทริปแรกของคุณ</p>
                <Link href="/trips/new" className="mt-4 text-sm text-[#398AB9] font-medium hover:underline">
                  สร้างทริป →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {myTrips.map((t) => {
                  const itemCount = t.days.reduce((s, d) => s + d.items.length, 0);
                  return (
                    <Link key={t.id} href={`/trips/${t.id}`}
                      className="group rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-slate-700 relative">
                        <img
                          src={t.coverImage ?? `https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=400&q=80&sig=${t.id}`}
                          alt={t.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=400&q=80"; }}
                        />
                        <div className="absolute top-2 left-2">
                          {t.isPublic ? (
                            <span className="text-[9px] font-semibold bg-[#398AB9] text-white px-1.5 py-0.5 rounded-full">Public</span>
                          ) : (
                            <span className="text-[9px] font-semibold bg-black/40 text-white/80 px-1.5 py-0.5 rounded-full">Private</span>
                          )}
                        </div>
                        {itemCount > 0 && (
                          <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {itemCount} จุด
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-bold text-gray-800 dark:text-slate-200 line-clamp-1">{t.title}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{t.destination}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <Link href="/trips/new"
                  className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center aspect-[4/3] text-gray-400 dark:text-slate-500 hover:border-[#398AB9] hover:text-[#398AB9] transition-colors">
                  <span className="text-2xl mb-1">+</span>
                  <span className="text-xs font-medium">สร้างทริปใหม่</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {tab === "saved" && (
          <div>
            {/* Sub-tabs */}
            <div className="flex bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 gap-4">
              {([
                { key: "places", label: "สถานที่", count: savedPlaces.length },
                { key: "posts",  label: "โพสต์",   count: savedPosts.length },
              ] as const).map(({ key, label, count }) => (
                <button key={key} onClick={() => setSavedSubTab(key)}
                  className={`py-3 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
                    savedSubTab === key ? "border-[#398AB9] text-[#398AB9]" : "border-transparent text-gray-400 dark:text-slate-500"
                  }`}>
                  {label}
                  {count > 0 && (
                    <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">{count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Saved places */}
            {savedSubTab === "places" && (
              savedPlaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-8 bg-white dark:bg-slate-800">
                  <Bookmark className="w-12 h-12 text-gray-200 dark:text-slate-600 mb-4" />
                  <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่มีสถานที่ที่บันทึก</p>
                  <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">กด 🔖 บนสถานที่ที่ชอบใน สำรวจ</p>
                  <Link href="/explore" className="mt-4 text-sm text-[#398AB9] font-medium hover:underline">
                    สำรวจสถานที่
                  </Link>
                </div>
              ) : (
                <div className="p-4 space-y-3 bg-white dark:bg-slate-800 min-h-full">
                  {savedPlaces.map((s) => (
                    <Link key={s.id} href={`/place/${s.place.slug}`}
                      className="flex gap-3 bg-white dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-700 p-3 hover:shadow-md transition-shadow group">
                      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700">
                        {s.place.coverImage ? (
                          <img src={s.place.coverImage} alt={s.place.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🗺️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">{s.place.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#398AB9] flex-shrink-0" />
                          <span className="text-xs text-gray-400 dark:text-slate-500 truncate">{s.place.province ?? s.place.nameEn}</span>
                        </div>
                        {s.place.rating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <StarIcon className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{s.place.rating.toFixed(1)}</span>
                          </div>
                        )}
                        <span className="text-[10px] bg-[#398AB9]/8 text-[#398AB9] px-2 py-0.5 rounded-full mt-1.5 inline-block">
                          {"฿".repeat(s.place.priceRange)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* Saved posts */}
            {savedSubTab === "posts" && (
              savedPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-8 bg-white dark:bg-slate-800">
                  <Bookmark className="w-12 h-12 text-gray-200 dark:text-slate-600 mb-4" />
                  <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่มีโพสต์ที่บันทึก</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-slate-700">
                  {savedPosts.map((p) => (
                    <Link key={p.id} href={`/post/${p.id}`}
                      className="relative aspect-square bg-gray-200 dark:bg-slate-700 overflow-hidden group cursor-pointer">
                      {p.images[0] ? (
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Bookmark className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                          <Heart className="w-4 h-4 fill-white" />
                          {p.likesCount}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8 bg-white dark:bg-slate-800">
            <Star className="w-12 h-12 text-gray-200 dark:text-slate-600 mb-4" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่มีรีวิว</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">แบ่งปันประสบการณ์ท่องเที่ยวของคุณ</p>
            <Link href="/explore" className="mt-4 text-sm text-[#398AB9] font-medium hover:underline">
              เขียนรีวิว
            </Link>
          </div>
        )}

        {/* ── Activity Timeline ── */}
        {tab === "activity" && (
          <div className="bg-white dark:bg-slate-800 min-h-[300px] px-4 py-5">
            {activityItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                <Activity className="w-12 h-12 text-gray-200 dark:text-slate-600 mb-4" />
                <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่มีกิจกรรม</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">โพสต์ วางแผนทริป หรือเขียนรีวิว</p>
              </div>
            ) : (
              <div className="relative">
                {/* vertical timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100 dark:bg-slate-700" />
                <div className="space-y-5">
                  {activityItems.map((item) => {
                    const rel = (() => {
                      const diff = Date.now() - new Date(item.createdAt).getTime();
                      const mins = Math.floor(diff / 60000);
                      const hrs  = Math.floor(diff / 3600000);
                      const days = Math.floor(diff / 86400000);
                      const months = Math.floor(days / 30);
                      if (mins < 60) return `${mins} นาทีที่แล้ว`;
                      if (hrs < 24)  return `${hrs} ชั่วโมงที่แล้ว`;
                      if (days < 30) return `${days} วันที่แล้ว`;
                      return `${months} เดือนที่แล้ว`;
                    })();

                    if (item.kind === "post") {
                      return (
                        <Link key={`post-${item.id}`} href={`/post/${item.id}`}
                          className="flex gap-4 pl-10 relative hover:opacity-80 transition group">
                          <div className="absolute left-0 w-8 h-8 rounded-full bg-[#398AB9]/10 border-2 border-white dark:border-slate-800 flex items-center justify-center flex-shrink-0 z-10">
                            <Camera className="w-3.5 h-3.5 text-[#398AB9]" />
                          </div>
                          {item.image && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-700">
                              <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display="none"; }} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 py-1">
                            <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">เพิ่มโพสต์ใหม่</p>
                            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{item.caption}</p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 dark:text-slate-500">
                              <Heart className="w-3 h-3" /> {item.likesCount}
                              <span className="ml-auto">{rel}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    }

                    if (item.kind === "trip") {
                      return (
                        <Link key={`trip-${item.id}`} href={`/trips/${item.id}`}
                          className="flex gap-4 pl-10 relative hover:opacity-80 transition group">
                          <div className="absolute left-0 w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border-2 border-white dark:border-slate-800 flex items-center justify-center flex-shrink-0 z-10">
                            <Map className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          {item.coverImage && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-700">
                              <img src={item.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display="none"; }} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 py-1">
                            <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">สร้างแผนทริปใหม่</p>
                            <p className="text-[11px] text-[#398AB9] font-medium mt-0.5 line-clamp-1">{item.title}</p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 dark:text-slate-500">
                              <MapPin className="w-3 h-3" /> {item.destination}
                              <span className="ml-auto">{rel}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    }

                    /* review */
                    return (
                      <Link key={`review-${item.id}`} href={`/place/${item.placeSlug}`}
                        className="flex gap-4 pl-10 relative hover:opacity-80 transition">
                        <div className="absolute left-0 w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 border-2 border-white dark:border-slate-800 flex items-center justify-center flex-shrink-0 z-10">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">รีวิว {item.placeName}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < item.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-slate-600"}`} />
                            ))}
                          </div>
                          {item.content && (
                            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{item.content}</p>
                          )}
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 text-right">{rel}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
