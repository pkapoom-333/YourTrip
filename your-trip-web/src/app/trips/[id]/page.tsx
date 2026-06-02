"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import AppShell from "@/components/AppShell";
import { getTripById, addItineraryItem, deleteTripItem, updateTripItem } from "@/server/actions/trips";
import {
  ChevronLeft, Plus, MapPin, Clock, Wallet,
  Trash2, GripVertical, Calendar, Share2,
  Edit3, ChevronDown, ChevronUp, Flag, Car, Map,
  Navigation, Search, Loader2, X,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getDrivingRoute, haversineKm } from "@/lib/osrm";
import type { MapPoint } from "@/components/features/TripDayMap";
import { searchPlacesForTrip, type PlacePickerItem } from "@/server/actions/places";

const TripDayMap = dynamic(() => import("@/components/features/TripDayMap"), { ssr: false });

interface TripItem {
  id: string;
  name: string;
  time?: string;
  duration?: number;      // นาที — ใช้เวลาอยู่ที่นี่
  travelTimeTo?: number;  // นาที — เดินทางไปสถานที่ถัดไป
  cost?: number;
  note?: string;
  type: "place" | "food" | "hotel" | "transport" | "activity";
  lat?: number;
  lng?: number;
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
        { id: "i1", name: "ดอยสุเทพ", time: "07:00", duration: 120, travelTimeTo: 45, cost: 50, type: "place" as const },
        { id: "i2", name: "ข้าวมันไก่ป้าแดง", time: "10:00", duration: 45, travelTimeTo: 20, cost: 60, type: "food" as const },
        { id: "i3", name: "ตลาดวโรรส", time: "11:30", duration: 90, travelTimeTo: 30, cost: 200, type: "place" as const },
        { id: "i4", name: "เช็คอิน Akyra Manor", time: "14:00", duration: 30, travelTimeTo: 15, cost: 2800, type: "hotel" as const },
        { id: "i5", name: "ถนนคนเดินวันอาทิตย์", time: "17:00", duration: 180, cost: 300, type: "place" as const },
      ],
    },
    {
      day: 2,
      date: "วันจันทร์ที่ 16 มิ.ย.",
      items: [
        { id: "i6", name: "ดอยอ่างขาง", time: "06:00", duration: 240, travelTimeTo: 180, cost: 100, type: "place" as const, note: "ออกเร็วเพราะไกล ~3 ชม." },
        { id: "i7", name: "ข้าวเหนียวปิ้งไก่ข้างทาง", time: "13:00", duration: 30, travelTimeTo: 40, cost: 80, type: "food" as const },
        { id: "i8", name: "น้ำพุร้อนฝาง", time: "15:00", duration: 60, cost: 100, type: "activity" as const },
      ],
    },
    {
      day: 3,
      date: "วันอังคารที่ 17 มิ.ย.",
      items: [
        { id: "i9", name: "คาเฟ่ริมนา Hygge", time: "08:00", duration: 90, travelTimeTo: 25, cost: 180, type: "food" as const },
        { id: "i10", name: "วัดอุโมงค์", time: "10:30", duration: 60, travelTimeTo: 30, cost: 0, type: "place" as const },
        { id: "i11", name: "ย่านนิมมานเหมินท์", time: "14:00", duration: 180, travelTimeTo: 20, cost: 500, type: "place" as const },
        { id: "i12", name: "ดินเนอร์ร้าน The Larder", time: "19:00", duration: 90, cost: 450, type: "food" as const },
      ],
    },
    {
      day: 4,
      date: "วันพุธที่ 18 มิ.ย.",
      items: [
        { id: "i13", name: "เช็คเอาท์ + ฝากกระเป๋า", time: "10:00", duration: 30, travelTimeTo: 15, cost: 0, type: "hotel" as const },
        { id: "i14", name: "ตลาดสันป่าตอง", time: "10:30", duration: 120, travelTimeTo: 60, cost: 200, type: "place" as const },
        { id: "i15", name: "สนามบินเชียงใหม่", time: "15:00", duration: 60, cost: 200, type: "transport" as const },
      ],
    },
  ] as TripDay[],
};

