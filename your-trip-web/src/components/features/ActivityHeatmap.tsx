"use client";

import { useMemo } from "react";

interface Props {
  /** Array of ISO date strings (YYYY-MM-DD) when the user posted / checked in */
  dates: string[];
  /** Number of weeks to show (default 26 = ~6 months) */
  weeks?: number;
  label?: string;
}

const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] as const;
const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."] as const;

function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function intensityClass(count: number): string {
  if (count === 0) return "bg-gray-100 dark:bg-slate-700";
  if (count === 1) return "bg-[#398AB9]/30";
  if (count === 2) return "bg-[#398AB9]/55";
  if (count === 3) return "bg-[#398AB9]/75";
  return "bg-[#398AB9]";
}

export function ActivityHeatmap({ dates, weeks = 26, label = "กิจกรรม" }: Props) {
  const { grid, monthLabels, totalCount, streak } = useMemo(() => {
    // Count per day
    const counts: Record<string, number> = {};
    for (const d of dates) {
      const key = d.slice(0, 10); // ensure YYYY-MM-DD
      counts[key] = (counts[key] ?? 0) + 1;
    }

    // Build grid: columns = weeks, rows = 7 days (Sun–Sat)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // start from the first Sunday on or before (today - (weeks*7 - 1) days)
    const endSunday = new Date(today);
    // roll forward to next Saturday so the last column is current week
    const dayOfWeek = today.getDay(); // 0=Sun
    endSunday.setDate(endSunday.getDate() + (6 - dayOfWeek));

    const startDate = new Date(endSunday);
    startDate.setDate(startDate.getDate() - (weeks * 7 - 1));

    const cols: Array<Array<{ date: string; count: number; isToday: boolean; isFuture: boolean }>> = [];
    const monthLabelsList: Array<{ label: string; col: number }> = [];
    let lastMonth = -1;

    const todayStr = toLocalDateString(today);

    for (let w = 0; w < weeks; w++) {
      const col: typeof cols[0] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + w * 7 + d);
        const dateStr = toLocalDateString(date);
        const isFuture = date > today;
        col.push({
          date: dateStr,
          count: isFuture ? 0 : (counts[dateStr] ?? 0),
          isToday: dateStr === todayStr,
          isFuture,
        });
        if (date.getMonth() !== lastMonth && d === 0) {
          monthLabelsList.push({ label: MONTHS_TH[date.getMonth()], col: w });
          lastMonth = date.getMonth();
        }
      }
      cols.push(col);
    }

    // Calculate current streak (backwards from today)
    let streak = 0;
    const check = new Date(today);
    while (true) {
      const k = toLocalDateString(check);
      if ((counts[k] ?? 0) > 0) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else break;
    }

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
    return { grid: cols, monthLabels: monthLabelsList, totalCount, streak };
  }, [dates, weeks]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">{label}</h3>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
            {totalCount} ครั้ง · streak {streak} วัน
          </p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500">
          <span>น้อย</span>
          {[0, 1, 2, 3, 4].map((v) => (
            <span key={v} className={`w-3 h-3 rounded-sm inline-block ${intensityClass(v)}`} />
          ))}
          <span>มาก</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="relative mb-1 overflow-x-auto">
        <div className="flex" style={{ gap: 3 }}>
          {/* Day labels column */}
          <div className="flex flex-col" style={{ gap: 3 }}>
            <div className="h-4" /> {/* spacer for month row */}
            {DAYS.map((day, i) => (
              <div key={day} className="w-7 h-3 flex items-center">
                {(i % 2 === 1) && (
                  <span className="text-[9px] text-gray-300 dark:text-slate-600 leading-none">{day}</span>
                )}
              </div>
            ))}
          </div>

          {/* Columns */}
          {grid.map((col, wi) => {
            const monthLabel = monthLabels.find((m) => m.col === wi);
            return (
              <div key={wi} className="flex flex-col" style={{ gap: 3 }}>
                {/* Month label */}
                <div className="h-4 flex items-center">
                  {monthLabel && (
                    <span className="text-[9px] text-gray-400 dark:text-slate-500 whitespace-nowrap leading-none">
                      {monthLabel.label}
                    </span>
                  )}
                </div>
                {/* Day cells */}
                {col.map((cell) => (
                  <div
                    key={cell.date}
                    title={`${cell.date}: ${cell.count} ${label}`}
                    className={[
                      "w-3 h-3 rounded-sm transition-transform hover:scale-125 cursor-default",
                      cell.isFuture ? "opacity-0" : intensityClass(cell.count),
                      cell.isToday ? "ring-1 ring-[#398AB9] ring-offset-0" : "",
                    ].join(" ")}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
