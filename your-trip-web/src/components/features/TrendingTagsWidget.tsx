"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Hash } from "lucide-react";
import { getTrendingHashtags } from "@/server/actions/posts";

interface TrendingTag { tag: string; count: number; }

interface TrendingTagsWidgetProps {
  compact?: boolean;
  className?: string;
}

export function TrendingTagsWidget({ compact = false, className = "" }: TrendingTagsWidgetProps) {
  const [tags, setTags] = useState<TrendingTag[]>([]);

  useEffect(() => {
    getTrendingHashtags(compact ? 8 : 15)
      .then(({ data }) => setTags(data))
      .catch(() => {});
  }, [compact]);

  if (tags.length === 0) return null;

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {tags.map((t) => (
          <Link key={t.tag} href={`/tag/${encodeURIComponent(t.tag)}`}
            className="flex items-center gap-1 text-[11px] font-medium bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:text-[#398AB9] hover:border-[#398AB9]/30 px-2.5 py-1 rounded-full transition">
            <Hash className="w-2.5 h-2.5" />
            {t.tag}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[#398AB9]" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">แท็กยอดนิยม</h3>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-slate-700">
        {tags.map((t, i) => (
          <Link key={t.tag} href={`/tag/${encodeURIComponent(t.tag)}`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#398AB9]/5 dark:hover:bg-[#398AB9]/10 transition group">
            <span className="text-xs font-bold text-gray-300 dark:text-slate-600 w-5 text-center">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 group-hover:text-[#398AB9] transition">
                #{t.tag}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">{t.count} โพสต์</p>
            </div>
            <TrendingUp className="w-3.5 h-3.5 text-[#398AB9] opacity-0 group-hover:opacity-100 transition" />
          </Link>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-50 dark:border-slate-700">
        <Link href="/trending" className="text-xs font-medium text-[#398AB9] hover:underline">
          ดูทั้งหมด →
        </Link>
      </div>
    </div>
  );
}
