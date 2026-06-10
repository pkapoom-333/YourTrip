"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, FileText } from "lucide-react";
import Link from "next/link";
import { searchPosts, type PostSearchResult } from "@/server/actions/posts";

function fmtDate(d: Date) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "วันนี้";
  if (days < 7) return `${days} วันที่แล้ว`;
  return `${Math.floor(days / 7)} สัปดาห์`;
}

function PostSearchRow({ post }: { post: PostSearchResult }) {
  const initials = (post.user.name ?? post.user.username ?? "U").charAt(0).toUpperCase();
  const thumb = post.images[0];

  return (
    <Link
      href={`/post/${post.id}`}
      className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition border-b border-gray-50 dark:border-slate-700/50 last:border-0"
    >
      {thumb ? (
        <img src={thumb} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 bg-[#398AB9]/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-[#398AB9]/40" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-5 h-5 bg-[#398AB9] rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
            {initials}
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 truncate">
            {post.user.name ?? post.user.username ?? "ผู้ใช้"}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-auto flex-shrink-0">
            {fmtDate(post.createdAt)}
          </span>
        </div>

        <p className="text-sm text-gray-800 dark:text-slate-200 line-clamp-2 leading-snug">
          {post.content}
        </p>

        {post.tags.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-[#398AB9]/10 text-[#398AB9] px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function PostSearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }

    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await searchPosts(query, 30);
      setResults(data);
      setLoading(false);
    }, 350);

    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [query]);

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาโพสต์ คำบรรยาย หรือ #แท็ก..."
          autoFocus
          className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-2xl text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10 transition"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex flex-col">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-slate-700/50 animate-pulse">
                <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-full" />
                  <div className="h-4 bg-gray-50 dark:bg-slate-700/60 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !query.trim() ? (
          <div className="py-14 flex flex-col items-center gap-3 text-gray-400 dark:text-slate-500">
            <Search className="w-10 h-10 opacity-30" />
            <p className="text-sm">พิมพ์คำค้นหาเพื่อค้นหาโพสต์</p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-14 flex flex-col items-center gap-3 text-gray-400 dark:text-slate-500">
            <FileText className="w-10 h-10 opacity-30" />
            <p className="text-sm">ไม่พบโพสต์สำหรับ &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          results.map((post) => <PostSearchRow key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
