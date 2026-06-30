"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Trash2, CheckCircle, XCircle } from "lucide-react";
import type { AdminUser } from "@/server/actions/admin";
import { verifyUser } from "@/server/actions/admin";
import { Avatar } from "@/components/shared/Avatar";

interface Props {
  initialUsers: AdminUser[];
  total: number;
  initialSearch: string;
  initialPage: number;
}

export default function AdminUsersClient({ initialUsers, total, initialSearch, initialPage }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (q: string) => {
    setSearch(q);
    startTransition(() => {
      router.push(`/admin/users?q=${encodeURIComponent(q)}&page=1`);
    });
  };

  const handleVerify = async (userId: string, verified: boolean) => {
    await verifyUser(userId, verified);
    router.refresh();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-4 pt-16 md:pt-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ผู้ใช้</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">ทั้งหมด {total.toLocaleString()} คน</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="ค้นหาชื่อ, username, email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#398AB9]"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400">ผู้ใช้</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400">โพสต์</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400">ผู้ติดตาม</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400">สมัครวันที่</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400">สถานะ</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {initialUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatarUrl} name={user.name ?? user.email ?? "U"} className="w-8 h-8" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {user.name ?? "—"}
                          {user.isVerified && <CheckCircle className="inline-block w-3.5 h-3.5 text-[#398AB9] ml-1" />}
                          {user.isVerifiedGuide && <ShieldCheck className="inline-block w-3.5 h-3.5 text-amber-500 ml-1" />}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{user.postCount}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{user.followerCount}</td>
                  <td className="px-4 py-3 text-gray-400 dark:text-slate-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.isVerified
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400"
                    }`}>
                      {user.isVerified ? "ยืนยันแล้ว" : "ปกติ"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleVerify(user.id, !user.isVerified)}
                        title={user.isVerified ? "ยกเลิกการยืนยัน" : "ยืนยันตัวตน"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.isVerified
                            ? "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {user.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700">
            <span className="text-xs text-gray-500 dark:text-slate-400">
              หน้า {initialPage} จาก {totalPages}
            </span>
            <div className="flex gap-2">
              {initialPage > 1 && (
                <button
                  onClick={() => router.push(`/admin/users?q=${search}&page=${initialPage - 1}`)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  ก่อนหน้า
                </button>
              )}
              {initialPage < totalPages && (
                <button
                  onClick={() => router.push(`/admin/users?q=${search}&page=${initialPage + 1}`)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#398AB9] text-white hover:bg-[#1C658C]"
                >
                  ถัดไป
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
