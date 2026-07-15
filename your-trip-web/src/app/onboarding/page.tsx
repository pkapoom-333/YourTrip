"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, Users, Loader2 } from "lucide-react";
import {
  followUser,
  getSuggestedUsers,
  completeOnboarding,
  type UserCard,
} from "@/server/actions/profile";
import { useUser } from "@/hooks/useUser";

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

/** Auto-generate a username slug from full name or email */
function makeUsername(name: string, email: string): string {
  const base = name
    ? name.toLowerCase().replace(/[^a-z0-9]/g, "")
    : email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return (base.slice(0, 12) || "traveler") + suffix;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [suggested, setSuggested] = useState<UserCard[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");

  // Pre-fill name/username from Google auth metadata
  useEffect(() => {
    if (!user) return;
    const googleName: string = (user.user_metadata?.full_name as string | undefined) ?? "";
    const email: string = user.email ?? "";
    if (!displayName) setDisplayName(googleName);
    if (!username) setUsername(makeUsername(googleName, email));
  }, [user]);

  function toggleInterest(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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

  async function finish() {
    setFinishing(true);
    setFinishError("");
    try {
      const result = await completeOnboarding({
        username: username.trim() || makeUsername(displayName, user?.email ?? ""),
        name: displayName.trim() || "นักเดินทาง",
        interests: Array.from(selected),
        followUserIds: Array.from(followed),
      });
      if (!result.ok) {
        // Username conflict — regenerate and retry once
        const retryUsername = makeUsername(displayName, user?.email ?? "");
        const retry = await completeOnboarding({
          username: retryUsername,
          name: displayName.trim() || "นักเดินทาง",
          interests: Array.from(selected),
          followUserIds: Array.from(followed),
        });
        if (!retry.ok) {
          setFinishError(retry.error ?? "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
          setFinishing(false);
          return;
        }
      }
    } catch {
      // Non-fatal — send to feed anyway so they're not stuck
    }
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

        {/* ─── Step 1: Name + Interests ─── */}
        {step === 1 && (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">
                ยินดีต้อนรับ! 👋
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                บอกเราว่าคุณชอบเที่ยวแบบไหน
              </p>
            </div>

            {/* Name + username quick edit */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wide">ชื่อที่แสดง</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ชื่อของคุณ"
                  maxLength={50}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder:text-gray-400 focus:outline-none focus:border-[#398AB9]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wide">ชื่อผู้ใช้</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username"
                    maxLength={30}
                    className="w-full pl-6 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder:text-gray-400 focus:outline-none focus:border-[#398AB9]"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">เลือกความสนใจอย่างน้อย 3 หัวข้อ</p>

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
              disabled={selected.size < 3 || !username.trim() || !displayName.trim()}
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

        {/* ─── Step 2: Follow suggested users ─── */}
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
                {suggested.map((u) => {
                  const isFollowed = followed.has(u.id);
                  const initials = (u.name ?? u.username ?? "U").charAt(0).toUpperCase();
                  return (
                    <div key={u.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name ?? ""} className="w-12 h-12 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-12 h-12 bg-[#398AB9] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{u.name ?? "นักเดินทาง"}</p>
                        {u.username && <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">@{u.username}</p>}
                        {u.bio && <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{u.bio}</p>}
                      </div>
                      <button
                        onClick={() => handleFollow(u.id)}
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

        {/* ─── Step 3: Done ─── */}
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
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>@{username} · เลือก {selected.size} ความสนใจ</span>
              </div>
              {followed.size > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>ติดตาม {followed.size} นักเดินทาง</span>
                </div>
              )}
            </div>

            {finishError && (
              <p className="mt-4 text-xs text-red-500">{finishError}</p>
            )}

            <button
              onClick={finish}
              disabled={finishing}
              className="mt-8 w-full max-w-xs py-4 rounded-2xl bg-[#398AB9] text-white font-bold text-base hover:bg-[#1C658C] disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {finishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังตั้งค่า...
                </>
              ) : (
                "เริ่มใช้งาน YourTrip →"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
