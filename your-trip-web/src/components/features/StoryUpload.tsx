"use client";

import { useRef, useState } from "react";
import { Camera, X, Check, Loader2 } from "lucide-react";
import { createStory } from "@/server/actions/stories";

interface StoryUploadProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function StoryUpload({ onClose, onCreated }: StoryUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isVideo = f.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleSubmit = async () => {
    const f = fileRef.current?.files?.[0];
    if (!f || !preview) return;

    setUploading(true);
    setError(null);

    try {
      // Upload via /api/upload
      const form = new FormData();
      form.append("file", f);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json() as { url?: string; error?: string };
      if (!json.url) throw new Error(json.error ?? "Upload failed");

      const { data, error: storyErr } = await createStory({
        mediaUrl: json.url,
        mediaType,
        caption: caption.trim() || undefined,
      });

      if (storyErr || !data) throw new Error(storyErr ?? "Story creation failed");
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center">
      <div className="bg-slate-900 w-full max-w-sm md:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-white font-semibold">สร้างสตอรี่</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview / pick */}
        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-64 flex flex-col items-center justify-center gap-3 text-white/50 hover:text-white/80 transition"
          >
            <Camera className="w-12 h-12" />
            <span className="text-sm">แตะเพื่อเลือกรูปหรือวิดีโอ</span>
          </button>
        ) : (
          <div className="relative w-full h-64 bg-black">
            {mediaType === "video" ? (
              <video src={preview} className="w-full h-full object-contain" controls />
            ) : (
              <img src={preview} alt="preview" className="w-full h-full object-contain" />
            )}
            <button
              onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Caption */}
        <div className="px-4 py-3">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="เพิ่มคำบรรยาย..."
            maxLength={150}
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#398AB9]"
          />
        </div>

        {error && <p className="px-4 pb-2 text-[#FF4F4F] text-xs">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3 px-4 pb-5">
          <button onClick={() => fileRef.current?.click()} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white text-sm">
            เลือกไฟล์
          </button>
          <button
            onClick={handleSubmit}
            disabled={!preview || uploading}
            className="flex-1 py-2.5 rounded-xl bg-[#398AB9] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {uploading ? "กำลังอัปโหลด..." : "โพสต์สตอรี่"}
          </button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
