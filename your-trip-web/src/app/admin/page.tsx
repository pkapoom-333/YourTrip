import { getDashboardStats } from "@/server/actions/admin";
import { Users, FileText, MapPin, Flag, MessageSquare, ShieldCheck, TrendingUp, UserPlus } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "ผู้ใช้ทั้งหมด",
      value: stats.totalUsers,
      sub: `+${stats.newUsersThisWeek} สัปดาห์นี้`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      href: "/admin/users",
    },
    {
      label: "โพสต์ทั้งหมด",
      value: stats.totalPosts,
      sub: `+${stats.newPostsThisWeek} สัปดาห์นี้`,
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      href: "/feed",
    },
    {
      label: "สถานที่",
      value: stats.totalPlaces,
      sub: "ในฐานข้อมูล",
      icon: MapPin,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      href: "/admin/places",
    },
    {
      label: "รายงานที่รอ",
      value: stats.pendingReports,
      sub: "ต้องตรวจสอบ",
      icon: Flag,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
      href: "/admin/reports",
    },
    {
      label: "ข้อความทั้งหมด",
      value: stats.totalMessages,
      sub: "ระบบ chat",
      icon: MessageSquare,
      color: "text-violet-500",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      href: "/admin/messages",
    },
    {
      label: "รอยืนยันไกด์",
      value: stats.pendingGuides,
      sub: "คำขอค้างอยู่",
      icon: ShieldCheck,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      href: "/admin/guides",
    },
  ];

  const quickActions = [
    { href: "/admin/places/new", label: "เพิ่มสถานที่ใหม่", icon: MapPin },
    { href: "/admin/reports", label: "ตรวจสอบรายงาน", icon: Flag },
    { href: "/admin/guides", label: "อนุมัติไกด์", icon: ShieldCheck },
    { href: "/admin/users", label: "จัดการผู้ใช้", icon: Users },
  ];

  return (
    <div className="p-4 pt-16 md:pt-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">ภาพรวมระบบ YourTrip</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {cards.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600 group-hover:text-gray-400 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
              {value.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-gray-700 dark:text-slate-300">{label}</div>
            <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">การดำเนินการด่วน</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-[#398AB9] hover:bg-[#398AB9]/5 transition-colors text-center"
            >
              <Icon className="w-5 h-5 text-[#398AB9]" />
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {(stats.pendingReports > 0 || stats.pendingGuides > 0) && (
        <div className="mt-4 flex flex-col gap-2">
          {stats.pendingReports > 0 && (
            <Link
              href="/admin/reports"
              className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Flag className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-300">
                มี <strong>{stats.pendingReports}</strong> รายงานรอการตรวจสอบ
              </span>
            </Link>
          )}
          {stats.pendingGuides > 0 && (
            <Link
              href="/admin/guides"
              className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-sm text-amber-700 dark:text-amber-300">
                มี <strong>{stats.pendingGuides}</strong> คำขอเป็นไกด์รอการอนุมัติ
              </span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
