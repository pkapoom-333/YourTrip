"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, Users } from "lucide-react";
import { followUser, getSuggestedUsers, type UserCard } from "@/server/actions/profile";
import { Avatar } from "@/components/shared/Avatar";

const INTERESTS = [
  { id: "attraction", emoji: "🏔️", label: "สถานที่เที่ยว" },
  { id: "restaurant", emoji: "🍜", label: "ร้านอาหาร" },
  { id: "cafe",       emoji: "☕", label: "คาเฟ่" },
  { id: "nature",     emoji: "🌿", label: "ธรรมชาติ" },
  { id: "culture",    emoji: "🏛️", label: "วัฒนธรรม" },
  { id: "adventure",  emoji: "🧗", label: "Adventure" },
  { id: "beach",      emoji: "🏖️", label: "ทะเล/หาดทราย" },
  { id: "food",       emoji: "🍱", label: "Street Food" },
  { id: "city",       emoji: "🏙️", label: "City Trip" },
  { id: "solo",       emoji: "✈️", label: "Solo Travel" },
  { id: "family",     emoji: "👨‍👩‍👧", label: "ครอบครัว" },
  { id: "budget",     emoji: "💰", label: "เที่ยวประหยัด" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [suggested, setSuggested] = useState<UserCard[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [loadingSuggested, setLoadingSuggested] = useState(false);

  function toggleInterest(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function goToStep2() {
    setStep(2);
    setLoadingSuggested(true);
    const { data } = await getSuggestedUsers(6);
    setSuggested(data);
    setLoadingSuggested(false);
  }

  async function handleFollow(userId: string) {
    if (followed.has(userId)) return;
    setFollowed((prev) => new Set(prev).add(userId));
    await followUser(userId);
  }

  function finish() {
    // Mark onboarding done in localStorage to not show again
    if (typeof window !== "undefined") {
      localStorage.setItem("yt_onboarded", "1");
    }
    router.push("/feed");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#398AB9]/5 to-white dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 pt-10 pb-4 flex items-center gap-2">
        <div className="w-9 h-9 bg-[#398AB9] rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">✈️</span>
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-slate-100">YourTrip</span>
      </div>

      {/* Progress bar */}
      <div className="px-6 mb-6">
        <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#398AB9] rounded-full transition-all duration-500"
            style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">{step} / 3</p>
      </div>

      <div className="flex-1 px-6 pb-8 flex flex-col max-w-lg mx-auto w-full">
        {/* Step 1: Interests */}
        {step === 1 && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                คุณชอบเที่ยวแบบไหน?
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                เลือกอย่างน้อย 3 หัวข้อที่ตรงกับสไตล์ของคุณ
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 flex-1">
              {INTERESTS.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all aspect-square ${
                      isSelected
                        ? "border-[#398AB9] bg-[#398AB9]/10 dark:bg-[#398AB9]/20"
                        : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#398AB9] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-2xl mb-1">{item.emoji}</span>
                    <span className={`text-[10px] font-semibold text-center leading-tight ${
                      isSelected ? "text-[#398AB9]" : "text-gray-600 dark:text-slate-400"
                    }`}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={goToStep2}
              disabled={selected.size < 3}
              className="mt-6 w-full py-4 rounded-2xl bg-[#398AB9] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1C658C] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ถัดไป
              <ChevronRight className="w-4 h-4" />
            </button>
            {selected.size < 3 && (
              <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-2">
                เลือกอีก {3 - selected.size} หัวข้อ
              </p>
            )}
          </>
        )}

        {/* Step 2: Follow suggested users */}
        {step === 2 && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                ติดตามนักเดินทาง
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                ติดตามเพื่อเห็นโพสต์ของพวกเขาใน Feed ของคุณ
              </p>
            </div>

            {loadingSuggested ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-32" />
                      <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded w-24" />
                    </div>
                    <div className="h-8 w-20 bg-gray-100 dark:bg-slate-700 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : suggested.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 dark:text-slate-500">
                <Users className="w-10 h-10 opacity-30" />
                <p className="text-sm">ยังไม่มีนักเดินทางแนะนำ</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 flex-1">
                {suggested.map((user) => {
                  const isFollowed = followed.has(user.id);
                  const initials = (user.name ?? user.username ?? "U").charAt(0).toUpperCase();
                  return (
                    <div key={user.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-3">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name ?? ""} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-[#398AB9] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{user.name ?? "นักเดินทาง"}</p>
                        {user.username && <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">@{user.username}</p>}
                        {user.bio && <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{user.bio}</p>}
                      </div>
                      <button
                        onClick={() => handleFollow(user.id)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          isFollowed
                            ? "border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400"
                            : "bg-[#398AB9] text-white hover:bg-[#1C658C]"
                        }`}
                      >
                        {isFollowed ? "ติดตามอยู่" : "ติดตาม"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-600 dark:text-slate-400 hover:border-gray-300 transition"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-2xl bg-[#398AB9] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1C658C] transition"
              >
                ถัดไป
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-24 h-24 bg-[#398AB9]/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-5xl">🎉</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              ยินดีต้อนรับสู่ YourTrip!
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs mb-2">
              โปรไฟล์ของคุณพร้อมแล้ว ค้นพบสถานที่ที่คุณชอบ แชร์ประสบการณ์ และวางแผนทริปในฝัน
            </p>
            <div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3">
                <Check className="w-4 h-4 text-green-500" />
                เลือก {selected.size} ความสนใจแล้ว
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3">
                <Check className="w-4 h-4 text-green-500" />
                ติดตาม {followed.size} นักเดินทาง
              </div>
            </div>
            <button
              onClick={finish}
              className="mt-8 w-full max-w-xs py-4 rounded-2xl bg-[#398AB9] text-white font-bold text-base hover:bg-[#1C658C] transition"
            >
              เริ่มใช้งาน YourTrip →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
