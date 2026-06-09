"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import { generateAITrip, saveAITrip, type AIPlanInput, type AIPlanResult } from "@/server/actions/ai-trip";
import { useToast } from "@/components/shared/Toast";
import {
  ChevronLeft, Sparkles, MapPin, Users, Palette, Calendar,
  Wallet, Check, Globe, Lock, Clock, AlertCircle, Loader2,
  Sun, Sunset, Moon,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVINCES = [
  "เชียงใหม่", "กรุงเทพฯ", "ภูเก็ต", "เกาะสมุย", "กระบี่",
  "เชียงราย", "อยุธยา", "พัทยา", "หัวหิน", "ขอนแก่น",
  "เขาใหญ่", "ระยอง", "สุโขทัย", "ลำปาง", "น่าน",
];

const GROUP_TYPES = [
  { value: "solo",   label: "เดี่ยว",         icon: "🧳" },
  { value: "couple", label: "คู่รัก",         icon: "💑" },
  { value: "group",  label: "กลุ่มเพื่อน",   icon: "👥" },
  { value: "family", label: "ครอบครัว",       icon: "👨‍👩‍👧‍👦" },
] as const;

const STYLES = [
  { value: "cafe hopping",   label: "คาเฟ่", icon: "☕" },
  { value: "outdoor",        label: "ธรรมชาติ",  icon: "🏕️" },
  { value: "cultural",       label: "วัฒนธรรม",  icon: "🏛️" },
  { value: "adventure",      label: "แอดเวนเจอร์", icon: "🏄" },
  { value: "shopping",       label: "ช็อปปิ้ง",   icon: "🛍️" },
  { value: "food",           label: "กินเที่ยว",  icon: "🍜" },
  { value: "relaxation",     label: "พักผ่อน",    icon: "🌴" },
  { value: "photography",    label: "ถ่ายรูป",    icon: "📸" },
];

const BUDGETS = [
  { value: 3000,  label: "ประหยัด",     icon: "💚", desc: "< ฿3,000/วัน" },
  { value: 6000,  label: "ปานกลาง",    icon: "💛", desc: "฿3,000–6,000/วัน" },
  { value: 12000, label: "สะดวกสบาย", icon: "🧡", desc: "฿6,000–12,000/วัน" },
  { value: 999999,label: "หรูหรา",    icon: "💜", desc: "> ฿12,000/วัน" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIPlanPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<"form" | "generating" | "preview" | "save">("form");

  // Form state
  const [province, setProvince] = useState("");
  const [groupType, setGroupType] = useState<AIPlanInput["groupType"]>("couple");
  const [styles, setStyles] = useState<string[]>(["food", "cultural"]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState(6000);

  // Result state
  const [plan, setPlan] = useState<AIPlanResult | null>(null);
  const [activeDay, setActiveDay] = useState(0);

  // Save state
  const [tripTitle, setTripTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleStyle(s: string) {
    setStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  const canGenerate =
    province.trim().length > 0 &&
    startDate.length > 0 &&
    endDate.length > 0 &&
    styles.length > 0;

  async function handleGenerate() {
    if (!canGenerate) return;
    setStep("generating");

    const result = await generateAITrip({
      province,
      groupType,
      styles,
      startDate,
      endDate,
      budget,
    });

    if (result.error || !result.data) {
      toastError(result.error ?? "เกิดข้อผิดพลาด");
      setStep("form");
      return;
    }

    setPlan(result.data);
    setTripTitle(result.data.title);
    setActiveDay(0);
    setStep("preview");
  }

  async function handleSave() {
    if (!plan) return;
    setSaving(true);

    const result = await saveAITrip(plan, {
      title: tripTitle || plan.title,
      startDate,
      endDate,
      budget,
      isPublic,
    });

    setSaving(false);

    if (result.error || !result.data) {
      toastError(result.error ?? "ไม่สามารถบันทึกได้");
      return;
    }

    success("สร้างทริปแล้ว! 🎉");
    router.push(`/trips/${result.data.id}`);
  }

  const timeIcon = (time: string) => {
    const h = parseInt(time.split(":")[0] ?? "12", 10);
    if (h < 12) return <Sun className="w-3.5 h-3.5 text-amber-400" />;
    if (h < 17) return <Sunset className="w-3.5 h-3.5 text-orange-400" />;
    return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => step === "form" ? router.back() : setStep("form")}
            className="w-9 h-9 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#398AB9]" />
              AI วางแผนทริป
            </h1>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              บอก AI ว่าอยากไปไหน — AI จัดให้เลย
            </p>
          </div>
        </div>

        {/* ── FORM ── */}
        {step === "form" && (
          <div className="space-y-6">
            {/* Province */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                <MapPin className="inline w-4 h-4 mr-1 text-[#398AB9]" />
                ปลายทาง
              </label>
              <div className="relative mb-3">
                <input
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="พิมพ์จังหวัด เช่น เชียงใหม่, ภูเก็ต..."
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PROVINCES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvince(p)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      province === p
                        ? "bg-[#398AB9] text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Group type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                <Users className="inline w-4 h-4 mr-1 text-[#398AB9]" />
                ประเภทผู้เดินทาง
              </label>
              <div className="grid grid-cols-4 gap-2">
                {GROUP_TYPES.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGroupType(g.value)}
                    className={`py-3 rounded-xl text-center text-xs font-medium transition-all ${
                      groupType === g.value
                        ? "bg-[#398AB9] text-white shadow-md shadow-[#398AB9]/30"
                        : "bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600"
                    }`}
                  >
                    <div className="text-lg mb-0.5">{g.icon}</div>
                    <div>{g.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Travel style */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                <Palette className="inline w-4 h-4 mr-1 text-[#398AB9]" />
                สไตล์การท่องเที่ยว{" "}
                <span className="text-gray-400 dark:text-slate-500 font-normal">(เลือกได้หลายอย่าง)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => toggleStyle(s.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                      styles.includes(s.value)
                        ? "bg-[#398AB9] text-white border-[#398AB9]"
                        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-[#398AB9] hover:text-[#398AB9]"
                    }`}
                  >
                    <span>{s.icon}</span>
                    {s.label}
                    {styles.includes(s.value) && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1 text-[#398AB9]" />
                วันเดินทาง
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">วันออกเดินทาง</p>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] text-gray-600"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">วันกลับ</p>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                <Wallet className="inline w-4 h-4 mr-1 text-[#398AB9]" />
                งบประมาณ
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BUDGETS.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setBudget(b.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      budget === b.value
                        ? "border-[#398AB9] bg-[#398AB9]/5 dark:bg-[#398AB9]/10"
                        : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span>{b.icon}</span>
                      <span className={`text-xs font-semibold ${budget === b.value ? "text-[#398AB9]" : "text-gray-700 dark:text-slate-300"}`}>
                        {b.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#398AB9] to-[#1C658C] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#398AB9]/30 hover:opacity-90 transition disabled:opacity-40"
            >
              <Sparkles className="w-5 h-5" />
              ให้ AI วางแผนทริปเลย!
            </button>
          </div>
        )}

        {/* ── GENERATING ── */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-20 h-20 bg-[#398AB9]/10 dark:bg-[#398AB9]/20 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#398AB9] animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800 dark:text-slate-200">AI กำลังวางแผนทริป...</p>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                กำลังค้นหาสถานที่ใน{province} และจัดตารางให้คุณ
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              {["🗺️", "🍜", "📸", "✈️"].map((e, i) => (
                <span
                  key={i}
                  className="text-2xl"
                  style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {step === "preview" && plan && (
          <div className="space-y-4">
            {/* Plan header */}
            <div className="bg-gradient-to-r from-[#398AB9] to-[#1C658C] rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/70 font-medium">AI แนะนำ</span>
              </div>
              <h2 className="text-lg font-bold">{plan.title}</h2>
              <p className="text-sm text-white/80 mt-1">{plan.description}</p>
              <div className="flex items-center gap-3 mt-3 text-white/70 text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {startDate} — {endDate}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {province}
                </span>
              </div>
            </div>

            {/* Day tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {plan.days.map((d, i) => (
                <button
                  key={d.day}
                  onClick={() => setActiveDay(i)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeDay === i
                      ? "bg-[#398AB9] text-white"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                  }`}
                >
                  วันที่ {d.day}
                </button>
              ))}
            </div>

            {/* Day itinerary */}
            {plan.days[activeDay] && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                  {plan.days[activeDay].theme}
                </p>
                <div className="space-y-2">
                  {plan.days[activeDay].items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 mt-0.5 min-w-[48px]">
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-slate-400">
                            {timeIcon(item.time)}
                            {item.time}
                          </div>
                          <div className="flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                            <Clock className="w-2.5 h-2.5" />
                            {item.duration} น.
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 leading-tight">
                            {item.name}
                          </p>
                          {item.placeName && (
                            <span className="inline-block text-[10px] bg-[#398AB9]/10 text-[#398AB9] px-2 py-0.5 rounded-full mt-0.5">
                              📍 {item.placeName}
                            </span>
                          )}
                          {item.notes && (
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 leading-relaxed">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-600 text-sm text-gray-600 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                วางแผนใหม่
              </button>
              <button
                onClick={() => { setTripTitle(plan.title); setStep("save"); }}
                className="flex-[2] py-3.5 rounded-2xl bg-[#398AB9] text-white text-sm font-bold hover:bg-[#1C658C] transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                บันทึกทริปนี้
              </button>
            </div>
          </div>
        )}

        {/* ── SAVE ── */}
        {step === "save" && plan && (
          <div className="space-y-5">
            <div className="bg-[#398AB9]/5 dark:bg-[#398AB9]/10 border border-[#398AB9]/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-[#398AB9]" />
                <span className="text-xs font-semibold text-[#398AB9]">เกือบเสร็จแล้ว!</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                ตรวจสอบชื่อทริปและการมองเห็น แล้วกดบันทึก
              </p>
            </div>

            {/* Trip title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                ชื่อทริป
              </label>
              <input
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                maxLength={80}
                className="w-full px-4 py-3.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10"
              />
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                การมองเห็น
              </label>
              <div className="space-y-2">
                {[
                  { val: false, icon: Lock,  label: "ส่วนตัว",  desc: "มองเห็นได้เฉพาะคุณ" },
                  { val: true,  icon: Globe, label: "สาธารณะ", desc: "ทุกคนสามารถดูแผนทริปของคุณ" },
                ].map(({ val, icon: Icon, label, desc }) => (
                  <button
                    key={String(val)}
                    onClick={() => setIsPublic(val)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                      isPublic === val
                        ? "border-[#398AB9] bg-[#398AB9]/5 dark:bg-[#398AB9]/10"
                        : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isPublic === val ? "text-[#398AB9]" : "text-gray-400 dark:text-slate-500"}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isPublic === val ? "text-[#398AB9]" : "text-gray-700 dark:text-slate-300"}`}>
                        {label}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{desc}</p>
                    </div>
                    {isPublic === val && <Check className="w-4 h-4 text-[#398AB9]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Save button */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("preview")}
                className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !tripTitle.trim()}
                className="flex-[2] py-4 rounded-2xl bg-[#398AB9] text-white font-bold hover:bg-[#1C658C] transition disabled:opacity-40 flex items-center justify-center gap-2 shadow-md shadow-[#398AB9]/30"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    บันทึกทริปนี้!
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </AppShell>
  );
}
