"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { Plus, MapPin, Lock, Globe, Trash2, BookMarked } from "lucide-react";
import { getUserCollections, createCollection, deleteCollection, type CollectionListItem } from "@/server/actions/collections";
import { useToast } from "@/components/shared/Toast";

const EMOJIS = ["📍", "🏔️", "🍜", "☕", "🏖️", "🌿", "🏛️", "🎭", "🚣", "🛍️", "🌸", "🌄"];

function CollectionCard({ col, onDelete }: { col: CollectionListItem; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`ลบ "${col.title}"?`)) return;
    setDeleting(true);
    await deleteCollection(col.id);
    onDelete(col.id);
  }

  return (
    <Link href={`/collections/${col.id}`} className="group block bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover mosaic */}
      <div className="relative h-32 bg-gradient-to-br from-[#398AB9]/20 to-[#1C658C]/20 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
        {col.coverImages.length > 0 ? (
          <div className={`absolute inset-0 grid ${col.coverImages.length >= 4 ? "grid-cols-2 grid-rows-2" : col.coverImages.length === 2 ? "grid-cols-2" : ""} gap-0.5`}>
            {col.coverImages.slice(0, 4).map((img, i) => (
              <img key={i} src={img} alt="" className="w-full h-full object-cover"
                referrerPolicy="no-referrer" loading="lazy" />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-60">
            {col.emoji ?? "📍"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-base">{col.emoji ?? "📍"}</span>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{col.title}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-slate-500">
              <div className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                <span>{col.placeCount} สถานที่</span>
              </div>
              {col.isPublic
                ? <Globe className="w-3 h-3" />
                : <Lock className="w-3 h-3" />}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function NewCollectionModal({ onClose, onCreate }: { onClose: () => void; onCreate: (col: CollectionListItem) => void }) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📍");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const { error: showError } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const result = await createCollection({ title, emoji, isPublic });
    setLoading(false);
    if (result.error) { showError(result.error); return; }
    const newCol: CollectionListItem = {
      id: result.data!.id, title, description: null, emoji, isPublic,
      placeCount: 0, coverImages: [], createdAt: new Date(),
      user: { id: "", name: null, avatarUrl: null },
    };
    onCreate(newCol);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
        <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-4">สร้างคอลเลกชันใหม่</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Emoji picker */}
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1.5 font-medium">ไอคอน</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  className={`w-9 h-9 text-xl rounded-xl flex items-center justify-center transition ${emoji === e ? "bg-[#398AB9]/20 ring-2 ring-[#398AB9]" : "bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">ชื่อคอลเลกชัน *</label>
              <span className={`text-xs tabular-nums ${title.length > 50 ? "text-[#FF4F4F] font-medium" : "text-gray-300 dark:text-slate-600"}`}>
                {title.length} / 60
              </span>
            </div>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น เที่ยวเชียงใหม่ Weekend"
              maxLength={60}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#398AB9]/40"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-slate-300">สาธารณะ</span>
            <button type="button" onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${isPublic ? "bg-[#398AB9]" : "bg-gray-200 dark:bg-slate-600"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isPublic ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-600 rounded-xl hover:border-gray-300 transition">
              ยกเลิก
            </button>
            <button type="submit" disabled={!title.trim() || loading}
              className="flex-1 py-2.5 text-sm font-semibold bg-[#398AB9] text-white rounded-xl hover:bg-[#1C658C] disabled:opacity-50 transition">
              {loading ? "กำลังสร้าง…" : "สร้าง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    getUserCollections().then((r) => { setCollections(r.data); setLoading(false); });
  }, []);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">คอลเลกชันของฉัน</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">รวมสถานที่ที่คุณชอบ</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 bg-[#398AB9] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1C658C] transition"
          >
            <Plus className="w-4 h-4" />
            สร้างใหม่
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-slate-700 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && collections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 dark:text-slate-500">
            <BookMarked className="w-12 h-12 opacity-30" />
            <p className="text-sm font-medium">ยังไม่มีคอลเลกชัน</p>
            <p className="text-xs text-center">สร้างรายการสถานที่ที่คุณชื่นชอบ</p>
            <button onClick={() => setShowNew(true)}
              className="mt-2 bg-[#398AB9] text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-[#1C658C] transition">
              สร้างคอลเลกชันแรก
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && collections.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {collections.map((col) => (
              <CollectionCard key={col.id} col={col}
                onDelete={(id) => setCollections((prev) => prev.filter((c) => c.id !== id))} />
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <NewCollectionModal
          onClose={() => setShowNew(false)}
          onCreate={(col) => setCollections((prev) => [col, ...prev])}
        />
      )}
    </AppShell>
  );
}
