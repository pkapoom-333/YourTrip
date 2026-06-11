"use client";

import { use, useState, useEffect } from "react";
import { getTripById } from "@/server/actions/trips";
import { MapPin, Clock, Wallet, Car, Printer, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

interface TripItem {
  id: string;
  name: string;
  time?: string;
  duration?: number;
  travelTimeTo?: number;
  cost?: number;
  note?: string;
  type: string;
}

interface TripDay {
  day: number;
  date: string;
  items: TripItem[];
}

function fmtMin(min: number) {
  if (min < 60) return `${min} นาที`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} ชม. ${m} นาที` : `${h} ชม.`;
}

function buildTextExport(
  title: string,
  destination: string,
  startDate: string,
  endDate: string,
  budget: number,
  days: TripDay[],
  tripId: string
): string {
  const header = [
    `📋 ${title}`,
    `📍 ${destination}`,
    startDate ? `🗓 ${startDate}${endDate ? ` – ${endDate}` : ""}` : "",
    budget > 0 ? `💰 งบ ฿${budget.toLocaleString()}` : "",
    "",
    "─".repeat(40),
  ].filter(Boolean).join("\n");

  const body = days.map((d) => {
    const dayHeader = `\n📅 วันที่ ${d.day}${d.date ? ` — ${d.date}` : ""}`;
    const items = d.items.map((item) => {
      const parts = [`  • ${item.time ? `[${item.time}] ` : ""}${item.name}`];
      if (item.duration) parts.push(`    ⏱ ${fmtMin(item.duration)}`);
      if (item.cost) parts.push(`    ฿ ${item.cost.toLocaleString()}`);
      if (item.note) parts.push(`    → ${item.note}`);
      return parts.join("\n");
    });
    return [dayHeader, ...items].join("\n");
  }).join("\n\n");

  const totalCost = days.flatMap((d) => d.items).reduce((s, i) => s + (i.cost ?? 0), 0);
  const footer = `\n${"─".repeat(40)}\n💸 ค่าใช้จ่ายรวม ฿${totalCost.toLocaleString()}${budget > 0 ? ` / งบ ฿${budget.toLocaleString()}` : ""}\n🔗 yourtrip.app/trips/${tripId}`;

  return [header, body, footer].join("\n");
}

const typeEmoji: Record<string, string> = {
  place: "📍",
  food: "🍽️",
  hotel: "🏨",
  transport: "✈️",
  activity: "🎯",
};

export default function TripPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [title, setTitle] = useState("แผนทริป");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState(0);
  const [days, setDays] = useState<TripDay[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const fmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    getTripById(id).then(({ data }) => {
      if (!data) return;
      setTitle(data.title);
      setDestination(data.destination);
      setStartDate(data.startDate ? fmt.format(data.startDate) : "");
      setEndDate(data.endDate ? fmt.format(data.endDate) : "");
      setBudget(data.budget ?? 0);
      setDays(
        data.days.map((d) => ({
          day: d.day,
          date: d.date ? fmt.format(d.date) : `วันที่ ${d.day}`,
          items: d.items.map((item) => ({
            id: item.id,
            name: item.name,
            time: item.time ?? undefined,
            duration: item.duration ?? undefined,
            travelTimeTo: item.travelTimeTo ?? undefined,
            cost: item.cost ?? undefined,
            note: item.note ?? undefined,
            type: "place",
          })),
        }))
      );
      setLoaded(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const totalCost = days.flatMap((d) => d.items).reduce((s, i) => s + (i.cost ?? 0), 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Print controls — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href={`/trips/${id}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </Link>
        <div className="flex-1" />
        <button
          onClick={async () => {
            const text = buildTextExport(title, destination, startDate, endDate, budget, days, id);
            await navigator.clipboard.writeText(text).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl border transition ${
            copied ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200 text-gray-600 hover:border-[#398AB9] hover:text-[#398AB9]"
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "คัดลอกแล้ว!" : "คัดลอกข้อความ"}
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-[#398AB9] text-white text-sm font-semibold rounded-xl hover:bg-[#1C658C] transition"
        >
          <Printer className="w-4 h-4" />
          พิมพ์ / PDF
        </button>
      </div>

      {/* Print content */}
      <div className="max-w-2xl mx-auto px-6 py-8 print:px-4 print:py-4">
        {/* Header */}
        <div className="mb-6 pb-4 border-b-2 border-[#398AB9]">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-[#398AB9]" />
                <span>{destination}</span>
              </div>
              {startDate && (
                <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-[#398AB9]" />
                  <span>{startDate}{endDate ? ` → ${endDate}` : ""}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">งบประมาณทั้งหมด</div>
              <div className="text-xl font-bold text-[#398AB9]">฿{totalCost.toLocaleString()}</div>
              {budget > 0 && (
                <div className="text-xs text-gray-400">/ ฿{budget.toLocaleString()}</div>
              )}
            </div>
          </div>
        </div>

        {/* Days */}
        {!loaded ? (
          <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
        ) : days.length === 0 ? (
          <p className="text-center text-gray-400 py-12">ยังไม่มีแผนการเดินทาง</p>
        ) : (
          <div className="space-y-8">
            {days.map((day) => {
              const dayCost = day.items.reduce((s, i) => s + (i.cost ?? 0), 0);
              return (
                <div key={day.day} className="print:break-inside-avoid">
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                    <div>
                      <h2 className="text-base font-bold text-gray-800">
                        วันที่ {day.day}
                        {day.date && <span className="text-sm font-normal text-gray-400 ml-2">{day.date}</span>}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Wallet className="w-3.5 h-3.5" />
                      <span className="font-medium">฿{dayCost.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-0">
                    {day.items.map((item, idx) => (
                      <div key={item.id}>
                        {/* Item row */}
                        <div className="flex items-start gap-3 py-2.5">
                          <div className="flex flex-col items-center w-8 flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-[#398AB9]/10 border-2 border-[#398AB9]/30 flex items-center justify-center text-[10px] font-bold text-[#398AB9]">
                              {idx + 1}
                            </div>
                            {idx < day.items.length - 1 && (
                              <div className="w-px flex-1 bg-gray-200 mt-1" style={{ minHeight: "16px" }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-gray-800">
                                {typeEmoji[item.type] ?? "📍"} {item.name}
                              </span>
                              {item.time && (
                                <span className="text-xs text-gray-400">{item.time}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              {item.duration !== undefined && (
                                <span className="text-xs text-gray-400">
                                  อยู่ {fmtMin(item.duration)}
                                </span>
                              )}
                              {item.cost !== undefined && (
                                <span className="text-xs text-gray-500 font-medium">
                                  ฿{item.cost.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {item.note && (
                              <p className="text-xs text-gray-400 mt-0.5 italic">{item.note}</p>
                            )}
                          </div>
                        </div>
                        {/* Travel connector */}
                        {idx < day.items.length - 1 && item.travelTimeTo !== undefined && (
                          <div className="flex items-center gap-3 pl-11 py-1">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Car className="w-3 h-3" />
                              <span>เดินทาง {fmtMin(item.travelTimeTo)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
          <span>สร้างด้วย YourTrip • your-trip-nu.vercel.app</span>
          <span className="print:block hidden">{new Date().toLocaleDateString("th-TH")}</span>
        </div>
      </div>
    </div>
  );
}
