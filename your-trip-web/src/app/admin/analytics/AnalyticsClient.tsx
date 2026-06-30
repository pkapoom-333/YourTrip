"use client";

import type { AdminAnalytics, DailyCount } from "@/server/actions/admin";
import { Users, FileText, MapPin, Tag, TrendingUp } from "lucide-react";

function LineChart({ data, color = "#398AB9" }: { data: DailyCount[]; color?: string }) {
  if (!data.length) return <div className="h-24 flex items-center justify-center text-xs text-gray-400">ไม่มีข้อมูล</div>;

  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 400;
  const H = 80;
  const padX = 4;
  const padY = 6;
  const innerW = W - 2 * padX;
  const innerH = H - 2 * padY;

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padY + innerH - (d.count / max) * innerH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillD = `${pathD} L${points[points.length - 1].x},${H} L${points[0].x},${H} Z`;

  const total = data.reduce((s, d) => s + d.count, 0);
  const avg = (total / data.length).toFixed(1);

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{total.toLocaleString()}</span>
        <span className="text-xs text-gray-400 dark:text-slate-500">รวม 30 วัน (เฉลี่ย {avg}/วัน)</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={fillD} fill={`url(#grad-${color.replace("#", "")})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Latest dot */}
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={color} />
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-600 mt-1">
        <span>{data[0]?.date?.slice(5) ?? ""}</span>
        <span>{data[data.length - 1]?.date?.slice(5) ?? ""}</span>
      </div>
    </div>
  );
}

function BarChart({ data, color = "#398AB9", labelKey = "tag", valueKey = "count" }: {
  data: Record<string, string | number>[];
  color?: string;
  labelKey?: string;
  valueKey?: string;
}) {
  if (!data.length) return <div className="text-xs text-gray-400 text-center py-4">ไม่มีข้อมูล</div>;
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1);

  return (
    <div className="flex flex-col gap-2">
      {data.map((item, i) => {
        const pct = (Number(item[valueKey]) / max) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 dark:text-slate-400 w-28 truncate flex-shrink-0">
              {String(item[labelKey])}
            </span>
            <div className="flex-1 h-4 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.75 + 0.25 * (1 - i / data.length) }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 w-8 text-right flex-shrink-0">
              {Number(item[valueKey]).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data }: { data: { type: string; count: number }[] }) {
  if (!data.length) return <div className="text-xs text-gray-400 text-center py-4">ไม่มีข้อมูล</div>;
  const total = data.reduce((s, d) => s + d.count, 0);
  const COLORS = ["#398AB9", "#1C658C", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  const TYPE_LABELS: Record<string, string> = { text: "ข้อความ", image: "รูปภาพ", video: "วิดีโอ", album: "อัลบัม" };

  let cumAngle = -90;
  const slices = data.map((d, i) => {
    const angle = (d.count / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    return { ...d, angle, start, color: COLORS[i % COLORS.length] };
  });

  const R = 50;
  const CX = 60;
  const CY = 60;
  const svgSlices = slices.map((s, i) => {
    const startRad = (s.start * Math.PI) / 180;
    const endRad = ((s.start + s.angle) * Math.PI) / 180;
    const x1 = CX + R * Math.cos(startRad);
    const y1 = CY + R * Math.sin(startRad);
    const x2 = CX + R * Math.cos(endRad);
    const y2 = CY + R * Math.sin(endRad);
    const large = s.angle > 180 ? 1 : 0;
    return (
      <path
        key={i}
        d={`M${CX},${CY} L${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
        fill={s.color}
        stroke="white"
        strokeWidth="1.5"
      />
    );
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-24 h-24 flex-shrink-0">
        {svgSlices}
        <circle cx={CX} cy={CY} r="28" fill="white" className="dark:fill-slate-800" />
        <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" className="fill-gray-700 dark:fill-slate-200" fontSize="9" fontWeight="600">
          {total}
        </text>
        <text x={CX} y={CY + 11} textAnchor="middle" dominantBaseline="middle" className="fill-gray-400" fontSize="6">
          โพสต์
        </text>
      </svg>
      <div className="flex flex-col gap-1.5 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-gray-600 dark:text-slate-400 truncate">
              {TYPE_LABELS[s.type] ?? s.type}
            </span>
            <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 ml-auto pl-2">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsClient({ data }: { data: AdminAnalytics }) {
  return (
    <div className="p-4 pt-16 md:pt-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#398AB9]/10 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[#398AB9]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">ข้อมูล 30 วันล่าสุด</p>
        </div>
      </div>

      {/* Growth charts */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">ผู้ใช้ใหม่</h2>
          </div>
          <LineChart data={data.usersByDay} color="#398AB9" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">โพสต์ใหม่</h2>
          </div>
          <LineChart data={data.postsByDay} color="#10B981" />
        </div>
      </div>

      {/* Content types + Top tags */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-violet-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">ประเภทโพสต์</h2>
          </div>
          <DonutChart data={data.contentTypes} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">แฮชแท็กยอดนิยม</h2>
          </div>
          <BarChart
            data={data.topTags as Record<string, string | number>[]}
            color="#F59E0B"
            labelKey="tag"
            valueKey="count"
          />
        </div>
      </div>

      {/* Top places */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">สถานที่ยอดนิยม</h2>
          <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto">(เรียงตามจำนวน Wishlist)</span>
        </div>
        {data.topPlaces.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">ไม่มีข้อมูล</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 pb-2 pr-4">#</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 pb-2 pr-4">สถานที่</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 pb-2 pr-4">Wishlist</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 pb-2">รีวิว</th>
                </tr>
              </thead>
              <tbody>
                {data.topPlaces.map((p, i) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                    <td className="py-2.5 pr-4 text-xs text-gray-400 dark:text-slate-500 font-mono">{i + 1}</td>
                    <td className="py-2.5 pr-4">
                      <a href={`/admin/places`} className="text-sm font-medium text-gray-800 dark:text-slate-200 hover:text-[#398AB9] transition-colors truncate block max-w-[200px]">
                        {p.name}
                      </a>
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <span className="text-sm font-semibold text-[#398AB9]">{p.saveCount.toLocaleString()}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-sm text-gray-600 dark:text-slate-400">{p.reviewCount.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
