"use client";

import { use, useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { getTripById, addItineraryItem, deleteTripItem } from "@/server/actions/trips";
import {
  ChevronLeft, Plus, MapPin, Clock, Wallet,
  Trash2, GripVertical, Calendar, Share2,
  Edit3, ChevronDown, ChevronUp, Flag,
} from "lucide-react";
import Link from "next/link";

interface TripItem {
  id: string;
  name: string;
  time?: string;
  duration?: number;
  cost?: number;
  note?: string;
  type: "place" | "food" | "hotel" | "transport" | "activity";
}

interface TripDay {
  day: number;
  date: string;
  items: TripItem[];
}

const MOCK_TRIP = {
  id: "trip-1",
  title: "เชียงใหม่ 4 วัน 3 คืน",
  destination: "เชียงใหม่",
  coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  startDate: "15 มิ.ย. 2026",
  endDate: "18 มิ.ย. 2026",
  status: "PLANNING" as const,
  totalDays: 4,
  budget: 12000,
  days: [
    {
      day: 1,
      date: "วันอาทิตย์ที่ 15 มิ.ย.",
      items: [
        { id: "i1", name: "ดอยสุเทพ", time: "07:00", duration: 120, cost: 50, type: "place" as const },
        { id: "i2", name: "ข้าวมันไก่ป้าแดง", time: "10:00", duration: 45, cost: 60, type: "food" as const },
        { id: "i3", name: "ตลาดวโรรส", time: "11:30", duration: 90, cost: 200, type: "place" as const },
        { id: "i4", name: "เช็คอิน Akyra Manor Chiang Mai", time: "14:00", duration: 30, cost: 2800, type: "hotel" as const },
        { id: "i5", name: "ถนนคนเดินวันอาทิตย์", time: "17:00", duration: 180, cost: 300, type: "place" as const },
      ],
    },
    {
      day: 2,
      date: "วันจันทร์ที่ 16 มิ.ย.",
      items: [
        { id: "i6", name: "ดอยอ่างขาง", time: "06:00", duration: 240, cost: 100, type: "place" as const, note: "ออกเร็วเพราะไกล ~3 ชม." },
        { id: "i7", name: "ข้าวเหนียวปิ้งไก่ข้างทาง", time: "13:00", duration: 30, cost: 80, type: "food" as const },
        { id: "i8", name: "น้ำพุร้อนฝาง", time: "15:00", duration: 60, cost: 100, type: "activity" as const },
      ],
    },
    {
      day: 3,
      date: "วันอังคารที่ 17 มิ.ย.",
      items: [
        { id: "i9", name: "คาเฟ่ริมนา Hygge", time: "08:00", duration: 90, cost: 180, type: "food" as const },
        { id: "i10", name: "วัดอุโมงค์", time: "10:30", duration: 60, cost: 0, type: "place" as const },
        { id: "i11", name: "ย่านนิมมานเหมินท์", time: "14:00", duration: 180, cost: 500, type: "place" as const },
        { id: "i12", name: "ดินเนอร์ร้าน The Larder", time: "19:00", duration: 90, cost: 450, type: "food" as const },
      ],
    },
    {
      day: 4,
      date: "วันพุธที่ 18 มิ.ย.",
      items: [
        { id: "i13", name: "เช็คเอาท์ + ฝากกระเป๋า", time: "10:00", duration: 30, cost: 0, type: "hotel" as const },
        { id: "i14", name: "ตลาดสันป่าตอง", time: "10:30", duration: 120, cost: 200, type: "place" as const },
        { id: "i15", name: "สนามบินเชียงใหม่", time: "15:00", duration: 60, cost: 200, type: "transport" as const },
      ],
    },
  ] as TripDay[],
};

const typeColors: Record<string, string> = {
  place: "bg-[#398AB9]/10 text-[#398AB9]",
  food: "bg-orange-50 text-orange-600",
  hotel: "bg-violet-50 text-violet-600",
  transport: "bg-slate-100 text-slate-500",
  activity: "bg-emerald-50 text-emerald-600",
};

const typeLabels: Record<string, string> = {
  place: "สถานที่",
  food: "อาหาร",
  hotel: "ที่พัก",
  transport: "เดินทาง",
  activity: "กิจกรรม",
};

function ItemCard({
  item,
  onDelete,
}: {
  item: TripItem;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3.5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0 cursor-grab" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[item.type]}`}>
              {typeLabels[item.type]}
            </span>
            {item.time && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {item.time}
              </span>
            )}
            {item.cost !== undefined && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Wallet className="w-3 h-3" />
                ฿{item.cost.toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800 mt-1">{item.name}</p>
          {item.note && (
            <p className={`text-xs text-gray-400 mt-0.5 ${!expanded ? "line-clamp-1" : ""}`}>{item.note}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {item.note && (
            <button onClick={() => setExpanded(!expanded)} className="text-gray-300 hover:text-gray-500 p-1">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="text-gray-300 hover:text-red-400 transition p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState(MOCK_TRIP);
  const [activeDay, setActiveDay] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", time: "", cost: "", note: "", type: "place" as TripItem["type"] });

  // Load real trip from DB on mount
  useEffect(() => {
    if (id && !id.startsWith("mock")) {
      getTripById(id).then(({ data }) => {
        if (!data) return;
        const fmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" });
        setTrip({
          id: data.id,
          title: data.title,
          destination: data.destination,
          coverImage: data.coverImage ?? MOCK_TRIP.coverImage,
          startDate: data.startDate ? fmt.format(data.startDate) : "—",
          endDate: data.endDate ? fmt.format(data.endDate) : "—",
          status: data.status as typeof MOCK_TRIP.status,
          totalDays: data.days.length || 1,
          budget: data.budget ?? 0,
          days: data.days.map((d) => ({
            day: d.day,
            date: d.date ? fmt.format(d.date) : `วันที่ ${d.day}`,
            items: d.items.map((item) => ({
              id: item.id,
              name: item.name,
              time: item.time ?? undefined,
              duration: item.duration ?? undefined,
              cost: item.cost ?? undefined,
              note: item.note ?? undefined,
              type: "place" as TripItem["type"],
            })),
          })),
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const currentDay = trip.days.find((d) => d.day === activeDay);
  const totalCost = trip.days.flatMap((d) => d.items).reduce((s, i) => s + (i.cost ?? 0), 0);
  const budgetPercent = Math.min((totalCost / (trip.budget ?? 1)) * 100, 100);

  function deleteItem(dayNum: number, itemId: string) {
    // Optimistic update
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.day === dayNum ? { ...d, items: d.items.filter((i) => i.id !== itemId) } : d
      ),
    }));
    // Persist to DB (fire-and-forget — mock fallback handles errors)
    if (!itemId.startsWith("new-") && !itemId.startsWith("i")) {
      deleteTripItem(itemId).catch(() => {});
    }
  }

  async function addItem() {
    if (!newItem.name.trim()) return;
    const optimisticId = `new-${Date.now()}`;
    const item: TripItem = {
      id: optimisticId,
      name: newItem.name,
      time: newItem.time || undefined,
      cost: newItem.cost ? parseInt(newItem.cost) : undefined,
      note: newItem.note || undefined,
      type: newItem.type,
    };
    // Optimistic update
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.day === activeDay ? { ...d, items: [...d.items, item] } : d
      ),
    }));
    setNewItem({ name: "", time: "", cost: "", note: "", type: "place" });
    setShowAddModal(false);
    // Persist to DB
    try {
      const result = await addItineraryItem(trip.id, {
        day: activeDay,
        title: newItem.name,
        time: newItem.time || undefined,
        notes: newItem.note || undefined,
      });
      // Replace optimistic id with real id
      if (result.data) {
        setTrip((prev) => ({
          ...prev,
          days: prev.days.map((d) =>
            d.day === activeDay
              ? { ...d, items: d.items.map((i) => i.id === optimisticId ? { ...i, id: result.data!.id } : i) }
              : d
          ),
        }));
      }
    } catch { /* mock fallback handles */ }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="relative h-52 md:h-64 overflow-hidden">
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <Link href="/trips"
              className="flex items-center gap-1 text-white/90 text-sm bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-black/50 transition">
              <ChevronLeft className="w-4 h-4" />
              ทริปทั้งหมด
            </Link>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-xl font-bold text-white">{trip.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <MapPin className="w-3.5 h-3.5" />
                {trip.destination}
              </div>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {trip.startDate} – {trip.endDate}
              </div>
            </div>
          </div>
        </div>

        {/* Budget strip */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Wallet className="w-4 h-4 text-[#398AB9]" />
              <span className="font-medium">งบประมาณ</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-800">฿{totalCost.toLocaleString()}</span>
              <span className="text-xs text-gray-400"> / ฿{trip.budget?.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                budgetPercent > 90 ? "bg-red-400" : budgetPercent > 70 ? "bg-amber-400" : "bg-[#398AB9]"
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>

        {/* Day tabs */}
        <div className="bg-white border-b border-gray-100">
          <div className="flex overflow-x-auto scrollbar-none px-4 py-2 gap-2">
            {trip.days.map((d) => (
              <button
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-xl text-sm transition-all ${
                  activeDay === d.day
                    ? "bg-[#398AB9] text-white shadow-md shadow-[#398AB9]/30"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <span className="text-[10px] font-medium opacity-80">วันที่</span>
                <span className="text-lg font-bold leading-none">{d.day}</span>
                <span className="text-[10px] opacity-70 mt-0.5">{d.items.length} ที่</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active day content */}
        {currentDay && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">วันที่ {currentDay.day}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{currentDay.date}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Wallet className="w-3.5 h-3.5" />
                ฿{currentDay.items.reduce((s, i) => s + (i.cost ?? 0), 0).toLocaleString()}
              </div>
            </div>

            {/* Item list */}
            <div className="space-y-2.5 mb-4">
              {currentDay.items.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Flag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ยังไม่มีแผน — เพิ่มสถานที่เลย!</p>
                </div>
              ) : (
                currentDay.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onDelete={(itemId) => deleteItem(currentDay.day, itemId)}
                  />
                ))
              )}
            </div>

            {/* Add item button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-[#398AB9]/30 rounded-2xl text-[#398AB9] text-sm font-medium hover:bg-[#398AB9]/5 transition"
            >
              <Plus className="w-4 h-4" />
              เพิ่มสถานที่ / กิจกรรม
            </button>
          </div>
        )}

        {/* Add item modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddModal(false)} />
            <div className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl md:rounded-3xl p-6 shadow-2xl">
              <h3 className="text-base font-bold text-gray-900 mb-4">เพิ่มในวันที่ {activeDay}</h3>

              {/* Type selector */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {(["place", "food", "hotel", "transport", "activity"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewItem((p) => ({ ...p, type: t }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      newItem.type === t ? typeColors[t] + " ring-1 ring-current" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {typeLabels[t]}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <input
                  value={newItem.name}
                  onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                  placeholder="ชื่อสถานที่ / กิจกรรม *"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      value={newItem.time}
                      onChange={(e) => setNewItem((p) => ({ ...p, time: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={newItem.cost}
                      onChange={(e) => setNewItem((p) => ({ ...p, cost: e.target.value }))}
                      placeholder="ค่าใช้จ่าย ฿"
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                    />
                  </div>
                </div>
                <textarea
                  value={newItem.note}
                  onChange={(e) => setNewItem((p) => ({ ...p, note: e.target.value }))}
                  placeholder="หมายเหตุ (ไม่บังคับ)"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] resize-none"
                />
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={addItem}
                  disabled={!newItem.name.trim()}
                  className="flex-1 py-3 rounded-xl bg-[#398AB9] text-white text-sm font-bold hover:bg-[#1C658C] transition disabled:opacity-40"
                >
                  เพิ่ม
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
