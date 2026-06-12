"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Calendar, Users, ChevronRight, ChevronLeft, Map as MapIcon, Plane, Trash2, X, ChevronDown, Copy, Check, Globe, Search, Sparkles, LayoutList, CalendarDays } from "lucide-react";
import { deleteTrip, updateTripStatus, duplicateTrip, type PublicTripItem } from "@/server/actions/trips";
import type { DestinationSuggestion } from "@/server/actions/savedPlaces";
import { useToast } from "@/components/shared/Toast";
import { Avatar } from "@/components/shared/Avatar";

export interface TripSummary {
  id: string;
  title: string;
  status: "upcoming" | "planning" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  startDateISO?: string;
  endDateISO?: string;
  members: number;
  places: number;
  img: string;
  destinations: string[];
}

const statusConfig: Record<TripSummary["status"], { label: string; color: string }> = {
  upcoming:  { label: "กำลังจะไป",    color: "bg-[#398AB9]/10 text-[#398AB9]" },
  planning:  { label: "กำลังวางแผน", color: "bg-amber-50 text-amber-600" },
  completed: { label: "เสร็จแล้ว",   color: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "ยกเลิก",       color: "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500" },
};

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=800&q=80";

export default function TripsClient({ initialTrips, communityTrips = [], destinationSuggestions = [] }: { initialTrips: TripSummary[]; communityTrips?: PublicTripItem[]; destinationSuggestions?: DestinationSuggestion[] }) {
  const [tab, setTab] = useState<"all" | "upcoming" | "planning" | "completed">("all");
  const [trips, setTrips] = useState<TripSummary[]>(initialTrips);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [duplicatedId, setDuplicatedId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const [view, setView] = useState<"list" | "calendar">("list");
  const _now = new Date();
  const [calYear, setCalYear] = useState(_now.getFullYear());
  const [calMonth, setCalMonth] = useState(_now.getMonth());

  const [search, setSearch] = useState("");
  const filtered = trips
    .filter((t) => tab === "all" || t.status === tab)
    .filter((t) => !search.trim() || t.title.toLowerCase().includes(search.toLowerCase()) || t.destinations.join(" ").toLowerCase().includes(search.toLowerCase()));

  async function handleDelete(tripId: string) {
    setDeleting(true);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    setConfirmDeleteId(null);
    await deleteTrip(tripId).catch(() => {});
    setDeleting(false);
  }

  const STATUS_CYCLE: TripSummary["status"][] = ["planning", "upcoming", "completed"];
  const DB_STATUS: Record<TripSummary["status"], "PLANNING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"> = {
    planning: "PLANNING", upcoming: "CONFIRMED", completed: "COMPLETED", cancelled: "CANCELLED",
  };

  async function handleDuplicate(tripId: string) {
    if (duplicatingId) return;
    setDuplicatingId(tripId);
    const { data, error } = await duplicateTrip(tripId);
    setDuplicatingId(null);
    if (data) {
      const original = trips.find((t) => t.id === tripId);
      if (original) {
        const cloned: TripSummary = { ...original, id: data.id, title: data.title, status: "planning" };
        setTrips((prev) => [cloned, ...prev]);
        setDuplicatedId(data.id);
        success(`คัดลอก "${data.title}" แล้ว ✓`);
        setTimeout(() => setDuplicatedId(null), 3000);
      }
    } else {
      toastError("ไม่สามารถคัดลอกทริปได้");
    }
  }

  async function cycleStatus(tripId: string, current: TripSummary["status"]) {
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, status: next } : t));
    await updateTripStatus(tripId, DB_STATUS[next]).catch(() => {});
  }

  function prevCalMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }
  function nextCalMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }

  const totalPlaces = trips.reduce((s: number, t: TripSummary) => s + t.places, 0);
  const totalDays   = trips.reduce((s: number, t: TripSummary) => {
    // Use ISO fields — startDate/endDate are Thai-formatted display strings (NaN with new Date)
    if (!t.startDateISO || !t.endDateISO) return s;
    const diff = new Date(t.endDateISO).getTime() - new Date(t.startDateISO).getTime();
    if (isNaN(diff)) return s;
    return s + Math.max(1, Math.ceil(diff / 86_400_000) + 1);
  }, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <div className="hidden md:flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">ทริปของฉัน</h1>
        <div className="flex items-center gap-2">
          <Link href="/trips/ai-plan"
            className="flex items-center gap-2 bg-gradient-to-r from-[#398AB9] to-[#1C658C] text-white text-sm font-medium px-4 py-2 rounded-xl hover:opacity-90 transition">
            <Sparkles className="w-4 h-4" />
            AI วางแผนให้
          </Link>
          <Link href="/trips/new"
            className="flex items-center gap-2 border border-[#398AB9] text-[#398AB9] text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#398AB9]/5 transition">
            <Plus className="w-4 h-4" />
            สร้างเอง
          </Link>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { icon: Plane,    label: "ทริปทั้งหมด",    value: trips.length },
          { icon: MapPin,   label: "สถานที่",         value: totalPlaces },
          { icon: Calendar, label: "วันที่เดินทาง",  value: totalDays },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3 text-center">
            <s.icon className="w-5 h-5 text-[#398AB9] mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{s.value}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Destination suggestions — based on saved places */}
      {destinationSuggestions.length > 0 && trips.length < 5 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">จากสถานที่ที่คุณบันทึก</p>
            <Link href="/explore" className="text-xs text-[#398AB9] hover:underline">ดูเพิ่ม →</Link>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            {destinationSuggestions.map((s) => (
              <Link
                key={s.province}
                href={`/trips/new?destination=${encodeURIComponent(s.province)}`}
                className="flex-shrink-0 group relative w-28 h-32 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200"
              >
                {s.coverImage ? (
                  <img src={s.coverImage} alt={s.province}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#398AB9] to-[#1C658C]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-white text-xs font-bold truncate">{s.province}</p>
                  <p className="text-white/70 text-[10px]">{s.count} สถานที่</p>
                </div>
                <div className="absolute top-2 right-2 bg-[#398AB9] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  วางแผน
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      {trips.length > 3 && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาทริป..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#398AB9] transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Tabs + view toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-none flex-1">
          {(["all", "upcoming", "planning", "completed"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition ${
                tab === t ? "bg-[#398AB9] text-white" : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400"
              }`}>
              {t === "all" ? "ทั้งหมด" : statusConfig[t].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-0.5">
          <button onClick={() => setView("list")}
            className={`p-1.5 rounded-lg transition ${view === "list" ? "bg-[#398AB9] text-white" : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"}`}
            title="รายการ">
            <LayoutList className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setView("calendar")}
            className={`p-1.5 rounded-lg transition ${view === "calendar" ? "bg-[#398AB9] text-white" : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"}`}
            title="ปฏิทิน">
            <CalendarDays className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Calendar view */}
      {view === "calendar" && (
        <TripsCalendar trips={trips} year={calYear} month={calMonth} onPrev={prevCalMonth} onNext={nextCalMonth} />
      )}

      {/* Trip cards */}
      {view === "list" && (<div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-slate-500">
            <Plane className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">ยังไม่มีทริปในหมวดนี้</p>
            <Link href="/trips/new"
              className="mt-3 inline-block text-sm text-[#398AB9] font-medium hover:underline">
              + สร้างทริปแรก
            </Link>
          </div>
        )}
        {filtered.map((trip) => {
          const s = statusConfig[trip.status] ?? statusConfig.planning;
          const isConfirming = confirmDeleteId === trip.id;
          return (
            <div key={trip.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-36 overflow-hidden">
                <img src={trip.img || PLACEHOLDER_IMG} alt={trip.title} className="w-full h-full object-cover"
                  referrerPolicy="no-referrer" loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3">
                  <button
                    onClick={() => cycleStatus(trip.id, trip.status)}
                    className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full transition hover:opacity-80 ${s.color}`}
                    title="กดเพื่อเปลี่ยนสถานะ">
                    {s.label}
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                </div>
                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {/* Duplicate */}
                  <button
                    onClick={() => handleDuplicate(trip.id)}
                    disabled={duplicatingId === trip.id}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-[#398AB9]/80 transition disabled:opacity-50"
                    title="คัดลอกทริป">
                    {duplicatedId === trip.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> :
                      duplicatingId === trip.id ? <Copy className="w-3.5 h-3.5 animate-pulse" /> :
                      <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => setConfirmDeleteId(isConfirming ? null : trip.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-red-500/80 transition"
                    title="ลบทริป">
                    {isConfirming ? <X className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-base">{trip.title}</p>
                  <p className="text-white/80 text-xs mt-0.5">{trip.startDate} – {trip.endDate}</p>
                </div>
              </div>

              <div className="px-4 py-3">
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {trip.members} คน
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {trip.places} สถานที่
                  </span>
                </div>

                {trip.destinations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {trip.destinations.slice(0, 3).map((d) => (
                      <span key={d} className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{d}</span>
                    ))}
                    {trip.destinations.length > 3 && (
                      <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 px-2 py-0.5 rounded-full">+{trip.destinations.length - 3}</span>
                    )}
                  </div>
                )}

                {!isConfirming ? (
                  <Link href={`/trips/${trip.id}`}
                    className="flex items-center justify-between text-sm text-[#398AB9] font-medium hover:text-[#1C658C] transition">
                    <span className="flex items-center gap-1.5"><MapIcon className="w-4 h-4" /> ดูแผนการเดินทาง</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                    <p className="text-sm text-red-600 font-medium">ยืนยันลบทริปนี้?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs text-gray-500 dark:text-slate-300 border border-gray-200 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                        ยกเลิก
                      </button>
                      <button
                        onClick={() => handleDelete(trip.id)}
                        disabled={deleting}
                        className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition disabled:opacity-60">
                        ลบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>)}

      {/* Community Trips */}
      {communityTrips.length > 0 && (
        <div className="px-4 mt-2 mb-24 md:mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-[#398AB9]" />
            <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300">ทริปจากชุมชน</h2>
            <span className="text-[10px] bg-[#398AB9]/10 text-[#398AB9] px-2 py-0.5 rounded-full font-medium ml-auto">
              {communityTrips.length} ทริป
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {communityTrips.map((t) => (
              <Link
                key={t.id}
                href={`/trips/${t.id}`}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Cover image */}
                <div className="aspect-[4/3] overflow-hidden relative bg-gray-100 dark:bg-slate-700">
                  <img
                    src={t.coverImage ?? `https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=400&q=80&sig=${t.id}`}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=400&q=80"; }}
                  />
                  {t.itemCount > 0 && (
                    <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {t.itemCount} จุด
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-200 line-clamp-1">{t.title}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">{t.destination}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Avatar
                      src={t.owner.avatarUrl}
                      name={t.owner.name ?? "ผู้ใช้"}
                      className="w-5 h-5 text-[9px]"
                    />
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate flex-1">
                      {t.owner.name ?? "ผู้ใช้"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* FAB mobile — two buttons */}
      <div className="md:hidden fixed bottom-24 right-4 flex flex-col items-end gap-2 z-40">
        <Link href="/trips/ai-plan"
          className="flex items-center gap-2 bg-gradient-to-r from-[#398AB9] to-[#1C658C] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-lg shadow-[#398AB9]/40 hover:opacity-90 transition">
          <Sparkles className="w-4 h-4" />
          AI วางแผนให้
        </Link>
        <Link href="/trips/new"
          className="w-12 h-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-2xl flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-slate-700 transition">
          <Plus className="w-5 h-5 text-[#398AB9]" />
        </Link>
      </div>
    </div>
  );
}

// ─── Calendar component ────────────────────────────────────────────────────────

const THAI_MONTHS_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const THAI_DOW = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

// Up to 6 trip colors for multi-trip calendars
const TRIP_COLORS = [
  "bg-[#398AB9] text-white",
  "bg-emerald-500 text-white",
  "bg-amber-500 text-white",
  "bg-purple-500 text-white",
  "bg-pink-500 text-white",
  "bg-orange-500 text-white",
];
const TRIP_BAR_COLORS = [
  "bg-[#398AB9]/30",
  "bg-emerald-400/30",
  "bg-amber-400/30",
  "bg-purple-400/30",
  "bg-pink-400/30",
  "bg-orange-400/30",
];

function buildCalendarCells(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function tripsOnDay(trips: TripSummary[], year: number, month: number, day: number): TripSummary[] {
  const d = new Date(year, month, day, 12, 0, 0);
  return trips.filter((t) => {
    if (!t.startDateISO || !t.endDateISO) return false;
    const start = new Date(t.startDateISO); start.setHours(0, 0, 0, 0);
    const end = new Date(t.endDateISO); end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  });
}

function isStartDay(t: TripSummary, year: number, month: number, day: number): boolean {
  if (!t.startDateISO) return false;
  const s = new Date(t.startDateISO);
  return s.getFullYear() === year && s.getMonth() === month && s.getDate() === day;
}

function TripsCalendar({ trips, year, month, onPrev, onNext }: {
  trips: TripSummary[];
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const cells = buildCalendarCells(year, month);
  const today = new Date();
  const tripsWithDates = trips.filter((t) => t.startDateISO);
  // build stable color index
  const colorMap = new Map<string, number>();
  tripsWithDates.forEach((t, i) => colorMap.set(t.id, i % TRIP_COLORS.length));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden mb-4">
      {/* Month header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <button onClick={onPrev}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-gray-800 dark:text-slate-200">
          {THAI_MONTHS_FULL[month]} {year + 543}
        </span>
        <button onClick={onNext}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-50 dark:border-slate-700/50">
        {THAI_DOW.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 dark:text-slate-500 py-2">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="min-h-[52px] border-b border-r border-gray-50 dark:border-slate-700/20" />;
          const dayTrips = tripsOnDay(trips, year, month, day);
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          const hasBg = dayTrips.length > 0;
          return (
            <div key={i} className={`min-h-[52px] p-1 border-b border-r border-gray-50 dark:border-slate-700/20 ${hasBg ? "bg-[#398AB9]/5 dark:bg-[#398AB9]/10" : ""}`}>
              <span className={`text-[11px] w-6 h-6 flex items-center justify-center mx-auto rounded-full mb-0.5 ${
                isToday ? "bg-[#398AB9] text-white font-bold" : "text-gray-700 dark:text-slate-300"
              }`}>
                {day}
              </span>
              {dayTrips.map((t) => {
                const ci = colorMap.get(t.id) ?? 0;
                const isStart = isStartDay(t, year, month, day);
                return isStart ? (
                  <Link key={t.id} href={`/trips/${t.id}`}
                    className={`block text-[9px] leading-tight px-1 py-0.5 rounded truncate font-semibold mb-0.5 ${TRIP_COLORS[ci]}`}>
                    {t.title}
                  </Link>
                ) : (
                  <div key={t.id} className={`h-1.5 rounded-full mb-0.5 mx-0.5 ${TRIP_BAR_COLORS[ci]}`} />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {tripsWithDates.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-50 dark:border-slate-700/50 flex flex-wrap gap-x-3 gap-y-1.5">
          {tripsWithDates.map((t) => {
            const ci = colorMap.get(t.id) ?? 0;
            const dotColors = ["bg-[#398AB9]", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-pink-500", "bg-orange-500"];
            return (
              <Link key={t.id} href={`/trips/${t.id}`}
                className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-slate-400 hover:text-[#398AB9] transition">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[ci]}`} />
                {t.title}
              </Link>
            );
          })}
        </div>
      )}

      {tripsWithDates.length === 0 && (
        <div className="py-10 text-center text-gray-400 dark:text-slate-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">ยังไม่มีทริปที่มีวันที่</p>
        </div>
      )}
    </div>
  );
}
