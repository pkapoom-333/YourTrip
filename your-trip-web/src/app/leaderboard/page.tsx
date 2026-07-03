"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { Trophy, Star, PenLine, MapPin, Users, Shield, Loader2 } from "lucide-react";
import { getLeaderboard, type LeaderboardUser } from "@/server/actions/profile";
import { Avatar } from "@/components/shared/Avatar";

type Tab = "posts" | "reviews" | "trips" | "followers";

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: "posts", label: "โพสต์", icon: PenLine, color: "text-blue-500" },
  { id: "reviews", label: "รีวิว", icon: Star, color: "text-yellow-500" },
  { id: "trips", label: "ทริป", icon: MapPin, color: "text-green-500" },
  { id: "followers", label: "ผู้ติดตาม", icon: Users, color: "text-purple-500" },
];

const RANK_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600"];
const RANK_BG = ["bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800", "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600", "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"];
const MEDAL = ["🥇", "🥈", "🥉"];

function getStatValue(user: LeaderboardUser, tab: Tab): number {
  if (tab === "posts") return user.postsCount;
  if (tab === "reviews") return user.reviewsCount;
  if (tab === "trips") return user.tripsCount;
  return user.followersCount;
}

function getStatLabel(tab: Tab): string {
  if (tab === "posts") return "โพสต์";
  if (tab === "reviews") return "รีวิว";
  if (tab === "trips") return "ทริป";
  return "ผู้ติดตาม";
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("posts");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard(tab, 20)
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, [tab]);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">ลีดเดอร์บอร์ด</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">นักเดินทางที่มีความแอคทีฟสูงสุด</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-2xl p-1 mb-6 gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  tab === t.id
                    ? "bg-white dark:bg-slate-700 shadow-sm text-[#398AB9]"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab === t.id ? "text-[#398AB9]" : t.color}`} />
                {t.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#398AB9]" />
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-slate-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>ยังไม่มีข้อมูล</p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((user, podiumIdx) => {
                if (!user) return null;
                const realRank = podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2;
                return (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className={`flex flex-col items-center p-3 rounded-2xl border text-center transition hover:shadow-md ${
                      realRank === 0 ? RANK_BG[0] : realRank === 1 ? RANK_BG[1] : RANK_BG[2]
                    } ${realRank === 0 ? "col-start-2 row-start-1" : ""}`}
                  >
                    <div className={`text-2xl mb-1 ${realRank === 0 ? "text-3xl" : ""}`}>{MEDAL[realRank]}</div>
                    <Avatar
                      name={user.name}
                      src={user.avatarUrl}
                      className={`rounded-full mb-1.5 ${realRank === 0 ? "w-14 h-14" : "w-11 h-11"}`}
                    />
                    <p className={`font-bold truncate w-full text-gray-900 dark:text-slate-100 ${realRank === 0 ? "text-sm" : "text-xs"}`}>
                      {user.name}
                    </p>
                    {user.isVerifiedGuide && (
                      <Shield className="w-3 h-3 text-[#398AB9] mt-0.5" />
                    )}
                    <p className={`font-bold mt-1 ${RANK_COLORS[realRank]} ${realRank === 0 ? "text-base" : "text-sm"}`}>
                      {getStatValue(user, tab).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">{getStatLabel(tab)}</p>
                  </Link>
                );
              })}
            </div>

            {/* Rest of list */}
            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((user, i) => {
                  const rank = i + 4;
                  return (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-3 hover:shadow-md transition group"
                    >
                      <span className="w-6 text-sm font-bold text-gray-400 dark:text-slate-500 text-center">{rank}</span>
                      <Avatar
                        name={user.name}
                        src={user.avatarUrl}
                        className="w-9 h-9 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate group-hover:text-[#398AB9] transition">
                            {user.name}
                          </p>
                          {user.isVerifiedGuide && (
                            <Shield className="w-3.5 h-3.5 text-[#398AB9] flex-shrink-0" />
                          )}
                        </div>
                        {user.username && (
                          <p className="text-[11px] text-gray-400 dark:text-slate-500">@{user.username}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">
                          {getStatValue(user, tab).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500">{getStatLabel(tab)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
