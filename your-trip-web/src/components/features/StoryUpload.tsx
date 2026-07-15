"use client";

import { useRef, useState } from "react";
import { Camera, X, Check, Loader2, Sparkles } from "lucide-react";
import { createStory } from "@/server/actions/stories";
import StoryTextEditor from "./StoryTextEditor";

interface StoryUploadProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function StoryUpload({ onClose, onCreated }: StoryUploadProps) {
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  // After text-editor, holds the composited blob (image stories only)
  const [compositedBlob, setCompositedBlob] = useState<Blob | null>(null);
  const [compositedUrl, setCompositedUrl] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
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
    setRawFile(f);
    setCompositedBlob(null);
    setCompositedUrl(null);
  };

  function handleEditorDone(blob: Blob) {
    const url = URL.createObjectURL(blob);
    setCompositedBlob(blob);
    setCompositedUrl(url);
    setShowEditor(false);
  }

  const handleSubmit = async () => {
    if (!preview) return;

    setUploading(true);
    setError(null);

    try {
      // Decide what to upload: composited blob (with text overlays) or raw file
      const uploadTarget: File | Blob = compositedBlob ?? rawFile!;
      const filename = compositedBlob ? "story.jpg" : (rawFile?.name ?? "story");

      const form = new FormData();
      form.append("file", uploadTarget, filename);
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

  // Show text editor overlay (images only)
  if (showEditor && preview && mediaType === "image") {
    return (
      <StoryTextEditor
        imageDataUrl={preview}
        onDone={handleEditorDone}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  const displayUrl = compositedUrl ?? preview;

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
              <video src={displayUrl ?? undefined} className="w-full h-full object-contain" controls />
            ) : (
              <img src={displayUrl ?? undefined} alt="preview" className="w-full h-full object-contain" />
            )}
            {/* Remove button */}
            <button
              onClick={() => {
                setPreview(null);
                setRawFile(null);
                setCompositedBlob(null);
                setCompositedUrl(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Text overlay button (images only) */}
            {mediaType === "image" && (
              <button
                onClick={() => setShowEditor(true)}
                className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 hover:bg-black/70 text-white px-2.5 py-1 rounded-lg text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {compositedBlob ? "แก้ไขข้อความ" : "เพิ่มข้อความ"}
              </button>
            )}
            {/* Composited indicator */}
            {compositedBlob && (
              <div className="absolute bottom-2 left-2 bg-[#398AB9]/80 text-white text-[10px] px-2 py-0.5 rounded-full">
                มีข้อความ
              </div>
            )}
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
            onClick={() => void handleSubmit()}
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
