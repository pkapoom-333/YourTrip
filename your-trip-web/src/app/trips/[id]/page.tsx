"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { upload as blobUpload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import AppShell from "@/components/AppShell";
import { getTripById, addItineraryItem, deleteTripItem, updateTripItem, toggleTripPublic, reorderItinerary, cloneTripToUser, updateTripStatus, updateTripCover, updateTripDayNote } from "@/server/actions/trips";
import {
  ChevronLeft, Plus, MapPin, Clock, Wallet,
  Trash2, GripVertical, Calendar, Share2,
  Edit3, ChevronDown, ChevronUp, Flag, Car, Map,
  Navigation, Search, Loader2, X, ExternalLink, Printer,
  Lock, Unlock, QrCode, Camera,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getDrivingRoute, getGoogleRoute, haversineKm } from "@/lib/osrm";
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
  photo?: string;         // photo URL (auto-fetched from Google Places or manual upload)
}

interface TripDay {
  day: number;
  date: string;
  items: TripItem[];
  note?: string;
}

interface GooglePlaceResult {
  name: string;
  googlePlaceId: string;
  lat?: number;
  lng?: number;
  photoUrl?: string; // auto-fetched from Google Places
}

const FALLBACK_COVER = "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=800&q=80";

const EMPTY_TRIP = {
  id: "",
  title: "",
  destination: "",
  coverImage: FALLBACK_COVER,
  startDate: "—",
  endDate: "—",
  status: "PLANNING" as const,
  totalDays: 1,
  budget: 0,
  days: [] as TripDay[],
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

// ─── Trip Status Tracker ──────────────────────────────────────────────────────

type TripStatusValue = "PLANNING" | "CONFIRMED" | "ONGOING" | "COMPLETED";

const STATUS_STEPS: { value: TripStatusValue; label: string; emoji: string; color: string }[] = [
  { value: "PLANNING",  label: "วางแผน",   emoji: "📋", color: "bg-blue-500"   },
  { value: "CONFIRMED", label: "ยืนยันแล้ว", emoji: "✅", color: "bg-violet-500" },
  { value: "ONGOING",   label: "กำลังเดินทาง", emoji: "✈️", color: "bg-amber-500"  },
  { value: "COMPLETED", label: "เสร็จสิ้น",  emoji: "🏁", color: "bg-emerald-500" },
];

function TripStatusTracker({
  status,
  isOwner,
  onStatusChange,
}: {
  status: TripStatusValue;
  isOwner: boolean;
  onStatusChange: (s: TripStatusValue) => void;
}) {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.value === status);
  return (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3">
      <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">สถานะทริป</p>
      <div className="flex items-center gap-0">
        {STATUS_STEPS.map((step, idx) => {
          const isDone    = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isLast    = idx === STATUS_STEPS.length - 1;
          return (
            <div key={step.value} className="flex items-center flex-1">
              <button
                onClick={() => isOwner && onStatusChange(step.value)}
                disabled={!isOwner}
                className={`flex flex-col items-center gap-1 flex-1 transition-all ${isOwner ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                title={isOwner ? `เปลี่ยนเป็น: ${step.label}` : step.label}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all shadow-sm ${
                  isCurrent ? `${step.color} text-white ring-2 ring-offset-2 ring-[#398AB9] scale-110` :
                  isDone    ? "bg-[#398AB9] text-white" :
                              "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500"
                }`}>
                  {isDone ? "✓" : step.emoji}
                </div>
                <span className={`text-[9px] font-medium leading-tight text-center max-w-[52px] ${
                  isCurrent ? "text-[#398AB9] font-bold" :
                  isDone    ? "text-[#398AB9]" :
                              "text-gray-400 dark:text-slate-500"
                }`}>{step.label}</span>
              </button>
              {!isLast && (
                <div className={`h-0.5 flex-1 rounded-full mx-1 transition-all ${idx < currentIdx ? "bg-[#398AB9]" : "bg-gray-100 dark:bg-slate-700"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
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
          fields: ["place_id", "name", "geometry", "photos"],
        });

        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (!place?.place_id || !place?.name) return;
          // Try to get first photo from Google Places
          let photoUrl: string | undefined;
          try {
            const photos = (place as unknown as { photos?: Array<{ getUrl: (opts: { maxWidth: number }) => string }> }).photos;
            if (photos && photos.length > 0) {
              photoUrl = photos[0].getUrl({ maxWidth: 600 });
            }
          } catch { /* ignore */ }
          const result: GooglePlaceResult = {
            name: place.name,
            googlePlaceId: place.place_id,
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
            photoUrl,
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
  onUpdatePhoto,
}: {
  item: TripItem;
  isOwner: boolean;
  onDelete: (id: string) => void;
  onUpdateDuration: (id: string, min: number) => void;
  onUpdatePhoto: (id: string, url: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingDuration, setEditingDuration] = useState(false);
  const [durVal, setDurVal] = useState(String(item.duration ?? ""));
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoUpload(file: File) {
    if (!file || photoUploading) return;
    setPhotoUploading(true);
    try {
      const modeRes = await fetch("/api/upload");
      const { mode } = await modeRes.json() as { mode: string };
      let url: string | null = null;
      if (mode === "blob") {
        const blob = await blobUpload(
          `your-trip/stops/${Date.now()}-${file.name}`,
          file,
          { access: "public", handleUploadUrl: "/api/upload" }
        );
        url = blob.url;
      } else if (mode === "cloudinary") {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "your-trip/stops");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json() as { url?: string };
        url = data.url ?? null;
      }
      if (url) {
        onUpdatePhoto(item.id, url);
        updateTripItem(item.id, { imageUrl: url }).catch(() => {});
      }
    } catch { /* silent */ }
    setPhotoUploading(false);
  }

  function saveDuration() {
    const n = parseInt(durVal);
    if (!isNaN(n) && n > 0) onUpdateDuration(item.id, n);
    setEditingDuration(false);
  }

  const mapsUrl = getMapsUrl(item);

  return (
    <>
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Photo strip */}
      {item.photo ? (
        <div className="relative w-full h-36 overflow-hidden">
          <img src={item.photo} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          {/* Gradient overlay with place name */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <span className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow line-clamp-1">{item.name}</span>
          {isOwner && (
            <button
              onClick={() => { onUpdatePhoto(item.id, null); updateTripItem(item.id, { imageUrl: null }).catch(() => {}); }}
              className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      ) : isOwner ? (
        /* Photo placeholder — tap to upload */
        <button
          onClick={() => photoInputRef.current?.click()}
          disabled={photoUploading}
          className="w-full h-10 flex items-center justify-center gap-2 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition text-gray-400 dark:text-slate-500 hover:text-[#398AB9] dark:hover:text-[#398AB9]"
        >
          {photoUploading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <><Camera className="w-3.5 h-3.5" /><span className="text-xs">เพิ่มรูปภาพ</span></>
          }
        </button>
      ) : null}
      <div className="p-3.5">
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
    </div>
    {/* Hidden file input for photo upload */}
    <input
      ref={photoInputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="hidden"
      onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }}
    />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [trip, setTrip] = useState(EMPTY_TRIP);
  const [isOwner, setIsOwner] = useState(true); // assumed owner until DB confirms otherwise
  const [activeDay, setActiveDay] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [togglingPublic, setTogglingPublic] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cloningTrip, setCloningTrip] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [showMap, setShowMap] = useState(false);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [routeSegments, setRouteSegments] = useState<Array<{ distanceKm: number; durationMin: number }>>([]);
  const [routeSource, setRouteSource] = useState<"google" | "osrm" | "haversine" | null>(null);
  const [tripStatus, setTripStatus] = useState<"PLANNING" | "CONFIRMED" | "ONGOING" | "COMPLETED">("PLANNING");
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [newItem, setNewItem] = useState({
    name: "", time: "", cost: "", note: "",
    duration: "", travelTimeTo: "",
    type: "place" as TripItem["type"],
    placeId: "" as string | undefined,
    googlePlaceId: "" as string | undefined,
    placeLat: undefined as number | undefined,
    placeLng: undefined as number | undefined,
    photoUrl: undefined as string | undefined,
  });

  useEffect(() => {
    if (id) {
      getTripById(id).then(({ data, isOwner: owner }) => {
        if (!data) return;
        setIsOwner(owner ?? false);
        setIsPublic(data.isPublic);
        if (data.status) setTripStatus(data.status as typeof tripStatus);
        const fmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" });
        setTrip({
          id: data.id,
          title: data.title,
          destination: data.destination,
          coverImage: data.coverImage ?? FALLBACK_COVER,
          startDate: data.startDate ? fmt.format(data.startDate) : "—",
          endDate: data.endDate ? fmt.format(data.endDate) : "—",
          status: data.status as typeof EMPTY_TRIP.status,
          totalDays: data.days.length || 1,
          budget: data.budget ?? 0,
          days: data.days.map((d) => ({
            day: d.day,
            date: d.date ? fmt.format(d.date) : `วันที่ ${d.day}`,
            note: d.note ?? undefined,
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
              photo: (item as unknown as { imageUrl?: string }).imageUrl ?? undefined,
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

    // 1️⃣ Google Directions (accurate, traffic-aware)
    const googleSegs = await getGoogleRoute(coords);
    if (googleSegs.length > 0) {
      setRouteSegments(googleSegs);
      setRouteSource("google");
      return;
    }

    // 2️⃣ OSRM fallback (open-source routing)
    try {
      const segs = await getDrivingRoute(coords);
      if (segs.length > 0) {
        setRouteSegments(segs);
        setRouteSource("osrm");
        return;
      }
    } catch { /* fall through */ }

    // 3️⃣ Haversine fallback (straight-line estimate)
    const segs = [];
    for (let i = 0; i < coords.length - 1; i++) {
      const km = haversineKm(coords[i], coords[i + 1]);
      segs.push({ distanceKm: km, durationMin: Math.round((km / 40) * 60) });
    }
    setRouteSegments(segs);
    setRouteSource("haversine");
  }, [currentDay]);

  useEffect(() => { fetchRoute(); }, [fetchRoute]);

  async function handleCoverUpload(file: File) {
    if (!file || coverUploading) return;
    setCoverUploading(true);
    try {
      // Ask server which storage backend is active
      const modeRes = await fetch("/api/upload");
      const { mode } = await modeRes.json() as { mode: "blob" | "cloudinary" | "unavailable" };

      let url: string | null = null;

      if (mode === "blob") {
        const blob = await blobUpload(
          `your-trip/trips/${Date.now()}-${file.name}`,
          file,
          { access: "public", handleUploadUrl: "/api/upload" }
        );
        url = blob.url;
      } else if (mode === "cloudinary") {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "your-trip/trips");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json() as { url?: string };
        url = data.url ?? null;
      }

      if (url) {
        setTrip((prev) => ({ ...prev, coverImage: url! }));
        await updateTripCover(trip.id, url).catch(() => {});
      }
    } catch {
      // silent — camera button will re-enable on next click
    } finally {
      setCoverUploading(false);
    }
  }

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

  function handleDrop(dayNum: number, dropOnItemId: string) {
    if (!dragItemId || dragItemId === dropOnItemId) { setDragItemId(null); setDragOverItemId(null); return; }
    setTrip((prev) => {
      const days = prev.days.map((d) => {
        if (d.day !== dayNum) return d;
        const items = [...d.items];
        const fromIdx = items.findIndex((i) => i.id === dragItemId);
        const toIdx   = items.findIndex((i) => i.id === dropOnItemId);
        if (fromIdx === -1 || toIdx === -1) return d;
        const [moved] = items.splice(fromIdx, 1);
        items.splice(toIdx, 0, moved);
        // fire-and-forget persist
        reorderItinerary(trip.id, dayNum, items.map((i) => i.id)).catch(() => {});
        return { ...d, items };
      });
      return { ...prev, days };
    });
    setDragItemId(null);
    setDragOverItemId(null);
  }

  function resetNewItem() {
    setNewItem({
      name: "", time: "", cost: "", note: "", duration: "", travelTimeTo: "",
      type: "place", placeId: "", googlePlaceId: "",
      placeLat: undefined, placeLng: undefined, photoUrl: undefined,
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
      photo: newItem.photoUrl,
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
        imageUrl: newItem.photoUrl,
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
            {isPublic && (
              <button
                onClick={async () => {
                  const url = window.location.href;
                  const dataUrl = await QRCode.toDataURL(url, { width: 256, margin: 2 });
                  setQrDataUrl(dataUrl);
                  setShowQR(true);
                }}
                className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition"
                title="QR Code สำหรับแชร์"
              >
                <QrCode className="w-4 h-4" />
              </button>
            )}
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
          {/* Hidden cover image input */}
          {isOwner && (
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleCoverUpload(e.target.files[0]); }}
            />
          )}

          {/* Camera button — change cover (owner only) */}
          {isOwner && (
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="absolute bottom-4 right-4 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition disabled:opacity-50"
              title="เปลี่ยนภาพหน้าปก"
            >
              {coverUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
          )}

          <div className="absolute bottom-4 left-4 right-4 pr-12">
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
          {/* Category breakdown chips */}
          {totalCost > 0 && (() => {
            const allItems = trip.days.flatMap((d) => d.items);
            const cats: { key: string; label: string; emoji: string; color: string }[] = [
              { key: "place",     label: "สถานที่", emoji: "📍", color: "bg-[#398AB9]/10 text-[#398AB9]" },
              { key: "food",      label: "อาหาร",  emoji: "🍽️", color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" },
              { key: "hotel",     label: "ที่พัก",  emoji: "🏨", color: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400" },
              { key: "transport", label: "เดินทาง", emoji: "✈️", color: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400" },
              { key: "activity",  label: "กิจกรรม", emoji: "🎯", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
            ];
            return (
              <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-none">
                {cats.map(({ key, label, emoji, color }) => {
                  const sum = allItems.filter((i) => i.type === key).reduce((s, i) => s + (i.cost ?? 0), 0);
                  if (sum === 0) return null;
                  return (
                    <div key={key} className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${color}`}>
                      <span>{emoji}</span>
                      <span>{label}</span>
                      <span className="opacity-70">฿{sum.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Status tracker */}
        <TripStatusTracker
          status={tripStatus}
          isOwner={isOwner}
          onStatusChange={async (s) => {
            setTripStatus(s);
            await updateTripStatus(trip.id, s).catch(() => {});
          }}
        />

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
              disabled={cloningTrip}
              onClick={async () => {
                setCloningTrip(true);
                const result = await cloneTripToUser(trip.id);
                setCloningTrip(false);
                if (result.data) {
                  router.push(`/trips/${result.data.id}`);
                }
              }}
              className="flex-shrink-0 text-[11px] font-semibold bg-amber-100 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-800 transition disabled:opacity-60"
            >
              {cloningTrip ? "⏳ กำลังบันทึก..." : "📋 บันทึกสำเนา"}
            </button>
          </div>
        )}

        {/* Active day */}
        {currentDay && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0 mr-3">
                <h2 className="text-base font-bold text-gray-800 dark:text-slate-200">วันที่ {currentDay.day}</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{currentDay.date}</p>
                {/* Day note — editable for owners, read-only otherwise */}
                {isOwner ? (
                  <input
                    type="text"
                    placeholder="+ เพิ่มบันทึกประจำวัน..."
                    defaultValue={currentDay.note ?? ""}
                    key={`note-${currentDay.day}`}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      setTrip((prev) => ({
                        ...prev,
                        days: prev.days.map((d) =>
                          d.day === currentDay.day ? { ...d, note: val || undefined } : d
                        ),
                      }));
                      updateTripDayNote(trip.id, currentDay.day, val).catch(() => {});
                    }}
                    className="mt-1 text-xs text-gray-500 dark:text-slate-400 bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-slate-600 w-full truncate"
                  />
                ) : currentDay.note ? (
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 italic">{currentDay.note}</p>
                ) : null}
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
                {/* Route summary */}
                {routeSegments.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">เวลาเดินทาง</span>
                      {routeSource === "google" && (
                        <span className="text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                          📍 Google Maps
                        </span>
                      )}
                      {routeSource === "osrm" && (
                        <span className="text-[9px] text-gray-400 dark:text-slate-500 px-1.5 py-0.5 rounded-full bg-gray-50 dark:bg-slate-700">
                          OSRM
                        </span>
                      )}
                      {routeSource === "haversine" && (
                        <span className="text-[9px] text-gray-400 dark:text-slate-500 px-1.5 py-0.5 rounded-full bg-gray-50 dark:bg-slate-700">
                          ประมาณการ
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
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
                  <div key={item.id}
                    draggable={isOwner}
                    onDragStart={() => setDragItemId(item.id)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverItemId(item.id); }}
                    onDrop={() => handleDrop(currentDay.day, item.id)}
                    onDragEnd={() => { setDragItemId(null); setDragOverItemId(null); }}
                    className={`transition-opacity ${dragItemId === item.id ? "opacity-40" : ""} ${dragOverItemId === item.id && dragItemId !== item.id ? "ring-2 ring-[#398AB9]/40 rounded-2xl" : ""}`}
                  >
                    <ItemCard
                      item={item}
                      isOwner={isOwner}
                      onDelete={(itemId) => deleteItem(currentDay.day, itemId)}
                      onUpdateDuration={(itemId, min) => updateItem(currentDay.day, itemId, { duration: min })}
                      onUpdatePhoto={(itemId, url) => updateItem(currentDay.day, itemId, { photo: url ?? undefined })}
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

        {/* QR Code modal */}
        {showQR && qrDataUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowQR(false)} />
            <div className="relative z-10 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl max-w-xs w-full mx-4 text-center">
              <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-1">แชร์ทริปนี้</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">สแกน QR Code เพื่อเปิดทริปนี้</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl" />
              <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-3 truncate px-2" suppressHydrationWarning>{typeof window !== "undefined" ? window.location.href : ""}</p>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href).catch(() => {});
                }}
                className="mt-3 text-xs font-medium text-[#398AB9] hover:underline"
              >
                คัดลอก link
              </button>
            </div>
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
                    photoUrl: p.photoUrl,      // auto-fetch Google Places photo
                  }))}
                  onClear={() => setNewItem((prev) => ({
                    ...prev,
                    googlePlaceId: "",
                    placeLat: undefined,
                    placeLng: undefined,
                    name: "",
                    photoUrl: undefined,
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

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="time" value={newItem.time}
                      onChange={(e) => setNewItem((p) => ({ ...p, time: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" value={newItem.cost} placeholder="ค่าใช้จ่าย ฿"
                      onChange={(e) => setNewItem((p) => ({ ...p, cost: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                    />
                  </div>
                </div>

                {/* Duration + Travel time */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-xs whitespace-nowrap">อยู่ที่นี่</span>
                    <input type="number" value={newItem.duration} placeholder="นาที"
                      onChange={(e) => setNewItem((p) => ({ ...p, duration: e.target.value }))}
                      className="w-full pl-16 pr-3 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" value={newItem.travelTimeTo} placeholder="เดินทางถัดไป (นาที)"
                      onChange={(e) => setNewItem((p) => ({ ...p, travelTimeTo: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
                    />
                  </div>
                </div>

                <textarea value={newItem.note}
                  onChange={(e) => setNewItem((p) => ({ ...p, note: e.target.value }))}
                  placeholder="หมายเหตุ (ไม่บังคับ)" rows={2}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] resize-none"
                />

                {/* Photo preview (auto from Google Places) */}
                {newItem.photoUrl && (
                  <div className="relative rounded-xl overflow-hidden h-28">
                    <img src={newItem.photoUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 left-1.5 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full">
                      📸 Google Places
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewItem((p) => ({ ...p, photoUrl: undefined }))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
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
