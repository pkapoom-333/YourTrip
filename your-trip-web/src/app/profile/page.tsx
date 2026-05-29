"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { Settings, MapPin, Grid3X3, Bookmark, Heart, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { getProfile, getUserPosts, getUserSavedPosts, type PostGridItem } from "@/server/actions/profile";
import { useUser } from "@/hooks/useUser";
import { Avatar } from "@/components/shared/Avatar";

// Mock fallback posts (shown when DB not configured)
const MOCK_POSTS: PostGridItem[] = [
  { id: "m1", images: ["https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=400&q=80"], likesCount: 284, commentsCount: 12 },
  { id: "m2", images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80"], likesCount: 512, commentsCount: 24 },
  { id: "m3", images: ["https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=400&q=80"], likesCount: 1024, commentsCount: 48 },
  { id: "m4", images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80"], likesCount: 763, commentsCount: 31 },
  { id: "m5", images: ["https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=400&q=80"], likesCount: 445, commentsCount: 18 },
  { id: "m6", images: ["https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=400&q=80"], likesCount: 329, commentsCount: 9 },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const [tab, setTab] = useState<"posts" | "saved" | "reviews">("posts");
  const [profile, setProfile] = useState({
    id: "" as string,
    name: "Your Trip User",
    username: "yourtrip_user",
    bio: "นักเดินทางสายธรรมชาติ ✈️ | ไปแล้ว 23 ประเทศ | กำลังวางแผนทริปต่อไป 🌍",
    location: "เชียงใหม่, ไทย",
    avatarUrl: null as string | null,
    postsCount: 48,
    followersCount: 1200,
    followingCount: 234,
  });
  const [myPosts, setMyPosts] = useState<PostGridItem[]>(MOCK_POSTS);
  const [savedPosts, setSavedPosts] = useState<PostGridItem[]>([]);

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
        postsCount: data.postsCount,
        followersCount: data.followersCount,
        followingCount: data.followingCount,
      });
    });
    getUserPosts().then(({ data }) => {
      if (data.length > 0) setMyPosts(data);
    });
    getUserSavedPosts().then(({ data }) => setSavedPosts(data));
  }, []);

  return (
    <AppShell>
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-bold text-[#398AB9]">โปรไฟล์</span>
        <Link href="/settings">
          <Settings className="w-5 h-5 text-gray-500" />
        </Link>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* ── Profile header ── */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-6 pt-4 pb-5 md:rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <Avatar src={profile.avatarUrl} name={profile.name} className="w-20 h-20 text-2xl" />
            <div className="flex gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-gray-900">{profile.postsCount}</p>
                <p className="text-xs text-gray-400">โพสต์</p>
              </div>
              {user?.id ? (
                <Link href={`/profile/${user.id}/followers`} className="hover:opacity-80 transition">
                  <p className="text-xl font-bold text-gray-900">
                    {profile.followersCount >= 1000
                      ? (profile.followersCount / 1000).toFixed(1).replace(".0","") + "K"
                      : profile.followersCount}
                  </p>
                  <p className="text-xs text-gray-400">ผู้ติดตาม</p>
                </Link>
              ) : (
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {profile.followersCount >= 1000
                      ? (profile.followersCount / 1000).toFixed(1).replace(".0","") + "K"
                      : profile.followersCount}
                  </p>
                  <p className="text-xs text-gray-400">ผู้ติดตาม</p>
                </div>
              )}
              {user?.id ? (
                <Link href={`/profile/${user.id}/following`} className="hover:opacity-80 transition">
                  <p className="text-xl font-bold text-gray-900">{profile.followingCount}</p>
                  <p className="text-xs text-gray-400">กำลังติดตาม</p>
                </Link>
              ) : (
                <div>
                  <p className="text-xl font-bold text-gray-900">{profile.followingCount}</p>
                  <p className="text-xs text-gray-400">กำลังติดตาม</p>
                </div>
              )}
            </div>
          </div>

          <div>
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

          {/* achievements */}
          <div className="flex gap-3 mt-3 overflow-x-auto scrollbar-none">
            {[
              { icon: "🗺️", label: "Explorer", count: "23 ประเทศ" },
              { icon: "📸", label: "Photographer", count: "48 โพสต์" },
              { icon: "⭐", label: "Top Reviewer", count: "156 รีวิว" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl flex-shrink-0">
                <span className="text-base">{b.icon}</span>
                <div>
                  <p className="text-[10px] font-semibold text-gray-700">{b.label}</p>
                  <p className="text-[9px] text-gray-400">{b.count}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => router.push("/profile/edit")}
              className="flex-1 py-2 bg-[#398AB9] text-white text-sm font-semibold rounded-xl hover:bg-[#1C658C] transition">
              แก้ไขโปรไฟล์
            </button>
            <button
              onClick={() => navigator.share?.({ title: profile.name, url: window.location.href }).catch(() => {})}
              className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">
              แชร์โปรไฟล์
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex bg-white border-b border-gray-100">
          {[
            { key: "posts",   icon: Grid3X3,  label: "โพสต์" },
            { key: "saved",   icon: Bookmark, label: "บันทึก" },
            { key: "reviews", icon: Star,     label: "รีวิว" },
          ].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key as typeof tab)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 border-b-2 transition ${
                tab === key ? "border-[#398AB9] text-[#398AB9]" : "border-transparent text-gray-400"
              }`}>
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Posts grid ── */}
        {tab === "posts" && (
          <div className="grid grid-cols-3 gap-px bg-gray-100">
            {myPosts.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center px-8">
                <Grid3X3 className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">ยังไม่มีโพสต์</p>
                <Link href="/create" className="mt-4 text-sm text-[#398AB9] font-medium hover:underline">
                  สร้างโพสต์แรก
                </Link>
              </div>
            ) : (
              myPosts.map((p) => (
                <div key={p.id} className="relative aspect-square bg-gray-200 overflow-hidden group cursor-pointer">
                  {p.images[0] ? (
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Grid3X3 className="w-6 h-6 text-gray-400" />
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

        {tab === "saved" && (
          savedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-8">
              <Bookmark className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">ยังไม่มีที่บันทึก</p>
              <p className="text-sm text-gray-400 mt-1">กด บันทึก บนโพสต์หรือสถานที่ที่ชอบ</p>
              <Link href="/explore" className="mt-4 text-sm text-[#398AB9] font-medium hover:underline">
                สำรวจสถานที่
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-px bg-gray-100">
              {savedPosts.map((p) => (
                <div key={p.id} className="relative aspect-square bg-gray-200 overflow-hidden group cursor-pointer">
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
                </div>
              ))}
            </div>
          )
        )}

        {tab === "reviews" && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <Star className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">ยังไม่มีรีวิว</p>
            <p className="text-sm text-gray-400 mt-1">แบ่งปันประสบการณ์ท่องเที่ยวของคุณ</p>
            <Link href="/explore" className="mt-4 text-sm text-[#398AB9] font-medium hover:underline">
              เขียนรีวิว
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
