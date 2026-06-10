"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import AppShell from "@/components/AppShell";
import { getTripById, addItineraryItem, deleteTripItem, updateTripItem, toggleTripPublic } from "@/server/actions/trips";
import {
  ChevronLeft, Plus, MapPin, Clock, Wallet,
  Trash2, GripVertical, Calendar, Share2,
  Edit3, ChevronDown, ChevronUp, Flag, Car, Map,
  Navigation, Search, Loader2, X, ExternalLink, Printer,
  Lock, Unlock,
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
  googlePlaceId?: string;
}

interface TripDay {
  day: number;
  date: string;
  items: TripItem[];
}

interface GooglePlaceResult {
  name: string;
  googlePlaceId: string;
  lat?: number;
  lng?: number;
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
        { id: "i1", name: "ดอยสุเทพ", time: "07:00", duration: 120, travelTimeTo: 45, cost: 50, type: "place" as const, lat: 18.8048, lng: 98.9220 },
        { id: "i2", name: "ข้าวมันไก่ป้าแดง", time: "10:00", duration: 45, travelTimeTo: 20, cost: 60, type: "food" as const, lat: 18.7883, lng: 98.9853 },
        { id: "i3", name: "ตลาดวโรรส", time: "11:30", duration: 90, travelTimeTo: 30, cost: 200, type: "place" as const, lat: 18.7916, lng: 98.9946 },
        { id: "i4", name: "เช็คอิน Akyra Manor", time: "14:00", duration: 30, travelTimeTo: 15, cost: 2800, type: "hotel" as const, lat: 18.7940, lng: 98.9927 },
        { id: "i5", name: "ถนนคนเดินวันอาทิตย์", time: "17:00", duration: 180, cost: 300, type: "place" as const, lat: 18.7876, lng: 98.9877 },
      ],
    },
    {
      day: 2,
      date: "วันจันทร์ที่ 16 มิ.ย.",
      items: [
        { id: "i6", name: "ดอยอ่างขาง", time: "06:00", duration: 240, travelTimeTo: 180, cost: 100, type: "place" as const, note: "ออกเร็วเพราะไกล ~3 ชม.", lat: 19.4895, lng: 99.0434 },
        { id: "i7", name: "ข้าวเหนียวปิ้งไก่ข้างทาง", time: "13:00", duration: 30, travelTimeTo: 40, cost: 80, type: "food" as const },
        { id: "i8", name: "น้ำพุร้อนฝาง", time: "15:00", duration: 60, cost: 100, type: "activity" as const, lat: 19.6172, lng: 99.0375 },
      ],
    },
    {
      day: 3,
      date: "วันอังคารที่ 17 มิ.ย.",
      items: [
        { id: "i9", name: "คาเฟ่ริมนา Hygge", time: "08:00", duration: 90, travelTimeTo: 25, cost: 180, type: "food" as const, lat: 18.7650, lng: 98.9673 },
        { id: "i10", name: "วัดอุโมงค์", time: "10:30", duration: 60, travelTimeTo: 30, cost: 0, type: "place" as const, lat: 18.7651, lng: 98.9693 },
        { id: "i11", name: "ย่านนิมมานเหมินท์", time: "14:00", duration: 180, travelTimeTo: 20, cost: 500, type: "place" as const, lat: 18.7985, lng: 98.9652 },
        { id: "i12", name: "ดินเนอร์ร้าน The Larder", time: "19:00", duration: 90, cost: 450, type: "food" as const, lat: 18.7981, lng: 98.9660 },
      ],
    },
    {
      day: 4,
      date: "วันพุธที่ 18 มิ.ย.",
      items: [
        { id: "i13", name: "เช็คเอาท์ + ฝากกระเป๋า", time: "10:00", duration: 30, travelTimeTo: 15, cost: 0, type: "hotel" as const },
        { id: "i14", name: "ตลาดสันป่าตอง", time: "10:30", duration: 120, travelTimeTo: 60, cost: 200, type: "place" as const, lat: 18.4828, lng: 98.9084 },
        { id: "i15", name: "สนามบินเชียงใหม่", time: "15:00", duration: 60, cost: 200, type: "transport" as const, lat: 18.7667, lng: 98.9628 },
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

// ─── Google Maps link helpers ─────────────────────────────────────────────────

function getMapsUrl(item: TripItem): string {
  if (item.googlePlaceId) {
    return `https://www.google.com/maps/place/?q=place_id:${item.googlePlaceId}`;
  }
  if (item.lat !== undefined && item.lng !== undefined) {
    return `https://www.google.com/maps?q=${item.lat},${item.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`;
}

function getFullRouteUrl(items: TripItem[]): string {
  const waypoints = items.map((item) => {
    if (item.lat !== undefined && item.lng !== undefined) return `${item.lat},${item.lng}`;
    return encodeURIComponent(item.name);
  });
  return `https://www.google.com/maps/dir/${waypoints.join("/")}`;
}

// ─── Google Places Autocomplete ───────────────────────────────────────────────
// TODO: Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local to enable this picker

function GooglePlacesPicker({
  onSelect,
  onClear,
}: {
  onSelect: (result: GooglePlaceResult) => void;
  onClear: () => void;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const inputRef = useRef<HTMLInputElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onClearRef = useRef(onClear);
  onClearRef.current = onClear;
  const [initialized, setInitialized] = useState(false);
  const [selected, setSelected] = useState<GooglePlaceResult | null>(null);

  useEffect(() => {
    if (!apiKey || !inputRef.current || initialized) return;
    let cancelled = false;

    (async () => {
      try {
        const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader");
        if (cancelled || !inputRef.current) return;
        setOptions({ key: apiKey, v: "weekly" });
        await importLibrary("places");
        if (cancelled || !inputRef.current) return;

        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["place_id", "name", "geometry"],
        });

        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (!place?.place_id || !place?.name) return;
          const result: GooglePlaceResult = {
            name: place.name,
            googlePlaceId: place.place_id,
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
          };
          setSelected(result);
          onSelectRef.current(result);
        });

        setInitialized(true);
      } catch {
        // API key invalid or quota exceeded — silent fail, fall back to DB picker
      }
    })();

    return () => { cancelled = true; };
  }, [apiKey, initialized]);

  if (!apiKey) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-100 dark:bg-slate-600" />
        <span className="text-[10px] text-gray-400 dark:text-slate-500">
          หรือค้นหาจาก{" "}
          <span className="font-semibold text-sky-500">Google Maps</span>
        </span>
        <div className="flex-1 h-px bg-gray-100 dark:bg-slate-600" />
      </div>

      {selected ? (
        <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-xl px-3 py-2">
          <span className="text-base leading-none">🗺️</span>
          <span className="text-sm text-sky-700 dark:text-sky-300 font-medium flex-1 truncate">{selected.name}</span>
          {selected.lat !== undefined && (
            <span className="text-[10px] bg-sky-100 dark:bg-sky-800 text-sky-600 dark:text-sky-300 px-2 py-0.5 rounded-full flex-shrink-0">
              📍 Maps
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              if (inputRef.current) inputRef.current.value = "";
              onClearRef.current();
            }}
            className="text-sky-400 hover:text-sky-600 transition flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm leading-none select-none">🗺️</span>
          <input
            ref={inputRef}
            placeholder="ค้นหาด้วย Google Maps..."
            className="w-full pl-9 pr-8 py-3 border border-sky-200 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-900/10 rounded-xl text-sm focus:outline-none focus:border-sky-400 dark:text-slate-200 dark:placeholder:text-slate-500 transition"
          />
          {!initialized && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin" />
          )}
        </div>
      )}
    </>
  );
}

