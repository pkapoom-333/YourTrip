"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MapPin, Bookmark, BookmarkCheck, TrendingUp } from "lucide-react";
import { toggleSavePlace } from "@/server/actions/savedPlaces";
import type { PlaceListItem } from "@/server/actions/places";

const CATEGORY_LABELS: Record<string, string> = {
  attraction: "สถานที่เที่ยว",
  restaurant: "ร้านอาหาร",
  cafe: "คาเฟ่",
  hotel: "ที่พัก",
  activity: "กิจกรรม",
};

const CATEGORY_EMOJI: Record<string, string> = {
  attraction: "🏔️",
  restaurant: "🍜",
  cafe: "☕",
  hotel: "🏨",
  activity: "🤿",
};

const priceSymbol = (n: number) => "฿".repeat(n);

const RANK_BADGES = ["🥇", "🥈", "🥉"];

function rankBadge(index: number) {
  if (index < 3) return RANK_BADGES[index];
  return `#${index + 1}`;
}

interface Props {
  initialPlaces: PlaceListItem[];
}

export default function TrendingPlacesClient({ initialPlaces }: Props) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [busySave, setBusySave] = useState<Set<string>>(new Set());

  async function handleSave(id: string) {
    if (busySave.has(id)) return;
    setBusySave((s) => new Set(s).add(id));
    const next = new Set(saved);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSaved(next);
    try {
      await toggleSavePlace(id);
    } catch {
      // rollback
      setSaved(saved);
    } finally {
      setBusySave((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }

  if (initialPlaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 dark:text-slate-500">
        <TrendingUp className="w-12 h-12 opacity-30" />
        <p className="text-sm font-medium">ยังไม่มีข้อมูลอันดับ</p>
        <p className="text-xs text-center">เพิ่มรีวิวและบันทึกสถานที่เพื่อสร้างอันดับ</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {initialPlaces.map((place, idx) => {
        const img = place.coverImage ??
          "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=600&q=80";
        const isSaved = saved.has(place.id);

        return (
          <div
            key={place.id}
            className="flex gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-12 flex-shrink-0 bg-gray-50 dark:bg-slate-900/40">
              <span className={`text-lg font-bold ${idx < 3 ? "text-xl" : "text-gray-400 dark:text-slate-500"}`}>
                {rankBadge(idx)}
              </span>
            </div>

            {/* Image */}
            <Link href={`/place/${place.slug}`} className="block w-24 h-24 flex-shrink-0 self-center">
              <img
                src={img}
                alt={place.name}
                className="w-24 h-24 object-cover rounded-xl"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </Link>

            {/* Info */}
            <Link href={`/place/${place.slug}`} className="flex-1 min-w-0 py-3 pr-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs">{CATEGORY_EMOJI[place.category] ?? "📍"}</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">
                  {CATEGORY_LABELS[place.category] ?? place.category}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-snug line-clamp-2">
                {place.name}
              </p>
              {place.province && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                  <span className="text-[11px] text-gray-400 dark:text-slate-500">{place.province}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                {place.rating > 0 && (
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                      {place.rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">
                      ({place.reviewCount})
                    </span>
                  </div>
                )}
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {priceSymbol(place.priceRange)}
                </span>
              </div>
            </Link>

            {/* Save button */}
            <div className="flex items-center pr-3">
              <button
                onClick={() => handleSave(place.id)}
                disabled={busySave.has(place.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition disabled:opacity-50"
                aria-label={isSaved ? "ยกเลิกบันทึก" : "บันทึกสถานที่"}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-[#398AB9]" />
                ) : (
                  <Bookmark className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
