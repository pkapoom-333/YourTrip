"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, EyeOff, Trash2, Flag, Image as ImageIcon, MessageCircle, Heart } from "lucide-react";
import type { AdminPost } from "@/server/actions/admin";
import { hidePost, deletePost } from "@/server/actions/admin";
import Image from "next/image";

interface Props {
  initialPosts: AdminPost[];
  total: number;
  initialSearch: string;
  initialPage: number;
  initialFilter: "all" | "reported" | "hidden";
}

export default function AdminContentClient({ initialPosts, total, initialSearch, initialPage, initialFilter }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState(initialFilter);
  const [posts, setPosts] = useState(initialPosts);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (q: string) => {
    setSearch(q);
    startTransition(() => {
      router.push(`/admin/content?q=${encodeURIComponent(q)}&page=1&filter=${filter}`);
    });
  };

  const handleFilter = (f: "all" | "reported" | "hidden") => {
    setFilter(f);
    router.push(`/admin/content?q=${search}&page=1&filter=${f}`);
  };

  const handleHide = async (postId: string, hidden: boolean) => {
    await hidePost(postId, hidden);
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isHidden: hidden } : p));
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("ลบโพสต์นี้? ไม่สามารถกู้คืนได้")) return;
    startTransition(async () => {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    });
  };

  const totalPages = Math.ceil(total / 20);
  const filters: { key: "all" | "reported" | "hidden"; label: string }[] = [
    { key: "all", label: "ทั้งหมด" },
    { key: "reported", label: "ถูกรายงาน" },
    { key: "hidden", label: "ซ่อนอยู่" },
  ];

  return (
    <div className="p-4 pt-16 md:pt-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">ทั้งหมด {total.toLocaleString()} โพสต์</p>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === key
                  ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="ค้นหาเนื้อหา, ชื่อผู้ใช้..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#398AB9]"
          />
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-3">
        {posts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-12 text-center text-gray-400 dark:text-slate-500">
            ไม่พบโพสต์
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 p-4 ${
                post.isHidden
                  ? "border-orange-200 dark:border-orange-800/50 opacity-70"
                  : post.reportCount > 0
                  ? "border-red-200 dark:border-red-800/50"
                  : "border-gray-100"
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                {post.user.avatarUrl ? (
                  <Image src={post.user.avatarUrl} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 bg-[#398AB9]/20 rounded-full flex items-center justify-center text-[#398AB9] text-xs font-bold flex-shrink-0">
                    {(post.user.name ?? "U").charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.user.name ?? "ไม่มีชื่อ"}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{new Date(post.createdAt).toLocaleDateString("th-TH")}</p>
                </div>
                {post.isHidden && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium">ซ่อนอยู่</span>
                )}
                {post.reportCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                    <Flag className="w-3 h-3" />{post.reportCount}
                  </span>
                )}
              </div>

              {/* Content */}
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-3 line-clamp-3">{post.content}</p>

              {/* Images */}
              {post.images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {post.images.slice(0, 4).map((img, i) => (
                    <Image
                      key={i}
                      src={img}
                      alt=""
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 cursor-pointer hover:opacity-80"
                      onClick={() => window.open(img, "_blank")}
                    />
                  ))}
                </div>
              )}

              {/* Stats + Actions */}
              <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-slate-500">
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post.likeCount}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{post.commentCount}</span>
                {post.images.length > 0 && (
                  <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" />{post.images.length}</span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <a
                    href={`/post/${post.id}`}
                    target="_blank"
                    className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    ดูโพสต์
                  </a>
                  <button
                    onClick={() => handleHide(post.id, !post.isHidden)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      post.isHidden
                        ? "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        : "text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                    title={post.isHidden ? "แสดงโพสต์" : "ซ่อนโพสต์"}
                  >
                    {post.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="ลบโพสต์"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500 dark:text-slate-400">หน้า {initialPage} จาก {totalPages}</span>
          <div className="flex gap-2">
            {initialPage > 1 && (
              <button onClick={() => router.push(`/admin/content?q=${search}&page=${initialPage - 1}&filter=${filter}`)}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                ก่อนหน้า
              </button>
            )}
            {initialPage < totalPages && (
              <button onClick={() => router.push(`/admin/content?q=${search}&page=${initialPage + 1}&filter=${filter}`)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#398AB9] text-white hover:bg-[#1C658C]">
                ถัดไป
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
