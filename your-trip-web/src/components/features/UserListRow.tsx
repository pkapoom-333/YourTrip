"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, UserCheck } from "lucide-react";
import { followUser, unfollowUser, type UserCard } from "@/server/actions/profile";

const AVATAR_COLORS = [
  "bg-[#398AB9]", "bg-emerald-500", "bg-violet-500",
  "bg-orange-400", "bg-pink-400", "bg-amber-500",
];

interface Props {
  user: UserCard;
  /** When viewing your own list, hide the follow button on yourself */
  selfId?: string;
}

export default function UserListRow({ user, selfId }: Props) {
  const [following, setFollowing] = useState(user.isFollowing);
  const [busy, setBusy] = useState(false);

  const initials = (user.name ?? user.username ?? "U").charAt(0).toUpperCase();
  const color = AVATAR_COLORS[(user.name ?? user.username ?? "U").charCodeAt(0) % AVATAR_COLORS.length];
  const isSelf = selfId === user.id;

  async function toggle() {
    if (busy || isSelf) return;
    const next = !following;
    setFollowing(next);
    setBusy(true);
    try {
      if (next) await followUser(user.id);
      else await unfollowUser(user.id);
    } catch {
      setFollowing(!next); // rollback
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
      <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name ?? ""}
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className={`w-11 h-11 ${color} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user.name ?? "ผู้ใช้"}
          </p>
          {user.username && (
            <p className="text-[11px] text-gray-400 truncate">@{user.username}</p>
          )}
          {user.bio && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{user.bio}</p>
          )}
        </div>
      </Link>

      {!isSelf && (
        <button
          onClick={toggle}
          disabled={busy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex-shrink-0 disabled:opacity-60 ${
            following
              ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
              : "bg-[#398AB9] text-white hover:bg-[#1C658C]"
          }`}
        >
          {following ? (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              ติดตามอยู่
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              ติดตาม
            </>
          )}
        </button>
      )}
    </div>
  );
}
