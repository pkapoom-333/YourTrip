"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/server/actions/profile";
import { MapPin, Utensils, Coffee, Hotel, Compass, Mountain, Check, ChevronRight, Loader2, User, AtSign } from "lucide-react";

interface SuggestedUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  isGuide: boolean;
  _count: { followers: number };
}

interface Props {
  suggestedUsers: SuggestedUser[];
  defaultName?: string;
}

const INTERESTS = [
  { key: "attraction", label: "สถานที่เที่ยว", icon: MapPin, color: "bg-blue-100 text-blue-600 border-blue-200" },
  { key: "restaurant", label: "ร้านอาหาร", icon: Utensils, color: "bg-orange-100 text-orange-600 border-orange-200" },
  { key: "cafe", label: "คาเฟ่", icon: Coffee, color: "bg-amber-100 text-amber-600 border-amber-200" },
  { key: "hotel", label: "ที่พัก", icon: Hotel, color: "bg-purple-100 text-purple-600 border-purple-200" },
  { key: "activity", label: "กิจกรรม", icon: Compass, color: "bg-green-100 text-green-600 border-green-200" },
  { key: "nature", label: "ธรรมชาติ", icon: Mountain, color: "bg-teal-100 text-teal-600 border-teal-200" },
];

export default function OnboardingWizard({ suggestedUsers, defaultName = "" }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(defaultName);
  const [username, setUsername] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [followIds, setFollowIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggleInterest(key: string) {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleFollow(id: string) {
    setFollowIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleFinish() {
    if (!username.trim()) { setError("กรุณาใส่ชื่อผู้ใช้"); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError("ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ (3-20 ตัว)");
      return;
    }
    setError("");
    startTransition(async () => {
      const { ok, error: err } = await completeOnboarding({
        username: username.trim(),
        name: name.trim() || username,
        interests: selectedInterests,
        followUserIds: followIds,
      });
      if (!ok) { setError(err ?? "เกิดข้อผิดพลาด"); return; }
      router.push("/feed");
    });
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#398AB9] to-[#1C658C] z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-[#398AB9] transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-7">
          {/* Step indicator */}
          <p className="text-xs text-gray-400 mb-1">ขั้นตอนที่ {step} จาก 3</p>

          {/* Step 1: Name + Username */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">ยินดีต้อนรับสู่ Your Trip! 🎉</h2>
                <p className="text-sm text-gray-500 mt-1">มาเริ่มต้นด้วยการตั้งชื่อของคุณ</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">ชื่อที่แสดง</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ชื่อของคุณ"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#398AB9]/30 focus:border-[#398AB9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">ชื่อผู้ใช้ (Username)</label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="your_username"
                      maxLength={20}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#398AB9]/30 focus:border-[#398AB9] font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">ตัวอักษร a-z, ตัวเลข, _ เท่านั้น</p>
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>

              <button
                onClick={() => {
                  if (!username.trim()) { setError("กรุณาใส่ชื่อผู้ใช้"); return; }
                  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
                    setError("ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ (3-20 ตัว)");
                    return;
                  }
                  setError(""); setStep(2);
                }}
                className="w-full bg-[#398AB9] text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#1C658C] transition-colors"
              >
                ถัดไป <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">คุณชอบท่องเที่ยวแบบไหน?</h2>
                <p className="text-sm text-gray-500 mt-1">เลือกอย่างน้อย 1 อย่าง</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {INTERESTS.map(({ key, label, icon: Icon, color }) => {
                  const selected = selectedInterests.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleInterest(key)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                        selected
                          ? "border-[#398AB9] bg-[#398AB9]/5"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-[#398AB9] ml-auto" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  ย้อนกลับ
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#398AB9] text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#1C658C] transition-colors"
                >
                  ถัดไป <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Follow users */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">ติดตามนักท่องเที่ยว</h2>
                <p className="text-sm text-gray-500 mt-1">ข้ามได้ถ้าไม่ต้องการ</p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestedUsers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">ยังไม่มีผู้ใช้แนะนำ</p>
                ) : (
                  suggestedUsers.map((u) => {
                    const following = followIds.includes(u.id);
                    const initials = (u.name ?? u.username ?? "U").charAt(0).toUpperCase();
                    return (
                      <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                        <div className="w-10 h-10 bg-[#398AB9] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
                          ) : initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.name ?? u.username}</p>
                          <p className="text-xs text-gray-400">{u._count.followers} followers {u.isGuide ? "· 🏅 Guide" : ""}</p>
                        </div>
                        <button
                          onClick={() => toggleFollow(u.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            following
                              ? "bg-[#398AB9] text-white"
                              : "border border-[#398AB9] text-[#398AB9] hover:bg-[#398AB9]/5"
                          }`}
                        >
                          {following ? "✓ ติดตาม" : "ติดตาม"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  ย้อนกลับ
                </button>
                <button
                  onClick={handleFinish}
                  disabled={isPending}
                  className="flex-1 bg-[#398AB9] text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#1C658C] transition-colors disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  เริ่มเลย!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
