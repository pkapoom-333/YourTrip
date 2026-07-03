"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Star, CalendarDays } from "lucide-react";
import type { UserCheckIn } from "@/server/actions/places";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then((m) => m.TileLayer),    { ssr: false });
const Marker       = dynamic(() => import("react-leaflet").then((m) => m.Marker),       { ssr: false });
const Popup        = dynamic(() => import("react-leaflet").then((m) => m.Popup),        { ssr: false });

const CAT_COLOR: Record<string, string> = {
  attraction: "#398AB9",
  restaurant: "#F97316",
  cafe:       "#A16207",
  hotel:      "#7C3AED",
  activity:   "#059669",
};
const CAT_EMOJI: Record<string, string> = {
  attraction: "🏔️", restaurant: "🍜", cafe: "☕", hotel: "🏨", activity: "🎯",
};

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

interface Props {
  checkIns: UserCheckIn[];
}

export default function CheckInsMapView({ checkIns }: Props) {
  const [ready, setReady] = useState(false);
  const iconCache = useRef<Record<string, unknown>>({});

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
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setReady(true);
    });
  }, []);

  function getIcon(cat: string, count: number) {
    const key = `${cat}-${count}`;
    if (iconCache.current[key]) return iconCache.current[key];
    if (typeof window === "undefined") return undefined;
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const Lraw = require("leaflet");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const L = (Lraw as any).default ?? Lraw;
    const color = CAT_COLOR[cat] ?? "#398AB9";
    const badge = count > 1 ? `<div style="position:absolute;top:-6px;right:-6px;background:#FF4F4F;color:white;border-radius:999px;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;padding:0 3px;">${count}</div>` : "";
    const svg = `<div style="position:relative;display:inline-block;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36" width="28" height="36">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
        <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
      </svg>${badge}</div>`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const icon = L.divIcon({ html: svg, className: "", iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -36] });
    iconCache.current[key] = icon;
    return icon;
  }

  const withCoords = checkIns.filter((c) => c.lat !== null && c.lng !== null);

  // Group by placeId to count visits per place
  const placeGroups = withCoords.reduce<Record<string, UserCheckIn[]>>((acc, ci) => {
    if (!acc[ci.placeId]) acc[ci.placeId] = [];
    acc[ci.placeId].push(ci);
    return acc;
  }, {});
  const uniquePlaces = Object.values(placeGroups).map((group) => ({
    ...group[0],
    visitCount: group.length,
    lastVisit: group[0].checkedAt,
  }));

  if (withCoords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-slate-500">
        <MapPin className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">ยังไม่มีสถานที่ที่มีพิกัด</p>
        <p className="text-xs mt-1">เช็คอินในสถานที่เพื่อดูบนแผนที่</p>
      </div>
    );
  }

  // Compute center
  const lats = withCoords.map((c) => c.lat!);
  const lngs = withCoords.map((c) => c.lng!);
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div className="flex-shrink-0 bg-[#398AB9]/10 rounded-xl px-4 py-2 text-center">
          <p className="text-lg font-bold text-[#398AB9]">{uniquePlaces.length}</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400">สถานที่</p>
        </div>
        {Object.entries(
          uniquePlaces.reduce<Record<string, number>>((a, c) => ({ ...a, [c.category]: (a[c.category] ?? 0) + 1 }), {})
        ).map(([cat, cnt]) => (
          <div key={cat} className="flex-shrink-0 bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2 text-center">
            <p className="text-base">{CAT_EMOJI[cat] ?? "📍"}</p>
            <p className="text-xs font-bold text-gray-700 dark:text-slate-200">{cnt}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700" style={{ height: 400 }}>
        {ready ? (
          <MapContainer
            center={[centerLat, centerLng] as [number, number]}
            zoom={withCoords.length === 1 ? 13 : 6}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            {uniquePlaces.map((p) => (
              <Marker
                key={p.placeId}
                position={[p.lat!, p.lng!] as [number, number]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                icon={getIcon(p.category, p.visitCount) as any}
              >
                <Popup>
                  <div className="w-44 p-0">
                    {p.coverImage && (
                      <img src={p.coverImage} alt={p.placeName}
                        className="w-full h-20 object-cover rounded-t-lg" referrerPolicy="no-referrer" />
                    )}
                    <div className="p-2">
                      <p className="font-semibold text-sm text-gray-900 truncate">{p.placeName}</p>
                      {p.province && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {p.province}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                        <CalendarDays className="w-2.5 h-2.5" />
                        {fmtDate(p.lastVisit)}
                        {p.visitCount > 1 && (
                          <span className="ml-auto bg-[#FF4F4F]/10 text-[#FF4F4F] font-semibold rounded-full px-1.5 py-0.5">
                            {p.visitCount}x
                          </span>
                        )}
                      </div>
                      <Link href={`/place/${p.placeSlug}`}
                        className="block mt-2 text-center text-xs font-semibold text-white bg-[#398AB9] hover:bg-[#1C658C] rounded-lg py-1.5 transition">
                        ดูรายละเอียด →
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-slate-800">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <MapPin className="w-8 h-8 animate-bounce" />
              <p className="text-xs">กำลังโหลดแผนที่...</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CAT_COLOR).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            {CAT_EMOJI[cat]} {cat === "attraction" ? "สถานที่เที่ยว" : cat === "restaurant" ? "ร้านอาหาร" : cat === "cafe" ? "คาเฟ่" : cat === "hotel" ? "ที่พัก" : "กิจกรรม"}
          </div>
        ))}
      </div>
    </div>
  );
}
