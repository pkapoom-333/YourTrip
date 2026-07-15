"use client";

/**
 * ProfileCompletionCard — shows a % completion bar + checklist
 * to nudge new users to fill in their profile and engage with features.
 * Hidden once all steps are complete.
 */

import Link from "next/link";
import { CheckCircle2, Circle, ChevronRight, X } from "lucide-react";
import { useState } from "react";

interface Step {
  id: string;
  label: string;
  hint: string;
  href: string;
  done: boolean;
}

interface Props {
  hasAvatar: boolean;
  hasBio: boolean;
  hasPost: boolean;
  hasTrip: boolean;
  hasFollow: boolean;
  hasCheckIn: boolean;
}

export default function ProfileCompletionCard({
  hasAvatar, hasBio, hasPost, hasTrip, hasFollow, hasCheckIn,
}: Props) {
  const [dismissed, setDismissed] = useState(false);

  const steps: Step[] = [
    { id: "avatar", label: "เพิ่มรูปโปรไฟล์", hint: "ทำให้คนจำคุณได้", href: "/profile/edit", done: hasAvatar },
    { id: "bio", label: "เพิ่ม Bio", hint: "บอกเล่าว่าคุณชอบท่องเที่ยวแบบไหน", href: "/profile/edit", done: hasBio },
    { id: "post", label: "สร้างโพสต์แรก", hint: "แชร์ประสบการณ์การเดินทาง", href: "/create", done: hasPost },
    { id: "trip", label: "สร้างทริปแรก", hint: "วางแผนการเดินทางครั้งต่อไป", href: "/trips/new", done: hasTrip },
    { id: "follow", label: "ติดตามใครสักคน", hint: "ค้นพบนักเดินทางที่น่าสนใจ", href: "/discover", done: hasFollow },
    { id: "checkin", label: "เช็คอินสถานที่แรก", hint: "บันทึกสถานที่ที่คุณไปมาแล้ว", href: "/explore", done: hasCheckIn },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  // Hide if all done or dismissed
  if (doneCount === steps.length || dismissed) return null;

  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="bg-gradient-to-br from-[#398AB9]/8 to-[#1C658C]/5 dark:from-[#398AB9]/15 dark:to-[#1C658C]/10 border border-[#398AB9]/20 rounded-2xl p-4 mb-4 relative">
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
        aria-label="ปิด"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pr-6">
        <span className="text-lg">🚀</span>
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-slate-200">ตั้งค่าโปรไฟล์ของคุณ</p>
          <p className="text-[11px] text-gray-500 dark:text-slate-400">{doneCount}/{steps.length} ขั้นตอน</p>
        </div>
        <span className="ml-auto text-sm font-bold text-[#398AB9]">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/60 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-[#398AB9] rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {steps.map((step) => (
          step.done ? (
            <div key={step.id} className="flex items-center gap-2 opacity-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-gray-500 dark:text-slate-400 line-through">{step.label}</span>
            </div>
          ) : (
            <Link
              key={step.id}
              href={step.href}
              className={`flex items-center gap-2 group ${step.id === nextStep?.id ? "" : "opacity-60"}`}
            >
              <Circle className="w-4 h-4 text-gray-300 dark:text-slate-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{step.label}</span>
                {step.id === nextStep?.id && (
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{step.hint}</p>
                )}
              </div>
              {step.id === nextStep?.id && (
                <ChevronRight className="w-3.5 h-3.5 text-[#398AB9] flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              )}
            </Link>
          )
        ))}
      </div>
    </div>
  );
}
