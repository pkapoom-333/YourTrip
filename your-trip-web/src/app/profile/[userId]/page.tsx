"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import {
  ChevronLeft, MapPin, Grid3X3, Star,
  Heart, UserPlus, UserCheck, MessageCircle,
} from "lucide-react";
import {
  getProfile,
  getUserPosts,
  followUser,
  unfollowUser,
  checkIsFollowing,
  type PostGridItem,
} from "@/server/actions/profile";

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
  const [tab, setTab] = useState<"posts" | "reviews">("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    Promise.all([
      getProfile(userId),
      getUserPosts(userId),
      checkIsFollowing(userId),
    ]).then(([profileRes, postsRes, followRes]) => {
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
        });
        setFollowerCount(profileRes.data.followersCount);
      }
      if (postsRes.data.length > 0) setPosts(postsRes.data);
      setIsFollowing(followRes.following);
      setLoading(false);
    });
  }, [userId]);

  async function handleFollow() {
    if (!profile) return;
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount((n) => n - 1);
      unfollowUser(profile.id).catch(() => {});
    } else {
      setIsFollowing(true);
      setFollowerCount((n) => n + 1);
      followUser(profile.id).catch(() => {});
    }
  }

  const avatarColor = AVATAR_COLORS[(profile?.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  const initials = (profile?.name ?? "U").charAt(0).toUpperCase();

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-14 bg-gray-100 mb-4" />
            <div className="px-4 pt-4 pb-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full" />
                <div className="flex gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-5 bg-gray-200 rounded" />
                      <div className="w-10 h-3 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-48" />
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
          <p className="text-gray-500 font-medium">ไม่พบผู้ใช้นี้</p>
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
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-900 flex-1 truncate">
          {profile.username ? `@${profile.username}` : profile.name}
        </span>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Profile header */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-6 pt-4 pb-5">
          <div className="flex items-center justify-between mb-4">
            {/* Avatar */}
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className={`w-20 h-20 ${avatarColor} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
                {initials}
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-xl font-bold text-gray-900">{profile.postsCount}</p>
                <p className="text-xs text-gray-400">โพสต์</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {followerCount >= 1000
                    ? (followerCount / 1000).toFixed(1).replace(".0", "") + "K"
                    : followerCount}
                </p>
                <p className="text-xs text-gray-400">ผู้ติดตาม</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{profile.followingCount}</p>
                <p className="text-xs text-gray-400">กำลังติดตาม</p>
              </div>
            </div>
          </div>

          {/* Name & bio */}
          <div className="mb-4">
            <p className="font-bold text-gray-900">{profile.name}</p>
            {profile.username && (
              <p className="text-xs text-gray-400">@{profile.username}</p>
            )}
            {profile.location && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-[#398AB9]" />
                <span className="text-xs text-gray-400">{profile.location}</span>
              </div>
            )}
            {profile.bio && (
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleFollow}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition ${
                isFollowing
                  ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
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
              className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              <MessageCircle className="w-4 h-4" />
              ส่งคำขอทริป
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-b border-gray-100">
          {[
            { key: "posts",   icon: Grid3X3, label: "โพสต์" },
            { key: "reviews", icon: Star,    label: "รีวิว" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 border-b-2 transition ${
                tab === key ? "border-[#398AB9] text-[#398AB9]" : "border-transparent text-gray-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {tab === "posts" && (
          <div className="grid grid-cols-3 gap-px bg-gray-100">
            {posts.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center px-8">
                <Grid3X3 className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">ยังไม่มีโพสต์</p>
              </div>
            ) : (
              posts.map((p) => (
                <div
                  key={p.id}
                  className="relative aspect-square bg-gray-200 overflow-hidden group cursor-pointer"
                >
                  {p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Grid3X3 className="w-6 h-6 text-gray-300" />
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

        {tab === "reviews" && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <Star className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">ยังไม่มีรีวิว</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
