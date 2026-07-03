"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, MapPin, Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { getTrendingPlaces } from "@/server/actions/places";
import type { PlaceListItem } from "@/server/actions/places";

// Deterministically pick "place of the week" using ISO week number
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

const CATEGORY_TH: Record<string, string> = {
  attraction: "สถานที่เที่ยว", restaurant: "ร้านอาหาร", cafe: "คาเฟ่",
  hotel: "ที่พัก", activity: "กิจกรรม",
};

export function PlaceOfWeekWidget() {
  const [place, setPlace] = useState<PlaceListItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingPlaces(20).then((res) => {
      if (res.data.length > 0) {
        const week = getISOWeek(new Date());
        setPlace(res.data[week % res.data.length]);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 animate-spin text-[#398AB9]" />
      </div>
    );
  }

  if (!place) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Sparkles className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">สถานที่แห่งสัปดาห์</h3>
      </div>

      {/* Image */}
      <Link href={`/place/${place.slug}`} className="block group">
        <div className="relative mx-4 rounded-xl overflow-hidden aspect-video mb-3">
          {place.coverImage ? (
            <img
              src={place.coverImage}
              alt={place.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.classList.add("bg-gray-100"); (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#398AB9]/20 to-[#1C658C]/20 flex items-center justify-center">
              <span className="text-3xl">🗺️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 right-3">
            <p className="text-white font-bold text-sm truncate">{place.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-white/70" />
              <span className="text-white/70 text-[11px] truncate">{place.province ?? "ไทย"}</span>
              {place.rating > 0 && (
                <>
                  <span className="text-white/40 ml-1">·</span>
                  <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400 ml-1" />
                  <span className="text-white/80 text-[11px]">{place.rating.toFixed(1)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 pb-4">
          <div>
            <span className="text-[11px] bg-[#398AB9]/10 text-[#398AB9] font-medium px-2 py-0.5 rounded-full">
              {CATEGORY_TH[place.category] ?? place.category}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#398AB9] text-xs font-medium group-hover:gap-2 transition-all">
            ดูรายละเอียด
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </div>
  );
}
