"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin, Navigation, Loader2, SlidersHorizontal, List, Map, Star, RefreshCw, AlertCircle } from "lucide-react";
import { getPlacesNearCoords } from "@/server/actions/places";
import NearMeMapView from "@/components/features/NearMeMapView";


type ViewMode = "list" | "map";
type CategoryFilter = "all" | "attraction" | "restaurant" | "cafe";

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "ทั้งหมด",
  attraction: "สถานที่เที่ยว",
  restaurant: "ร้านอาหาร",
  cafe: "คาเฟ่",
};

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

function fmtDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} ม.`;
  return `${km.toFixed(1)} กม.`;
}

interface NearbyPlace {
  id: string;
  slug: string;
  name: string;
  category: string;
  province: string | null;
  coverImage: string | null;
  rating: number;
  priceRange: number | null;
  distance?: number;
  lat?: number | null;
  lng?: number | null;
}

export default function NearMeClient() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("list");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [radius, setRadius] = useState(5);
  const [showFilters, setShowFilters] = useState(false);

  // Get user location
  const getLocation = useCallback(() => {
    setGeoLoading(true);
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("เบราว์เซอร์ของคุณไม่รองรับ GPS");
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      () => {
        setGeoError("ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึง GPS");
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => { getLocation(); }, [getLocation]);

  // Fetch nearby places when coords/radius change
  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    setError(null);
    getPlacesNearCoords({ lat: coords.lat, lng: coords.lng, radiusKm: radius, take: 30 })
      .then((res) => {
        setPlaces((res.data ?? []) as NearbyPlace[]);
      })
      .catch(() => setError("เกิดข้อผิดพลาด"))
      .finally(() => setLoading(false));
  }, [coords, radius]);

  const filtered = category === "all"
    ? places
    : places.filter((p) => p.category === category);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#398AB9]" />
            ใกล้ฉัน
          </h1>
          {coords && (
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              รัศมี {radius} กม. · {filtered.length} สถานที่
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-lg transition ${view === "list" ? "bg-white dark:bg-slate-600 shadow-sm text-[#398AB9]" : "text-gray-400 dark:text-slate-400"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("map")}
              className={`p-1.5 rounded-lg transition ${view === "map" ? "bg-white dark:bg-slate-600 shadow-sm text-[#398AB9]" : "text-gray-400 dark:text-slate-400"}`}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition ${showFilters ? "bg-[#398AB9] border-[#398AB9] text-white" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">ประเภทสถานที่</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  category === c
                    ? "bg-[#398AB9] text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">รัศมี</p>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  radius === r
                    ? "bg-[#398AB9] text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {r} กม.
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Geo error state */}
      {geoLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#398AB9]" />
          <p className="text-sm">กำลังระบุตำแหน่ง...</p>
        </div>
      )}

      {geoError && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-3" />
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">{geoError}</p>
          <button
            onClick={getLocation}
            className="flex items-center gap-2 mx-auto bg-[#398AB9] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1C658C] transition"
          >
            <RefreshCw className="w-4 h-4" />
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {/* Content */}
      {coords && !geoLoading && (
        <>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#398AB9]" />
              <span className="ml-2 text-sm text-gray-500 dark:text-slate-400">กำลังค้นหาสถานที่...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500 text-sm">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-slate-500">
              <MapPin className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-base font-medium">ไม่พบสถานที่ในรัศมีนี้</p>
              <p className="text-sm mt-1">ลองเพิ่มรัศมีการค้นหา</p>
              <button
                onClick={() => setRadius(Math.min(radius + 5, 20))}
                className="mt-4 bg-[#398AB9] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1C658C] transition"
              >
                เพิ่มรัศมีเป็น {Math.min(radius + 5, 20)} กม.
              </button>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && view === "list" && (
            <div className="space-y-3">
              {filtered.map((place) => (
                <Link
                  key={place.id}
                  href={`/place/${place.slug}`}
                  className="flex gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md transition group"
                >
                  {/* Image */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700">
                    {place.coverImage ? (
                      <img
                        src={place.coverImage}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🗺️</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate group-hover:text-[#398AB9] transition">
                        {place.name}
                      </h3>
                      {place.distance !== undefined && (
                        <span className="flex-shrink-0 flex items-center gap-1 text-[11px] text-[#398AB9] font-semibold bg-[#398AB9]/10 px-2 py-0.5 rounded-full">
                          <Navigation className="w-2.5 h-2.5" />
                          {fmtDist(place.distance)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[11px] text-gray-400 dark:text-slate-500 capitalize">
                        {place.category === "attraction" ? "สถานที่เที่ยว" : place.category === "cafe" ? "คาเฟ่" : place.category === "restaurant" ? "ร้านอาหาร" : place.category}
                      </span>
                      {place.province && (
                        <>
                          <span className="text-gray-300 dark:text-slate-600">·</span>
                          <span className="text-[11px] text-gray-400 dark:text-slate-500">{place.province}</span>
                        </>
                      )}
                    </div>

                    {place.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{place.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {place.priceRange && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {"฿".repeat(place.priceRange)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Map view — Leaflet with real markers */}
          {!loading && !error && filtered.length > 0 && view === "map" && coords && (
            <NearMeMapView
              places={filtered}
              userLat={coords.lat}
              userLng={coords.lng}
              radius={radius}
            />
          )}
        </>
      )}
    </div>
  );
}
