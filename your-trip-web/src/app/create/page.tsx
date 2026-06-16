"use client";

import { useState, useRef } from "react";
import AppShell from "@/components/AppShell";
import { useRouter, useSearchParams } from "next/navigation";
import { createPost } from "@/server/actions/posts";
import { ImageUpload, type UploadedImage } from "@/components/ImageUpload";
import { useUser } from "@/hooks/useUser";
import { Avatar } from "@/components/shared/Avatar";
import { searchPlacesForTrip, type PlacePickerItem } from "@/server/actions/places";
import {
  MapPin, Tag, X, ChevronLeft, Smile, AlertCircle, Loader2, Eye, EyeOff,
  Heart, MessageCircle, Bookmark, Share2, Sparkles,
} from "lucide-react";
import { generateCaption } from "@/server/actions/ai-caption";

const MAX_CHARS = 500;
const MAX_IMAGES = 4;

const suggestedTags = [
  "เที่ยวเหนือ", "ทะเล", "ธรรมชาติ", "คาเฟ่", "ร้านอาหาร",
  "Hiking", "ต่างประเทศ", "วีคเอนด์", "โรแมนติก", "ครอบครัว",
];

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [location, setLocation] = useState("");
  const [placeId, setPlaceId] = useState<string | undefined>(searchParams.get("placeId") ?? undefined);
  const [placeSearchQ, setPlaceSearchQ] = useState("");
  const [placeResults, setPlaceResults] = useState<PlacePickerItem[]>([]);
  const [placeSearching, setPlaceSearching] = useState(false);
  const placeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preTag = searchParams.get("tag");
  const [tags, setTags] = useState<string[]>(preTag ? [preTag] : []);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const remaining = MAX_CHARS - content.length;
  const canPost = content.trim().length > 0 && !isSubmitting;

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "You";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials = displayName.charAt(0).toUpperCase();

  function searchPlace(q: string) {
    setPlaceSearchQ(q);
    if (placeTimerRef.current) clearTimeout(placeTimerRef.current);
    if (!q.trim()) { setPlaceResults([]); return; }
    placeTimerRef.current = setTimeout(async () => {
      setPlaceSearching(true);
      const { data } = await searchPlacesForTrip(q, 5);
      setPlaceResults(data);
      setPlaceSearching(false);
    }, 300);
  }

  function selectPlace(p: PlacePickerItem) {
    setLocation(p.name);
    setPlaceId(p.id);
    setPlaceSearchQ("");
    setPlaceResults([]);
  }

  function clearPlace() {
    setLocation("");
    setPlaceId(undefined);
    setPlaceSearchQ("");
    setPlaceResults([]);
  }

  function addTag(tag: string) {
    const cleaned = tag.replace(/^#/, "").trim();
    if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handlePost() {
    if (!canPost) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await createPost({
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
        location: location.trim() || undefined,
        placeId: placeId || undefined,
        images: images.map((img) => img.url),
      });
      if (result?.error) {
        setError(result.error.message);
        return;
      }
      router.push("/feed");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition">
            <ChevronLeft className="w-4 h-4" />
            ยกเลิก
          </button>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-slate-100">โพสต์ใหม่</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview((v) => !v)}
              title={showPreview ? "กลับแก้ไข" : "ดูตัวอย่าง"}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                showPreview
                  ? "border-[#398AB9] bg-[#398AB9]/10 text-[#398AB9]"
                  : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-[#398AB9] hover:text-[#398AB9]"
              }`}>
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreview ? "แก้ไข" : "Preview"}
            </button>
            <button
              onClick={handlePost}
              disabled={!canPost}
              className="text-sm font-bold text-white bg-[#398AB9] px-4 py-1.5 rounded-full disabled:opacity-40 hover:bg-[#1C658C] transition">
              {isSubmitting ? "กำลังโพสต์..." : "โพสต์"}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Preview panel ── */}
        {showPreview && (
          <div className="px-4 py-4">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">
              ตัวอย่างโพสต์ในฟีด
            </p>
            <article className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
              {/* Post header */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <Avatar src={avatarUrl} name={displayName} className="w-9 h-9" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-none">{displayName}</p>
                  {location && (
                    <div className="flex items-center gap-1 text-[11px] text-[#398AB9] mt-0.5">
                      <MapPin className="w-3 h-3" />{location}
                    </div>
                  )}
                  {!location && <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">เมื่อกี้นี้</p>}
                </div>
              </div>

              {/* Images */}
              {images.length > 0 && (
                <div className={`grid gap-0.5 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
                  {images.slice(0, 4).map((img, i) => (
                    <div key={i} className={`relative overflow-hidden bg-gray-100 dark:bg-slate-700 ${
                      images.length === 1 ? "aspect-video" :
                      images.length === 3 && i === 0 ? "row-span-2 aspect-square" : "aspect-square"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {i === 3 && images.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">+{images.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Content */}
              {content.trim() && (
                <p className="px-4 pt-3 pb-1 text-sm text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {content.split(/(@\w+|#\w+)/).map((part, i) =>
                    part.startsWith("@") || part.startsWith("#")
                      ? <span key={i} className="text-[#398AB9] font-medium">{part}</span>
                      : part
                  )}
                </p>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="px-4 pt-1 pb-2 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="text-[11px] text-[#398AB9] bg-[#398AB9]/8 px-2 py-0.5 rounded-full">#{t}</span>
                  ))}
                </div>
              )}

              {/* Action bar */}
              <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-50 dark:border-slate-700 mt-1">
                <button className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
                  <Heart className="w-4 h-4" /><span>0</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
                  <MessageCircle className="w-4 h-4" /><span>0</span>
                </button>
                <button className="ml-auto text-gray-400 dark:text-slate-500">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="text-gray-400 dark:text-slate-500">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </article>

            {!content.trim() && images.length === 0 && (
              <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-4">เขียนอะไรสักอย่างหรืออัปโหลดรูปก่อนดูตัวอย่าง</p>
            )}
          </div>
        )}

        <div className={`px-4 py-4 space-y-4 ${showPreview ? "hidden" : ""}`}>
          {/* Author row */}
          <div className="flex items-start gap-3">
            <Avatar src={avatarUrl} name={displayName} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-0.5">{displayName}</p>
              {location && (
                <div className="flex items-center gap-1 text-[11px] text-[#398AB9]">
                  <MapPin className="w-3 h-3" />
                  {location}
                </div>
              )}
            </div>
          </div>

          {/* Text area */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
              placeholder="แชร์ประสบการณ์การท่องเที่ยวของคุณ..."
              rows={5}
              className="w-full text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 resize-none outline-none leading-relaxed bg-transparent"
              autoFocus
            />
            <div className={`text-right text-xs mt-1 tabular-nums ${remaining < 50 ? "text-[#FF4F4F] font-medium" : "text-gray-300 dark:text-slate-600"}`}>
              {content.length} / {MAX_CHARS}
            </div>
          </div>

          {/* Image upload */}
          <ImageUpload
            value={images}
            onChange={setImages}
            maxImages={MAX_IMAGES}
            folder="your-trip/posts"
          />

          {/* Place tag */}
          <div className="relative">
            {placeId ? (
              /* Selected place badge */
              <div className="flex items-center gap-2 bg-[#398AB9]/8 border border-[#398AB9]/20 rounded-xl px-3 py-2.5">
                <MapPin className="w-4 h-4 text-[#398AB9] flex-shrink-0" />
                <span className="flex-1 text-sm text-[#398AB9] font-medium">{location}</span>
                <button onClick={clearPlace}>
                  <X className="w-3.5 h-3.5 text-[#398AB9]/60 hover:text-[#398AB9]" />
                </button>
              </div>
            ) : (
              /* Search input */
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                <MapPin className="w-4 h-4 text-[#398AB9] flex-shrink-0" />
                <input
                  value={placeSearchQ}
                  onChange={(e) => searchPlace(e.target.value)}
                  placeholder="แท็กสถานที่ (ค้นหาจาก YourTrip...)"
                  className="flex-1 text-sm text-gray-700 dark:text-slate-300 placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-transparent outline-none"
                />
                {placeSearching
                  ? <Loader2 className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 animate-spin" />
                  : placeSearchQ && <button onClick={clearPlace}><X className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" /></button>
                }
              </div>
            )}

            {/* Dropdown results */}
            {placeResults.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                {placeResults.map((p) => (
                  <button key={p.id} type="button" onClick={() => selectPlace(p)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#398AB9]/5 dark:hover:bg-[#398AB9]/10 text-left transition">
                    <MapPin className="w-4 h-4 text-[#398AB9] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-slate-500">{p.province ?? p.nameEn}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-[#398AB9]" />
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="เพิ่ม #แท็ก แล้วกด Enter"
                className="flex-1 text-sm text-gray-700 dark:text-slate-300 placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none bg-transparent"
              />
            </div>

            {/* Selected tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <button key={t} onClick={() => removeTag(t)}
                    className="flex items-center gap-1 text-xs bg-[#398AB9]/10 text-[#398AB9] px-2.5 py-1 rounded-full font-medium hover:bg-[#398AB9]/20 transition">
                    #{t}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Suggested tags */}
            <div className="flex flex-wrap gap-1.5">
              {suggestedTags.filter((t) => !tags.includes(t)).slice(0, 6).map((t) => (
                <button key={t} onClick={() => addTag(t)}
                  className="text-[11px] bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-2.5 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom toolbar — hidden in preview mode */}
        <div className={`sticky bottom-20 md:bottom-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 px-4 py-3 ${showPreview ? "hidden" : ""}`}>
          <div className="flex items-center gap-4">
            <button className="text-sm text-gray-500 dark:text-slate-400 hover:text-[#398AB9] transition">
              <Smile className="w-5 h-5" />
            </button>
            {/* AI caption button */}
            <button
              type="button"
              disabled={aiLoading}
              onClick={async () => {
                setAiLoading(true);
                const result = await generateCaption({
                  location: location || undefined,
                  tags: tags.length > 0 ? tags : undefined,
                  imageCount: images.length,
                });
                setAiLoading(false);
                if (result.data) setContent(result.data.slice(0, MAX_CHARS));
                else if (result.error) setError(result.error);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/30 transition disabled:opacity-50"
              title="✨ ให้ AI เขียน caption"
            >
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              AI เขียนให้
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
