
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserPlus, UserCheck, Users, Shield, ChevronLeft } from "lucide-react";
import { DiscoverUser } from "@/server/actions/profile";
import { followUser, unfollowUser } from "@/server/actions/profile";
import { useToast } from "@/components/shared/Toast";

const INTEREST_EMOJI: Record<string, string> = {
  beach: "🏖️", mountain: "⛰️", temple: "🛕", city: "🏙️",
  food: "🍜", cafe: "☕", nature: "🌿", adventure: "🧗",
  culture: "🎭", shopping: "🛍️", nightlife: "🌙", family: "👨‍👩‍👧",
};

interface Props {
  users: DiscoverUser[];
}

export default function DiscoverClient({ users: initial }: Props) {
  const [users, setUsers] = useState(initial);
  const [pending, startTransition] = useTransition();
  const { success, error } = useToast();

  function toggle(userId: string, isFollowing: boolean) {
    startTransition(async () => {
      const fn = isFollowing ? unfollowUser : followUser;
      const res = await fn(userId);
      if ("error" in res && res.error) {
        error((res.error as { message: string }).message ?? "เกิดข้อผิดพลาด");
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, isFollowing: !isFollowing, followersCount: u.followersCount + (isFollowing ? -1 : 1) }
            : u
        )
      );
      success(isFollowing ? "เลิกติดตามแล้ว" : "ติดตามแล้ว! 🎉");
    });
  }

  const guides = users.filter((u) => u.isGuide || u.isVerifiedGuide);
  const regular = users.filter((u) => !u.isGuide && !u.isVerifiedGuide);

  function UserCard({ u }: { u: DiscoverUser }) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 flex flex-col items-center text-center gap-2">
        <Link href={`/profile/${u.id}`} className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700">
            {u.avatarUrl
              ? <Image src={u.avatarUrl} alt={u.name ?? ""} width={64} height={64} className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center bg-[#398AB9] text-white text-xl font-bold">{(u.name ?? "U")[0]}</div>
            }
          </div>
          {u.isVerifiedGuide && (
            <span className="absolute -bottom-0.5 -right-0.5 bg-[#398AB9] rounded-full p-0.5">
              <Shield className="w-3 h-3 text-white" />
            </span>
          )}
        </Link>

        <div>
          <Link href={`/profile/${u.id}`} className="font-semibold text-sm text-gray-900 dark:text-slate-100 hover:text-[#398AB9] line-clamp-1">
            {u.name ?? "ผู้ใช้"}
          </Link>
          {u.username && <p className="text-xs text-gray-400">@{u.username}</p>}
        </div>

        {u.bio && (
          <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{u.bio}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-0.5">
            <Users className="w-3 h-3" /> {u.followersCount.toLocaleString()}
          </span>
          <span>{u.postsCount} โพสต์</span>
        </div>

        {u.mutualFollowers > 0 && (
          <p className="text-[10px] text-[#398AB9]">
            {u.mutualFollowers} คนที่คุณรู้จักติดตาม
          </p>
        )}

        {u.interests.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1">
            {u.interests.slice(0, 4).map((int) => (
              <span key={int} className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                {INTEREST_EMOJI[int] ?? "✈️"} {int}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => toggle(u.id, u.isFollowing)}
          disabled={pending}
          className={`w-full py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${u.isFollowing
            ? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-500"
            : "bg-[#398AB9] text-white hover:bg-[#1C658C]"}`}>
          {u.isFollowing
            ? <><UserCheck className="w-4 h-4" /> ติดตามแล้ว</>
            : <><UserPlus className="w-4 h-4" /> ติดตาม</>}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/feed" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">ค้นพบคน</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">นักเดินทางและผู้นำเที่ยวที่น่าติดตาม</p>
        </div>
      </div>

      {guides.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 mb-4">
            <Shield className="w-4 h-4 text-[#398AB9]" /> มัคคุเทศก์
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {guides.map((u) => <UserCard key={u.id} u={u} />)}
          </div>
        </section>
      )}

      {regular.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 mb-4">
            <Users className="w-4 h-4 text-[#398AB9]" /> นักเดินทาง
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {regular.map((u) => <UserCard key={u.id} u={u} />)}
          </div>
        </section>
      )}

      {users.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>ยังไม่มีผู้ใช้ให้แนะนำ</p>
        </div>
      )}
    </div>
  );
}
