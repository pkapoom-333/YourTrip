"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { ArrowLeft, Star, MapPin, Trash2, Globe, Lock, BookMarked } from "lucide-react";
import { getCollectionById, removeFromCollection, type CollectionDetail } from "@/server/actions/collections";
import { useToast } from "@/components/shared/Toast";
import { Avatar } from "@/components/shared/Avatar";

const CATEGORY_EMOJI: Record<string, string> = {
  attraction: "🏔️", restaurant: "🍜", cafe: "☕", hotel: "🏨", activity: "🤿",
};

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success: showSuccess } = useToast();
  const [col, setCol] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    getCollectionById(id).then((r) => { setCol(r.data); setLoading(false); });
  }, [id]);

  async function handleRemove(placeId: string) {
    if (removing) return;
    setRemoving(placeId);
    await removeFromCollection(id, placeId);
    setCol((prev) => prev ? { ...prev, places: prev.places.filter((p) => p.placeId !== placeId), placeCount: prev.placeCount - 1 } : prev);
    showSuccess("ลบสถานที่ออกจากคอลเลกชันแล้ว");
    setRemoving(null);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-4 py-6 animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded-xl w-48" />
          <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-slate-700 flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </AppShell>
    );
  }

  if (!col) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-slate-400">ไม่พบคอลเลกชันนี้</p>
          <button onClick={() => router.back()} className="mt-4 text-sm text-[#398AB9]">← กลับ</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 mb-4 transition">
          <ArrowLeft className="w-4 h-4" />
          คอลเลกชัน
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{col.emoji ?? "📍"}</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">{col.title}</h1>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <Avatar src={col.user.avatarUrl} name={col.user.name ?? "U"} className="w-5 h-5" />
              <span className="text-xs text-gray-500 dark:text-slate-400">{col.user.name ?? "ผู้ใช้"}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>{col.placeCount} สถานที่</span>
            </div>
            {col.isPublic
              ? <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500"><Globe className="w-3 h-3" /><span>สาธารณะ</span></div>
              : <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500"><Lock className="w-3 h-3" /><span>ส่วนตัว</span></div>}
          </div>
          {col.description && (
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">{col.description}</p>
          )}
        </div>

        {/* Place list */}
        {col.places.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 dark:text-slate-500">
            <MapPin className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">ยังไม่มีสถานที่ในคอลเลกชันนี้</p>
            <Link href="/explore" className="mt-1 text-sm text-[#398AB9] font-medium hover:underline">
              สำรวจสถานที่
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {col.places.map((item) => (
              <div key={item.id} className="flex gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <Link href={`/place/${item.place.slug}`} className="block w-20 h-20 flex-shrink-0">
                  {item.place.coverImage ? (
                    <img src={item.place.coverImage} alt={item.place.name}
                      className="w-20 h-20 object-cover"
                      referrerPolicy="no-referrer" loading="lazy" />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-2xl">
                      {CATEGORY_EMOJI[item.place.category] ?? "📍"}
                    </div>
                  )}
                </Link>
                <Link href={`/place/${item.place.slug}`} className="flex-1 min-w-0 py-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-snug line-clamp-2">{item.place.name}</p>
                  {item.place.province && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                      <span className="text-[11px] text-gray-400 dark:text-slate-500">{item.place.province}</span>
                    </div>
                  )}
                  {item.place.rating > 0 && (
                    <div className="flex items-center gap-0.5 mt-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-gray-700 dark:text-slate-300">{item.place.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {item.note && <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 italic truncate">"{item.note}"</p>}
                </Link>
                <div className="flex items-center pr-3">
                  <button
                    onClick={() => handleRemove(item.placeId)}
                    disabled={removing === item.placeId}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 dark:text-slate-600 hover:text-red-400 transition disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