const typeColors: Record<string, string> = {
  place:     "bg-[#398AB9]/10 text-[#398AB9]",
  food:      "bg-orange-50 text-orange-600",
  hotel:     "bg-violet-50 text-violet-600",
  transport: "bg-slate-100 text-slate-500",
  activity:  "bg-emerald-50 text-emerald-600",
};

const typeLabels: Record<string, string> = {
  place:     "สถานที่",
  food:      "อาหาร",
  hotel:     "ที่พัก",
  transport: "เดินทาง",
  activity:  "กิจกรรม",
};

function fmtMin(min: number) {
  if (min < 60) return `${min} นาที`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} ชม. ${m} นาที` : `${h} ชม.`;
}

/** Search & pick a place from DB to link to an itinerary item */
function PlacePicker({
  onSelect,
}: {
  onSelect: (p: PlacePickerItem) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PlacePickerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(v: string) {
    setQ(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!v.trim()) { setResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await searchPlacesForTrip(v, 6);
      setResults(data);
      setLoading(false);
    }, 300);
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={q}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="ค้นหาสถานที่ใน YourTrip..."
          className="w-full pl-9 pr-3 py-3 border border-[#398AB9]/30 bg-[#398AB9]/5 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] transition"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
      </div>

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onSelect(p); setQ(""); setResults([]); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#398AB9]/5 transition text-left"
            >
              <MapPin className="w-4 h-4 text-[#398AB9] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{p.province ?? p.nameEn}</p>
              </div>
              {p.lat && p.lng && (
                <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex-shrink-0">
                  📍 มีแผนที่
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** เส้นเชื่อมระหว่างสถานที่ — แสดงเวลาเดินทาง + ระยะทาง */
function TravelConnector({
  minutes,
  distanceKm,
  onEdit,
}: {
  minutes: number;
  distanceKm?: number;
  onEdit: (m: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(minutes));

  function save() {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 0) onEdit(n);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      {/* line */}
      <div className="flex flex-col items-center w-8 flex-shrink-0">
        <div className="w-px h-2 bg-gray-200" />
        <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <Car className="w-3.5 h-3.5 text-gray-400" />
        </div>
        <div className="w-px h-2 bg-gray-200" />
      </div>

      {/* label */}
      {editing ? (
        <div className="flex items-center gap-1.5 flex-1">
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            autoFocus
            className="w-16 px-2 py-1 text-xs border border-[#398AB9] rounded-lg focus:outline-none"
          />
          <span className="text-xs text-gray-400">นาที</span>
          <button onClick={save} className="text-[10px] text-white bg-[#398AB9] px-2 py-0.5 rounded-md">
            บันทึก
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setVal(String(minutes)); setEditing(true); }}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#398AB9] transition group"
        >
          <Clock className="w-3 h-3" />
          <span>เดินทาง {fmtMin(minutes)}</span>
          {distanceKm !== undefined && (
            <span className="text-[10px] bg-[#398AB9]/10 text-[#398AB9] px-1.5 py-0.5 rounded-full font-medium">
              {distanceKm} km
            </span>
          )}
          <span className="opacity-0 group-hover:opacity-100 text-[10px] ml-1">✏️</span>
        </button>
      )}
    </div>
  );
}

function ItemCard({
  item,
  onDelete,
  onUpdateDuration,
}: {
  item: TripItem;
  onDelete: (id: string) => void;
  onUpdateDuration: (id: string, min: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingDuration, setEditingDuration] = useState(false);
  const [durVal, setDurVal] = useState(String(item.duration ?? ""));

  function saveDuration() {
    const n = parseInt(durVal);
    if (!isNaN(n) && n > 0) onUpdateDuration(item.id, n);
    setEditingDuration(false);
  }

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

          {/* Duration — กดแก้ได้ */}
          <div className="mt-1.5">
            {editingDuration ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400">อยู่ที่นี่</span>
                <input
                  type="number"
                  value={durVal}
                  onChange={(e) => setDurVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveDuration()}
                  autoFocus
                  className="w-14 px-1.5 py-0.5 text-xs border border-[#398AB9] rounded focus:outline-none"
                />
                <span className="text-[10px] text-gray-400">นาที</span>
                <button onClick={saveDuration} className="text-[10px] text-white bg-[#398AB9] px-1.5 py-0.5 rounded">
                  ✓
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setDurVal(String(item.duration ?? "")); setEditingDuration(true); }}
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#398AB9] transition group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#398AB9]/40 flex-shrink-0" />
                อยู่ที่นี่{" "}
                <span className="font-medium">
                  {item.duration ? fmtMin(item.duration) : "— นาที"}
                </span>
                <span className="opacity-0 group-hover:opacity-100 text-[10px] ml-0.5">✏️</span>
              </button>
            )}
          </div>

          {item.note && (
            <p className={`text-xs text-gray-400 mt-1 ${!expanded ? "line-clamp-1" : ""}`}>{item.note}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {item.note && (
            <button onClick={() => setExpanded(!expanded)} className="text-gray-300 hover:text-gray-500 p-1">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          <button onClick={() => onDelete(item.id)} className="text-gray-300 hover:text-red-400 transition p-1">
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
  const [showMap, setShowMap] = useState(false);
  const [routeSegments, setRouteSegments] = useState<Array<{ distanceKm: number; durationMin: number }>>([]);
  const [newItem, setNewItem] = useState({
    name: "", time: "", cost: "", note: "",
    duration: "", travelTimeTo: "",
    type: "place" as TripItem["type"],
    placeId: "" as string | undefined,
    placeLat: undefined as number | undefined,
    placeLng: undefined as number | undefined,
  });

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
              travelTimeTo: item.travelTimeTo ?? undefined,
              cost: item.cost ?? undefined,
              note: item.note ?? undefined,
              type: "place" as TripItem["type"],
              lat: item.place?.lat ?? undefined,
              lng: item.place?.lng ?? undefined,
            })),
          })),
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const currentDay = trip.days.find((d) => d.day === activeDay);

  // Fetch OSRM route whenever activeDay changes and has coords
  const fetchRoute = useCallback(async () => {
    if (!currentDay) return;
    const coords = currentDay.items
      .filter((i) => i.lat && i.lng)
      .map((i) => ({ lat: i.lat!, lng: i.lng! }));

    if (coords.length < 2) {
      // Haversine fallback for consecutive pairs
      const segs = [];
      for (let i = 0; i < coords.length - 1; i++) {
        const km = haversineKm(coords[i], coords[i + 1]);
        segs.push({ distanceKm: km, durationMin: Math.round((km / 40) * 60) });
      }
      setRouteSegments(segs);
      return;
    }
    try {
      const segs = await getDrivingRoute(coords);
      setRouteSegments(segs);
    } catch {
      setRouteSegments([]);
    }
  }, [currentDay]);

  useEffect(() => { fetchRoute(); }, [fetchRoute]);
  const totalCost = trip.days.flatMap((d) => d.items).reduce((s, i) => s + (i.cost ?? 0), 0);
  const budgetPercent = Math.min((totalCost / (trip.budget ?? 1)) * 100, 100);

  function updateItem(dayNum: number, itemId: string, patch: Partial<TripItem>) {
    // Optimistic UI update
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.day === dayNum
          ? { ...d, items: d.items.map((i) => i.id === itemId ? { ...i, ...patch } : i) }
          : d
      ),
    }));
    // Persist to DB (skip mock IDs)
    if (!itemId.startsWith("new-") && !itemId.startsWith("i")) {
      updateTripItem(itemId, {
        duration: patch.duration,
        travelTimeTo: patch.travelTimeTo,
        cost: patch.cost,
        note: patch.note,
        time: patch.time,
      }).catch(() => {});
    }
  }

  function deleteItem(dayNum: number, itemId: string) {
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.day === dayNum ? { ...d, items: d.items.filter((i) => i.id !== itemId) } : d
      ),
    }));
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
      duration: newItem.duration ? parseInt(newItem.duration) : undefined,
      travelTimeTo: newItem.travelTimeTo ? parseInt(newItem.travelTimeTo) : undefined,
      cost: newItem.cost ? parseInt(newItem.cost) : undefined,
      note: newItem.note || undefined,
      type: newItem.type,
      lat: newItem.placeLat,
      lng: newItem.placeLng,
    };
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.day === activeDay ? { ...d, items: [...d.items, item] } : d
      ),
    }));
    setNewItem({ name: "", time: "", cost: "", note: "", duration: "", travelTimeTo: "", type: "place", placeId: "", placeLat: undefined, placeLng: undefined });
    setShowAddModal(false);
    try {
      const result = await addItineraryItem(trip.id, {
        day: activeDay,
        title: newItem.name,
        time: newItem.time || undefined,
        notes: newItem.note || undefined,
        duration: newItem.duration ? parseInt(newItem.duration) : undefined,
        travelTimeTo: newItem.travelTimeTo ? parseInt(newItem.travelTimeTo) : undefined,
        cost: newItem.cost ? parseInt(newItem.cost) : undefined,
        placeId: newItem.placeId || undefined,
      });
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
    } catch { /* mock fallback */ }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="relative h-52 md:h-64 overflow-hidden">
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <Link href="/trips"
              className="flex items-center gap-1 text-white/90 text-sm bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-black/50 transition">
              <ChevronLeft className="w-4 h-4" />ทริปทั้งหมด
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
                <MapPin className="w-3.5 h-3.5" />{trip.destination}
              </div>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Calendar className="w-3.5 h-3.5" />{trip.startDate} – {trip.endDate}
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
              <button key={d.day} onClick={() => setActiveDay(d.day)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-xl text-sm transition-all ${
                  activeDay === d.day
                    ? "bg-[#398AB9] text-white shadow-md shadow-[#398AB9]/30"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}>
                <span className="text-[10px] font-medium opacity-80">วันที่</span>
                <span className="text-lg font-bold leading-none">{d.day}</span>
                <span className="text-[10px] opacity-70 mt-0.5">{d.items.length} ที่</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active day */}
        {currentDay && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-gray-800">วันที่ {currentDay.day}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{currentDay.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Wallet className="w-3.5 h-3.5" />
                  ฿{currentDay.items.reduce((s, i) => s + (i.cost ?? 0), 0).toLocaleString()}
                </div>
                <button
                  onClick={() => setShowMap((v) => !v)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition ${
                    showMap
                      ? "bg-[#398AB9] text-white"
                      : "border border-gray-200 text-gray-500 hover:border-[#398AB9] hover:text-[#398AB9]"
                  }`}>
                  <Map className="w-3.5 h-3.5" />
                  แผนที่
                </button>
              </div>
            </div>

            {/* Map panel */}
            {showMap && (
              <div className="mb-4">
                <TripDayMap
                  points={currentDay.items
                    .filter((i) => i.lat && i.lng)
                    .map((i, idx) => ({
                      name: i.name,
                      lat: i.lat!,
                      lng: i.lng!,
                      order: idx + 1,
                    } satisfies MapPoint))
                  }
                />
                {/* Route summary */}
                {routeSegments.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {routeSegments.map((seg, i) => (
                      <div key={i} className="flex items-center gap-1 bg-[#398AB9]/8 text-[#398AB9] text-[11px] font-medium px-2.5 py-1 rounded-full">
                        <Navigation className="w-3 h-3" />
                        {currentDay.items[i]?.name.slice(0, 8)} → {currentDay.items[i + 1]?.name.slice(0, 8)}
                        <span className="text-[#1C658C] font-bold ml-1">{seg.distanceKm} km</span>
                        <span className="text-gray-400">·</span>
                        <span>~{seg.durationMin} นาที</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Item list with travel connectors */}
            <div className="mb-4">
              {currentDay.items.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Flag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ยังไม่มีแผน — เพิ่มสถานที่เลย!</p>
                </div>
              ) : (
                currentDay.items.map((item, idx) => (
                  <div key={item.id}>
                    <ItemCard
                      item={item}
                      onDelete={(itemId) => deleteItem(currentDay.day, itemId)}
                      onUpdateDuration={(itemId, min) => updateItem(currentDay.day, itemId, { duration: min })}
                    />
                    {/* Travel connector — แสดงหลังทุก item ยกเว้นตัวสุดท้าย */}
                    {idx < currentDay.items.length - 1 && (
                      <TravelConnector
                        minutes={item.travelTimeTo ?? routeSegments[idx]?.durationMin ?? 15}
                        distanceKm={routeSegments[idx]?.distanceKm}
                        onEdit={(m) => updateItem(currentDay.day, item.id, { travelTimeTo: m })}
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-[#398AB9]/30 rounded-2xl text-[#398AB9] text-sm font-medium hover:bg-[#398AB9]/5 transition"
            >
              <Plus className="w-4 h-4" />เพิ่มสถานที่ / กิจกรรม
            </button>
          </div>
        )}

        {/* Add modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddModal(false)} />
            <div className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl md:rounded-3xl p-6 shadow-2xl">
              <h3 className="text-base font-bold text-gray-900 mb-4">เพิ่มในวันที่ {activeDay}</h3>

              <div className="flex gap-2 mb-4 flex-wrap">
                {(["place", "food", "hotel", "transport", "activity"] as const).map((t) => (
                  <button key={t}
                    onClick={() => setNewItem((p) => ({ ...p, type: t }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      newItem.type === t ? typeColors[t] + " ring-1 ring-current" : "bg-gray-100 text-gray-500"
                    }`}>
                    {typeLabels[t]}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {/* Place picker from DB */}
                <PlacePicker
                  onSelect={(p) => setNewItem((prev) => ({
                    ...prev,
                    name: p.name,
                    placeId: p.id,
                    placeLat: p.lat ?? undefined,
                    placeLng: p.lng ?? undefined,
                    type: p.category === "cafe" || p.category === "restaurant" ? "food" : "place",
                  }))}
                />

                {/* Selected place badge */}
                {newItem.placeId && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-emerald-700 font-medium flex-1 truncate">{newItem.name}</span>
                    {newItem.placeLat && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">📍 มีแผนที่</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setNewItem((p) => ({ ...p, placeId: "", placeLat: undefined, placeLng: undefined, name: "" }))}
                      className="text-emerald-400 hover:text-emerald-600 transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Manual name (shown when no place selected) */}
                {!newItem.placeId && (
                  <input
                    value={newItem.name}
                    onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                    placeholder="หรือพิมพ์ชื่อเอง..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                  />
                )}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="time" value={newItem.time}
                      onChange={(e) => setNewItem((p) => ({ ...p, time: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" value={newItem.cost} placeholder="ค่าใช้จ่าย ฿"
                      onChange={(e) => setNewItem((p) => ({ ...p, cost: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                    />
                  </div>
                </div>

                {/* Duration + Travel time */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs whitespace-nowrap">อยู่ที่นี่</span>
                    <input type="number" value={newItem.duration} placeholder="นาที"
                      onChange={(e) => setNewItem((p) => ({ ...p, duration: e.target.value }))}
                      className="w-full pl-16 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" value={newItem.travelTimeTo} placeholder="เดินทางถัดไป (นาที)"
                      onChange={(e) => setNewItem((p) => ({ ...p, travelTimeTo: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                    />
                  </div>
                </div>

                <textarea value={newItem.note}
                  onChange={(e) => setNewItem((p) => ({ ...p, note: e.target.value }))}
                  placeholder="หมายเหตุ (ไม่บังคับ)" rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] resize-none"
                />
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                  ยกเลิก
                </button>
                <button onClick={addItem} disabled={!newItem.name.trim()}
                  className="flex-1 py-3 rounded-xl bg-[#398AB9] text-white text-sm font-bold hover:bg-[#1C658C] transition disabled:opacity-40">
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
