"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronLeft, Users } from "lucide-react";
import { createExpenseGroup } from "@/server/actions/expense";

const EMOJIS = ["💰", "🍕", "✈️", "🏕️", "🎉", "🏖️", "🛍️", "🍺", "🎮", "🏠"];
const COLORS = ["#398AB9", "#FF6B6B", "#6BCB77", "#FFD93D", "#C77DFF", "#FF9A3C", "#4ECDC4", "#FF6FD8"];

interface Member {
  name: string;
  promptPay: string;
  bankAccount: string;
  bankName: string;
  color: string;
}

export default function NewExpenseGroupClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("💰");
  const [members, setMembers] = useState<Member[]>([
    { name: "", promptPay: "", bankAccount: "", bankName: "", color: COLORS[0] },
    { name: "", promptPay: "", bankAccount: "", bankName: "", color: COLORS[1] },
  ]);
  const [error, setError] = useState<string | null>(null);

  const addMember = () => {
    setMembers([...members, { name: "", promptPay: "", bankAccount: "", bankName: "", color: COLORS[members.length % COLORS.length] }]);
  };

  const updateMember = (i: number, field: keyof Member, value: string) => {
    setMembers(members.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  const removeMember = (i: number) => {
    if (members.length <= 2) return;
    setMembers(members.filter((_, idx) => idx !== i));
  };

  const handleSubmit = () => {
    if (!name.trim()) { setError("กรุณาใส่ชื่อกลุ่ม"); return; }
    const validMembers = members.filter((m) => m.name.trim());
    if (validMembers.length < 2) { setError("กรุณาใส่สมาชิกอย่างน้อย 2 คน"); return; }

    startTransition(async () => {
      try {
        const group = await createExpenseGroup({ name: name.trim(), description: description.trim() || undefined, emoji, members: validMembers });
        router.push(`/expense/${group.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      }
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">สร้างกลุ่มหาร</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Group Info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">ข้อมูลกลุ่ม</h2>

        {/* Emoji picker */}
        <div className="flex gap-2 flex-wrap mb-3">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl text-xl transition-all ${emoji === e ? "bg-[#398AB9]/20 ring-2 ring-[#398AB9]" : "bg-gray-50 dark:bg-slate-700 hover:bg-gray-100"}`}
            >
              {e}
            </button>
          ))}
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อกลุ่ม เช่น ทริปเชียงใหม่"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#398AB9]"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="คำอธิบาย (ไม่บังคับ)"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#398AB9]"
        />
      </div>

      {/* Members */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> สมาชิก ({members.length} คน)
          </h2>
          <button onClick={addMember} className="text-xs text-[#398AB9] font-medium flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> เพิ่ม
          </button>
        </div>

        <div className="space-y-4">
          {members.map((m, i) => (
            <div key={i} className="border border-gray-100 dark:border-slate-700 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: m.color }} />
                <input
                  value={m.name}
                  onChange={(e) => updateMember(i, "name", e.target.value)}
                  placeholder={`ชื่อสมาชิก ${i + 1}`}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#398AB9]"
                />
                {members.length > 2 && (
                  <button onClick={() => removeMember(i)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Color picker */}
              <div className="flex gap-1.5 mb-2 pl-8">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => updateMember(i, "color", c)}
                    className={`w-5 h-5 rounded-full transition-all ${m.color === c ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}
                    style={{ background: c }}
                  />
                ))}
              </div>

              <div className="pl-8 space-y-1.5">
                <input
                  value={m.promptPay}
                  onChange={(e) => updateMember(i, "promptPay", e.target.value)}
                  placeholder="พร้อมเพย์ (เบอร์หรือบัตรประชาชน)"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-xs text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#398AB9]"
                />
                <div className="flex gap-1.5">
                  <input
                    value={m.bankName}
                    onChange={(e) => updateMember(i, "bankName", e.target.value)}
                    placeholder="ธนาคาร"
                    className="w-1/3 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-xs text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#398AB9]"
                  />
                  <input
                    value={m.bankAccount}
                    onChange={(e) => updateMember(i, "bankAccount", e.target.value)}
                    placeholder="เลขบัญชี"
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-xs text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#398AB9]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-[#398AB9] text-white py-3 rounded-2xl font-semibold disabled:opacity-60"
      >
        {isPending ? "กำลังสร้าง..." : "สร้างกลุ่ม"}
      </button>
    </div>
  );
}
