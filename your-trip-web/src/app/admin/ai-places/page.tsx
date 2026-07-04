"use client";

import { useState } from "react";
import { Sparkles, Plus, Loader2, CheckCircle2, XCircle, MapPin } from "lucide-react";

// metadata export removed — this is a Client Component ("use client")

const PROVINCES = [
  "เชียงใหม่","กรุงเทพมหานคร","ภูเก็ต","กระบี่","เชียงราย",
  "สุราษฎร์ธานี","ประจวบคีรีขันธ์","พระนครศรีอยุธยา","ชลบุรี","ขอนแก่น",
];

const CATEGORIES = [
  { value: "attraction", label: "สถานที่เที่ยว" },
  { value: "restaurant", label: "ร้านอาหาร" },
  { value: "cafe", label: "คาเฟ่" },
  { value: "hotel", label: "ที่พัก" },
  { value: "activity", label: "กิจกรรม" },
];

interface GeneratedPlace {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  category: string;
  province: string;
  address: string;
  priceRange: number;
  lat: number;
  lng: number;
}

interface ApiResponse {
  places?: GeneratedPlace[];
  error?: string;
}

export default function AIPlacesPage() {
  const [province, setProvince] = useState("เชียงใหม่");
  const [category, setCategory] = useState("attraction");
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedPlace[]>([]);
  const [status, setStatus] = useState<Record<number, "idle"|"saving"|"saved"|"error">>({});
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setResults([]);
    setStatus({});
    try {
      const res = await fetch("/api/admin/ai-generate-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province, category, count }),
      });
      const data = await res.json() as ApiResponse;
      if (data.error) { setError(data.error); return; }
      setResults(data.places ?? []);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  async function savePlace(place: GeneratedPlace, idx: number) {
    setStatus(s => ({ ...s, [idx]: "saving" }));
    try {
      const res = await fetch("/api/admin/ai-generate-places", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(place),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      setStatus(s => ({ ...s, [idx]: data.ok ? "saved" : "error" }));
    } catch {
      setStatus(s => ({ ...s, [idx]: "error" }));
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Place Generator</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">สร้างข้อมูลสถานที่ใหม่ด้วย AI แล้ว save ลง DB</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 block">จังหวัด</label>
            <select
              value={province}
              onChange={e => setProvince(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200"
            >
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 block">ประเภท</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200"
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 block">จำนวน</label>
            <select
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200"
            >
              {[1,2,3,5,10].map(n => <option key={n} value={n}>{n} สถานที่</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 bg-[#398AB9] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1C658C] disabled:opacity-60 transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "กำลังสร้าง..." : "สร้างด้วย AI"}
        </button>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <p className="mt-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
            ⚠️ ต้องตั้ง ANTHROPIC_API_KEY ใน .env.local เพื่อใช้ฟีเจอร์นี้
          </p>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
            สร้างสำเร็จ {results.length} สถานที่ — กด &quot;บันทึก&quot; เพื่อเพิ่มลง DB
          </p>
          {results.map((place, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{place.name}</h3>
                    <span className="text-xs text-gray-400 dark:text-slate-500">{place.nameEn}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-slate-400">{place.address}</span>
                    <span className="text-xs text-[#398AB9]">{"฿".repeat(place.priceRange)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-2">{place.description}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 line-clamp-1">{place.descriptionEn}</p>
                  <p className="text-xs text-gray-300 dark:text-slate-600 mt-1">
                    slug: {place.slug} · {place.lat}, {place.lng}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {status[idx] === "saved" ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      บันทึกแล้ว
                    </div>
                  ) : status[idx] === "error" ? (
                    <div className="flex items-center gap-1.5 text-red-500 text-sm">
                      <XCircle className="w-4 h-4" />
                      ผิดพลาด
                    </div>
                  ) : (
                    <button
                      onClick={() => savePlace(place, idx)}
                      disabled={status[idx] === "saving"}
                      className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-60 transition"
                    >
                      {status[idx] === "saving" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      บันทึก
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
