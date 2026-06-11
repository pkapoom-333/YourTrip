"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import {
  ChevronLeft, MapPin, Grid3X3, Star,
  Heart, UserPlus, UserCheck, MessageCircle, Map,
  MoreVertical, ShieldOff, Shield, X, Activity, Camera,
} from "lucide-react";
import {
  getProfile,
  getUserPosts,
  getRecentActivity,
  followUser,
  unfollowUser,
  checkIsFollowing,
  blockUser,
  unblockUser,
  type PostGridItem,
  type ActivityItem,
} from "@/server/actions/profile";
import { getUserPublicTrips, type PublicTripItem } from "@/server/actions/trips";
import { Avatar } from "@/components/shared/Avatar";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/components/shared/Toast";

interface ProfileState {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  avatarUrl: string | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isVerifiedGuide: boolean;
}

const AVATAR_COLORS = [
  "bg-[#398AB9]", "bg-emerald-500", "bg-violet-500",
  "bg-orange-400", "bg-pink-400", "bg-amber-500",
];

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [posts, setPosts] = useState<PostGridItem[]>([]);
  const [publicTrips, setPublicTrips] = useState<PublicTripItem[]>([]);
  const [tab, setTab] = useState<"posts" | "trips" | "reviews" | "activity">("posts");
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const { user: currentUser } = useUser();
  const { success } = useToast();

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (!userId) return;

    Promise.all([
      getProfile(userId),
      getUserPosts(userId),
      checkIsFollowing(userId),
      getUserPublicTrips(userId),
      getRecentActivity(userId),
    ]).then(([profileRes, postsRes, followRes, tripsRes, activityRes]) => {
      setActivityItems(activityRes.data);
      if (profileRes.data) {
        setProfile({
          id: profileRes.data.id ?? userId,
          name: profileRes.data.name ?? "ผู้ใช้",
          username: profileRes.data.username ?? "",
          bio: profileRes.data.bio ?? "",
          location: profileRes.data.location ?? "",
          avatarUrl: profileRes.data.avatarUrl ?? null,
          postsCount: profileRes.data.postsCount,
          followersCount: profileRes.data.followersCount,
          followingCount: profileRes.data.followingCount,
          isVerifiedGuide: (profileRes.data as { isVerifiedGuide?: boolean }).isVerifiedGuide ?? false,
        });
        setFollowerCount(profileRes.data.followersCount);
      }
      if (postsRes.data.length > 0) setPosts(postsRes.data);
      setIsFollowing(followRes.following);
      setPublicTrips(tripsRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  async function handleBlock() {
    if (!profile) return;
    setBlockLoading(true);
    if (isBlocked) {
      await unblockUser(profile.id);
      setIsBlocked(false);
      success(`เลิกบล็อก ${profile.name} แล้ว`);
    } else {
      await blockUser(profile.id);
      setIsBlocked(true);
      setIsFollowing(false);
      success(`บล็อก ${profile.name} แล้ว`);
    }
    setBlockLoading(false);
    setConfirmBlock(false);
    setMenuOpen(false);
  }

  async function handleFollow() {
    if (!profile) return;
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount((n) => n - 1);
      unfollowUser(profile.id).catch(() => {
        setIsFollowing(true);
        setFollowerCount((n) => n + 1);
      });
    } else {
      setIsFollowing(true);
      setFollowerCount((n) => n + 1);
      followUser(profile.id).catch(() => {
        setIsFollowing(false);
        setFollowerCount((n) => n - 1);
      });
      success(`ติดตาม ${profile.name} แล้ว ✓`);
    }
  }

  const avatarColor = AVATAR_COLORS[(profile?.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  const initials = (profile?.name ?? "U").charAt(0).toUpperCase();

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-14 bg-gray-100 dark:bg-slate-700 mb-4" />
            <div className="px-4 pt-4 pb-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-full" />
                <div className="flex gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-5 bg-gray-200 dark:bg-slate-700 rounded" />
                      <div className="w-10 h-3 bg-gray-100 dark:bg-slate-700/60 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700/60 rounded w-48" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <p className="text-gray-500 dark:text-slate-400 font-medium">ไม่พบผู้ใช้นี้</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-[#398AB9] font-medium hover:underline"
          >
            กลับ
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Mobile header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 flex-1 truncate">
          {profile.username ? `@${profile.username}` : profile.name}
        </span>
        {!isOwnProfile && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-1 -m-1 rounded-lg transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-6 z-50 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-[150px]">
                  <button
                    onClick={() => { setMenuOpen(false); setConfirmBlock(true); }}
                    className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm transition text-left ${
                      isBlocked
                        ? "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                        : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    }`}
                  >
                    {isBlocked ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                    {isBlocked ? "เลิกบล็อก" : "บล็อกผู้ใช้"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Block confirmation dialog */}
      {confirmBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-slate-100">
                {isBlocked ? "เลิกบล็อก" : "บล็อก"}{profile.name}?
              </h3>
              <button onClick={() => setConfirmBlock(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
              {isBlocked
                ? "หลังจากเลิกบล็อก ผู้ใช้นี้จะสามารถดูโปรไฟล์และโพสต์ของคุณได้อีกครั้ง"
                : "ผู้ใช้ที่ถูกบล็อกจะไม่เห็นโปรไฟล์ โพสต์ หรือติดตามคุณได้"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmBlock(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleBlock}
                disabled={blockLoading}
                className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 ${
                  isBlocked ? "bg-[#398AB9] hover:bg-[#1C658C]" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {blockLoading ? "กำลังดำเนินการ..." : isBlocked ? "เลิกบล็อก" : "บล็อก"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Profile header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 md:px-6 pt-4 pb-5">
          <div className="flex items-center justify-between mb-4">
            {/* Avatar */}
            <Avatar src={profile.avatarUrl} name={profile.name} className="w-20 h-20 text-2xl" />

            {/* Stats */}
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{profile.postsCount}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">โพสต์</p>
              </div>
              <Link href={`/profile/${profile.id}/followers`} className="hover:opacity-80 transition">
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">
                  {followerCount >= 1000
                    ? (followerCount / 1000).toFixed(1).replace(".0", "") + "K"
                    : followerCount}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500">ผู้ติดตาม</p>
              </Link>
              <Link href={`/profile/${profile.id}/following`} className="hover:opacity-80 transition">
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{profile.followingCount}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">กำลังติดตาม</p>
              </Link>
            </div>
          </div>

          {/* Name & bio */}
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-900 dark:text-slate-100">{profile.name}</p>
              {profile.isVerifiedGuide && (
                <span className="text-[11px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full font-semibold">
                  🏅 มัคคุเทศก์ที่ได้รับการรับรอง
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

          {/* Action buttons */}
          {isOwnProfile ? (
            <Link href="/profile/edit"
              className="flex items-center justify-center gap-2 py-2 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition w-full">
              แก้ไขโปรไฟล์
            </Link>
          ) : isBlocked ? (
            <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <ShieldOff className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
              <p className="text-sm text-gray-500 dark:text-slate-400 flex-1">คุณบล็อกผู้ใช้นี้อยู่</p>
              <button onClick={() => setConfirmBlock(true)} className="text-xs text-[#398AB9] font-medium hover:underline flex-shrink-0">เลิกบล็อก</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleFollow}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition ${
                  isFollowing
                    ? "border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                    : "bg-[#398AB9] text-white hover:bg-[#1C658C]"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    ติดตามอยู่
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    ติดตาม
                  </>
                )}
              </button>
              <Link
                href={`/buddy?request=${profile.id}`}
                className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <MessageCircle className="w-4 h-4" />
                ส่งคำขอทริป
              </Link>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-none bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
          {[
            { key: "posts",    icon: Grid3X3,  label: "โพสต์" },
            { key: "trips",    icon: Map,      label: `ทริป${publicTrips.length > 0 ? ` (${publicTrips.length})` : ""}` },
            { key: "reviews",  icon: Star,     label: "รีวิว" },
            { key: "activity", icon: Activity, label: "กิจกรรม" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={`flex-none flex flex-col items-center gap-1 px-4 py-3 border-b-2 transition ${
                tab === key ? "border-[#398AB9] text-[#398AB9]" : "border-transparent text-gray-400 dark:text-slate-500"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {tab === "posts" && (
          <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-slate-700">
            {posts.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center px-8 bg-white dark:bg-slate-800">
                <Grid3X3 className="w-12 h-12 text-gray-200 dark:text-slate-600 mb-4" />
                <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่มีโพสต์</p>
              </div>
            ) : (
              posts.map((p) => (
                <div
                  key={p.id}
                  className="relative aspect-square bg-gray-200 dark:bg-slate-700 overflow-hidden group cursor-pointer"
                >
                  {p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                      <Grid3X3 className="w-6 h-6 text-gray-300 dark:text-slate-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                      <Heart className="w-4 h-4 fill-white" />
                      {p.likesCount}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "trips" && (
          <div className="p-4 bg-white dark:bg-slate-800">
            {publicTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                <Map className="w-12 h-12 text-gray-200 dark:text-slate-600 mb-4" />
                <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่มีทริปสาธารณะ</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">ทริปที่ตั้งเป็น Public จะปรากฏที่นี่</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {publicTrips.map((t) => (
                  <Link
                    key={t.id}
                    href={`/trips/${t.id}`}
                    className="group rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-slate-700 relative">
                      <img
                        src={t.coverImage ?? `https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=400&q=80&sig=${t.id}`}
                        alt={t.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=400&q=80"; }}
                      />
                      {t.itemCount > 0 && (
                        <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {t.itemCount} จุด
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
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8 bg-white dark:bg-slate-800">
            <Star className="w-12 h-12 text-gray-200 dark:text-slate-600 mb-4" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่มีรีวิว</p>
          </div>
        )}

        {/* Activity Timeline */}
        {tab === "activity" && (
          <div className="bg-white dark:bg-slate-800 min-h-[300px] px-4 py-5">
            {activityItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                <Activity className="w-12 h-12 text-gray-200 dark:text-slate-600 mb-4" />
                <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่มีกิจกรรม</p>
              </div>
            ) : (
              <div className="relative">
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
