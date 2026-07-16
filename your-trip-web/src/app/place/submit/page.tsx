"use client";

import { useState, useRef } from "react";
import AppShell from "@/components/AppShell";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, ChevronLeft, CheckCircle, Loader2, AlertCircle,
  Camera, X, ImagePlus,
} from "lucide-react";

const CATEGORIES = [
  { value: "attraction", label: "สถานที่เที่ยว" },
  { value: "restaurant", label: "ร้านอาหาร" },
  { value: "cafe", label: "คาเฟ่" },
  { value: "hotel", label: "ที่พัก" },
  { value: "activity", label: "กิจกรรม" },
];

const PROVINCES = [
  "กรุงเทพมหานคร", "เชียงใหม่", "ภูเก็ต", "เชียงราย", "กระบี่", "สุราษฎร์ธานี",
  "นครราชสีมา", "ขอนแก่น", "อุดรธานี", "นนทบุรี", "ปทุมธานี", "สมุทรปราการ",
  "อยุธยา", "กาญจนบุรี", "ราชบุรี", "เพชรบุรี", "ประจวบคีรีขันธ์", "ชลบุรี",
  "ระยอง", "จันทบุรี", "นครศรีธรรมราช", "สงขลา", "ตรัง", "พัทลุง",
  "พระนครศรีอยุธยา", "ลำพูน", "ลำปาง", "แม่ฮ่องสอน", "น่าน", "พะเยา",
  "แพร่", "อุตรดิตถ์", "พิษณุโลก", "เพชรบูรณ์", "สุโขทัย", "กำแพงเพชร",
  "นครสวรรค์", "อุทัยธานี", "ชัยนาท", "สิงห์บุรี", "ลพบุรี", "สระบุรี",
  "นครนายก", "ปราจีนบุรี", "สระแก้ว", "ฉะเชิงเทรา", "ตราด", "ระนอง",
  "พังงา", "ชุมพร", "สตูล", "ปัตตานี", "ยะลา", "นราธิวาส",
  "อื่นๆ",
];

const MAX_PHOTOS = 5;
const DESCRIPTION_MAX = 500;
const NOTE_MAX = 200;

interface FormData {
  name: string;
  nameEn: string;
  category: string;
  province: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  googleMapsUrl: string;
  submitterNote: string;
}

interface PhotoItem {
  localUrl: string;   // object URL for preview
  cloudUrl: string;   // Cloudinary URL (empty while uploading)
  uploading: boolean;
  error: string | null;
}

const INITIAL: FormData = {
  name: "", nameEn: "", category: "attraction", province: "",
  address: "", phone: "", website: "", description: "", googleMapsUrl: "", submitterNote: "",
};

// ── shared input style ────────────────────────────────────────────────────────
const INPUT_CLS =
  "w-full text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 placeholder-gray-300 dark:placeholder-slate-500 text-gray-900 dark:text-slate-100 focus:outline-none focus:border-[#398AB9] focus:ring-1 focus:ring-[#398AB9]/30 transition";

