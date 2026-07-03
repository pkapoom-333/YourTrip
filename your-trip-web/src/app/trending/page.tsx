"use server";
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { TrendingUp, Hash } from "lucide-react";
import { getTrendingHashtags } from "@/server/actions/posts";

export const metadata: Metadata = {
  title: "แท็กยอดนิยม | YourTrip",
  description: "ค้นหาเทรนด์การเดินทางที่กำลังฮิตบน YourTrip",
};

export default async function TrendingPage() {
  const { data: tags } = await getTrendingHashtags(50);

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#398AB9] to-[#1C658C] flex items-center justify-center shadow-lg shadow-[#398AB9]/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">แท็กยอดนิยม</h1>
            <p className="text-xs text-gray-400 dark:text-slate-500">เทรนด์การเดินทางที่กำลังฮิต</p>
          </div>
        </div>

        {tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Hash className="w-16 h-16 text-gray-200 dark:text-slate-700 mb-4" />
            <p className="text-gray-400 dark:text-slate-500">ยังไม่มีแท็กในระบบ</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((t, i) => {
              const fmtCount = t.count >= 1000
                ? (t.count / 1000).toFixed(1).replace(".0", "") + "K"
                : String(t.count);

              // Color bands by rank
              const rankColor = i < 3
                ? "text-[#398AB9] bg-[#398AB9]/10"
                : i < 10
                ? "text-violet-500 bg-violet-50 dark:bg-violet-900/20"
                : "text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700/50";

              const barWidth = tags[0]?.count
                ? Math.max(4, Math.round((t.count / tags[0].count) * 100))
                : 0;

              return (
                <Link key={t.tag} href={`/tag/${encodeURIComponent(t.tag)}`}
                  className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-3.5 hover:border-[#398AB9]/30 hover:shadow-sm hover:shadow-[#398AB9]/10 transition-all group">
                  {/* Rank */}
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rankColor}`}>
                    {i + 1}
                  </span>

                  {/* Tag + bar */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-slate-200 group-hover:text-[#398AB9] transition">
                      #{t.tag}
                    </p>
                    <div className="mt-1.5 h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#398AB9] to-[#1C658C] rounded-full transition-all duration-700"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* Count */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-700 dark:text-slate-300">{fmtCount}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">โพสต์</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
