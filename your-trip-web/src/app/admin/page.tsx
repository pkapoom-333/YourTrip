import { getDashboardStats, getRecentActivity } from "@/server/actions/admin";
import { Users, FileText, MapPin, Flag, MessageSquare, ShieldCheck, TrendingUp, UserPlus, UserCheck, AlertCircle, BarChart2 } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard" };

const ACTIVITY_ICONS: Record<string, typeof Users> = {
  user_join: Users,
  new_post: FileText,
  new_report: Flag,
  guide_apply: ShieldCheck,
};

const ACTIVITY_COLORS: Record<string, string> = {
  user_join: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
  new_post: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
  new_report: "text-red-500 bg-red-50 dark:bg-red-900/20",
  guide_apply: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
};

function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "เมื่อกี้";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชม.ที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(15),
  ]);

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
    { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  ];

  return (
    <div className="p-4 pt-16 md:pt-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">ภาพรวมระบบ YourTrip</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
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

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">การดำเนินการด่วน</h2>
          <div className="grid grid-cols-2 gap-3">
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
        <div className="flex flex-col gap-2">
          {stats.pendingReports > 0 && (
            <Link
              href="/admin/reports"
              className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
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
          {stats.pendingReports === 0 && stats.pendingGuides === 0 && (
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
              <UserCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-emerald-700 dark:text-emerald-300">
                ไม่มีรายการที่ต้องดำเนินการ
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">กิจกรรมล่าสุด (7 วัน)</h2>
        {activity.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-4">ไม่มีกิจกรรมใน 7 วันที่ผ่านมา</p>
        ) : (
          <div className="space-y-2">
            {activity.map((item) => {
              const Icon = ACTIVITY_ICONS[item.type] ?? Users;
              const colorClass = ACTIVITY_COLORS[item.type] ?? "text-gray-500 bg-gray-100";
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-700 dark:text-slate-300">
                      {item.description}
                      {item.userName && (
                        <span className="font-semibold"> — {item.userName}</span>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 flex-shrink-0">
                    {timeAgo(item.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
