"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Star, Filter, ThumbsUp, Camera, ChevronDown } from "lucide-react";
import { getPlaceReviews, type FullReview } from "@/server/actions/places";

type SortOpt = "newest" | "highest" | "lowest" | "helpful";

const SORT_LABELS: Record<SortOpt, string> = {
  helpful: "มีประโยชน์ที่สุด", newest: "ล่าสุด",
  highest: "คะแนนสูงสุด", lowest: "คะแนนต่ำสุด",
};

interface Props {
  place: { id: string; slug: string; name: string; rating: number; reviewCount: number };
  initialReviews: FullReview[];
  initialCursor: string | null;
  totalCount: number;
  ratingBreakdown: Record<number, number>;
}

function StarRow({ n, count, total }: { n: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 dark:text-slate-400 w-4 text-right">{n}</span>
      <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 dark:text-slate-500 w-6 text-right">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: FullReview }) {
  const [expanded, setExpanded] = useState(false);
  const initials = (review.user.name ?? review.user.username ?? "U").charAt(0).toUpperCase();
  const bodyLong = (review.content?.length ?? 0) > 200;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
      {/* User + rating */}
      <div className="flex items-start gap-3 mb-3">
        {review.user.avatarUrl ? (
          <img src={review.user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-9 h-9 bg-[#398AB9] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {review.user.name ?? review.user.username ?? "ผู้ใช้"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-slate-600"}`} />
            ))}

          </div>
        </div>
        <span className="text-[10px] text-gray-400 dark:text-slate-500 flex-shrink-0">
          {new Date(review.createdAt).toLocaleDateString("th-TH")}
        </span>
      </div>

      {/* Title */}
          {/* Body */}
      {review.content && (
        <div>
          <p className={`text-sm text-gray-600 dark:text-slate-300 leading-relaxed ${!expanded && bodyLong ? "line-clamp-3" : ""}`}>
            {review.content}
          </p>
          {bodyLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-[#398AB9] mt-1">
              {expanded ? "ย่อ" : "อ่านต่อ"}
            </button>
          )}
        </div>
      )}

      {/* Images */}
      {(review.images as string[]).length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {(review.images as string[]).map((img, i) => (
            <img key={i} src={img} alt="" className="h-20 w-20 rounded-xl object-cover flex-shrink-0" />
          ))}
        </div>
      )}

      {/* Helpful */}
      {review.likes > 0 && (
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 dark:text-slate-500">
          <ThumbsUp className="w-3 h-3" />
          {review.likes} คนกดถูกใจ
        </div>
      )}
    </div>
  );
}

export default function PlaceReviewsClient({ place, initialReviews, initialCursor, totalCount, ratingBreakdown }: Props) {
  const [reviews, setReviews] = useState<FullReview[]>(initialReviews);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [sort, setSort] = useState<SortOpt>("helpful");
  const [isPending, startTransition] = useTransition();
  const [showSortMenu, setShowSortMenu] = useState(false);

  const avgRating = totalCount > 0
    ? Object.entries(ratingBreakdown).reduce((s, [r, c]) => s + parseInt(r) * c, 0) / totalCount
    : 0;

  function handleSortChange(newSort: SortOpt) {
    setShowSortMenu(false);
    if (newSort === sort) return;
    setSort(newSort);
    startTransition(async () => {
      const { data, nextCursor } = await getPlaceReviews(place.slug, { sort: newSort, take: 20 });
      setReviews(data);
      setCursor(nextCursor);
    });
  }

  function loadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const { data, nextCursor } = await getPlaceReviews(place.slug, { sort, cursor, take: 20 });
      setReviews((prev) => [...prev, ...data]);
      setCursor(nextCursor);
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/place/${place.slug}`} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">รีวิว {place.name}</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">{totalCount} รีวิวทั้งหมด</p>
        </div>
      </div>

      {/* Rating summary */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 mb-5">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-black text-gray-900 dark:text-white">{avgRating.toFixed(1)}</div>
            <div className="flex justify-center gap-0.5 mt-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-slate-600"}`} />
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{totalCount} รีวิว</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5,4,3,2,1].map((n) => (
              <StarRow key={n} n={n} count={ratingBreakdown[n] ?? 0} total={totalCount} />
            ))}
          </div>
        </div>
      </div>

      {/* Sort + Filter bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          แสดง {reviews.length} จาก {totalCount} รีวิว
        </p>
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1.5 text-xs border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300"
          >
            <Filter className="w-3.5 h-3.5" />
            {SORT_LABELS[sort]}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg z-20 min-w-36 overflow-hidden">
              {(Object.keys(SORT_LABELS) as SortOpt[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSortChange(s)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-700 ${sort === s ? "text-[#398AB9] font-semibold" : "text-gray-600 dark:text-slate-300"}`}
                >
                  {SORT_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <Camera className="w-12 h-12 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400 dark:text-slate-500">ยังไม่มีรีวิว — เป็นคนแรกที่รีวิวสถานที่นี้</p>
          <Link href={`/place/${place.slug}`} className="inline-block mt-4 text-sm text-[#398AB9] font-medium">
            เขียนรีวิว →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}

          {cursor && (
            <button
              onClick={loadMore}
              disabled={isPending}
              className="w-full py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
