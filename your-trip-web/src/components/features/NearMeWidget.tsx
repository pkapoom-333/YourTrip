"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navigation, Loader2, MapPin, Star, RefreshCw } from "lucide-react";
import { getPlacesNearCoords } from "@/server/actions/places";

interface NearbyPlace {
  id: string;
  name: string;
  slug: string;
  category: string;
  province: string | null;
  rating: number;
  reviewCount: number;
  image: string | null;
  distance?: number;
}

interface NearMeWidgetProps {
  /** If true, shows in horizontal scroll card mode. If false, shows full list */
  compact?: boolean;
}

export function NearMeWidget({ compact = true }: NearMeWidgetProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "denied" | "error">("idle");
  const [places, setPlaces] = useState<NearbyPlace[]>([]);

  async function fetchNearby() {
    setState("loading");
    if (!navigator.geolocation) { setState("error"); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data } = await getPlacesNearCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            radiusKm: 50,
            take: compact ? 6 : 20,
          });
          setPlaces(data as unknown as NearbyPlace[]);
          setState("done");
        } catch { setState("error"); }
      },
      (err) => {
        if (err.code === 1) setState("denied");
        else setState("error");
      },
      { timeout: 8000 }
    );
  }

  // Auto-request on mount
  useEffect(() => { fetchNearby(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (state === "idle" || state === "loading") {
    return (
      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 flex items-center gap-3">
          {state === "loading"
            ? <Loader2 className="w-4 h-4 text-[#398AB9] animate-spin flex-shrink-0" />
            : <Navigation className="w-4 h-4 text-[#398AB9] flex-shrink-0" />}
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {state === "loading" ? "กำลังค้นหาสถานที่ใกล้คุณ..." : "ค้นหาสถานที่ใกล้คุณ"}
          </p>
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
          <Navigation className="w-4 h-4 flex-shrink-0" />
          เปิดใช้งาน location เพื่อดูสถานที่ใกล้คุณ
        </div>
      </div>
    );
  }

  if (state === "error" || places.length === 0) return null;

  return (
    <div className="pt-4">
      <div className="px-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#398AB9]" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">ใกล้คุณ</h2>
        </div>
        <button onClick={fetchNearby} className="text-[#398AB9] hover:opacity-70 transition" title="รีเฟรช">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {compact ? (
        /* Horizontal scroll */
        <div className="flex gap-3 overflow-x-auto scrollbar-none px-4 pb-1">
          {places.map((place) => (
            <Link key={place.id} href={`/place/${place.slug}`}
              className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-24 bg-gray-100 dark:bg-slate-700 overflow-hidden">
                {place.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 leading-tight line-clamp-1">{place.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">{place.province ?? place.category}</span>
                  {place.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-medium text-gray-600 dark:text-slate-400">{place.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                {place.distance !== undefined && (
                  <p className="text-[10px] text-[#398AB9] mt-0.5 flex items-center gap-0.5">
                    <Navigation className="w-2.5 h-2.5" />{place.distance.toFixed(1)} กม.
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Full list */
        <div className="px-4 space-y-2">
          {places.map((place) => (
            <Link key={place.id} href={`/place/${place.slug}`}
              className="flex gap-3 p-3 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#398AB9]/30 transition-colors">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-700">
                {place.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover"
                    referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-gray-300 dark:text-slate-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{place.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{place.province ?? place.category}</p>
                <div className="flex items-center gap-3 mt-1">
                  {place.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-medium text-gray-600 dark:text-slate-400">{place.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {place.distance !== undefined && (
                    <span className="text-[11px] text-[#398AB9] flex items-center gap-0.5">
                      <Navigation className="w-2.5 h-2.5" />{place.distance.toFixed(1)} กม.
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
