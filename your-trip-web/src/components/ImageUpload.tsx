"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";

export interface UploadedImage {
  url: string;
  publicId: string;
  preview: string; // local object URL for immediate preview
}

interface ImageUploadProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  folder?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 4,
  folder = "your-trip/posts",
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState<number>(0); // count of in-progress uploads
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File): Promise<UploadedImage | null> => {
    const preview = URL.createObjectURL(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "อัปโหลดล้มเหลว");
        URL.revokeObjectURL(preview);
        return null;
      }

      return { url: data.url, publicId: data.publicId, preview };
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
      URL.revokeObjectURL(preview);
      return null;
    }
  }, [folder]);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setError(null);

    const available = maxImages - value.length;
    if (available <= 0) {
      setError(`อัปโหลดได้สูงสุด ${maxImages} รูป`);
      return;
    }

    const selected = Array.from(files).slice(0, available);
    setUploading((n) => n + selected.length);

    const results = await Promise.all(selected.map(uploadFile));
    const successful = results.filter(Boolean) as UploadedImage[];

    setUploading((n) => n - selected.length);
    if (successful.length > 0) {
      onChange([...value, ...successful]);
    }
  }

  function removeImage(idx: number) {
    const updated = [...value];
    const removed = updated.splice(idx, 1)[0];
    URL.revokeObjectURL(removed.preview);
    onChange(updated);
  }

  // Drag-and-drop
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  const canAdd = value.length < maxImages && uploading === 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Preview grid */}
      {value.length > 0 && (
        <div className={`grid gap-2 ${value.length === 1 ? "grid-cols-1" : value.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {value.map((img, i) => (
            <div key={img.publicId} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-700">
              <img src={img.preview || img.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              {/* Cover label for first image */}
              {i === 0 && value.length > 1 && (
                <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded-full font-medium">
                  ภาพหลัก
                </span>
              )}
            </div>
          ))}

          {/* Add more slot */}
          {canAdd && value.length < maxImages && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-600 flex flex-col items-center justify-center gap-1.5 text-gray-400 dark:text-slate-500 hover:border-[#398AB9] hover:text-[#398AB9] transition"
            >
              <Camera className="w-5 h-5" />
              <span className="text-[10px] font-medium">เพิ่ม</span>
            </button>
          )}

          {/* Uploading indicator */}
          {uploading > 0 && (
            <div className="aspect-square rounded-2xl bg-[#398AB9]/10 flex flex-col items-center justify-center gap-1.5">
              <Loader2 className="w-5 h-5 text-[#398AB9] animate-spin" />
              <span className="text-[10px] text-[#398AB9] font-medium">กำลังอัปโหลด</span>
            </div>
          )}
        </div>
      )}

      {/* Drop zone (shown when no images yet) */}
      {value.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#398AB9] hover:bg-[#398AB9]/5 transition group"
        >
          {uploading > 0 ? (
            <>
              <Loader2 className="w-8 h-8 text-[#398AB9] animate-spin" />
              <p className="text-sm text-[#398AB9] font-medium">กำลังอัปโหลด...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 group-hover:bg-[#398AB9]/10 rounded-2xl flex items-center justify-center transition">
                <ImageIcon className="w-6 h-6 text-gray-400 dark:text-slate-500 group-hover:text-[#398AB9] transition" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">เพิ่มรูปภาพ</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">ลากวางหรือแตะเพื่อเลือก (สูงสุด {maxImages} รูป, 10 MB/รูป)</p>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={maxImages > 1}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