export default function PlaceSubmitPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // ── photo upload ─────────────────────────────────────────────────────────────
  async function handlePhotoFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;

    const picked = Array.from(files).slice(0, remaining);
    const newItems: PhotoItem[] = picked.map((f) => ({
      localUrl: URL.createObjectURL(f),
      cloudUrl: "",
      uploading: true,
      error: null,
    }));

    setPhotos((prev) => [...prev, ...newItems]);

    // Upload each file to Cloudinary via /api/upload
    for (let i = 0; i < picked.length; i++) {
      const file = picked[i];
      const idx = photos.length + i; // stable index in the new array

      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "your-trip/place-submissions");

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json() as { url?: string; error?: string };

        if (!res.ok || !json.url) throw new Error(json.error ?? "อัปโหลดล้มเหลว");

        setPhotos((prev) =>
          prev.map((p, j) => j === idx ? { ...p, cloudUrl: json.url!, uploading: false } : p)
        );
      } catch (err) {
        setPhotos((prev) =>
          prev.map((p, j) =>
            j === idx
              ? { ...p, uploading: false, error: err instanceof Error ? err.message : "อัปโหลดล้มเหลว" }
              : p
          )
        );
      }
    }
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].localUrl);
      next.splice(idx, 1);
      return next;
    });
  }

  // ── submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.province) {
      setError("กรุณากรอกชื่อสถานที่และจังหวัดให้ครบ");
      return;
    }
    const stillUploading = photos.some((p) => p.uploading);
    if (stillUploading) {
      setError("กรุณารอจนกว่าการอัปโหลดรูปภาพจะเสร็จสิ้น");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const photoUrls = photos.filter((p) => p.cloudUrl).map((p) => p.cloudUrl);
      const res = await fetch("/api/place-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photos: photoUrls }),
      });
      if (!res.ok) {
        const j = await res.json() as { error?: string };
        throw new Error(j.error ?? "ส่งข้อมูลไม่สำเร็จ");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6 md:py-8">
        {/* Back */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-[#398AB9] transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          กลับไปสำรวจ
        </Link>

        {/* ── Success state ─────────────────────────────────────────────────────── */}
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">ขอบคุณที่แนะนำ!</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              ทีมงานจะตรวจสอบข้อมูลและเพิ่มสถานที่ในระบบภายใน 3–5 วันทำการ
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setForm(INITIAL); setPhotos([]); setSubmitted(false); }}
                className="px-4 py-2 text-sm font-medium text-[#398AB9] border border-[#398AB9] rounded-xl hover:bg-[#398AB9]/5 transition"
              >
                แนะนำอีกสถานที่
              </button>
              <Link
                href="/explore"
                className="px-4 py-2 text-sm font-medium bg-[#398AB9] text-white rounded-xl hover:bg-[#1C658C] transition"
              >
                กลับสำรวจ
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-[#398AB9]" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">แนะนำสถานที่ใหม่</h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                ช่วยชุมชนนักเดินทาง! เพิ่มสถานที่ที่คุณรู้จักและอยากแนะนำให้ผู้อื่น
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ── Photo Upload ──────────────────────────────────────────────── */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                    รูปภาพ
                    <span className="text-xs font-normal text-gray-400 dark:text-slate-500 ml-1.5">
                      (ไม่บังคับ สูงสุด {MAX_PHOTOS} รูป)
                    </span>
                  </h2>
                  {photos.length > 0 && (
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {photos.length}/{MAX_PHOTOS}
                    </span>
                  )}
                </div>

                {/* Preview grid */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700">
                        <Image
                          src={photo.localUrl}
                          alt={`รูปที่ ${idx + 1}`}
                          fill
                          className="object-cover"
                        />

                        {/* Uploading overlay */}
                        {photo.uploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}

                        {/* Error overlay */}
                        {photo.error && (
                          <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center p-1">
                            <p className="text-white text-[9px] text-center leading-tight">{photo.error}</p>
                          </div>
                        )}

                        {/* Remove button */}
                        {!photo.uploading && (
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        )}

                        {/* Uploaded checkmark */}
                        {!photo.uploading && !photo.error && photo.cloudUrl && (
                          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                {photos.length < MAX_PHOTOS && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => handlePhotoFiles(e.target.files)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-slate-500 hover:border-[#398AB9] hover:text-[#398AB9] transition-colors"
                    >
                      {photos.length === 0 ? (
                        <>
                          <Camera className="w-4 h-4" />
                          เพิ่มรูปภาพสถานที่
                        </>
                      ) : (
                        <>
                          <ImagePlus className="w-4 h-4" />
                          เพิ่มรูปอีก ({MAX_PHOTOS - photos.length} รูปที่เหลือ)
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* ── Basic Info ────────────────────────────────────────────────── */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 space-y-4">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">ข้อมูลพื้นฐาน</h2>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                    ชื่อสถานที่ <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="เช่น ดอยอินทนนท์, ร้านกาแฟข้างวัด"
                    className={INPUT_CLS}
                    maxLength={100}
                    required
                  />
                  {form.name.length > 60 && (
                    <p className="text-right text-[10px] text-gray-400 mt-0.5">{form.name.length}/100</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                    ชื่อภาษาอังกฤษ
                  </label>
                  <input
                    value={form.nameEn}
                    onChange={(e) => set("nameEn", e.target.value)}
                    placeholder="Doi Inthanon, Side Street Café"
                    className={INPUT_CLS}
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                      ประเภท <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      className={INPUT_CLS}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                      จังหวัด <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.province}
                      onChange={(e) => set("province", e.target.value)}
                      className={INPUT_CLS}
                      required
                    >
                      <option value="">เลือกจังหวัด</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">ที่อยู่</label>
                  <input
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ"
                    className={INPUT_CLS}
                  />
                </div>
              </div>

              {/* ── Contact & Links ───────────────────────────────────────────── */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 space-y-4">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">ช่องทางติดต่อ</h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">เบอร์โทรศัพท์</label>
                    <input
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="0x-xxxx-xxxx"
                      className={INPUT_CLS}
                      inputMode="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">เว็บไซต์</label>
                    <input
                      value={form.website}
                      onChange={(e) => set("website", e.target.value)}
                      placeholder="https://..."
                      className={INPUT_CLS}
                      inputMode="url"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">ลิงก์ Google Maps</label>
                  <input
                    value={form.googleMapsUrl}
                    onChange={(e) => set("googleMapsUrl", e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className={INPUT_CLS}
                    inputMode="url"
                  />
                </div>
              </div>

              {/* ── Description ───────────────────────────────────────────────── */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 space-y-4">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">รายละเอียด</h2>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-slate-400">คำอธิบายสถานที่</label>
                    <span className={`text-[10px] ${form.description.length > DESCRIPTION_MAX * 0.85 ? "text-orange-400" : "text-gray-400 dark:text-slate-500"}`}>
                      {form.description.length}/{DESCRIPTION_MAX}
                    </span>
                  </div>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value.slice(0, DESCRIPTION_MAX))}
                    placeholder="บอกเล่าสถานที่นี้ให้ผู้อื่นรู้จัก เช่น บรรยากาศ สิ่งที่น่าสนใจ ไฮไลต์"
                    rows={4}
                    className={`${INPUT_CLS} resize-none`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-slate-400">หมายเหตุถึงทีมงาน</label>
                    <span className={`text-[10px] ${form.submitterNote.length > NOTE_MAX * 0.85 ? "text-orange-400" : "text-gray-400 dark:text-slate-500"}`}>
                      {form.submitterNote.length}/{NOTE_MAX}
                    </span>
                  </div>
                  <textarea
                    value={form.submitterNote}
                    onChange={(e) => set("submitterNote", e.target.value.slice(0, NOTE_MAX))}
                    placeholder="ข้อมูลเพิ่มเติมที่อยากให้ทีมงานทราบ"
                    rows={2}
                    className={`${INPUT_CLS} resize-none`}
                  />
                </div>
              </div>

              {/* ── Submit ────────────────────────────────────────────────────── */}
              <button
                type="submit"
                disabled={submitting || photos.some((p) => p.uploading)}
                className="w-full py-3.5 bg-[#398AB9] hover:bg-[#1C658C] disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : photos.some((p) => p.uploading) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังอัปโหลดรูป...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    ส่งข้อมูลสถานที่
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 dark:text-slate-500">
                ข้อมูลจะถูกตรวจสอบโดยทีมงานก่อนเผยแพร่
              </p>
            </form>
          </>
        )}
      </div>
    </AppShell>
  );
}