// ─── DB PlacePicker ───────────────────────────────────────────────────────────

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

// ─── TravelConnector ──────────────────────────────────────────────────────────

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

// ─── ItemCard ─────────────────────────────────────────────────────────────────

function ItemCard({
  item,
  isOwner,
  onDelete,
  onUpdateDuration,
}: {
  item: TripItem;
  isOwner: boolean;
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

  const mapsUrl = getMapsUrl(item);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3.5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        {isOwner && <GripVertical className="w-4 h-4 text-gray-300 dark:text-slate-600 mt-0.5 flex-shrink-0 cursor-grab" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[item.type]}`}>
              {typeLabels[item.type]}
            </span>
            {item.time && (
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                <Clock className="w-3 h-3" />
                {item.time}
              </span>
            )}
            {item.cost !== undefined && (
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                <Wallet className="w-3 h-3" />
                ฿{item.cost.toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mt-1">{item.name}</p>

          {/* Duration — กดแก้ได้ (เจ้าของเท่านั้น) */}
          {item.duration !== undefined && (
            <div className="mt-1.5">
              {isOwner && editingDuration ? (
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
              ) : isOwner ? (
                <button
                  onClick={() => { setDurVal(String(item.duration ?? "")); setEditingDuration(true); }}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#398AB9] transition group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#398AB9]/40 flex-shrink-0" />
                  อยู่ที่นี่{" "}
                  <span className="font-medium">{fmtMin(item.duration)}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] ml-0.5">✏️</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#398AB9]/40 flex-shrink-0" />
                  อยู่ที่นี่ <span className="font-medium">{fmtMin(item.duration)}</span>
                </div>
              )}
            </div>
          )}

          {item.note && (
            <p className={`text-xs text-gray-400 dark:text-slate-500 mt-1 ${!expanded ? "line-clamp-1" : ""}`}>{item.note}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {item.note && (
            <button onClick={() => setExpanded(!expanded)} className="text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 p-1">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          {/* Google Maps link */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 dark:text-slate-600 hover:text-[#398AB9] dark:hover:text-[#398AB9] transition p-1"
            title="เปิดใน Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {isOwner && (
            <button onClick={() => onDelete(item.id)} className="text-gray-300 dark:text-slate-600 hover:text-red-400 transition p-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState(MOCK_TRIP);
  const [isOwner, setIsOwner] = useState(true); // assumed owner until DB confirms otherwise
  const [activeDay, setActiveDay] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [togglingPublic, setTogglingPublic] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [routeSegments, setRouteSegments] = useState<Array<{ distanceKm: number; durationMin: number }>>([]);
  const [newItem, setNewItem] = useState({
    name: "", time: "", cost: "", note: "",
    duration: "", travelTimeTo: "",
    type: "place" as TripItem["type"],
    placeId: "" as string | undefined,
    googlePlaceId: "" as string | undefined,
    placeLat: undefined as number | undefined,
    placeLng: undefined as number | undefined,
  });

  useEffect(() => {
    if (id && !id.startsWith("mock")) {
      getTripById(id).then(({ data, isOwner: owner }) => {
        if (!data) return;
        setIsOwner(owner ?? false);
        setIsPublic(data.isPublic);
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
              // TripItem.lat/lng first (Google Places), then linked Place coords
              lat: item.lat ?? item.place?.lat ?? undefined,
              lng: item.lng ?? item.place?.lng ?? undefined,
              googlePlaceId: item.googlePlaceId ?? undefined,
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
      setRouteSegments([]);
      return;
    }
    try {
      const segs = await getDrivingRoute(coords);
      if (segs.length > 0) {
        setRouteSegments(segs);
        return;
      }
    } catch { /* fall through to haversine */ }

    // Haversine fallback for consecutive pairs
    const segs = [];
    for (let i = 0; i < coords.length - 1; i++) {
      const km = haversineKm(coords[i], coords[i + 1]);
      segs.push({ distanceKm: km, durationMin: Math.round((km / 40) * 60) });
    }
    setRouteSegments(segs);
  }, [currentDay]);

  useEffect(() => { fetchRoute(); }, [fetchRoute]);

  const totalCost = trip.days.flatMap((d) => d.items).reduce((s, i) => s + (i.cost ?? 0), 0);
  const budgetPercent = Math.min((totalCost / (trip.budget ?? 1)) * 100, 100);

  function updateItem(dayNum: number, itemId: string, patch: Partial<TripItem>) {
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.day === dayNum
          ? { ...d, items: d.items.map((i) => i.id === itemId ? { ...i, ...patch } : i) }
          : d
      ),
    }));
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

  function resetNewItem() {
    setNewItem({
      name: "", time: "", cost: "", note: "", duration: "", travelTimeTo: "",
      type: "place", placeId: "", googlePlaceId: "",
      placeLat: undefined, placeLng: undefined,
    });
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
      googlePlaceId: newItem.googlePlaceId || undefined,
    };
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.day === activeDay ? { ...d, items: [...d.items, item] } : d
      ),
    }));
    resetNewItem();
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
        googlePlaceId: newItem.googlePlaceId || undefined,
        lat: newItem.placeLat,
        lng: newItem.placeLng,
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
    } catch { /* mock fallback — optimistic update already applied */ }
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
            <button
              onClick={async () => {
                const url = window.location.href;
                if (navigator.share) {
                  try { await navigator.share({ title: trip.title, url }); } catch { /* cancelled */ }
                } else {
                  await navigator.clipboard.writeText(url).catch(() => {});
                  setShareCopied(true);
                  setTimeout(() => setShareCopied(false), 2000);
                }
              }}
              className="relative w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition"
              title={shareCopied ? "คัดลอกแล้ว!" : "แชร์ทริป"}>
              <Share2 className="w-4 h-4" />
              {shareCopied && (
                <span className="absolute -bottom-8 right-0 whitespace-nowrap text-[10px] font-medium bg-gray-900 text-white px-2 py-1 rounded-lg">
                  คัดลอกแล้ว!
                </span>
              )}
            </button>
            <Link
              href={`/trips/${trip.id}/print`}
              className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition"
              title="พิมพ์ / บันทึก PDF"
            >
              <Printer className="w-4 h-4" />
            </Link>
            {isOwner && (
              <button
                onClick={async () => {
                  setTogglingPublic(true);
                  const { data } = await toggleTripPublic(trip.id);
                  if (data) {
                    setIsPublic(data.isPublic);
                    if (data.isPublic) {
                      await navigator.clipboard.writeText(window.location.href).catch(() => {});
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }
                  }
                  setTogglingPublic(false);
                }}
                disabled={togglingPublic}
                className={`w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition ${isPublic ? "bg-green-500/70 hover:bg-green-600/80" : "bg-black/30 hover:bg-black/50"}`}
                title={isPublic ? "ทริปสาธารณะ — คลิกเพื่อทำเป็นส่วนตัว" : "ทำให้ทริปเป็นสาธารณะ"}
              >
                {togglingPublic ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublic ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </button>
            )}
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
        <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300">
              <Wallet className="w-4 h-4 text-[#398AB9]" />
              <span className="font-medium">งบประมาณ</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-800 dark:text-slate-200">฿{totalCost.toLocaleString()}</span>
              <span className="text-xs text-gray-400 dark:text-slate-500"> / ฿{trip.budget?.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                budgetPercent > 90 ? "bg-red-400" : budgetPercent > 70 ? "bg-amber-400" : "bg-[#398AB9]"
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>

        {/* Day tabs */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
          <div className="flex overflow-x-auto scrollbar-none px-4 py-2 gap-2">
            {trip.days.map((d) => (
              <button key={d.day} onClick={() => setActiveDay(d.day)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-xl text-sm transition-all ${
                  activeDay === d.day
                    ? "bg-[#398AB9] text-white shadow-md shadow-[#398AB9]/30"
                    : "bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600"
                }`}>
                <span className="text-[10px] font-medium opacity-80">วันที่</span>
                <span className="text-lg font-bold leading-none">{d.day}</span>
                <span className="text-[10px] opacity-70 mt-0.5">{d.items.length} ที่</span>
              </button>
            ))}
          </div>
        </div>

        {/* Read-only banner for non-owners */}
        {!isOwner && (
          <div className="mx-4 mt-4 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-4 py-3">
            <span className="text-base leading-none flex-shrink-0">👁️</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">กำลังดูแบบ Read-only</p>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-500 mt-0.5">ทริปนี้เป็นของผู้ใช้อื่น — คุณสามารถดูแผนได้แต่แก้ไขไม่ได้</p>
            </div>
            <button
              onClick={async () => {
                // TODO: implement "Save a copy" — clone trip to current user
                await navigator.clipboard.writeText(window.location.href).catch(() => {});
              }}
              className="flex-shrink-0 text-[11px] font-semibold bg-amber-100 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-800 transition"
            >
              📋 คัดลอก link
            </button>
          </div>
        )}

        {/* Active day */}
        {currentDay && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-gray-800 dark:text-slate-200">วันที่ {currentDay.day}</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{currentDay.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                  <Wallet className="w-3.5 h-3.5" />
                  ฿{currentDay.items.reduce((s, i) => s + (i.cost ?? 0), 0).toLocaleString()}
                </div>
                <button
                  onClick={() => setShowMap((v) => !v)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition ${
                    showMap
                      ? "bg-[#398AB9] text-white"
                      : "border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-[#398AB9] hover:text-[#398AB9]"
                  }`}>
                  <Map className="w-3.5 h-3.5" />
                  แผนที่
                </button>
                {/* Open full route in Google Maps — shows when day has 2+ items */}
                {currentDay.items.length >= 2 && (
                  <a
                    href={getFullRouteUrl(currentDay.items)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                    title="เปิด route ทั้งหมดใน Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Route
                  </a>
                )}
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
                {/* Route summary from OSRM */}
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
                <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                  <Flag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ยังไม่มีแผน — เพิ่มสถานที่เลย!</p>
                </div>
              ) : (
                currentDay.items.map((item, idx) => (
                  <div key={item.id}>
                    <ItemCard
                      item={item}
                      isOwner={isOwner}
                      onDelete={(itemId) => deleteItem(currentDay.day, itemId)}
                      onUpdateDuration={(itemId, min) => updateItem(currentDay.day, itemId, { duration: min })}
                    />
                    {/* Travel connector — after every item except the last */}
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

            {/* Add button — owner only */}
            {isOwner && (
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-[#398AB9]/30 rounded-2xl text-[#398AB9] text-sm font-medium hover:bg-[#398AB9]/5 transition"
              >
                <Plus className="w-4 h-4" />เพิ่มสถานที่ / กิจกรรม
              </button>
            )}
          </div>
        )}

        {/* Add modal — owner only */}
        {isOwner && showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setShowAddModal(false); resetNewItem(); }} />
            <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl p-6 shadow-2xl max-h-[90dvh] overflow-y-auto">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-4">เพิ่มในวันที่ {activeDay}</h3>

              {/* Type selector */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {(["place", "food", "hotel", "transport", "activity"] as const).map((t) => (
                  <button key={t}
                    onClick={() => setNewItem((p) => ({ ...p, type: t }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      newItem.type === t ? typeColors[t] + " ring-1 ring-current" : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                    }`}>
                    {typeLabels[t]}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {/* DB picker */}
                <PlacePicker
                  onSelect={(p) => setNewItem((prev) => ({
                    ...prev,
                    name: p.name,
                    placeId: p.id,
                    googlePlaceId: "",         // clear Google Place
                    placeLat: p.lat ?? undefined,
                    placeLng: p.lng ?? undefined,
                    type: p.category === "cafe" || p.category === "restaurant" ? "food" : "place",
                  }))}
                />

                {/* DB selected place badge */}
                {newItem.placeId && (
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl px-3 py-2">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium flex-1 truncate">{newItem.name}</span>
                    {newItem.placeLat && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full">📍 มีแผนที่</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setNewItem((p) => ({ ...p, placeId: "", placeLat: undefined, placeLng: undefined, name: "" }))}
                      className="text-emerald-400 hover:text-emerald-600 transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Google Places Autocomplete — hides if no API key */}
                <GooglePlacesPicker
                  onSelect={(p) => setNewItem((prev) => ({
                    ...prev,
                    name: p.name,
                    googlePlaceId: p.googlePlaceId,
                    placeId: "",               // clear DB place
                    placeLat: p.lat,
                    placeLng: p.lng,
                  }))}
                  onClear={() => setNewItem((prev) => ({
                    ...prev,
                    googlePlaceId: "",
                    placeLat: undefined,
                    placeLng: undefined,
                    name: "",
                  }))}
                />

                {/* Manual name input — hidden when a place is selected */}
                {!newItem.placeId && !newItem.googlePlaceId && (
                  <input
                    value={newItem.name}
                    onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                    placeholder="หรือพิมพ์ชื่อเอง..."
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
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
                <button onClick={() => { setShowAddModal(false); resetNewItem(); }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition">
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
