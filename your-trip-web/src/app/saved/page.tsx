"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { Bookmark, Heart, MessageCircle, MapPin, X, Grid3x3, List as ListIcon } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { getSavedPosts, toggleSave, type SavedPostItem } from "@/server/actions/posts";
import { useToast } from "@/components/shared/Toast";

function fmtDate(d: Date | string) {
  const ms = Date.now() - new Date(d).getTime();
  const day = Math.floor(ms / 86400000);
  if (day < 1) return "วันนี้";
  if (day < 7) return `${day} วันที่แล้ว`;
  if (day < 30) return `${Math.floor(day / 7)} สัปดาห์ที่แล้ว`;
  return `${Math.floor(day / 30)} เดือนที่แล้ว`;
}

export default function SavedPage() {
  const toast = useToast();
  const [posts, setPosts] = useState<SavedPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    getSavedPosts(60).then(({ data }) => {
      setPosts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleUnsave(postId: string) {
    setPosts((p) => p.filter((x) => x.id !== postId));
    const res = await toggleSave(postId) as { error?: { message: string } };
    if (res.error) {
      toast.error(res.error.message ?? "เกิดข้อผิดพลาด");
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#398AB9] to-[#1C658C] flex items-center justify-center shadow-lg shadow-[#398AB9]/20">
              <Bookmark className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">โพสต์ที่บันทึก</h1>
              <p className="text-xs text-gray-400 dark:text-slate-500">{posts.length} โพสต์</p>
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
            <button onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-white dark:bg-slate-600 shadow-sm" : "text-gray-400 dark:text-slate-500"}`}>
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-white dark:bg-slate-600 shadow-sm" : "text-gray-400 dark:text-slate-500"}`}>
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className={viewMode === "grid" ? "grid grid-cols-3 gap-1" : "space-y-3"}>
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className={`animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl ${viewMode === "grid" ? "aspect-square" : "h-28"}`} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#398AB9]/8 flex items-center justify-center mb-5">
              <Bookmark className="w-9 h-9 text-[#398AB9]/40" />
            </div>
            <p className="font-semibold text-gray-700 dark:text-slate-200 mb-1">ยังไม่มีโพสต์ที่บันทึก</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 max-w-xs">
              กดปุ่มบันทึก 🔖 ที่โพสต์ไหนก็ได้ เพื่อเก็บไว้ดูทีหลัง
            </p>
            <Link href="/feed"
              className="mt-5 px-5 py-2.5 bg-[#398AB9] text-white text-sm font-bold rounded-2xl hover:bg-[#1C658C] transition shadow-lg shadow-[#398AB9]/20">
              สำรวจโพสต์
            </Link>
          </div>
        )}

        {/* Grid view */}
        {!loading && posts.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <div key={post.id} className="relative group aspect-square">
                <Link href={`/post/${post.id}`}>
                  {post.images[0] ? (
                    <img src={post.images[0]} alt=""
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy" referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#398AB9]/10 to-[#1C658C]/10 flex items-center justify-center p-3">
                      <p className="text-xs text-gray-500 dark:text-slate-400 text-center line-clamp-4">{post.content}</p>
                    </div>
                  )}
                </Link>
                {/* Overlay on hover */}
                <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <span className="flex items-center gap-1 text-white text-xs font-bold">
                    <Heart className="w-3.5 h-3.5 fill-white" /> {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1 text-white text-xs font-bold">
                    <MessageCircle className="w-3.5 h-3.5 fill-white" /> {post.commentsCount}
                  </span>
                </div>
                {/* Unsave button */}
                <button onClick={() => handleUnsave(post.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {!loading && posts.length > 0 && viewMode === "list" && (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="flex gap-3 p-3">
                  {post.images[0] && (
                    <Link href={`/post/${post.id}`} className="flex-shrink-0">
                      <img src={post.images[0]} alt=""
                        className="w-20 h-20 object-cover rounded-xl"
                        loading="lazy" referrerPolicy="no-referrer"
                      />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar name={post.user.name ?? post.user.username ?? "?"} src={post.user.avatarUrl} className="w-6 h-6" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 truncate">
                        {post.user.name ?? post.user.username}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-auto flex-shrink-0">
                        {fmtDate(post.savedAt)}
                      </span>
                    </div>
                    <Link href={`/post/${post.id}`}>
                      <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-2 leading-snug hover:text-[#398AB9] transition">
                        {post.content}
                      </p>
                    </Link>
                    {post.place && (
                      <Link href={`/place/${post.place.slug}`}
                        className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-[#398AB9] bg-[#398AB9]/8 px-2 py-0.5 rounded-full">
                        <MapPin className="w-2.5 h-2.5" /> {post.place.name}
                      </Link>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
                        <Heart className="w-3 h-3" /> {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
                        <MessageCircle className="w-3 h-3" /> {post.commentsCount}
                      </span>
                      <button onClick={() => handleUnsave(post.id)}
                        className="ml-auto text-[11px] text-red-400 hover:text-red-500 flex items-center gap-1 transition">
                        <X className="w-3 h-3" /> ลบออก
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
