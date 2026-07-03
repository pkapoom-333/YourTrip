"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, RefreshCw, MapPin, Star } from "lucide-react";
import { getTrendingPlaces } from "@/server/actions/places";
import type { PlaceListItem } from "@/server/actions/places";

const INSPIRATIONS = [
  "อยากไปไหนวันนี้? 🗺️",
  "วันหยุดนี้ลองที่ใหม่ไหม? ✨",
  "ไม่ไปก็เสียดาย! 🌟",
  "เปิดโลก เปิดใจ 🌍",
  "ประสบการณ์ดีๆ รอคุณอยู่ 🎒",
  "ค้นพบสถานที่น่าอัศจรรย์ 🔭",
];

const CATEGORY_TH: Record<string, string> = {
  attraction: "สถานที่เที่ยว",
  restaurant: "ร้านอาหาร",
  cafe: "คาเฟ่",
  hotel: "ที่พัก",
  activity: "กิจกรรม",
};

export function DailyInspirationWidget() {
  const [place, setPlace] = useState<PlaceListItem | null>(null);
  const [allPlaces, setAllPlaces] = useState<PlaceListItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tagline, setTagline] = useState(INSPIRATIONS[0]);

  useEffect(() => {
    getTrendingPlaces(30).then((res) => {
      if (res.data.length > 0) {
        setAllPlaces(res.data);
        const seed = new Date().getDate() % res.data.length;
        setPlace(res.data[seed]);
        setIdx(seed);
        setTagline(INSPIRATIONS[new Date().getDay() % INSPIRATIONS.length]);
      }
      setLoading(false);
    });
  }, []);

  function shuffle() {
    if (allPlaces.length === 0) return;
    const next = (idx + 1 + Math.floor(Math.random() * (allPlaces.length - 1))) % allPlaces.length;
    setIdx(next);
    setPlace(allPlaces[next]);
    setTagline(INSPIRATIONS[Math.floor(Math.random() * INSPIRATIONS.length)]);
  }

  if (loading || !place) return null;

  return (
    <div className="bg-gradient-to-br from-[#398AB9]/8 to-[#1C658C]/8 dark:from-[#398AB9]/15 dark:to-[#1C658C]/15 rounded-2xl border border-[#398AB9]/20 dark:border-[#398AB9]/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#398AB9]" />
          <span className="text-[11px] font-semibold text-[#398AB9] uppercase tracking-wider">แรงบันดาลใจวันนี้</span>
        </div>
        <button
          onClick={shuffle}
          className="w-7 h-7 rounded-lg bg-white/60 dark:bg-slate-700/60 flex items-center justify-center hover:bg-white dark:hover:bg-slate-600 transition text-gray-500 dark:text-slate-400 hover:text-[#398AB9]"
          title="สุ่มสถานที่ใหม่"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="px-4 text-xs text-gray-500 dark:text-slate-400 mb-3">{tagline}</p>

      {/* Place card */}
      <Link href={`/place/${place.slug}`} className="block group mx-4 mb-4">
        <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-slate-700">
          {place.coverImage ? (
            <img
              src={place.coverImage}
              alt={place.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#398AB9]/20 to-[#1C658C]/20 flex items-center justify-center">
              <span className="text-4xl">🗺️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Overlay info */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-sm truncate drop-shadow">{place.name}</p>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-white/70" />
                <span className="text-white/70 text-[10px]">{place.province ?? "ประเทศไทย"}</span>
              </div>
              <div className="flex items-center gap-1">
                {place.rating > 0 && (
                  <>
                    <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white/80 text-[10px]">{place.rating.toFixed(1)}</span>
                  </>
                )}
                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full ml-1">
                  {CATEGORY_TH[place.category] ?? place.category}
                </span>
              </div>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#398AB9]/0 group-hover:bg-[#398AB9]/10 transition-colors duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-full">
              ดูรายละเอียด →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
