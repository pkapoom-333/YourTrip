"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Scale, Receipt, Users, Copy, ArrowRight, Share2, RefreshCw, X } from "lucide-react";
import { addExpense, deleteExpense, recordPayment, regenerateInviteCode } from "@/server/actions/expense";
import type { MemberBalance, SimplifiedDebt } from "@/server/actions/expense";

type Group = {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  inviteCode?: string | null;
  members: Array<{
    id: string; name: string; color: string; avatarUrl: string | null;
    promptPay: string | null; bankAccount: string | null; bankName: string | null;
  }>;
  expenses: Array<{
    id: string; name: string; amount: number; category: string; notes: string | null; date: Date;
    paidBy: { id: string; name: string; color: string };
    splits: Array<{ id: string; memberId: string; amount: number; isPaid: boolean; member: { name: string } }>;
  }>;
};

const CATEGORIES = [
  { value: "general", label: "ทั่วไป", emoji: "📦" },
  { value: "food", label: "อาหาร", emoji: "🍕" },
  { value: "transport", label: "เดินทาง", emoji: "🚗" },
  { value: "accommodation", label: "ที่พัก", emoji: "🏨" },
  { value: "activity", label: "กิจกรรม", emoji: "🎯" },
  { value: "shopping", label: "ช้อปปิ้ง", emoji: "🛍️" },
  { value: "other", label: "อื่นๆ", emoji: "💫" },
];

function getCategoryEmoji(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.emoji ?? "📦";
}

