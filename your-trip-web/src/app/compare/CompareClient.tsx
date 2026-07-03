
"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ComparePlace, searchPlacesForTrip } from "@/server/actions/places";
import { Plus, X, Star, Wifi, Wind, Car, Leaf, Accessibility, Clock, DollarSign, ChevronLeft } from "lucide-react";

interface Props {
  initialPlaces: ComparePlace[];
}

const PRICE = ["", "฿", "฿฿", "฿฿฿", "฿฿฿฿"];
const CATEGORY_LABEL: Record<string, string> = {
  attraction: "สถานที่ท่องเที่ยว", restaurant: "ร้านอาหาร", cafe: "คาเฟ่",
  hotel: "ที่พัก", activity: "กิจกรรม",
};

function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count})</span>
    </div>
  );
}

function CheckIcon({ ok }: { ok: boolean }) {
  return (
    <span className={`text-lg font-bold ${ok ? "text-green-500" : "text-gray-200"}`}>
      {ok ? "✓" : "✗"}
    </span>
  );
}

function PlacePickerDropdown({
  onSelect,
  excludeSlugs,
}: {
  onSelect: (place: ComparePlace) => void;
  excludeSlugs: string[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; slug: string; name: string; province: string | null }>>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const { data } = await searchPlacesForTrip(q, 8);
      setResults(data.filter((p) => !excludeSlugs.includes(p.slug)));
    } finally {
      setLoading(false);
    }
  }, [excludeSlugs]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(q), 300);
  }

  async function pick(r: { id: string; slug: string; name: string; province: string | null }) {
    // Fetch full compare place via URL trick — use slug
    const res = await fetch(`/api/compare-place?slug=${r.slug}`);
    if (res.ok) {
      const place = await res.json() as ComparePlace;
      onSelect(place);
    }
    setQuery("");
    setResults([]);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 border border-dashed border-[#398AB9] rounded-xl p-3 bg-blue-50 dark:bg-[#398AB9]/10">
        <Plus className="w-4 h-4 text-[#398AB9] flex-shrink-0" />
        <input
          value={query}
          onChange={handleChange}
          placeholder="ค้นหาสถานที่..."
          className="flex-1 bg-transparent text-sm outline-none text-gray-700 dark:text-slate-200 placeholder:text-gray-400"
        />
        {loading && <span className="text-xs text-gray-400">...</span>}
      </div>
      {results.length > 0 && (
        <ul className="absolute z-30 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
          {results.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => pick(r)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <span className="font-medium text-gray-800 dark:text-slate-100">{r.name}</span>
                {r.province && <span className="text-xs text-gray-400">{r.province}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CompareClient({ initialPlaces }: Props) {
  const [places, setPlaces] = useState<ComparePlace[]>(initialPlaces);

  function remove(slug: string) {
    setPlaces((prev) => prev.filter((p) => p.slug !== slug));
  }

  function add(place: ComparePlace) {
    setPlaces((prev) => {
      if (prev.find((p) => p.slug === place.slug)) return prev;
      return [...prev, place].slice(0, 3);
    });
  }

  const canAdd = places.length < 3;
  const excludeSlugs = places.map((p) => p.slug);

  const rows = [
    { label: "ประเภท", render: (p: ComparePlace) => CATEGORY_LABEL[p.category] ?? p.category },
    { label: "จังหวัด", render: (p: ComparePlace) => p.province ?? p.country },
    { label: "คะแนน", render: (p: ComparePlace) => <StarRow rating={p.rating} count={p.reviewCount} /> },
    { label: "ราคา", render: (p: ComparePlace) => PRICE[p.priceRange] || "ฟรี" },
    { label: "ค่าเข้าชม", render: (p: ComparePlace) => p.entryFee ? `${p.entryFee.toLocaleString()} ฿` : "ฟรี" },
    { label: "เวลา", render: (p: ComparePlace) => p.openTime && p.closeTime ? `${p.openTime}–${p.closeTime}` : "—" },
    { label: "WiFi", render: (p: ComparePlace) => <CheckIcon ok={p.hasWifi} /> },
    { label: "แอร์", render: (p: ComparePlace) => <CheckIcon ok={p.hasAC} /> },
    { label: "ที่จอดรถ", render: (p: ComparePlace) => <CheckIcon ok={p.hasParking} /> },
    { label: "มังสวิรัติ", render: (p: ComparePlace) => <CheckIcon ok={p.isVegetarian} /> },
    { label: "ผู้พิการ", render: (p: ComparePlace) => <CheckIcon ok={p.isAccessible} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/explore" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">เปรียบเทียบสถานที่</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">เลือกได้สูงสุด 3 สถานที่</p>
        </div>
      </div>

      {/* Place cards header */}
      <div className={`grid gap-4 mb-6 ${places.length === 0 ? "grid-cols-1" : places.length === 1 ? "grid-cols-2" : places.length === 2 ? "grid-cols-3" : "grid-cols-3"}`}>
        {places.map((p) => (
          <div key={p.slug} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="relative h-32">
              {p.coverImage ? (
                <Image src={p.coverImage} alt={p.name} fill className="object-cover" sizes="300px" />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-slate-700" />
              )}
              <button
                onClick={() => remove(p.slug)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3">
              <Link href={`/place/${p.slug}`} className="font-semibold text-sm text-gray-900 dark:text-slate-100 hover:text-[#398AB9] line-clamp-1">
                {p.name}
              </Link>
              {p.nameEn && <p className="text-xs text-gray-400 line-clamp-1">{p.nameEn}</p>}
            </div>
          </div>
        ))}

        {canAdd && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 flex flex-col justify-center min-h-[160px]">
            <PlacePickerDropdown onSelect={add} excludeSlugs={excludeSlugs} />
          </div>
        )}
      </div>

      {/* Comparison table */}
      {places.length >= 2 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-gray-50/50 dark:bg-slate-700/30" : ""}>
                  <td className="px-4 py-3 font-medium text-gray-500 dark:text-slate-400 w-28 whitespace-nowrap">
                    {row.label}
                  </td>
                  {places.map((p) => (
                    <td key={p.slug} className="px-4 py-3 text-gray-800 dark:text-slate-100">
                      {row.render(p)}
                    </td>
                  ))}
                  {canAdd && <td />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {places.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">เพิ่มสถานที่เพื่อเปรียบเทียบ</p>
          <p className="text-sm mt-1">ค้นหาและเลือกสถานที่ 2–3 แห่งด้านบน</p>
        </div>
      )}

      {places.length === 1 && (
        <div className="text-center py-10 text-gray-400 dark:text-slate-500 text-sm">
          เพิ่มอีก 1 สถานที่เพื่อเริ่มเปรียบเทียบ
        </div>
      )}

      {/* Tags comparison */}
      {places.length >= 2 && (
        <div className="mt-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">แท็ก</h3>
          <div className="grid gap-3" style={{ gridTemplateColumns: `7rem repeat(${places.length}, 1fr)` }}>
            {places.map((p) => (
              <div key={p.slug} className="flex flex-wrap gap-1 col-start-auto">
                {p.tags.slice(0, 6).map((tag) => (
                  <span key={tag} className="text-[10px] bg-[#398AB9]/10 text-[#398AB9] px-1.5 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
                {p.tags.length === 0 && <span className="text-xs text-gray-300">—</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description comparison */}
      {places.length >= 2 && (
        <div className="mt-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">คำอธิบาย</h3>
          <div className={`grid gap-4 ${places.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {places.map((p) => (
              <div key={p.slug}>
                <p className="text-xs font-medium text-[#398AB9] mb-1">{p.name}</p>
                <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-4">
                  {p.description ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
