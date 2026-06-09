"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Calendar, Users, ChevronRight, Map, Plane, Trash2, X, ChevronDown, Copy, Check } from "lucide-react";
import { deleteTrip, updateTripStatus, duplicateTrip } from "@/server/actions/trips";
import { useToast } from "@/components/shared/Toast";

export interface TripSummary {
  id: string;
  title: string;
  status: "upcoming" | "planning" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
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

export default function TripsClient({ initialTrips }: { initialTrips: TripSummary[] }) {
  const [tab, setTab] = useState<"all" | "upcoming" | "planning" | "completed">("all");
  const [trips, setTrips] = useState<TripSummary[]>(initialTrips.length > 0 ? initialTrips : MOCK_TRIPS);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [duplicatedId, setDuplicatedId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const filtered = tab === "all" ? trips : trips.filter((t) => t.status === tab);

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

  const totalPlaces = trips.reduce((s: number, t: TripSummary) => s + t.places, 0);
  const totalDays   = trips.reduce((s: number, t: TripSummary) => {
    if (!t.startDate || !t.endDate) return s;
    try {
      const diff = new Date(t.endDate).getTime() - new Date(t.startDate).getTime();
      return s + Math.max(1, Math.ceil(diff / 86_400_000) + 1);
    } catch { return s; }
  }, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <div className="hidden md:flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">ทริปของฉัน</h1>
        <Link href="/trips/new"
          className="flex items-center gap-2 bg-[#398AB9] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1C658C] transition">
          <Plus className="w-4 h-4" />
          สร้างทริปใหม่
        </Link>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
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

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
        {(["all", "upcoming", "planning", "completed"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition ${
              tab === t ? "bg-[#398AB9] text-white" : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400"
            }`}>
            {t === "all" ? "ทั้งหมด" : statusConfig[t].label}
          </button>
        ))}
      </div>

      {/* Trip cards */}
      <div className="space-y-3">
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
                    <span className="flex items-center gap-1.5"><Map className="w-4 h-4" /> ดูแผนการเดินทาง</span>
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
      </div>

      {/* FAB mobile */}
      <Link href="/trips/new"
        className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-[#398AB9] rounded-2xl flex items-center justify-center shadow-lg shadow-[#398AB9]/40 hover:bg-[#1C658C] transition z-40">
        <Plus className="w-6 h-6 text-white" />
      </Link>
    </div>
  );
}

// ─── Mock fallback (shown when DB not configured) ─────────────────────────────

const MOCK_TRIPS: TripSummary[] = [
  {
    id: "mock-1", title: "เชียงใหม่ 3 วัน 2 คืน", status: "upcoming",
    startDate: "15 มิ.ย. 2026", endDate: "17 มิ.ย. 2026",
    members: 3, places: 8,
    img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80",
    destinations: ["ดอยอินทนนท์", "วัดพระธาตุดอยสุเทพ", "ถนนคนเดิน"],
  },
  {
    id: "mock-2", title: "บาหลี Solo Trip", status: "planning",
    startDate: "10 ก.ค. 2026", endDate: "17 ก.ค. 2026",
    members: 1, places: 12,
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    destinations: ["Tegalalang", "Ubud", "Seminyak", "Uluwatu"],
  },
  {
    id: "mock-3", title: "ภูเก็ตกับครอบครัว", status: "completed",
    startDate: "20 เม.ย. 2026", endDate: "24 เม.ย. 2026",
    members: 5, places: 6,
    img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80",
    destinations: ["หาดกะรน", "บิ๊กพุทธา", "ตลาดบางเหนียว"],
  },
];
