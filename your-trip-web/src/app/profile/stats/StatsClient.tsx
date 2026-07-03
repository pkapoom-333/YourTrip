"use client";

import Link from "next/link";
import { BarChart2, Map, Star, Bookmark, Users, Calendar, TrendingUp, ChevronLeft } from "lucide-react";
import type { DeepStats } from "@/server/actions/profile";

const CAT_TH: Record<string, string> = {
  attraction: "สถานที่เที่ยว", restaurant: "ร้านอาหาร",
  cafe: "คาเฟ่", hotel: "ที่พัก", activity: "กิจกรรม", other: "อื่นๆ",
};
const CAT_COLOR: Record<string, string> = {
  attraction: "#398AB9", restaurant: "#FF4F4F", cafe: "#F59E0B",
  hotel: "#8B5CF6", activity: "#22C55E", other: "#6B7280",
};

const MONTH_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function getMonthLabel(key: string) {
  const [, m] = key.split("-");
  return MONTH_SHORT[parseInt(m) - 1] ?? m;
}

function StatCard({ icon: Icon, label, value, sub, color = "#398AB9" }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function StatsClient({ stats }: { stats: DeepStats | null }) {
  if (!stats) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">ไม่สามารถโหลดสถิติได้</p>
        <Link href="/profile" className="text-[#398AB9] text-sm mt-4 inline-block">กลับสู่โปรไฟล์</Link>
      </div>
    );
  }

  const maxPosts = Math.max(...stats.postsPerMonth.map((m) => m.count), 1);
  const maxProv = Math.max(...stats.placesByProvince.map((p) => p.count), 1);
  const totalCatCount = stats.placesByCategory.reduce((s, c) => s + c.count, 0) || 1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/profile" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#398AB9] to-purple-500 rounded-2xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">สถิติการท่องเที่ยว</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">ข้อมูลรวมตั้งแต่เริ่มใช้ YourTrip</p>
          </div>
        </div>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Calendar} label="เป็นสมาชิก" value={`${stats.joinedDaysAgo} วัน`} color="#398AB9" />
        <StatCard icon={Users} label="ผู้ติดตาม" value={stats.followersCount} sub={`ติดตาม ${stats.followingCount} คน`} color="#8B5CF6" />
        <StatCard icon={TrendingUp} label="โพสต์ทั้งหมด" value={stats.postsPerMonth.reduce((s, m) => s + m.count, 0)} sub="12 เดือนล่าสุด" color="#22C55E" />
        <StatCard icon={Bookmark} label="บันทึกสถานที่" value={stats.savedPlacesCount} color="#F59E0B" />
        <StatCard icon={Map} label="ทริป" value={stats.tripsCount} sub={`${stats.totalDaysPlanned} วัน · ${stats.totalPlacesInTrips} สถานที่`} color="#FF4F4F" />
        <StatCard icon={Star} label="รีวิวที่ให้" value={stats.reviewsCount} sub={stats.reviewsCount > 0 ? `เฉลี่ย ${"★".repeat(Math.round(stats.avgRatingGiven))} ${stats.avgRatingGiven}` : "ยังไม่มี"} color="#F59E0B" />
      </div>

      {/* Posts per month chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4">โพสต์รายเดือน (12 เดือนล่าสุด)</h2>
        <div className="flex items-end gap-1.5 h-32">
          {stats.postsPerMonth.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-[#398AB9] rounded-t-md transition-all"
                style={{ height: `${Math.max((m.count / maxPosts) * 100, m.count > 0 ? 8 : 2)}%`, opacity: m.count > 0 ? 1 : 0.2 }}
                title={`${m.count} โพสต์`}
              />
              <span className="text-[8px] text-gray-400 dark:text-slate-500 rotate-0">{getMonthLabel(m.month)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Places by province */}
      {stats.placesByProvince.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4">สถานที่บันทึกตามจังหวัด</h2>
          <div className="space-y-2.5">
            {stats.placesByProvince.map((p) => (
              <div key={p.province}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700 dark:text-slate-300">{p.province}</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{p.count}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#398AB9] rounded-full transition-all"
                    style={{ width: `${(p.count / maxProv) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category donut */}
      {stats.placesByCategory.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4">ประเภทสถานที่ที่ชื่นชอบ</h2>
          <div className="space-y-2">
            {stats.placesByCategory.map((c) => {
              const pct = Math.round((c.count / totalCatCount) * 100);
              const color = CAT_COLOR[c.category] ?? "#6B7280";
              return (
                <div key={c.category} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="flex-1 text-sm text-gray-700 dark:text-slate-300">{CAT_TH[c.category] ?? c.category}</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{c.count} แห่ง</span>
                  <div className="w-24 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-400 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.postsPerMonth.every((m) => m.count === 0) && stats.placesByProvince.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 dark:text-slate-500 text-sm">เริ่มโพสต์และบันทึกสถานที่เพื่อดูสถิติของคุณ</p>
          <Link href="/explore" className="inline-block mt-3 text-[#398AB9] text-sm font-medium hover:underline">สำรวจสถานที่ →</Link>
        </div>
      )}
    </div>
  );
}
