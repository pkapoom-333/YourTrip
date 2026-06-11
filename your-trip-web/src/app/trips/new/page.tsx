"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import { useRouter, useSearchParams } from "next/navigation";
import { createTrip } from "@/server/actions/trips";
import { ImageUpload, type UploadedImage } from "@/components/ImageUpload";
import {
  ChevronLeft, MapPin, Calendar, Image as ImageIcon,
  Wallet, Globe, Lock, Sparkles, Check, Loader2,
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

// ─── DestinationInput — plain text + Google Places Autocomplete ───────────────

function DestinationInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (dest: string) => void;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const inputRef = useRef<HTMLInputElement>(null);
  const [initialized, setInitialized] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!apiKey || !inputRef.current || initialized) return;
    let cancelled = false;
    (async () => {
      try {
        const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader");
        if (cancelled || !inputRef.current) return;
        setOptions({ key: apiKey, v: "weekly" });
        await importLibrary("places");
        if (cancelled || !inputRef.current) return;
        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          types: ["(regions)"],
          fields: ["name"],
        });
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (place?.name) onChangeRef.current(place.name);
        });
        setInitialized(true);
      } catch { /* fallback to plain input */ }
    })();
    return () => { cancelled = true; };
  }, [apiKey, initialized]);

  return (
    <div className="relative">
      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#398AB9] pointer-events-none" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="เช่น เชียงใหม่, บาหลี..."
        className="w-full pl-10 pr-9 py-3.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10"
      />
      {apiKey && !initialized && (
        <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin" />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewTripPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledDestination = searchParams.get("destination") ?? "";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    destination: prefilledDestination,
    startDate: "",
    endDate: "",
    days: 3,
    budget: 6000,
    isPublic: false,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(2); // index
  const [coverImages, setCoverImages] = useState<UploadedImage[]>([]);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function selectDestination(dest: string) {
    set("destination", dest);
    if (!form.title) set("title", `ทริป${dest}`);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      // Calculate startDate / endDate from form.startDate + form.days
      const start = form.startDate || new Date().toISOString().split("T")[0];
      const startMs = new Date(start).getTime();
      const end = new Date(startMs + (form.days - 1) * 86_400_000).toISOString().split("T")[0];

      const result = await createTrip({
        title: form.title || `ทริป${form.destination}`,
        destination: form.destination,
        startDate: start,
        endDate: form.endDate || end,
        budget: form.budget,
        description: form.description || undefined,
        visibility: form.isPublic ? "PUBLIC" : "PRIVATE",
        coverImage: coverImages[0]?.url || undefined,
      });

      if (result.data) {
        router.push(`/trips/${result.data.id}`);
      } else {
        router.push("/trips");
      }
    } catch {
      router.push("/trips");
    } finally {
      setIsSubmitting(false);
    }
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
            className="w-9 h-9 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">สร้างทริปใหม่</h1>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">ขั้นตอนที่ {step} จาก 3</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? "bg-[#398AB9]" : "bg-gray-100 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Destination + Title */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                ปลายทาง <span className="text-red-400">*</span>
              </label>
              <DestinationInput
                value={form.destination}
                onChange={(dest) => {
                  set("destination", dest);
                  if (!form.title) set("title", `ทริป${dest}`);
                }}
              />
              {/* Popular destinations */}
              <div className="flex flex-wrap gap-2 mt-3">
                {popularDestinations.map((d) => (
                  <button
                    key={d}
                    onClick={() => selectDestination(d)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      form.destination === d
                        ? "bg-[#398AB9] text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                ชื่อทริป <span className="text-red-400">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={form.destination ? `ทริป${form.destination}` : "ตั้งชื่อทริปของคุณ"}
                maxLength={80}
                className="w-full px-4 py-3.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                คำอธิบาย <span className="text-gray-400 dark:text-slate-500 font-normal">(ไม่บังคับ)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="เป้าหมายของทริปนี้คืออะไร..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Dates + Duration */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                <Calendar className="inline w-4 h-4 mr-1.5 text-[#398AB9]" />
                ช่วงเวลาเดินทาง
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-1.5">วันออกเดินทาง</p>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] text-gray-600"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-1.5">วันกลับ</p>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#398AB9] text-gray-600"
                  />
                </div>
              </div>

              {/* Duration chips */}
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-2">หรือเลือกจำนวนวัน</p>
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
                        : "bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
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
                        ? "border-[#398AB9] bg-[#398AB9]/5 dark:bg-[#398AB9]/10"
                        : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span>{b.icon}</span>
                      <span className={`text-xs font-semibold ${form.budget === b.value ? "text-[#398AB9]" : "text-gray-700 dark:text-slate-300"}`}>
                        {b.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">{b.desc}</p>
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
            <div className="bg-[#398AB9]/5 dark:bg-[#398AB9]/10 border border-[#398AB9]/20 dark:border-[#398AB9]/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#398AB9]" />
                <p className="text-sm font-semibold text-[#398AB9]">สรุปทริป</p>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                  <span className="font-medium">{form.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                  <span>
                    {form.startDate
                      ? `${form.startDate}${form.endDate ? ` → ${form.endDate}` : ""}`
                      : `${form.days} วัน`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                  <span>
                    {budgetOptions.find((b) => b.value === form.budget)?.label ?? "ปานกลาง"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                <ImageIcon className="inline w-4 h-4 mr-1.5 text-[#398AB9]" />
                ภาพหน้าปก <span className="text-gray-400 dark:text-slate-500 font-normal">(ไม่บังคับ)</span>
              </label>
              <ImageUpload
                value={coverImages}
                onChange={setCoverImages}
                maxImages={1}
                folder="your-trip/covers"
              />
              {coverImages.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 text-center">
                  หากไม่อัปโหลด ระบบจะใช้รูปจาก Unsplash อัตโนมัติ
                </p>
              )}
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                การมองเห็น
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => set("isPublic", false)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                    !form.isPublic
                      ? "border-[#398AB9] bg-[#398AB9]/5 dark:bg-[#398AB9]/10"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <Lock className={`w-5 h-5 ${!form.isPublic ? "text-[#398AB9]" : "text-gray-400 dark:text-slate-500"}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${!form.isPublic ? "text-[#398AB9]" : "text-gray-700 dark:text-slate-300"}`}>
                      ส่วนตัว
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">มองเห็นได้เฉพาะคุณ</p>
                  </div>
                  {!form.isPublic && <Check className="w-4 h-4 text-[#398AB9]" />}
                </button>
                <button
                  onClick={() => set("isPublic", true)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                    form.isPublic
                      ? "border-[#398AB9] bg-[#398AB9]/5 dark:bg-[#398AB9]/10"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <Globe className={`w-5 h-5 ${form.isPublic ? "text-[#398AB9]" : "text-gray-400 dark:text-slate-500"}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${form.isPublic ? "text-[#398AB9]" : "text-gray-700 dark:text-slate-300"}`}>
                      สาธารณะ
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">ทุกคนสามารถดูแผนทริปของคุณ</p>
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
              className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
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
