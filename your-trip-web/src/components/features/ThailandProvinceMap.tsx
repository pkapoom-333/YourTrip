"use client";

/**
 * ThailandProvinceMap — tile-grid visualisation of 77 Thai provinces.
 * Visited provinces (passed via `visited` prop) light up in brand blue.
 * Non-visited provinces are shown as subtle grey tiles.
 */

import { useState } from "react";

// ── All 77 provinces grouped by region ──────────────────────────────────────
const REGIONS: Array<{
  name: string;
  color: string;       // Tailwind bg class for visited
  textColor: string;
  provinces: string[];
}> = [
  {
    name: "ภาคเหนือ",
    color: "bg-[#398AB9]",
    textColor: "text-white",
    provinces: [
      "เชียงใหม่", "เชียงราย", "ลำปาง", "ลำพูน", "แม่ฮ่องสอน",
      "พะเยา", "แพร่", "น่าน",
    ],
  },
  {
    name: "ภาคกลาง",
    color: "bg-emerald-500",
    textColor: "text-white",
    provinces: [
      "กรุงเทพมหานคร", "นนทบุรี", "ปทุมธานี", "สมุทรปราการ", "สมุทรสาคร",
      "นครปฐม", "สุพรรณบุรี", "กาญจนบุรี", "พระนครศรีอยุธยา", "อ่างทอง",
      "ลพบุรี", "สิงห์บุรี", "ชัยนาท", "สระบุรี", "นครนายก",
    ],
  },
  {
    name: "ภาคตะวันออก",
    color: "bg-orange-500",
    textColor: "text-white",
    provinces: [
      "ชลบุรี", "ระยอง", "จันทบุรี", "ตราด", "ฉะเชิงเทรา",
      "ปราจีนบุรี", "สระแก้ว",
    ],
  },
  {
    name: "ภาคตะวันออกเฉียงเหนือ",
    color: "bg-amber-500",
    textColor: "text-white",
    provinces: [
      "นครราชสีมา", "บุรีรัมย์", "สุรินทร์", "ศรีสะเกษ", "อุบลราชธานี",
      "ยโสธร", "อำนาจเจริญ", "มุกดาหาร", "ร้อยเอ็ด", "กาฬสินธุ์",
      "สกลนคร", "นครพนม", "ขอนแก่น", "มหาสารคาม", "อุดรธานี",
      "หนองบัวลำภู", "เลย", "หนองคาย", "บึงกาฬ", "ชัยภูมิ",
    ],
  },
  {
    name: "ภาคตะวันตก",
    color: "bg-violet-500",
    textColor: "text-white",
    provinces: [
      "ตาก", "เพชรบุรี", "ประจวบคีรีขันธ์", "ราชบุรี", "สมุทรสงคราม",
    ],
  },
  {
    name: "ภาคใต้",
    color: "bg-teal-500",
    textColor: "text-white",
    provinces: [
      "ชุมพร", "ระนอง", "สุราษฎร์ธานี", "พังงา", "ภูเก็ต",
      "กระบี่", "ตรัง", "นครศรีธรรมราช", "พัทลุง", "สตูล",
      "สงขลา", "ปัตตานี", "ยะลา", "นราธิวาส",
    ],
  },
  {
    name: "ภาคเหนือตอนล่าง",
    color: "bg-cyan-500",
    textColor: "text-white",
    provinces: [
      "พิษณุโลก", "เพชรบูรณ์", "พิจิตร", "กำแพงเพชร", "นครสวรรค์",
      "อุทัยธานี", "สุโขทัย", "อุตรดิตถ์",
    ],
  },
];

// Flatten for quick lookup
const ALL_PROVINCES = REGIONS.flatMap((r) => r.provinces);

interface Props {
  visited: string[];          // list of province names the user has been to
  compact?: boolean;           // true → smaller tiles, used inside profile card
}

export default function ThailandProvinceMap({ visited, compact = false }: Props) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const visitedSet = new Set(visited);
  const visitedCount = visited.filter((p) => ALL_PROVINCES.includes(p)).length;
  const totalCount = ALL_PROVINCES.length; // 77

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`font-bold text-gray-800 dark:text-slate-200 ${compact ? "text-sm" : "text-base"}`}>
          แผนที่การเดินทาง
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[#398AB9]">{visitedCount}</span>
          <span className="text-xs text-gray-400 dark:text-slate-500">/ {totalCount} จังหวัด</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#398AB9] rounded-full transition-all"
          style={{ width: `${(visitedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Region tiles */}
      <div className="space-y-3">
        {REGIONS.map((region) => {
          const regionVisited = region.provinces.filter((p) => visitedSet.has(p));
          return (
            <div key={region.name}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${region.color}`} />
                <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">
                  {region.name}
                </span>
                {regionVisited.length > 0 && (
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-auto">
                    {regionVisited.length}/{region.provinces.length}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {region.provinces.map((prov) => {
                  const isVisited = visitedSet.has(prov);
                  return (
                    <button
                      key={prov}
                      onMouseEnter={() => setTooltip(prov)}
                      onMouseLeave={() => setTooltip(null)}
                      className={`relative px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        compact ? "px-1.5 py-0.5 text-[9px]" : ""
                      } ${
                        isVisited
                          ? `${region.color} ${region.textColor} shadow-sm scale-105`
                          : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-600"
                      }`}
                    >
                      {prov}
                      {tooltip === prov && isVisited && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                          ✓ เคยไปแล้ว
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {visitedCount === 0 && (
        <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-2">
          Check-in ที่สถานที่แรกเพื่อเริ่มแผนที่การเดินทางของคุณ 🗺️
        </p>
      )}
    </div>
  );
}
