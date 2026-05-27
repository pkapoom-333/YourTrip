"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import { createPost } from "@/server/actions/posts";
import { ImageUpload, type UploadedImage } from "@/components/ImageUpload";
import { useUser } from "@/hooks/useUser";
import {
  MapPin, Tag, X, ChevronLeft, Smile, AlertCircle,
} from "lucide-react";

const MAX_CHARS = 500;
const MAX_IMAGES = 4;

const suggestedTags = [
  "เที่ยวเหนือ", "ทะเล", "ธรรมชาติ", "คาเฟ่", "ร้านอาหาร",
  "Hiking", "ต่างประเทศ", "วีคเอนด์", "โรแมนติก", "ครอบครัว",
];

export default function CreatePage() {
  const router = useRouter();
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_CHARS - content.length;
  const canPost = content.trim().length > 0 && !isSubmitting;

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "You";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials = displayName.charAt(0).toUpperCase();

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
        images: images.map((img) => img.url),
      });
      if (result?.error) {
        setError(result.error.message);
        return;
      }
      router.push("/feed");
      router.refresh();
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
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
            <ChevronLeft className="w-4 h-4" />
            ยกเลิก
          </button>
          <h1 className="text-sm font-semibold text-gray-900">โพสต์ใหม่</h1>
          <button
            onClick={handlePost}
            disabled={!canPost}
            className="text-sm font-bold text-white bg-[#398AB9] px-4 py-1.5 rounded-full disabled:opacity-40 hover:bg-[#1C658C] transition">
            {isSubmitting ? "กำลังโพสต์..." : "โพสต์"}
          </button>
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

        <div className="px-4 py-4 space-y-4">
          {/* Author row */}
          <div className="flex items-start gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 bg-[#398AB9] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">{displayName}</p>
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
              className="w-full text-sm text-gray-800 placeholder:text-gray-400 resize-none outline-none leading-relaxed bg-transparent"
              autoFocus
            />
            <div className={`text-right text-xs mt-1 ${remaining < 50 ? "text-[#FF4F4F]" : "text-gray-300"}`}>
              {remaining}
            </div>
          </div>

          {/* Image upload */}
          <ImageUpload
            value={images}
            onChange={setImages}
            maxImages={MAX_IMAGES}
            folder="your-trip/posts"
          />

          {/* Location input */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <MapPin className="w-4 h-4 text-[#398AB9] flex-shrink-0" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เพิ่มสถานที่ (เช่น ดอยอ่างขาง, เชียงใหม่)"
              className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent outline-none"
            />
            {location && (
              <button onClick={() => setLocation("")}>
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
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
                className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
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
                  className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full hover:bg-gray-200 transition">
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="sticky bottom-20 md:bottom-4 bg-white border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-4">
            <button className="text-sm text-gray-500 hover:text-[#398AB9] transition">
              <Smile className="w-5 h-5" />
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${remaining < 50 ? "bg-[#FF4F4F]" : remaining < 150 ? "bg-amber-400" : "bg-emerald-400"}`} />
              <span className={`text-xs font-medium ${remaining < 50 ? "text-[#FF4F4F]" : "text-gray-400"}`}>
                {remaining}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
