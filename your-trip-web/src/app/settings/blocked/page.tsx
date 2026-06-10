"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { ChevronLeft, ShieldOff, Shield, UserX } from "lucide-react";
import { getBlockedUsers, unblockUser } from "@/server/actions/profile";
import { Avatar } from "@/components/shared/Avatar";
import { useToast } from "@/components/shared/Toast";

interface BlockedUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
}

export default function BlockedUsersPage() {
  const router = useRouter();
  const { success } = useToast();
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    getBlockedUsers().then((r) => { setBlocked(r.data); setLoading(false); });
  }, []);

  async function handleUnblock(userId: string, name: string | null) {
    setUnblocking(userId);
    await unblockUser(userId);
    setBlocked((prev) => prev.filter((u) => u.id !== userId));
    setUnblocking(null);
    success(`เลิกบล็อก ${name ?? "ผู้ใช้"} แล้ว`);
  }

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 flex-1">บล็อกผู้ใช้</span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Info */}
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 text-xs text-gray-500 dark:text-slate-400 mb-5">
          ผู้ใช้ที่ถูกบล็อกจะไม่สามารถดูโปรไฟล์ โพสต์ หรือติดตามคุณได้
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 dark:bg-slate-700 rounded w-32" />
                  <div className="h-3 bg-gray-50 dark:bg-slate-700/60 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && blocked.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 dark:text-slate-500">
            <Shield className="w-12 h-12 opacity-30" />
            <p className="text-sm font-medium">ยังไม่มีผู้ใช้ที่ถูกบล็อก</p>
          </div>
        )}

        {!loading && blocked.length > 0 && (
          <div className="space-y-2">
            {blocked.map((user) => (
              <div key={user.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-3">
                <Avatar src={user.avatarUrl} name={user.name ?? "U"} className="w-12 h-12 text-sm flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                    {user.name ?? "ผู้ใช้"}
                  </p>
                  {user.username && (
                    <p className="text-xs text-gray-400 dark:text-slate-500">@{user.username}</p>
                  )}
                </div>
                <button
                  onClick={() => handleUnblock(user.id, user.name)}
                  disabled={unblocking === user.id}
                  className="flex items-center gap-1.5 text-xs text-[#398AB9] font-medium px-3 py-1.5 rounded-xl border border-[#398AB9]/30 hover:bg-[#398AB9]/10 transition disabled:opacity-50 flex-shrink-0"
                >
                  <ShieldOff className="w-3.5 h-3.5" />
                  {unblocking === user.id ? "กำลังดำเนินการ…" : "เลิกบล็อก"}
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-[11px] text-gray-400 dark:text-slate-500 mt-6 flex items-center justify-center gap-1">
          <UserX className="w-3.5 h-3.5" />
          {blocked.length > 0 ? `${blocked.length} คนที่ถูกบล็อก` : "ไม่มีรายชื่อ"}
        </p>
      </div>
    </AppShell>
  );
}
