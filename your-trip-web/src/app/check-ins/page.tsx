"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { MapPin, List, Map, Loader2, Star, CalendarDays } from "lucide-react";
import { getUserCheckIns, type UserCheckIn } from "@/server/actions/places";
import CheckInsMapView from "@/components/features/CheckInsMapView";

type ViewMode = "list" | "map" | "stats";

const PROVINCE_FLAG: Record<string, string> = {
  "เชียงใหม่": "🏔️", "กรุงเทพมหานคร": "🏙️", "ภูเก็ต": "🌊",
  "กระบี่": "🏝️", "เชียงราย": "⛰️", "สุราษฎร์ธานี": "🌴",
};

function fmtDate(d: Date | string) {
  const date = new Date(d);
  return date.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<UserCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("list");

  useEffect(() => {
    getUserCheckIns()
      .then((res) => setCheckIns(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Unique places (dedup by placeId)
  const seenIds = new Set<string>();
  const uniquePlaces: UserCheckIn[] = checkIns.filter((c) => {
    if (seenIds.has(c.placeId)) return false;
    seenIds.add(c.placeId);
    return true;
  });

  // Province breakdown
  const provinceMap: Record<string, number> = {};
  uniquePlaces.forEach((c: UserCheckIn) => {
    if (c.province) provinceMap[c.province] = (provinceMap[c.province] ?? 0) + 1;
  });
  const provinceSorted = Object.entries(provinceMap).sort((a, b) => b[1] - a[1]);
  const maxCount = provinceSorted[0]?.[1] ?? 1;

  // Category breakdown
  const catMap: Record<string, number> = {};
  uniquePlaces.forEach((c: UserCheckIn) => { catMap[c.category] = (catMap[c.category] ?? 0) + 1; });
  const catSorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  const catLabel = (c: string) =>
    c === "attraction" ? "สถานที่เที่ยว" : c === "cafe" ? "คาเฟ่" : c === "restaurant" ? "ร้านอาหาร" : c;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#398AB9]" />
              เช็คอินของฉัน
            </h1>
            {!loading && (
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                {uniquePlaces.length} สถานที่ · {provinceSorted.length} จังหวัด
              </p>
            )}
          </div>
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-0.5">
            {(["list", "map", "stats"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-1.5 rounded-lg transition text-xs font-medium px-2.5 ${
                  view === v ? "bg-white dark:bg-slate-600 shadow-sm text-[#398AB9]" : "text-gray-400 dark:text-slate-400"
                }`}
              >
                {v === "list" ? <List className="w-4 h-4" /> : v === "map" ? <Map className="w-4 h-4" /> : "📊"}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#398AB9]" />
          </div>
        )}

        {!loading && uniquePlaces.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-slate-500">
            <MapPin className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-base font-medium">ยังไม่มีการเช็คอิน</p>
            <p className="text-sm mt-1 mb-4">เช็คอินสถานที่เพื่อบันทึกการเดินทางของคุณ</p>
            <Link href="/explore"
              className="bg-[#398AB9] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1C658C] transition">
              สำรวจสถานที่
            </Link>
          </div>
        )}

        {/* List View */}
        {!loading && view === "list" && uniquePlaces.length > 0 && (
          <div className="space-y-3">
            {checkIns.map((ci) => (
              <Link
                key={ci.id}
                href={`/place/${ci.placeSlug}`}
                className="flex gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3.5 hover:shadow-md transition group"
              >
                <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700">
                  {ci.coverImage ? (
                    <img src={ci.coverImage} alt={ci.placeName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      {PROVINCE_FLAG[ci.province ?? ""] ?? "🗺️"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate group-hover:text-[#398AB9] transition">
                    {ci.placeName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <MapPin className="w-3 h-3 text-[#398AB9] flex-shrink-0" />
                    <span className="text-xs text-gray-400 dark:text-slate-500">{ci.province ?? "ไทย"}</span>
                    <span className="text-gray-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">{catLabel(ci.category)}</span>
                  </div>
                  {ci.note && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 italic line-clamp-1">&ldquo;{ci.note}&rdquo;</p>
                  )}
                  <div className="flex items-center gap-1 mt-1.5">
                    <CalendarDays className="w-3 h-3 text-gray-300 dark:text-slate-600" />
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">{fmtDate(ci.checkedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Map View */}
        {!loading && view === "map" && (
          <CheckInsMapView checkIns={checkIns} />
        )}

        {/* Stats View */}
        {!loading && view === "stats" && uniquePlaces.length > 0 && (
          <div className="space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: uniquePlaces.length, l: "สถานที่", emoji: "📍" },
                { v: provinceSorted.length, l: "จังหวัด", emoji: "🗺️" },
                { v: checkIns.length, l: "การเช็คอิน", emoji: "✅" },
              ].map((s) => (
                <div key={s.l} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3.5 text-center">
                  <div className="text-xl mb-1">{s.emoji}</div>
                  <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{s.v}</p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">{s.l}</p>
                </div>
              ))}
            </div>

            {/* Province breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-[#398AB9]" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">จังหวัดที่ไปมากที่สุด</h3>
              </div>
              <div className="space-y-3">
                {provinceSorted.slice(0, 8).map(([prov, count]) => (
                  <div key={prov}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 dark:text-slate-300">
                        {PROVINCE_FLAG[prov] ?? "📍"} {prov}
                      </span>
                      <span className="text-gray-400 dark:text-slate-500">{count} สถานที่</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#398AB9] rounded-full transition-all duration-700"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">ประเภทที่ชื่นชอบ</h3>
              <div className="space-y-2">
                {catSorted.map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-sm flex-1 text-gray-700 dark:text-slate-300">{catLabel(cat)}</span>
                    <div className="w-24 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#398AB9] rounded-full"
                        style={{ width: `${(count / (uniquePlaces.length || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-slate-500 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
