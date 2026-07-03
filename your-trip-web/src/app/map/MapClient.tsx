"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { MapPin, Star, Loader2, X } from "lucide-react";
import { getPlacesForMap, type MapPlace } from "@/server/actions/places";

// Leaflet must be client-only
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

const CATEGORIES = [
  { key: "", label: "ทั้งหมด", emoji: "🗺️" },
  { key: "attraction", label: "สถานที่เที่ยว", emoji: "🏔️" },
  { key: "restaurant", label: "ร้านอาหาร", emoji: "🍜" },
  { key: "cafe", label: "คาเฟ่", emoji: "☕" },
  { key: "hotel", label: "ที่พัก", emoji: "🏨" },
  { key: "activity", label: "กิจกรรม", emoji: "🎯" },
];

const CATEGORY_COLOR: Record<string, string> = {
  attraction: "#398AB9",
  restaurant: "#F97316",
  cafe: "#A16207",
  hotel: "#7C3AED",
  activity: "#059669",
};

function categoryColor(cat: string) {
  return CATEGORY_COLOR[cat] ?? "#398AB9";
}

export default function MapClient() {
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MapPlace | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const iconCache = useRef<Record<string, unknown>>({});

  // Leaflet icon fix + CSS (client-side only)
  useEffect(() => {
    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      const Lmod = (L as unknown as { default: typeof L }).default ?? L;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (Lmod.Icon.Default.prototype as any)._getIconUrl;
      Lmod.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setLeafletReady(true);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getPlacesForMap(category || undefined).then((res) => {
      setPlaces(res.data);
      setLoading(false);
    });
  }, [category]);

  function getIcon(cat: string) {
    if (iconCache.current[cat]) return iconCache.current[cat];
    if (typeof window === "undefined") return undefined;
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const Lraw = require("leaflet");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const L = (Lraw as any).default ?? Lraw;
    const color = categoryColor(cat);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20C24 5.37 18.63 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const icon = L.divIcon({
      html: svg,
      className: "",
      iconSize: [24, 32],
      iconAnchor: [12, 32],
      popupAnchor: [0, -32],
    });
    iconCache.current[cat] = icon;
    return icon;
  }

  return (
    <AppShell>
      <div className="flex flex-col" style={{ height: "calc(100dvh - 60px)" }}>
        {/* Top bar */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-[#398AB9]" />
            <h1 className="text-base font-bold text-gray-900 dark:text-slate-100">แผนที่สถานที่</h1>
            {!loading && (
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto">
                {places.length} สถานที่
              </span>
            )}
          </div>
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  category === c.key
                    ? "bg-[#398AB9] text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                <span>{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-900/70">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#398AB9]" />
                <p className="text-sm text-gray-500 dark:text-slate-400">กำลังโหลดสถานที่...</p>
              </div>
            </div>
          )}

          {leafletReady && (
            <MapContainer
              center={[13.7563, 100.5018] as [number, number]}
              zoom={6}
              style={{ width: "100%", height: "100%" }}
              className="z-0"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              {places.map((p) => (
                <Marker
                  key={p.id}
                  position={[p.lat, p.lng] as [number, number]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  icon={getIcon(p.category) as any}
                  eventHandlers={{ click: () => setSelected(p) }}
                >
                  <Popup>
                    <div className="w-48 p-0">
                      {p.coverImage && (
                        <img
                          src={p.coverImage}
                          alt={p.name}
                          className="w-full h-24 object-cover rounded-t-lg"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="p-2">
                        <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                        {p.province && (
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {p.province}
                          </p>
                        )}
                        {p.rating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-[11px] font-medium text-gray-700">{p.rating.toFixed(1)}</span>
                            <span className="text-[10px] text-gray-400">({p.reviewCount})</span>
                          </div>
                        )}
                        <Link
                          href={`/place/${p.slug}`}
                          className="block mt-2 text-center text-xs font-semibold text-white bg-[#398AB9] hover:bg-[#1C658C] rounded-lg py-1.5 transition"
                        >
                          ดูรายละเอียด →
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Mobile selected card */}
          {selected && (
            <div className="absolute bottom-4 left-4 right-4 z-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-3 flex gap-3">
              {selected.coverImage && (
                <img
                  src={selected.coverImage}
                  alt={selected.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">{selected.name}</p>
                {selected.province && (
                  <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {selected.province}
                  </p>
                )}
                {selected.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{selected.rating.toFixed(1)}</span>
                  </div>
                )}
                <Link
                  href={`/place/${selected.slug}`}
                  className="inline-block mt-1.5 text-xs font-semibold text-[#398AB9] hover:underline"
                >
                  ดูรายละเอียด →
                </Link>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="self-start p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
