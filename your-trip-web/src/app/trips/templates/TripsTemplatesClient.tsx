
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, MapPin, Tag, ChevronDown, ChevronUp, Wand2, Check } from "lucide-react";
import { TripTemplate, createTripFromTemplate } from "@/server/actions/trips";
import { useToast } from "@/components/shared/Toast";

const TYPE_ICON: Record<string, string> = {
  place: "📍", food: "🍽️", hotel: "🏨", transport: "🚌", activity: "🎯",
};

interface Props { templates: TripTemplate[] }

export default function TripsTemplatesClient({ templates }: Props) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "1-2" | "3-4" | "5+">("all");

  function filtered() {
    return templates.filter((t) => {
      if (filter === "all") return true;
      if (filter === "1-2") return t.duration <= 2;
      if (filter === "3-4") return t.duration >= 3 && t.duration <= 4;
      if (filter === "5+") return t.duration >= 5;
      return true;
    });
  }

  function create(templateId: string) {
    setCreatingId(templateId);
    startTransition(async () => {
      const res = await createTripFromTemplate(templateId);
      setCreatingId(null);
      if (res.error) { error(res.error); return; }
      success("สร้างทริปจาก template แล้ว! ✅");
      router.push(`/trips/${res.data!.id}`);
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/trips" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">เทมเพลตทริป</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">เลือกเทมเพลตสำเร็จรูป แล้วปรับแต่งได้ตามใจ</p>
        </div>
      </div>

      {/* Duration filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(["all", "1-2", "3-4", "5+"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? "bg-[#398AB9] text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"}`}>
            {f === "all" ? "ทั้งหมด" : f === "1-2" ? "1–2 วัน" : f === "3-4" ? "3–4 วัน" : "5+ วัน"}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {filtered().map((tpl) => {
          const isExpanded = expandedId === tpl.id;
          const isCreating = creatingId === tpl.id;

          return (
            <div key={tpl.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              {/* Cover */}
              <div className="relative h-40">
                <Image src={tpl.coverImage} alt={tpl.title} fill className="object-cover" sizes="400px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h2 className="text-white font-bold text-base leading-tight">{tpl.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5 text-white/80 text-xs">
                      <MapPin className="w-3 h-3" />{tpl.destination}
                    </span>
                    <span className="flex items-center gap-0.5 text-white/80 text-xs">
                      <Clock className="w-3 h-3" />{tpl.duration} วัน
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tpl.tags.map((tag) => (
                    <span key={tag} className="text-[11px] bg-[#398AB9]/10 text-[#398AB9] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" />{tag}
                    </span>
                  ))}
                </div>

                {/* Highlights */}
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                  ✨ {tpl.highlights.join(" · ")}
                </p>

                {/* Expand/collapse days */}
                <button onClick={() => setExpandedId(isExpanded ? null : tpl.id)}
                  className="text-xs text-[#398AB9] flex items-center gap-1 mb-3 hover:underline">
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {isExpanded ? "ซ่อนแผน" : "ดูแผนการเดินทาง"}
                </button>

                {isExpanded && (
                  <div className="mb-4 space-y-3">
                    {tpl.days.map((d) => (
                      <div key={d.day}>
                        <p className="text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                          วันที่ {d.day} — {d.theme}
                        </p>
                        <div className="space-y-1 pl-2 border-l-2 border-[#398AB9]/20">
                          {d.items.map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-sm flex-shrink-0">{TYPE_ICON[item.type] ?? "📍"}</span>
                              <div className="min-w-0">
                                <p className="text-xs text-gray-700 dark:text-slate-200 font-medium leading-tight">{item.name}</p>
                                {item.time && <span className="text-[10px] text-gray-400">{item.time}</span>}
                                {item.note && <p className="text-[10px] text-gray-400 italic">{item.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Create button */}
                <button onClick={() => create(tpl.id)} disabled={pending || !!creatingId}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#398AB9] text-white rounded-xl text-sm font-semibold hover:bg-[#1C658C] transition-colors disabled:opacity-60">
                  {isCreating ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังสร้าง...</>
                  ) : (
                    <><Wand2 className="w-4 h-4" /> ใช้เทมเพลตนี้</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered().length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-slate-500">
          <p>ไม่มีเทมเพลตในหมวดนี้</p>
        </div>
      )}
    </div>
  );
}
