"use client";

import { useState, useRef } from "react";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Camera, User, Mail, Globe,
  MapPin, FileText, Save, Link as LinkIcon,
} from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "Your Trip User",
    username: "yourtrip_user",
    email: "user@example.com",
    bio: "นักเดินทางสายธรรมชาติ ☀️ ชอบตื่นเช้าไปดูวิวและลองอาหารท้องถิ่น",
    location: "กรุงเทพฯ",
    website: "",
    gender: "Other" as "Male" | "Female" | "Other",
    dateOfBirth: "",
  });

  const set = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    // TODO: wire to updateProfile server action
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
            ยกเลิก
          </button>
          <h1 className="text-sm font-semibold text-gray-900">แก้ไขโปรไฟล์</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#398AB9] px-4 py-1.5 rounded-full disabled:opacity-50 hover:bg-[#1C658C] transition"
          >
            {saved ? (
              "✓ บันทึกแล้ว"
            ) : saving ? (
              "กำลังบันทึก..."
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                บันทึก
              </>
            )}
          </button>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-[#398AB9] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                YT
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition"
              >
                <Camera className="w-4 h-4 text-gray-500" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" />
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-3 text-sm text-[#398AB9] font-medium hover:text-[#1C658C]"
            >
              เปลี่ยนรูปโปรไฟล์
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <User className="w-3.5 h-3.5" /> ชื่อ
              </label>
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="ชื่อของคุณ"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10"
              />
            </div>

            {/* Username */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                @ Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  value={form.username}
                  onChange={set("username")}
                  placeholder="username"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <FileText className="w-3.5 h-3.5" /> Bio
              </label>
              <textarea
                value={form.bio}
                onChange={set("bio")}
                placeholder="เล่าเกี่ยวกับตัวคุณ..."
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] resize-none"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{form.bio.length}/200</p>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5" /> ที่อยู่
              </label>
              <input
                value={form.location}
                onChange={set("location")}
                placeholder="เช่น กรุงเทพฯ, เชียงใหม่"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10"
              />
            </div>

            {/* Website */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <LinkIcon className="w-3.5 h-3.5" /> เว็บไซต์
              </label>
              <input
                value={form.website}
                onChange={set("website")}
                placeholder="https://yourwebsite.com"
                type="url"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <Mail className="w-3.5 h-3.5" /> อีเมล
              </label>
              <input
                value={form.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1 pl-1">เปลี่ยนอีเมลใน Supabase Auth</p>
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide block">
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
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {g === "Male" ? "♂ ชาย" : g === "Female" ? "♀ หญิง" : "⚧ อื่นๆ"}
                  </button>
                ))}
              </div>
            </div>

            {/* DOB */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide block">
                วันเกิด
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={set("dateOfBirth")}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] text-gray-600"
              />
            </div>
          </div>

          {/* Save button (bottom) */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-[#398AB9] text-white font-bold hover:bg-[#1C658C] transition disabled:opacity-50 shadow-md shadow-[#398AB9]/30"
          >
            {saving ? "กำลังบันทึก..." : saved ? "✓ บันทึกแล้ว" : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
