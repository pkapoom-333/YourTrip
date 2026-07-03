"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Star, Navigation } from "lucide-react";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then((m) => m.TileLayer),    { ssr: false });
const Marker       = dynamic(() => import("react-leaflet").then((m) => m.Marker),       { ssr: false });
const Popup        = dynamic(() => import("react-leaflet").then((m) => m.Popup),        { ssr: false });

interface NearbyPlace {
  id: string;
  slug: string;
  name: string;
  category: string;
  province: string | null;
  coverImage: string | null;
  rating: number;
  distance?: number;
  lat?: number | null;
  lng?: number | null;
}

const CAT_COLOR: Record<string, string> = {
  attraction: "#398AB9",
  restaurant: "#F97316",
  cafe:       "#A16207",
  hotel:      "#7C3AED",
  activity:   "#059669",
};

function fmtDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} ม.`;
  return `${km.toFixed(1)} กม.`;
}

interface Props {
  places: NearbyPlace[];
  userLat: number;
  userLng: number;
  radius: number;
}

export default function NearMeMapView({ places, userLat, userLng, radius }: Props) {
  const [ready, setReady] = useState(false);
  const iconCache = useRef<Record<string, unknown>>({});

  useEffect(() => {
    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]).then(([L]) => {
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

  function getIcon(cat: string, isUser = false) {
    const key = isUser ? "user" : cat;
    if (iconCache.current[key]) return iconCache.current[key];
    if (typeof window === "undefined") return undefined;
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const Lraw = require("leaflet");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const L = (Lraw as any).default ?? Lraw;
    const color = isUser ? "#FF4F4F" : (CAT_COLOR[cat] ?? "#398AB9");
    const inner = isUser
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="10" height="10" fill="white"><circle cx="8" cy="8" r="6"/></svg>`
      : "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="${isUser ? 20 : 24}" height="${isUser ? 26 : 32}">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20S24 21 24 12C24 5.37 18.63 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>${inner}
    </svg>`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const icon = L.divIcon({
      html: svg,
      className: "",
      iconSize: isUser ? [20, 26] : [24, 32],
      iconAnchor: isUser ? [10, 26] : [12, 32],
      popupAnchor: [0, isUser ? -26 : -32],
    });
    iconCache.current[key] = icon;
    return icon;
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
      <div className="bg-white dark:bg-slate-800 px-4 py-2.5 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
        <Navigation className="w-3.5 h-3.5 text-[#398AB9]" />
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {places.length} สถานที่ในรัศมี {radius} กม.
        </p>
      </div>

      <div style={{ height: 400 }}>
        {ready ? (
          <MapContainer
            center={[userLat, userLng] as [number, number]}
            zoom={radius <= 1 ? 15 : radius <= 3 ? 14 : radius <= 5 ? 13 : radius <= 10 ? 12 : 11}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />

            {/* User location marker */}
            <Marker
              position={[userLat, userLng] as [number, number]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              icon={getIcon("user", true) as any}
            >
              <Popup>
                <div className="p-1 text-center">
                  <p className="text-xs font-semibold text-[#FF4F4F]">📍 ตำแหน่งของคุณ</p>
                </div>
              </Popup>
            </Marker>

            {/* Place markers */}
            {places.map((p) => (
              <Marker
                key={p.id}
                position={[
                  p.lat ?? userLat + (Math.random() - 0.5) * (radius / 55),
                  p.lng ?? userLng + (Math.random() - 0.5) * (radius / 55),
                ] as [number, number]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                icon={getIcon(p.category) as any}
              >
                <Popup>
                  <div className="w-40 p-0">
                    {p.coverImage && (
                      <img src={p.coverImage} alt={p.name}
                        className="w-full h-16 object-cover rounded-t-lg" referrerPolicy="no-referrer" />
                    )}
                    <div className="p-2">
                      <p className="font-semibold text-xs text-gray-900 truncate">{p.name}</p>
                      {p.distance !== undefined && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-[#398AB9]" />
                          {fmtDist(p.distance)}
                        </p>
                      )}
                      {p.rating > 0 && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-medium text-gray-700">{p.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <Link href={`/place/${p.slug}`}
                        className="block mt-1.5 text-center text-[10px] font-semibold text-white bg-[#398AB9] hover:bg-[#1C658C] rounded-lg py-1 transition">
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
              <Navigation className="w-6 h-6 animate-bounce" />
              <p className="text-xs">กำลังโหลดแผนที่...</p>
            </div>
          </div>
        )}
      </div>

      {/* Place list below map */}
      <div className="bg-white dark:bg-slate-800 p-3 border-t border-gray-100 dark:border-slate-700 max-h-48 overflow-y-auto">
        {places.slice(0, 10).map((p) => (
          <Link key={p.id} href={`/place/${p.slug}`}
            className="flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl px-2 py-1.5 transition group">
            <MapPin className="w-3.5 h-3.5 text-[#398AB9] flex-shrink-0" />
            <span className="text-xs font-medium text-gray-800 dark:text-slate-200 truncate">{p.name}</span>
            {p.distance !== undefined && (
              <span className="ml-auto text-[10px] text-gray-400 dark:text-slate-500 flex-shrink-0">{fmtDist(p.distance)}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
