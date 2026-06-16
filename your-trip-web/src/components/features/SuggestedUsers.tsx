"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, UserCheck, Users } from "lucide-react";
import {
  getSuggestedUsers,
  followUser,
  unfollowUser,
  type UserCard,
} from "@/server/actions/profile";

const AVATAR_COLORS = [
  "bg-[#398AB9]", "bg-emerald-500", "bg-violet-500",
  "bg-orange-400", "bg-pink-400", "bg-amber-500",
];

const MOCK: UserCard[] = [
  { id: "u1", name: "wanderer", username: "wanderer_th", avatarUrl: null, bio: "นักเดินทางสายธรรมชาติ", isFollowing: false },
  { id: "u2", name: "travelmate", username: "travelmate", avatarUrl: null, bio: "ไปไหนไปกัน 🌍", isFollowing: false },
  { id: "u3", name: "free people", username: "freepeople", avatarUrl: null, bio: "ภูเขา ทะเล คาเฟ่", isFollowing: false },
];

export default function SuggestedUsers() {
  const [users, setUsers] = useState<UserCard[]>(MOCK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuggestedUsers(5)
      .then(({ data }) => {
        if (data.length > 0) setUsers(data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggle(idx: number) {
    const u = users[idx];
    const next = !u.isFollowing;
    setUsers((prev) => prev.map((x, i) => (i === idx ? { ...x, isFollowing: next } : x)));
    try {
      if (next) await followUser(u.id);
      else await unfollowUser(u.id);
    } catch {
      // rollback
      setUsers((prev) => prev.map((x, i) => (i === idx ? { ...x, isFollowing: !next } : x)));
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-[#398AB9]" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">แนะนำให้ติดตาม</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 bg-gray-100 dark:bg-slate-700 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-24" />
                <div className="h-2 bg-gray-50 dark:bg-slate-700/60 rounded w-32" />
              </div>
              <div className="w-16 h-6 bg-gray-100 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-3">ไม่มีคำแนะนำในตอนนี้</p>
      ) : (
        <div className="space-y-3">
          {users.map((u, idx) => {
            const initials = (u.name ?? u.username ?? "U").charAt(0).toUpperCase();
            const color = AVATAR_COLORS[(u.name ?? u.username ?? "U").charCodeAt(0) % AVATAR_COLORS.length];
            return (
              <div key={u.id} className="flex items-center gap-3">
                <Link href={`/profile/${u.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  {u.avatarUrl ? (
                    <img
                      src={u.avatarUrl}
                      alt={u.name ?? ""}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-9 h-9 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                      {u.name ?? "ผู้ใช้"}
                    </p>
                    {u.username && (
                      <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">@{u.username}</p>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => toggle(idx)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex-shrink-0 ${
                    u.isFollowing
                      ? "border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                      : "bg-[#398AB9] text-white hover:bg-[#1C658C]"
                  }`}
                >
                  {u.isFollowing ? (
                    <>
                      <UserCheck className="w-3 h-3" />
                      ติดตาม
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      ติดตาม
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
