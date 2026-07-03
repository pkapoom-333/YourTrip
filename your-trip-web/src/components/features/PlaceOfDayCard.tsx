"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, MapPin, Award, ChevronRight } from "lucide-react";
import { getPlaceOfTheDay } from "@/server/actions/placeOfDay";
import type { PlaceListItem } from "@/server/actions/places";

const CATEGORY_LABEL: Record<string, string> = {
  attraction: "สถานที่เที่ยว", restaurant: "ร้านอาหาร",
  cafe: "คาเฟ่", hotel: "ที่พัก", activity: "กิจกรรม",
};

export function PlaceOfDayCard() {
  const [place, setPlace] = useState<PlaceListItem | null>(null);

  useEffect(() => {
    getPlaceOfTheDay().then(({ data }) => setPlace(data)).catch(() => {});
  }, []);

  if (!place) return null;

  const today = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long" });

  return (
    <Link href={`/place/${place.slug}`}
      className="block relative overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-700 group">
      {/* Background image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#398AB9]/20 to-[#1C658C]/20">
        {place.coverImage && (
          <img src={place.coverImage} alt={place.name}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            loading="lazy" referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full">
          <Award className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">สถานที่แห่งวัน</span>
        </div>
        <div className="absolute top-3 right-3 text-[10px] text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {today}
        </div>

        {/* Place info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-lg leading-tight line-clamp-1">{place.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-white text-xs font-semibold">{place.rating > 0 ? place.rating.toFixed(1) : "–"}</span>
            </div>
            <span className="text-white/60 text-xs">·</span>
            <span className="text-white/80 text-xs">{CATEGORY_LABEL[place.category] ?? place.category}</span>
            {place.province && (
              <>
                <span className="text-white/60 text-xs">·</span>
                <span className="text-white/80 text-xs flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />{place.province}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA strip */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800">
        <div className="flex gap-1">
          {"฿".repeat(place.priceRange).split("").map((c, i) => (
            <span key={i} className="text-[#398AB9] font-bold text-sm">{c}</span>
          ))}
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-[#398AB9]">
          ดูรายละเอียด <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
