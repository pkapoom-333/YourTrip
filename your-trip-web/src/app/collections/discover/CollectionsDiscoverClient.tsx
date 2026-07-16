"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, ChevronLeft, Loader2, Users } from "lucide-react";
import { getPublicCollections, type CollectionListItem } from "@/server/actions/collections";
import { Avatar } from "@/components/shared/Avatar";

interface Props {
  initial: CollectionListItem[];
  initialCursor: string | null;
}

function CollectionCard({ c }: { c: CollectionListItem }) {
  const covers = c.coverImages.slice(0, 4);

  return (
    <Link href={`/collections/${c.id}`}
      className="block bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover mosaic */}
      <div className="relative h-36 bg-gray-100 dark:bg-slate-700 flex overflow-hidden">
        {covers.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-4xl">
            {c.emoji ?? "📚"}
          </div>
        ) : covers.length === 1 ? (
          <Image src={covers[0]} alt={c.title} fill className="object-cover" />
        ) : (
          <div className={`grid h-full w-full ${covers.length >= 4 ? "grid-cols-2 grid-rows-2" : "grid-cols-2 grid-rows-1"} gap-0.5`}>
            {covers.slice(0, covers.length >= 4 ? 4 : 2).map((img, i) => (
              <div key={i} className="relative overflow-hidden">
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
        {/* Emoji badge */}
        {c.emoji && (
          <div className="absolute top-2 left-2 w-8 h-8 bg-white/90 dark:bg-slate-800/90 rounded-xl flex items-center justify-center text-lg shadow-sm">
            {c.emoji}
          </div>
        )}
        {/* Place count badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white rounded-full px-2 py-0.5 text-xs font-medium">
          <Bookmark className="w-3 h-3" />
          {c.placeCount} สถานที่
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 line-clamp-1">{c.title}</p>
        {c.description && (
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-2">{c.description}</p>
        )}
        {/* Creator */}
        <Link href={`/profile/${c.user.id}`}
          className="flex items-center gap-1.5 mt-2 hover:opacity-80 transition"
          onClick={(e) => e.stopPropagation()}>
          <Avatar src={c.user.avatarUrl} name={c.user.name ?? "U"} className="w-5 h-5 text-xs" />
          <span className="text-xs text-gray-500 dark:text-slate-400 truncate">{c.user.name ?? "ผู้ใช้"}</span>
        </Link>
      </div>
    </Link>
  );
}

export default function CollectionsDiscoverClient({ initial, initialCursor }: Props) {
  const [collections, setCollections] = useState<CollectionListItem[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    const { data, nextCursor } = await getPublicCollections(20, cursor);
    setCollections((prev) => [...prev, ...data]);
    setCursor(nextCursor);
    setLoading(false);
  }, [cursor, loading]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/collections"
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100">คอลเลกชันสาธารณะ</h1>
          <p className="text-xs text-gray-400 dark:text-slate-500">รวบรวมสถานที่น่าสนใจจากชุมชน</p>
        </div>
      </div>

      {/* Grid */}
      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-12 h-12 text-gray-200 dark:text-slate-700 mb-4" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่มีคอลเลกชันสาธารณะ</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">สร้างและเปิดเผยคอลเลกชันของคุณให้ชุมชนเห็น</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {collections.map((c) => (
              <CollectionCard key={c.id} c={c} />
            ))}
          </div>

          {cursor && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#398AB9] text-white text-sm font-semibold hover:bg-[#1C658C] disabled:opacity-60 transition">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลด...</>
                  : "โหลดเพิ่มเติม"}
              </button>
            </div>
          )}

          {!cursor && collections.length > 0 && (
            <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">
              แสดงทั้งหมด {collections.length} คอลเลกชัน
            </p>
          )}
        </>
      )}
    </div>
  );
}
