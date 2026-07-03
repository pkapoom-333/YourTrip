"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AppShell from "@/components/AppShell";
import { Search, Users, UserPlus, UserCheck, X } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import Link from "next/link";
import { searchUsers, getSuggestedUsers, followUser, unfollowUser, type UserCard } from "@/server/actions/profile";
import { useToast } from "@/components/shared/Toast";

export default function PeoplePage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [suggested, setSuggested] = useState<UserCard[]>([]);
  const [results, setResults] = useState<UserCard[]>([]);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [loadingSearch, setLoadingSearch] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load suggested users on mount
  useEffect(() => {
    getSuggestedUsers(20).then(({ data }) => {
      setSuggested(data);
      const map: Record<string, boolean> = {};
      data.forEach((u) => { map[u.id] = u.isFollowing; });
      setFollowing(map);
    }).catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(() => {
      setLoadingSearch(true);
      searchUsers(query, 30).then(({ data }) => {
        setResults(data);
        const map: Record<string, boolean> = {};
        data.forEach((u) => { map[u.id] = u.isFollowing; });
        setFollowing((prev) => ({ ...prev, ...map }));
        setLoadingSearch(false);
      }).catch(() => setLoadingSearch(false));
    }, 350);
  }, [query]);

  async function toggleFollow(userId: string) {
    const was = following[userId];
    setFollowing((f) => ({ ...f, [userId]: !was }));
    try {
      if (was) await unfollowUser(userId);
      else await followUser(userId);
    } catch {
      setFollowing((f) => ({ ...f, [userId]: was }));
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  const displayList = query.trim() ? results : suggested;

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-400/20">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">ค้นหาคน</h1>
            <p className="text-xs text-gray-400 dark:text-slate-500">ค้นพบนักเดินทางที่น่าสนใจ</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ชื่อหรือ @username…"
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 focus:outline-none focus:border-[#398AB9] focus:ring-1 focus:ring-[#398AB9]/30 transition shadow-sm"
          />
          {query && (
            <button onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Section title */}
        {!query.trim() && (
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            แนะนำให้ติดตาม
          </p>
        )}
        {query.trim() && !loadingSearch && (
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            ผลการค้นหา {results.length > 0 ? `(${results.length})` : ""}
          </p>
        )}

        {/* Loading */}
        {loadingSearch && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full w-32" />
                  <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full w-48" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loadingSearch && query.trim() && results.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400">ไม่พบผู้ใช้ที่ตรงกับ "{query}"</p>
          </div>
        )}

        {/* User list */}
        {!loadingSearch && (
          <div className="space-y-3">
            {displayList.map((u) => (
              <div key={u.id}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 hover:border-gray-200 dark:hover:border-slate-600 transition">
                <Link href={`/profile/${u.id}`} className="flex-shrink-0">
                  <Avatar name={u.name ?? u.username ?? "?"} src={u.avatarUrl} className="w-12 h-12" />
                </Link>
                <Link href={`/profile/${u.id}`} className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-slate-100 truncate hover:text-[#398AB9] transition">
                    {u.name ?? u.username ?? "ผู้ใช้"}
                  </p>
                  {u.username && (
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">@{u.username}</p>
                  )}
                  {u.bio && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{u.bio}</p>
                  )}
                </Link>
                <button
                  onClick={() => toggleFollow(u.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    following[u.id]
                      ? "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      : "bg-[#398AB9] text-white hover:bg-[#1C658C] shadow-sm shadow-[#398AB9]/20"
                  }`}>
                  {following[u.id]
                    ? <><UserCheck className="w-3.5 h-3.5" /> ติดตามแล้ว</>
                    : <><UserPlus className="w-3.5 h-3.5" /> ติดตาม</>
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
