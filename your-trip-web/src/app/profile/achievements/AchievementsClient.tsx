
"use client";

import Link from "next/link";
import { ChevronLeft, Trophy, Lock } from "lucide-react";
import { Achievement } from "@/server/actions/profile";

interface Props { achievements: Achievement[] }

export default function AchievementsClient({ achievements }: Props) {
  const earned = achievements.filter((a) => a.earned);
  const pending = achievements.filter((a) => !a.earned);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">ความสำเร็จ</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            ได้รับแล้ว {earned.length}/{achievements.length} ป้าย
          </p>
        </div>
      </div>

      {/* Summary bar */}
      <div className="bg-gradient-to-r from-[#398AB9] to-[#1C658C] rounded-2xl p-5 mb-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-8 h-8 opacity-80" />
          <div>
            <p className="text-2xl font-bold">{earned.length}</p>
            <p className="text-sm opacity-80">ป้ายที่ได้รับ</p>
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: achievements.length ? `${Math.round(earned.length / achievements.length * 100)}%` : "0%" }}
          />
        </div>
        <p className="text-xs opacity-70 mt-1">{Math.round(earned.length / (achievements.length || 1) * 100)}% สำเร็จ</p>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">🏅 ได้รับแล้ว</h2>
          <div className="grid grid-cols-2 gap-3">
            {earned.map((a) => (
              <div key={a.id}
                className="bg-white dark:bg-slate-800 border border-[#398AB9]/20 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{a.emoji}</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">{a.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{a.description}</p>
                  <span className="inline-block mt-1.5 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium">
                    ✓ สำเร็จ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* In progress */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">🔒 ยังไม่ได้รับ</h2>
          <div className="grid grid-cols-2 gap-3">
            {pending.map((a) => (
              <div key={a.id}
                className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 flex items-start gap-3 opacity-70">
                <span className="text-3xl flex-shrink-0 grayscale">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-700 dark:text-slate-200">{a.title}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{a.description}</p>
                  {a.maxValue !== undefined && a.currentValue !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>{a.currentValue}/{a.maxValue}</span>
                        <span>{a.progress}%</span>
                      </div>
                      <div className="h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[#398AB9]/50 rounded-full transition-all"
                          style={{ width: `${a.progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