function formatBaht(amount: number) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export default function ExpenseGroupClient({
  group,
  balances,
  simplifiedDebts,
}: {
  group: Group;
  balances: MemberBalance[];
  simplifiedDebts: SimplifiedDebt[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"expenses" | "summary" | "members">("expenses");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Add expense form state
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPaidBy, setExpPaidBy] = useState(group.members[0]?.id ?? "");
  const [expCategory, setExpCategory] = useState("general");
  const [expNotes, setExpNotes] = useState("");
  const [expError, setExpError] = useState<string | null>(null);

  const totalExpenses = group.expenses.reduce((s, e) => s + e.amount, 0);
  const [showShare, setShowShare] = useState(false);
  const [inviteCode, setInviteCode] = useState(group.inviteCode ?? "");
  const [copied, setCopied] = useState(false);

  function getShareUrl() {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/expense/join/${inviteCode}`;
  }

  function copyShareLink() {
    navigator.clipboard.writeText(getShareUrl()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleRegenCode() {
    startTransition(async () => {
      const { inviteCode: newCode } = await regenerateInviteCode(group.id);
      setInviteCode(newCode);
    });
  }

  const handleAddExpense = () => {
    const amount = parseFloat(expAmount);
    if (!expName.trim()) { setExpError("กรุณาใส่ชื่อรายการ"); return; }
    if (isNaN(amount) || amount <= 0) { setExpError("กรุณาใส่จำนวนเงิน"); return; }
    setExpError(null);

    startTransition(async () => {
      await addExpense({
        groupId: group.id,
        name: expName.trim(),
        amount,
        paidById: expPaidBy,
        splitType: "equal",
        notes: expNotes.trim() || undefined,
        category: expCategory,
      });
      setExpName(""); setExpAmount(""); setExpNotes(""); setExpError(null);
      setShowAddExpense(false);
      router.refresh();
    });
  };

  const handleDeleteExpense = (expId: string) => {
    if (!confirm("ลบรายการนี้?")) return;
    startTransition(async () => {
      await deleteExpense(expId, group.id);
      router.refresh();
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl">{group.emoji}</span>
            <div className="min-w-0">
              <h1 className="font-bold text-gray-900 dark:text-white truncate">{group.name}</h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">{group.members.length} คน · รวม {formatBaht(totalExpenses)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowShare(true)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800" title="แชร์กลุ่ม">
              <Share2 className="w-4 h-4 text-gray-600 dark:text-slate-400" />
            </button>
            <button onClick={() => setShowAddExpense(true)} className="flex items-center gap-1 bg-[#398AB9] text-white px-3 py-1.5 rounded-xl text-sm font-medium">
              <Plus className="w-4 h-4" /> เพิ่ม
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
          {(["expenses", "summary", "members"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${tab === t ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-slate-400"}`}
            >
              {t === "expenses" ? "รายการ" : t === "summary" ? "สรุป" : "สมาชิก"}
            </button>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-slate-800 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#398AB9]" />
                <h2 className="font-semibold text-gray-900 dark:text-white">แชร์กลุ่ม</h2>
              </div>
              <button onClick={() => setShowShare(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">ลิงก์เชิญเข้าร่วมกลุ่ม</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-slate-300 truncate font-mono">
                    {typeof window !== "undefined" ? getShareUrl() : `yourtrip.co/expense/join/${inviteCode}`}
                  </div>
                  <button
                    onClick={copyShareLink}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      copied ? "bg-green-100 text-green-700" : "bg-[#398AB9] text-white hover:bg-[#1C658C]"
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? "คัดลอกแล้ว!" : "คัดลอก"}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-2">
                  ใครก็ตามที่มีลิงก์นี้สามารถเข้าร่วมกลุ่มได้
                </p>
                <button
                  onClick={handleRegenCode}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-red-500 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
                  สร้างลิงก์ใหม่ (ลิงก์เดิมจะใช้ไม่ได้)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={(e) => { if (e.target === e.currentTarget) setShowAddExpense(false); }}>
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl mx-auto rounded-t-3xl p-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">เพิ่มรายการ</h2>
              <button onClick={() => setShowAddExpense(false)} className="text-gray-400 text-xl">✕</button>
            </div>

            {expError && <p className="text-xs text-red-500 mb-3">{expError}</p>}

            <div className="space-y-3">
              <input value={expName} onChange={(e) => setExpName(e.target.value)} placeholder="ชื่อรายการ เช่น อาหารเช้า"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#398AB9]" />

              <input value={expAmount} onChange={(e) => setExpAmount(e.target.value)} type="number" placeholder="จำนวนเงิน (บาท)"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#398AB9]" />

              <div>
                <label className="text-xs text-gray-500 dark:text-slate-400 mb-1.5 block">ใครจ่าย</label>
                <div className="flex gap-2 flex-wrap">
                  {group.members.map((m) => (
                    <button key={m.id} onClick={() => setExpPaidBy(m.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${expPaidBy === m.id ? "text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"}`}
                      style={expPaidBy === m.id ? { backgroundColor: m.color } : undefined}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button key={c.value} onClick={() => setExpCategory(c.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${expCategory === c.value ? "bg-[#398AB9] text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"}`}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>

              <input value={expNotes} onChange={(e) => setExpNotes(e.target.value)} placeholder="หมายเหตุ (ไม่บังคับ)"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#398AB9]" />

              <button onClick={handleAddExpense} disabled={isPending}
                className="w-full bg-[#398AB9] text-white py-3 rounded-xl font-semibold disabled:opacity-60">
                {isPending ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="px-3 pt-3">
        {tab === "expenses" && (
          <div className="space-y-2">
            {group.expenses.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">ยังไม่มีรายการ กด + เพื่อเพิ่ม</p>
              </div>
            ) : (
              group.expenses.map((exp) => (
                <div key={exp.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{getCategoryEmoji(exp.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white truncate">{exp.name}</span>
                        <span className="font-bold text-[#398AB9] flex-shrink-0">{formatBaht(exp.amount)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: exp.paidBy.color }}>
                          {exp.paidBy.name} จ่าย
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          หารเท่ากัน {formatBaht(exp.amount / group.members.length)}/คน
                        </span>
                      </div>
                      {exp.notes && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{exp.notes}</p>}
                    </div>
                    <button onClick={() => handleDeleteExpense(exp.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "summary" && (
          <div className="space-y-3">
            {/* Balance cards */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <Scale className="w-4 h-4" /> ยอดคงเหลือ
              </h3>
              <div className="space-y-2">
                {balances.map((b) => (
                  <div key={b.memberId} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: b.color }}>
                      {b.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{b.name}</div>
                      <div className="text-xs text-gray-400 dark:text-slate-500">จ่ายแล้ว {formatBaht(b.totalPaid)}</div>
                    </div>
                    <div className={`text-sm font-bold ${b.netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                      {b.netBalance >= 0 ? "+" : ""}{formatBaht(b.netBalance)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simplified debts */}
            {simplifiedDebts.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">ต้องโอนเงิน</h3>
                <div className="space-y-3">
                  {simplifiedDebts.map((d, i) => (
                    <div key={i} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{d.fromName}</span>
                        <ArrowRight className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{d.toName}</span>
                        <span className="ml-auto text-sm font-bold text-amber-600 dark:text-amber-400">{formatBaht(d.amount)}</span>
                      </div>

                      {/* Payment info */}
                      {d.toPromptPay && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                          <span className="text-green-600 font-medium">พร้อมเพย์:</span>
                          <span>{d.toPromptPay}</span>
                          <button onClick={() => navigator.clipboard.writeText(d.toPromptPay ?? "")} className="text-gray-400 hover:text-gray-600">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {d.toBankAccount && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                          <span className="text-blue-600 font-medium">{d.toBankName || "ธนาคาร"}:</span>
                          <span>{d.toBankAccount}</span>
                          <button onClick={() => navigator.clipboard.writeText(d.toBankAccount ?? "")} className="text-gray-400 hover:text-gray-600">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {simplifiedDebts.length === 0 && balances.length > 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-sm">
                ✅ ทุกคนเท่าเทียม ไม่ต้องโอนเงิน!
              </div>
            )}
          </div>
        )}

        {tab === "members" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            {group.members.map((m, i) => (
              <div key={m.id} className={`p-4 ${i > 0 ? "border-t border-gray-50 dark:border-slate-700" : ""}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: m.color }}>
                    {m.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{m.name}</div>
                    {!m.promptPay && !m.bankAccount && (
                      <div className="text-xs text-gray-400 dark:text-slate-500">ยังไม่มีข้อมูลการชำระเงิน</div>
                    )}
                  </div>
                </div>

                {m.promptPay && (
                  <div className="flex items-center gap-2 text-xs bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg mb-1.5">
                    <span className="text-green-700 dark:text-green-400 font-medium">พร้อมเพย์:</span>
                    <span className="text-gray-700 dark:text-slate-300">{m.promptPay}</span>
                    <button onClick={() => navigator.clipboard.writeText(m.promptPay ?? "")} className="ml-auto text-gray-400">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {m.bankAccount && (
                  <div className="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                    <span className="text-blue-700 dark:text-blue-400 font-medium">{m.bankName || "บัญชี"}:</span>
                    <span className="text-gray-700 dark:text-slate-300">{m.bankAccount}</span>
                    <button onClick={() => navigator.clipboard.writeText(m.bankAccount ?? "")} className="ml-auto text-gray-400">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
