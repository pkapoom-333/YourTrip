"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Users } from "lucide-react";
import {
  searchUsers,
  getSuggestedUsers,
  type UserCard,
} from "@/server/actions/profile";
import UserListRow from "./UserListRow";

const DEBOUNCE_MS = 300;

export default function UserSearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserCard[]>([]);
  const [suggested, setSuggested] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load suggested users on mount
  useEffect(() => {
    getSuggestedUsers(20).then((r) => setSuggested(r.data));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const { data } = await searchUsers(query, 30);
      setResults(data);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const isSearching = query.trim().length > 0;
  const displayList = isSearching ? results : suggested;

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อหรือ @username…"
            autoFocus
            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#398AB9]/40"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-slate-900/40">
        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
          {isSearching
            ? loading
              ? "กำลังค้นหา…"
              : `พบ ${results.length} คน`
            : "คนแนะนำ"}
        </span>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-700/50">
        {loading && (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-32" />
                  <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded w-20" />
                </div>
                <div className="h-7 w-20 bg-gray-100 dark:bg-slate-700 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {!loading && displayList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 dark:text-slate-500">
            <Users className="w-12 h-12 opacity-30" />
            <p className="text-sm font-medium">
              {isSearching ? `ไม่พบผู้ใช้ "${query}"` : "ยังไม่มีคนแนะนำ"}
            </p>
            {isSearching && (
              <p className="text-xs text-center">ลองค้นหาด้วยชื่อหรือ @username</p>
            )}
          </div>
        )}

        {!loading &&
          displayList.map((user) => <UserListRow key={user.id} user={user} />)}
      </div>
    </div>
  );
}
