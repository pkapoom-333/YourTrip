"use client";

import { useState, useRef, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import { updateProfile, getProfile } from "@/server/actions/profile";
import {
  ChevronLeft, Camera, User, Globe,
  MapPin, FileText, Save, Link as LinkIcon, Loader2,
} from "lucide-react";

const AVATAR_COLORS = [
  "bg-[#398AB9]", "bg-emerald-500", "bg-violet-500",
  "bg-orange-400", "bg-pink-400", "bg-amber-500",
];

export default function EditProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "Your Trip User",
    username: "",
    bio: "",
    location: "",
    website: "",
    gender: "Other" as "Male" | "Female" | "Other",
    dateOfBirth: "",
  });

  // Load real profile on mount
  useEffect(() => {
    getProfile().then(({ data }) => {
      if (!data) return;
      setForm((f) => ({
        ...f,
        name: data.name ?? f.name,
        username: data.username ?? f.username,
        bio: data.bio ?? f.bio,
        location: data.location ?? f.location,
        website: data.website ?? f.website,
      }));
      if (data.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
        setAvatarPreview(data.avatarUrl);
      }
    });
  }, []);

  const set = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    // Upload
    setUploading(true);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "avatars");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "อัพโหลดล้มเหลว");
      setAvatarUrl(json.url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "อัพโหลดล้มเหลว");
      setAvatarPreview(avatarUrl); // revert preview
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setErrorMsg(null);
    try {
      const result = await updateProfile({
        name: form.name,
        username: form.username || undefined,
        bio: form.bio || undefined,
        location: form.location || undefined,
        website: form.website || undefined,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || undefined,
        avatarUrl: avatarUrl || undefined,
      });
      if ("error" in result && result.error) {
        setErrorMsg(result.error.message);
      } else {
        setSaved(true);
        setTimeout(() => {
          router.push("/profile");
          router.refresh();
        }, 800);
      }
    } finally {
      setSaving(false);
    }
  }

  const avatarColor = AVATAR_COLORS[(form.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  const initials = (form.name ?? "U").charAt(0).toUpperCase();

  return (
    <AppShell>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
            ยกเลิก
          </button>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-slate-100">แก้ไขโปรไฟล์</h1>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#398AB9] px-4 py-1.5 rounded-full disabled:opacity-50 hover:bg-[#1C658C] transition"
          >
            {saved ? (
              "✓ บันทึกแล้ว"
            ) : saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> กำลังบันทึก...</>
            ) : (
              <><Save className="w-3.5 h-3.5" /> บันทึก</>
            )}
          </button>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Error message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {errorMsg}
            </div>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className={`w-24 h-24 ${avatarColor} rounded-full flex items-center justify-center text-white text-3xl font-bold`}>
                  {initials}
                </div>
              )}
              {/* Uploading overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-gray-500" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-3 text-sm text-[#398AB9] font-medium hover:text-[#1C658C] disabled:opacity-50"
            >
              {uploading ? "กำลังอัพโหลด..." : "เปลี่ยนรูปโปรไฟล์"}
            </button>
            <p className="text-[11px] text-gray-400 mt-1">JPEG, PNG, WebP · สูงสุด 10 MB</p>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                <User className="w-3.5 h-3.5" /> ชื่อ
              </label>
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="ชื่อของคุณ"
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10 bg-white dark:bg-slate-700/50 text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Username */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                @ Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  value={form.username}
                  onChange={set("username")}
                  placeholder="username"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10 bg-white dark:bg-slate-700/50 text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                <FileText className="w-3.5 h-3.5" /> Bio
              </label>
              <textarea
                value={form.bio}
                onChange={set("bio")}
                placeholder="เล่าเกี่ยวกับตัวคุณ..."
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] resize-none bg-white dark:bg-slate-700/50 text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{form.bio.length}/200</p>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5" /> ที่อยู่
              </label>
              <input
                value={form.location}
                onChange={set("location")}
                placeholder="เช่น กรุงเทพฯ, เชียงใหม่"
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10 bg-white dark:bg-slate-700/50 text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Website */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                <LinkIcon className="w-3.5 h-3.5" /> เว็บไซต์
              </label>
              <input
                value={form.website}
                onChange={set("website")}
                placeholder="https://yourwebsite.com"
                type="url"
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10 bg-white dark:bg-slate-700/50 text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Website icon */}
            {form.website && (
              <a
                href={form.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#398AB9] -mt-2 pl-1 hover:underline"
              >
                <Globe className="w-3 h-3" />
                {form.website.replace(/^https?:\/\//, "")}
              </a>
            )}

            {/* Gender */}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide block">
                เพศ
              </label>
              <div className="flex gap-2">
                {(["Male", "Female", "Other"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, gender: g }))}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                      form.gender === g
                        ? "border-[#398AB9] bg-[#398AB9] text-white"
                        : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    {g === "Male" ? "♂ ชาย" : g === "Female" ? "♀ หญิง" : "⚧ อื่นๆ"}
                  </button>
                ))}
              </div>
            </div>

            {/* DOB */}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide block">
                วันเกิด
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={set("dateOfBirth")}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-700/50"
              />
            </div>
          </div>

          {/* Save button (bottom) */}
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="w-full py-4 rounded-2xl bg-[#398AB9] text-white font-bold hover:bg-[#1C658C] transition disabled:opacity-50 shadow-md shadow-[#398AB9]/30"
          >
            {saving ? "กำลังบันทึก..." : saved ? "✓ บันทึกแล้ว" : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
