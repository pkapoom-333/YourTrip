"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Save, ArrowLeft, Plus, X, Upload, Loader2 } from "lucide-react";
import { createPlace, updatePlace, type PlaceFormData } from "@/server/actions/admin";

const CATEGORIES = [
  { value: "attraction", label: "สถานที่ท่องเที่ยว" },
  { value: "restaurant", label: "ร้านอาหาร" },
  { value: "cafe", label: "คาเฟ่" },
  { value: "hotel", label: "ที่พัก" },
  { value: "activity", label: "กิจกรรม" },
];

const REGIONS = [
  { value: "north", label: "ภาคเหนือ" },
  { value: "south", label: "ภาคใต้" },
  { value: "east", label: "ภาคตะวันออก" },
  { value: "west", label: "ภาคตะวันตก" },
  { value: "central", label: "ภาคกลาง" },
  { value: "northeast", label: "ภาคตะวันออกเฉียงเหนือ" },
  { value: "international", label: "ต่างประเทศ" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_TH: Record<string, string> = {
  Mon: "จ", Tue: "อ", Wed: "พ", Thu: "พฤ", Fri: "ศ", Sat: "ส", Sun: "อา",
};

const PRICE_RANGE = [
  { value: 1, label: "฿ (ถูก)" },
  { value: 2, label: "฿฿ (ปานกลาง)" },
  { value: 3, label: "฿฿฿ (แพง)" },
  { value: 4, label: "฿฿฿฿ (หรูหรา)" },
];

interface Props {
  mode: "create" | "edit";
  placeId?: string;
  initialData?: Partial<PlaceFormData>;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9฀-๿\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function PlaceFormClient({ mode, placeId, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const [form, setForm] = useState<PlaceFormData>({
    name: initialData?.name ?? "",
    nameEn: initialData?.nameEn ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    descriptionEn: initialData?.descriptionEn ?? "",
    category: initialData?.category ?? "attraction",
    region: initialData?.region ?? "central",
    province: initialData?.province ?? "",
    address: initialData?.address ?? "",
    lat: initialData?.lat,
    lng: initialData?.lng,
    phone: initialData?.phone ?? "",
    website: initialData?.website ?? "",
    googleMapsUrl: initialData?.googleMapsUrl ?? "",
    priceRange: initialData?.priceRange ?? 1,
    entryFee: initialData?.entryFee,
    openDays: initialData?.openDays ?? [],
    openTime: initialData?.openTime ?? "08:00",
    closeTime: initialData?.closeTime ?? "17:00",
    hasWifi: initialData?.hasWifi ?? false,
    hasAC: initialData?.hasAC ?? false,
    hasParking: initialData?.hasParking ?? false,
    parkingFee: initialData?.parkingFee,
    isVegetarian: initialData?.isVegetarian ?? false,
    isAccessible: initialData?.isAccessible ?? false,
    isPublished: initialData?.isPublished ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    images: initialData?.images ?? [],
  });

  const set = <K extends keyof PlaceFormData>(key: K, val: PlaceFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const toggleDay = (day: string) => {
    set("openDays", form.openDays.includes(day)
      ? form.openDays.filter((d) => d !== day)
      : [...form.openDays, day]
    );
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      set("images", [...(form.images ?? []), imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const removeImage = (idx: number) => {
    set("images", (form.images ?? []).filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim() || !form.description?.trim()) {
      setError("กรุณากรอกชื่อ, slug, และคำอธิบาย");
      return;
    }
    setError(null);
    startTransition(async () => {
      if (mode === "create") {
        const result = await createPlace(form);
        if (result.ok) {
          setSuccess(true);
          setTimeout(() => router.push("/admin/places"), 1500);
        } else {
          setError(result.error ?? "เกิดข้อผิดพลาด");
        }
      } else if (placeId) {
        const result = await updatePlace(placeId, form);
        if (result.ok) {
          setSuccess(true);
          setTimeout(() => router.push("/admin/places"), 1500);
        } else {
          setError(result.error ?? "เกิดข้อผิดพลาด");
        }
      }
    });
  };

  return (
    <div className="p-4 pt-16 md:pt-6 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "เพิ่มสถานที่ใหม่" : "แก้ไขสถานที่"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">กรอกข้อมูลสถานที่ให้ครบ</p>
        </div>
      </div>

      {success && (
        <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl p-3 text-sm">
          ✅ บันทึกสำเร็จ! กำลังกลับไปยังรายการ...
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* ── Section: Basic Info ── */}
        <Section title="ข้อมูลพื้นฐาน">
          <Field label="ชื่อสถานที่ (ไทย) *">
            <input
              value={form.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (mode === "create") set("slug", slugify(e.target.value));
              }}
              placeholder="เช่น ดอยอินทนนท์"
              className={inputCls}
              required
            />
          </Field>
          <Field label="ชื่อภาษาอังกฤษ">
            <input value={form.nameEn ?? ""} onChange={(e) => set("nameEn", e.target.value)} placeholder="e.g. Doi Inthanon" className={inputCls} />
          </Field>
          <Field label="Slug (URL) *">
            <input
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              placeholder="doi-inthanon"
              className={inputCls}
              required
            />
            <p className="text-xs text-gray-400 mt-1">URL: /place/{form.slug || "..."}</p>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="ประเภท *">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="ภาค *">
              <select value={form.region} onChange={(e) => set("region", e.target.value)} className={inputCls}>
                {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="จังหวัด">
            <input value={form.province ?? ""} onChange={(e) => set("province", e.target.value)} placeholder="เชียงใหม่" className={inputCls} />
          </Field>
        </Section>

        {/* ── Section: Description ── */}
        <Section title="คำอธิบาย">
          <Field label="คำอธิบาย (ไทย) *">
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="คำอธิบายสถานที่..."
              rows={4}
              className={inputCls + " resize-none"}
              required
            />
          </Field>
          <Field label="คำอธิบาย (อังกฤษ)">
            <textarea
              value={form.descriptionEn ?? ""}
              onChange={(e) => set("descriptionEn", e.target.value)}
              placeholder="English description..."
              rows={3}
              className={inputCls + " resize-none"}
            />
          </Field>
        </Section>

        {/* ── Section: Location ── */}
        <Section title="ที่ตั้ง">
          <Field label="ที่อยู่">
            <input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} placeholder="เลขที่ ถนน ตำบล อำเภอ..." className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <input type="number" step="any" value={form.lat ?? ""} onChange={(e) => set("lat", e.target.value ? Number(e.target.value) : undefined)} placeholder="18.5883" className={inputCls} />
            </Field>
            <Field label="Longitude">
              <input type="number" step="any" value={form.lng ?? ""} onChange={(e) => set("lng", e.target.value ? Number(e.target.value) : undefined)} placeholder="98.4867" className={inputCls} />
            </Field>
          </div>
          <Field label="Google Maps URL">
            <input value={form.googleMapsUrl ?? ""} onChange={(e) => set("googleMapsUrl", e.target.value)} placeholder="https://maps.google.com/..." className={inputCls} />
          </Field>
        </Section>

        {/* ── Section: Contact ── */}
        <Section title="ติดต่อ">
          <div className="grid grid-cols-2 gap-3">
            <Field label="เบอร์โทร">
              <input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="0xx-xxx-xxxx" className={inputCls} />
            </Field>
            <Field label="เว็บไซต์">
              <input value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="https://..." className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* ── Section: Pricing ── */}
        <Section title="ราคาและค่าเข้า">
          <Field label="ระดับราคา">
            <div className="flex gap-2">
              {PRICE_RANGE.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set("priceRange", p.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    form.priceRange === p.value
                      ? "bg-[#398AB9] text-white border-[#398AB9]"
                      : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-[#398AB9]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="ค่าเข้าชม (บาท) — ว่างเปล่า = ฟรี">
            <input type="number" value={form.entryFee ?? ""} onChange={(e) => set("entryFee", e.target.value ? Number(e.target.value) : undefined)} placeholder="0" className={inputCls} />
          </Field>
        </Section>

        {/* ── Section: Hours ── */}
        <Section title="เวลาทำการ">
          <Field label="วันที่เปิด">
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium border transition-colors ${
                    form.openDays.includes(d)
                      ? "bg-[#398AB9] text-white border-[#398AB9]"
                      : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-[#398AB9]"
                  }`}
                >
                  {DAY_TH[d]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => set("openDays", form.openDays.length === 7 ? [] : [...DAYS])}
                className="px-3 h-10 rounded-xl text-xs border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-[#398AB9] transition-colors"
              >
                {form.openDays.length === 7 ? "ล้าง" : "ทุกวัน"}
              </button>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="เวลาเปิด">
              <input type="time" value={form.openTime ?? "08:00"} onChange={(e) => set("openTime", e.target.value)} className={inputCls} />
            </Field>
            <Field label="เวลาปิด">
              <input type="time" value={form.closeTime ?? "17:00"} onChange={(e) => set("closeTime", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* ── Section: Facilities ── */}
        <Section title="สิ่งอำนวยความสะดวก">
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["hasWifi", "WiFi ฟรี"],
                ["hasAC", "แอร์"],
                ["hasParking", "ที่จอดรถ"],
                ["isVegetarian", "มังสวิรัติ"],
                ["isAccessible", "ผู้พิการเข้าได้"],
              ] as [keyof PlaceFormData, string][]
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => set(key, e.target.checked as PlaceFormData[typeof key])}
                  className="w-4 h-4 rounded accent-[#398AB9]"
                />
                <span className="text-sm text-gray-700 dark:text-slate-300">{label}</span>
              </label>
            ))}
          </div>
          {form.hasParking && (
            <Field label="ค่าจอดรถ (บาท/ชั่วโมง) — ว่างเปล่า = ฟรี">
              <input type="number" value={form.parkingFee ?? ""} onChange={(e) => set("parkingFee", e.target.value ? Number(e.target.value) : undefined)} placeholder="0" className={inputCls} />
            </Field>
          )}
        </Section>

        {/* ── Section: Images ── */}
        <Section title="รูปภาพ (URL)">
          <div className="flex gap-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls + " flex-1"}
            />
            <button
              type="button"
              onClick={addImage}
              className="px-3 py-2.5 bg-[#398AB9] text-white rounded-xl hover:bg-[#1C658C] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {(form.images ?? []).length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {(form.images ?? []).map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200 dark:border-slate-700" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }} />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Section: Publish Settings ── */}
        <Section title="การเผยแพร่">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="w-4 h-4 rounded accent-[#398AB9]" />
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-slate-300">เผยแพร่</div>
                <div className="text-xs text-gray-400 dark:text-slate-500">แสดงในหน้า Explore และค้นหา</div>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="w-4 h-4 rounded accent-[#398AB9]" />
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-slate-300">แนะนำ (Featured)</div>
                <div className="text-xs text-gray-400 dark:text-slate-500">แสดงในส่วนสถานที่แนะนำ</div>
              </div>
            </label>
          </div>
        </Section>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isPending || success}
            className="flex-1 py-3 bg-[#398AB9] text-white rounded-xl text-sm font-medium hover:bg-[#1C658C] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {mode === "create" ? "บันทึกสถานที่" : "อัปเดต"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#398AB9] placeholder:text-gray-400";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}
