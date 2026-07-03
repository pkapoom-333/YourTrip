"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Star, Sparkles, MapPin, Heart, MessageSquare, Flame, Clock, Award } from "lucide-react";
import type { PlaceListItem } from "@/server/actions/places";

interface Props {
  trending: PlaceListItem[];
  topRated: PlaceListItem[];
  newPlaces: PlaceListItem[];
}

type Tab = "trending" | "topRated" | "new";

const PRICE_LABEL: Record<number, string> = { 1: "฿", 2: "฿฿", 3: "฿฿฿", 4: "฿฿฿฿" };
const CAT_TH: Record<string, string> = {
  attraction: "สถานที่เที่ยว", restaurant: "ร้านอาหาร",
  cafe: "คาเฟ่", hotel: "ที่พัก", activity: "กิจกรรม",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function PlaceCard({ place, rank }: { place: PlaceListItem; rank?: number }) {
  return (
    <Link
      href={`/place/${place.slug}`}
      className="block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative h-40">
        {place.coverImage ? (
          <img src={place.coverImage} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#398AB9]/20 to-[#1C658C]/20 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-[#398AB9]/40" />
          </div>
        )}
        {/* Rank badge */}
        {rank !== undefined && rank <= 3 && (
          <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
            rank === 1 ? "bg-amber-400 text-white" :
            rank === 2 ? "bg-gray-300 text-gray-800" :
            "bg-amber-700 text-white"
          }`}>
            {rank}
          </div>
        )}
        {/* Category badge */}
        <div className="absolute bottom-2 left-2">
          <span className="text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            {CAT_TH[place.category] ?? place.category}
          </span>
        </div>
        {/* Featured badge */}
        {place.isFeatured && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] bg-[#398AB9] text-white px-2 py-0.5 rounded-full">✨ แนะนำ</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{place.name}</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{place.province ?? place.region}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <StarRating rating={place.rating} />
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300 ml-0.5">{place.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
            <span className="flex items-center gap-0.5">
              <MessageSquare className="w-3 h-3" /> {place.reviewCount}
            </span>
            <span className="text-gray-300">·</span>
            <span>{PRICE_LABEL[place.priceRange] ?? "฿"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PlaceRow({ place, rank }: { place: PlaceListItem; rank: number }) {
  return (
    <Link
      href={`/place/${place.slug}`}
      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-sm transition-shadow"
    >
      {/* Rank */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        rank <= 3
          ? rank === 1 ? "bg-amber-400 text-white" : rank === 2 ? "bg-gray-300 text-gray-700" : "bg-amber-700/80 text-white"
          : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
      }`}>
        {rank}
      </div>

      {/* Image */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-700">
        {place.coverImage && (
          <img src={place.coverImage} alt={place.name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{place.name}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{place.province ?? place.region} · {CAT_TH[place.category] ?? place.category}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{place.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-300">·</span>
          <MessageSquare className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400">{place.reviewCount} รีวิว</span>
        </div>
      </div>
    </Link>
  );
}

const TABS: { key: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "trending", label: "กำลังนิยม", icon: Flame, desc: "บันทึกและรีวิวมากที่สุดในสัปดาห์นี้" },
  { key: "topRated", label: "คะแนนสูงสุด", icon: Award, desc: "สถานที่ที่ได้รับคะแนนดีที่สุด" },
  { key: "new", label: "มาใหม่", icon: Sparkles, desc: "สถานที่ที่เพิ่งเพิ่มเข้ามาล่าสุด" },
];

export default function TrendingClient({ trending, topRated, newPlaces }: Props) {
  const [tab, setTab] = useState<Tab>("trending");

  const currentData = tab === "trending" ? trending : tab === "topRated" ? topRated : newPlaces;
  const currentDesc = TABS.find((t) => t.key === tab)?.desc ?? "";
  const top3 = currentData.slice(0, 3);
  const rest = currentData.slice(3);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#398AB9] to-[#1C658C] rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">กำลังนิยม</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">{currentDesc}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all ${
              tab === key
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-slate-400"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {currentData.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📍</div>
          <p className="text-gray-500 dark:text-slate-400">ยังไม่มีข้อมูลสถานที่</p>
        </div>
      ) : (
        <>
          {/* Top 3 grid */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {top3.map((place, i) => (
                <PlaceCard key={place.id} place={place} rank={i + 1} />
              ))}
            </div>
          )}

          {/* Rest as list */}
          {rest.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-3">อันดับถัดไป</h2>
              {rest.map((place, i) => (
                <PlaceRow key={place.id} place={place} rank={i + 4} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
