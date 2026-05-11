"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, MapPin, Calendar, Image as ImageIcon,
  Wallet, Globe, Lock, Sparkles, Check,
} from "lucide-react";

const popularDestinations = [
  "เชียงใหม่", "ภูเก็ต", "กรุงเทพฯ", "เกาะสมุย",
  "เชียงราย", "กระบี่", "บาหลี", "ญี่ปุ่น", "เกาหลี",
];

const durations = [
  { label: "วันเดียว", days: 1 },
  { label: "2 วัน", days: 2 },
  { label: "3 วัน", days: 3 },
  { label: "4 วัน", days: 4 },
  { label: "5 วัน", days: 5 },
  { label: "1 สัปดาห์", days: 7 },
  { label: "2 สัปดาห์", days: 14 },
  { label: "กำหนดเอง", days: 0 },
];

const budgetOptions = [
  { label: "ประหยัด", value: 3000, icon: "💚", desc: "< ฿3,000/วัน" },
  { label: "ปานกลาง", value: 6000, icon: "💛", desc: "฿3,000–6,000/วัน" },
  { label: "สะดวกสบาย", value: 12000, icon: "🧡", desc: "฿6,000–12,000/วัน" },
  { label: "หรูหรา", value: 999999, icon: "💜", desc: "> ฿12,000/วัน" },
];

export default function NewTripPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    days: 3,
    budget: 6000,
    isPublic: false,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(2); // index

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function selectDestination(dest: string) {
    set("destination", dest);
    if (!form.title) set("title", `ทริป${dest}`);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    // TODO: wire to createTrip server action
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    router.push("/trips/mock-new-trip-id");
  }

  const canNext = step === 1
    ? form.destination.trim().length > 0 && form.title.trim().length > 0
    : step === 2
    ? form.startDate.length > 0
    : true;

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">สร้างทริปใหม่</h1>
            <p className="text-xs text-gray-400 mt-0.5">ขั้นตอนที่ {step} จาก 3</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? "bg-[#398AB9]" : "bg-gray-100"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Destination + Title */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ปลายทาง <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#398AB9]" />
                <input
                  value={form.destination}
                  onChange={(e) => set("destination", e.target.value)}
                  placeholder="เช่น เชียงใหม่, บาหลี..."
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10"
                />
              </div>
              {/* Popular destinations */}
              <div className="flex flex-wrap gap-2 mt-3">
                {popularDestinations.map((d) => (
                  <button
                    key={d}
                    onClick={() => selectDestination(d)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      form.destination === d
                        ? "bg-[#398AB9] text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อทริป <span className="text-red-400">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={form.destination ? `ทริป${form.destination}` : "ตั้งชื่อทริปของคุณ"}
                maxLength={80}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                คำอธิบาย <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="เป้าหมายของทริปนี้คืออะไร..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Dates + Duration */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="inline w-4 h-4 mr-1.5 text-[#398AB9]" />
                ช่วงเวลาเดินทาง
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">วันออกเดินทาง</p>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] text-gray-600"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">วันกลับ</p>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] text-gray-600"
                  />
                </div>
              </div>

              {/* Duration chips */}
              <p className="text-xs text-gray-400 mb-2">หรือเลือกจำนวนวัน</p>
              <div className="grid grid-cols-4 gap-2">
                {durations.map((d, i) => (
                  <button
                    key={d.label}
                    onClick={() => {
                      setSelectedDuration(i);
                      set("days", d.days);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                      selectedDuration === i
                        ? "bg-[#398AB9] text-white shadow-md shadow-[#398AB9]/30"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Wallet className="inline w-4 h-4 mr-1.5 text-[#398AB9]" />
                งบประมาณ
              </label>
              <div className="grid grid-cols-2 gap-2">
                {budgetOptions.map((b) => (
                  <button
                    key={b.label}
                    onClick={() => set("budget", b.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.budget === b.value
                        ? "border-[#398AB9] bg-[#398AB9]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span>{b.icon}</span>
                      <span className={`text-xs font-semibold ${form.budget === b.value ? "text-[#398AB9]" : "text-gray-700"}`}>
                        {b.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Privacy + Cover */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-[#398AB9]/5 border border-[#398AB9]/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#398AB9]" />
                <p className="text-sm font-semibold text-[#398AB9]">สรุปทริป</p>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-medium">{form.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {form.startDate
                      ? `${form.startDate}${form.endDate ? ` → ${form.endDate}` : ""}`
                      : `${form.days} วัน`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {budgetOptions.find((b) => b.value === form.budget)?.label ?? "ปานกลาง"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <ImageIcon className="inline w-4 h-4 mr-1.5 text-[#398AB9]" />
                ภาพหน้าปก <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
              </label>
              <button className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#398AB9] hover:text-[#398AB9] transition group">
                <ImageIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-sm">อัปโหลดรูปภาพ</span>
                <span className="text-xs text-gray-300">PNG, JPG ขนาดสูงสุด 5MB</span>
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                หรือใช้รูปจาก Unsplash โดยอัตโนมัติ
              </p>
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                การมองเห็น
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => set("isPublic", false)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                    !form.isPublic ? "border-[#398AB9] bg-[#398AB9]/5" : "border-gray-200"
                  }`}
                >
                  <Lock className={`w-5 h-5 ${!form.isPublic ? "text-[#398AB9]" : "text-gray-400"}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${!form.isPublic ? "text-[#398AB9]" : "text-gray-700"}`}>
                      ส่วนตัว
                    </p>
                    <p className="text-xs text-gray-400">มองเห็นได้เฉพาะคุณ</p>
                  </div>
                  {!form.isPublic && <Check className="w-4 h-4 text-[#398AB9]" />}
                </button>
                <button
                  onClick={() => set("isPublic", true)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                    form.isPublic ? "border-[#398AB9] bg-[#398AB9]/5" : "border-gray-200"
                  }`}
                >
                  <Globe className={`w-5 h-5 ${form.isPublic ? "text-[#398AB9]" : "text-gray-400"}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${form.isPublic ? "text-[#398AB9]" : "text-gray-700"}`}>
                      สาธารณะ
                    </p>
                    <p className="text-xs text-gray-400">ทุกคนสามารถดูแผนทริปของคุณ</p>
                  </div>
                  {form.isPublic && <Check className="w-4 h-4 text-[#398AB9]" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-10">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
            >
              ย้อนกลับ
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="flex-1 py-4 rounded-2xl bg-[#398AB9] text-white font-bold hover:bg-[#1C658C] transition disabled:opacity-40 shadow-md shadow-[#398AB9]/30"
            >
              ถัดไป
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-4 rounded-2xl bg-[#398AB9] text-white font-bold hover:bg-[#1C658C] transition disabled:opacity-40 shadow-md shadow-[#398AB9]/30 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "กำลังสร้าง..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  สร้างทริป!
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
