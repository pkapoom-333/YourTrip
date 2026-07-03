"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Heart, ArrowLeft, UserPlus, UserCheck } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import Link from "next/link";
import { getPostLikes, type LikedByUser } from "@/server/actions/posts";
import { followUser, unfollowUser } from "@/server/actions/profile";
import { useToast } from "@/components/shared/Toast";

export default function PostLikesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [users, setUsers] = useState<LikedByUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getPostLikes(id, 100).then(({ data }) => {
      setUsers(data);
      const map: Record<string, boolean> = {};
      data.forEach((u) => { map[u.id] = u.isFollowing; });
      setFollowing(map);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  async function handleFollow(userId: string) {
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

  return (
    <AppShell>
      <div className="max-w-lg mx-auto pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-slate-300" />
          </button>
          <Heart className="w-5 h-5 text-[#FF4F4F] fill-[#FF4F4F]" />
          <span className="flex-1 text-sm font-bold text-gray-900 dark:text-slate-100">
            ถูกใจ {users.length > 0 ? `(${users.length})` : ""}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3 p-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full w-32" />
                  <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full w-48" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <Heart className="w-16 h-16 text-gray-200 dark:text-slate-700 mb-4" />
            <p className="text-gray-500 dark:text-slate-400">ยังไม่มีคนถูกใจโพสต์นี้</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">เป็นคนแรกที่กดถูกใจ!</p>
          </div>
        )}

        {/* User list */}
        {!loading && users.length > 0 && (
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                <Link href={`/profile/${u.id}`} className="flex-shrink-0">
                  <Avatar name={u.name ?? u.username ?? "?"} src={u.avatarUrl} className="w-11 h-11" />
                </Link>
                <Link href={`/profile/${u.id}`} className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-slate-100 truncate hover:text-[#398AB9] transition">
                    {u.name ?? u.username ?? "ผู้ใช้"}
                  </p>
                  {u.username && (
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">@{u.username}</p>
                  )}
                </Link>
                <button
                  onClick={() => handleFollow(u.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    following[u.id]
                      ? "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                      : "bg-[#398AB9] text-white hover:bg-[#1C658C]"
                  }`}>
                  {following[u.id]
                    ? <><UserCheck className="w-3.5 h-3.5" /> ติดตาม</>
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
