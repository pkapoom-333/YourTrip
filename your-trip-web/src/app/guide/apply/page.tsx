"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import { applyAsGuide } from "@/server/actions/profile";
import { ChevronLeft, CheckCircle, Star, MapPin, Users, Shield } from "lucide-react";
import Link from "next/link";

const specialtyOptions = [
  "ธรรมชาติและป่าเขา", "ประวัติศาสตร์และวัฒนธรรม", "ร้านอาหารและคาเฟ่",
  "ชายหาดและทะเล", "ช้อปปิ้งและตลาด", "ถ่ายภาพ", "ผจญภัย", "ครอบครัว",
];

const perks = [
  { icon: Star, label: "เพิ่มรายได้จากการพานักท่องเที่ยว" },
  { icon: MapPin, label: "แสดง badge 🏅 บนโปรไฟล์และ BuddyCard" },
  { icon: Users, label: "ปรากฏในผลการค้นหา Buddy ก่อนผู้ใช้ทั่วไป" },
  { icon: Shield, label: "รับการรับรองจาก YourTrip อย่างเป็นทางการ" },
];

export default function GuideApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState<"intro" | "form" | "done">("intro");
  const [form, setForm] = useState({
    experience: "",
    selectedSpecialties: [] as string[],
    certifications: "",
    agreeTerms: false,
  });
  const [submitting, setSubmitting] = useState(false);

  function toggleSpecialty(s: string) {
    setForm((prev) => ({
      ...prev,
      selectedSpecialties: prev.selectedSpecialties.includes(s)
        ? prev.selectedSpecialties.filter((x) => x !== s)
        : [...prev.selectedSpecialties, s],
    }));
  }

  const canSubmit =
    form.experience.trim().length >= 20 &&
    form.selectedSpecialties.length >= 1 &&
    form.agreeTerms;

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const result = await applyAsGuide();
    setSubmitting(false);
    if (result.data?.success) {
      setStep("done");
    }
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => (step === "form" ? setStep("intro") : router.back())}
            className="w-9 h-9 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">สมัครเป็นมัคคุเทศก์</h1>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">YourTrip Guide Program</p>
          </div>
        </div>

        {/* INTRO step */}
        {step === "intro" && (
          <div className="space-y-6">
            {/* Hero badge */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 rounded-3xl p-6 text-center">
              <div className="text-5xl mb-3">🏅</div>
              <h2 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-1">มัคคุเทศก์ที่ได้รับการรับรอง</h2>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                เป็นส่วนหนึ่งของเครือข่ายมัคคุเทศก์มืออาชีพของ YourTrip
                และช่วยนักท่องเที่ยวสร้างประสบการณ์ที่น่าจดจำ
              </p>
            </div>

            {/* Perks */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300">สิทธิประโยชน์</h3>
              {perks.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#398AB9]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#398AB9]" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Requirements */}
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">คุณสมบัติเบื้องต้น</h3>
              <ul className="space-y-1.5 text-sm text-gray-500 dark:text-slate-400">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> มีประสบการณ์พานักท่องเที่ยวมาก่อน</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> รู้จักพื้นที่เป้าหมายเป็นอย่างดี</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> สื่อสารได้ดี ใจเย็น รักการบริการ</li>
                <li className="flex items-center gap-2"><span className="text-gray-300 dark:text-slate-600">○</span> มีใบอนุญาตมัคคุเทศก์ (ไม่บังคับ)</li>
              </ul>
            </div>

            <button
              onClick={() => setStep("form")}
              className="w-full py-4 rounded-2xl bg-[#398AB9] text-white font-bold hover:bg-[#1C658C] transition shadow-md shadow-[#398AB9]/30"
            >
              เริ่มสมัคร →
            </button>
          </div>
        )}

        {/* FORM step */}
        {step === "form" && (
          <div className="space-y-6">
            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                ประสบการณ์ของคุณ <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.experience}
                onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                placeholder="เล่าประสบการณ์ด้านการท่องเที่ยวหรือการพานักท่องเที่ยว เช่น ทำงานมัคคุเทศก์มากี่ปี, เคยพาทัวร์ที่ไหน, เชี่ยวชาญด้านไหน..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] resize-none"
              />
              <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 text-right">
                {form.experience.length}/500 · ต้องการอย่างน้อย 20 ตัวอักษร
              </p>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                ความเชี่ยวชาญ <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {specialtyOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                      form.selectedSpecialties.includes(s)
                        ? "bg-[#398AB9] text-white shadow-sm"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {form.selectedSpecialties.length === 0 && (
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">เลือกอย่างน้อย 1 ความเชี่ยวชาญ</p>
              )}
            </div>

            {/* Certifications (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                ใบอนุญาต / ใบรับรอง <span className="text-gray-400 dark:text-slate-500 font-normal">(ไม่บังคับ)</span>
              </label>
              <input
                value={form.certifications}
                onChange={(e) => setForm((p) => ({ ...p, certifications: e.target.value }))}
                placeholder="เช่น ใบอนุญาตมัคคุเทศก์ทั่วไป, Tour Guide License เลขที่..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:border-[#398AB9]"
              />
              <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">
                * ในอนาคตจะสามารถอัปโหลดเอกสารได้ (Phase 2)
              </p>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() => setForm((p) => ({ ...p, agreeTerms: !p.agreeTerms }))}
                className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 transition-all flex items-center justify-center ${
                  form.agreeTerms ? "bg-[#398AB9] border-[#398AB9]" : "border-gray-300 dark:border-slate-600"
                }`}
              >
                {form.agreeTerms && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                ฉันยืนยันว่าข้อมูลที่ให้เป็นความจริง และยอมรับว่า YourTrip
                จะตรวจสอบคำสมัครก่อนให้ badge มัคคุเทศก์
              </p>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full py-4 rounded-2xl bg-[#398AB9] text-white font-bold hover:bg-[#1C658C] transition disabled:opacity-40 shadow-md shadow-[#398AB9]/30"
            >
              {submitting ? "กำลังส่งคำสมัคร..." : "ส่งคำสมัคร"}
            </button>
          </div>
        )}

        {/* DONE step */}
        {step === "done" && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">ส่งคำสมัครแล้ว!</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-2">
              ทีม YourTrip จะตรวจสอบคำสมัครของคุณภายใน 3–5 วันทำการ
              เมื่อผ่านการยืนยัน badge 🏅 จะปรากฏบนโปรไฟล์ของคุณทันที
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-8">
              สถานะปัจจุบัน: <span className="font-semibold text-amber-600">⏳ รอการยืนยัน</span>
            </p>
            <div className="flex gap-3 w-full">
              <Link
                href="/buddy"
                className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition text-center"
              >
                ดู Buddy
              </Link>
              <Link
                href="/profile"
                className="flex-1 py-3 rounded-2xl bg-[#398AB9] text-white text-sm font-bold hover:bg-[#1C658C] transition text-center"
              >
                ดูโปรไฟล์
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
