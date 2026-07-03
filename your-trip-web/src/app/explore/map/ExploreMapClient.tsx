"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, Star, X, LayoutGrid, Filter, ChevronDown } from "lucide-react";
import type { MapPlace } from "@/server/actions/places";

const CAT_TH: Record<string, string> = {
  attraction: "สถานที่เที่ยว", restaurant: "ร้านอาหาร",
  cafe: "คาเฟ่", hotel: "ที่พัก", activity: "กิจกรรม",
};
const CAT_COLOR: Record<string, string> = {
  attraction: "#398AB9", restaurant: "#FF4F4F",
  cafe: "#F59E0B", hotel: "#8B5CF6", activity: "#22C55E",
};

interface Props {
  places: MapPlace[];
}

export default function ExploreMapClient({ places }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<unknown>(null);
  const [selected, setSelected] = useState<MapPlace | null>(null);
  const [catFilter, setCatFilter] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);
  const markersRef = useRef<unknown[]>([]);

  const filteredPlaces = catFilter === "all"
    ? places
    : places.filter((p) => p.category === catFilter);

  const initMap = useCallback(async () => {
    if (!mapRef.current || leafletRef.current) return;
    const L = (await import("leaflet")).default;
    await import("leaflet/dist/leaflet.css");

    const map = L.map(mapRef.current, {
      center: [13.7563, 100.5018], // Bangkok
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    leafletRef.current = map;
    return map;
  }, []);

  const addMarkers = useCallback((map: unknown, pls: MapPlace[]) => {
    const L = (window as unknown as { L: typeof import("leaflet") }).L;
    if (!L) return;

    // Remove old markers
    for (const m of markersRef.current) {
      (m as { remove: () => void }).remove();
    }
    markersRef.current = [];

    for (const place of pls) {
      const color = CAT_COLOR[place.category] ?? "#398AB9";
      const icon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:${color};border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([place.lat, place.lng], { icon })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .addTo(map as any)
        .on("click", () => setSelected(place));

      markersRef.current.push(marker);
    }
  }, []);

  useEffect(() => {
    let map: unknown;
    (async () => {
      const L = (await import("leaflet")).default;
      // Make L available on window for addMarkers callback
      (window as unknown as Record<string, unknown>).L = L;
      map = await initMap();
      if (map) addMarkers(map, filteredPlaces);
    })();

    return () => {
      if (leafletRef.current) {
        (leafletRef.current as { remove: () => void }).remove();
        leafletRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!leafletRef.current) return;
    addMarkers(leafletRef.current, filteredPlaces);
  }, [filteredPlaces, addMarkers]);

  const categories = ["all", ...Array.from(new Set(places.map((p) => p.category)))];

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link
          href="/explore"
          className="p-1.5 rounded-xl hover:bg-gray-100 transition"
        >
          <LayoutGrid className="w-5 h-5 text-gray-600" />
        </Link>

        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#398AB9]" />
          <span className="text-sm font-semibold text-gray-900">แผนที่</span>
          <span className="text-xs text-gray-400">({filteredPlaces.length} สถานที่)</span>
        </div>

        <div className="ml-auto relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 text-gray-600"
          >
            <Filter className="w-3.5 h-3.5" />
            {catFilter === "all" ? "ทุกประเภท" : CAT_TH[catFilter] ?? catFilter}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFilter && (
            <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-40 overflow-hidden">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCatFilter(c); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${catFilter === c ? "text-[#398AB9] font-semibold" : "text-gray-600"}`}
                >
                  {c === "all" ? "ทุกประเภท" : (CAT_TH[c] ?? c)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1 mt-14" />

      {/* Selected place card */}
      {selected && (
        <div className="absolute bottom-6 left-4 right-4 z-30 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>

          <div className="flex gap-3 p-4">
            {selected.coverImage ? (
              <img src={selected.coverImage} alt={selected.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#398AB9]/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-7 h-7 text-[#398AB9]/40" />
              </div>
            )}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ backgroundColor: CAT_COLOR[selected.category] ?? "#398AB9" }}
                >
                  {CAT_TH[selected.category] ?? selected.category}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm truncate">{selected.name}</h3>
              {selected.province && (
                <p className="text-xs text-gray-500 mt-0.5">{selected.province}</p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-gray-700">{selected.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({selected.reviewCount} รีวิว)</span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <Link
              href={`/place/${selected.slug}`}
              className="block w-full text-center bg-[#398AB9] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1C658C] transition-colors"
            >
              ดูรายละเอียด →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
