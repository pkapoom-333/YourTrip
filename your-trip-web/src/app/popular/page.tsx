import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { Flame, Heart, MessageCircle } from "lucide-react";
import { getPopularThisWeek } from "@/server/actions/posts";
import { Avatar } from "@/components/shared/Avatar";

export const metadata: Metadata = {
  title: "ยอดนิยมสัปดาห์นี้ | YourTrip",
  description: "โพสต์ที่ได้รับความนิยมสูงสุดในสัปดาห์นี้บน YourTrip",
};

function fmtDate(d: Date | string) {
  const ms = Date.now() - new Date(d).getTime();
  const day = Math.floor(ms / 86400000);
  if (day < 1) return "วันนี้";
  if (day === 1) return "เมื่อวาน";
  return `${day} วันที่แล้ว`;
}

export default async function PopularPage() {
  const { data: posts } = await getPopularThisWeek(18);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-400/20">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">ยอดนิยมสัปดาห์นี้</h1>
            <p className="text-xs text-gray-400 dark:text-slate-500">โพสต์ที่ได้รับความนิยมสูงสุด 7 วันที่ผ่านมา</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Flame className="w-16 h-16 text-gray-200 dark:text-slate-700 mb-4" />
            <p className="text-gray-400 dark:text-slate-500">ยังไม่มีข้อมูล</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 mb-6">
            {posts.map((post, idx) => (
              <Link key={post.id} href={`/post/${post.id}`}
                className="relative group aspect-square bg-gray-100 dark:bg-slate-700 overflow-hidden rounded-xl">
                {post.images[0] ? (
                  <img src={post.images[0]} alt=""
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                    loading="lazy" referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3 bg-gradient-to-br from-[#398AB9]/10 to-[#1C658C]/10">
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 text-center line-clamp-4">{post.content}</p>
                  </div>
                )}
                {/* Rank badge for top 3 */}
                {idx < 3 && (
                  <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${
                    idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-gray-400" : "bg-orange-600"
                  }`}>
                    {idx + 1}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <span className="flex items-center gap-1 text-white text-xs font-bold">
                    <Heart className="w-3.5 h-3.5 fill-white" /> {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1 text-white text-xs font-bold">
                    <MessageCircle className="w-3.5 h-3.5 fill-white" /> {post.commentsCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Top posts list view */}
        {posts.slice(0, 5).length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">อันดับต้น ๆ สัปดาห์นี้</h2>
            <div className="space-y-3">
              {posts.slice(0, 5).map((post, idx) => (
                <Link key={post.id} href={`/post/${post.id}`}
                  className="flex gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3 hover:border-[#398AB9]/30 hover:shadow-sm transition">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400" : idx === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400 dark:bg-slate-700/50"
                  }`}>
                    {idx + 1}
                  </span>
                  {post.images[0] && (
                    <img src={post.images[0]} alt=""
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      loading="lazy" referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Avatar name={post.user.name ?? post.user.username ?? "?"} src={post.user.avatarUrl} className="w-5 h-5" />
                      <span className="text-[11px] font-semibold text-gray-600 dark:text-slate-400 truncate">
                        {post.user.name ?? post.user.username}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-auto">{fmtDate(post.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-2 leading-snug">{post.content}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-[#FF4F4F] font-semibold">
                        <Heart className="w-3 h-3 fill-current" /> {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
                        <MessageCircle className="w-3 h-3" /> {post.commentsCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
