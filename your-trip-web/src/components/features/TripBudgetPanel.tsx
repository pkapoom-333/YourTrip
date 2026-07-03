
"use client";

import { useState, useTransition, useEffect } from "react";
import { Wallet, Plus, X, ChevronDown, ChevronUp, TrendingUp, Edit3, Check } from "lucide-react";
import {
  getTripBudget, addTripExpense, deleteTripExpense, updateTripBudget,
  BudgetSummary, TripExpenseItem
} from "@/server/actions/trips";

const CAT_EMOJI: Record<string, string> = {
  food: "🍽️", transport: "🚌", hotel: "🏨",
  activity: "🎯", shopping: "🛍️", other: "💰",
};
const CAT_LABELS: Record<string, string> = {
  food: "อาหาร", transport: "เดินทาง", hotel: "ที่พัก",
  activity: "กิจกรรม", shopping: "ช้อปปิ้ง", other: "อื่นๆ",
};
const CATEGORIES = Object.keys(CAT_LABELS);

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface Props { tripId: string }

export default function TripBudgetPanel({ tripId }: Props) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();

  // Add expense form
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("other");
  const [paidBy, setPaidBy] = useState("");

  // Budget edit
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  async function load() {
    const { data } = await getTripBudget(tripId);
    setSummary(data);
    if (data?.budget) setBudgetInput(String(data.budget));
    setLoaded(true);
  }

  function toggle() {
    if (!open && !loaded) load();
    setOpen((v) => !v);
  }

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    const optimistic: TripExpenseItem = {
      id: `tmp-${Date.now()}`, name: name.trim(), amount: amt,
      category: cat, paidBy: paidBy || null, date: new Date(),
    };
    setSummary((prev) => prev ? {
      ...prev,
      totalSpent: prev.totalSpent + amt,
      remaining: prev.budget != null ? prev.budget - (prev.totalSpent + amt) : null,
      byCategory: { ...prev.byCategory, [cat]: (prev.byCategory[cat] ?? 0) + amt },
      expenses: [optimistic, ...prev.expenses],
    } : null);
    const n = name.trim(); const a = amt; const c = cat; const p = paidBy;
    setName(""); setAmount(""); setPaidBy("");
    startTransition(async () => {
      const { data } = await addTripExpense(tripId, n, a, c, p || undefined);
      if (data) {
        setSummary((prev) => prev ? {
          ...prev,
          expenses: prev.expenses.map((ex) => ex.id === optimistic.id ? data : ex),
        } : null);
      }
    });
  }

  function handleDelete(id: string, amount: number, category: string) {
    setSummary((prev) => prev ? {
      ...prev,
      totalSpent: prev.totalSpent - amount,
      remaining: prev.budget != null ? prev.budget - (prev.totalSpent - amount) : null,
      byCategory: { ...prev.byCategory, [category]: Math.max(0, (prev.byCategory[category] ?? 0) - amount) },
      expenses: prev.expenses.filter((e) => e.id !== id),
    } : null);
    startTransition(async () => { await deleteTripExpense(id); });
  }

  function handleSaveBudget() {
    const b = parseFloat(budgetInput);
    if (isNaN(b) || b < 0) return;
    setSummary((prev) => prev ? { ...prev, budget: b, remaining: b - (prev?.totalSpent ?? 0) } : null);
    setEditBudget(false);
    startTransition(async () => { await updateTripBudget(tripId, b); });
  }

  const pct = summary?.budget && summary.budget > 0
    ? Math.min(100, Math.round((summary.totalSpent / summary.budget) * 100))
    : null;
  const overBudget = summary?.remaining != null && summary.remaining < 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <button onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
        <div className="flex items-center gap-2.5">
          <Wallet className="w-4 h-4 text-[#398AB9]" />
          <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">งบประมาณและรายจ่าย</span>
          {loaded && summary && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${overBudget ? "bg-red-100 dark:bg-red-900/30 text-red-500" : "bg-[#398AB9]/10 text-[#398AB9]"}`}>
              ฿{fmt(summary.totalSpent)}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && summary && (
        <div className="px-4 pb-4 space-y-4">
          {/* Budget header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">งบทั้งหมด</p>
              {editBudget ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm text-gray-500">฿</span>
                  <input value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)}
                    type="number" className="w-24 text-sm font-bold border-b border-[#398AB9] bg-transparent focus:outline-none dark:text-slate-100"
                    autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveBudget()} />
                  <button onClick={handleSaveBudget} className="text-green-500"><Check className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    {summary.budget != null ? `฿${fmt(summary.budget)}` : "ยังไม่ได้ตั้งงบ"}
                  </p>
                  <button onClick={() => setEditBudget(true)} className="text-gray-300 hover:text-[#398AB9] transition">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-slate-500">ใช้ไปแล้ว</p>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">฿{fmt(summary.totalSpent)}</p>
            </div>
          </div>

          {/* Progress bar */}
          {pct != null && (
            <div>
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${overBudget ? "bg-red-500" : pct > 80 ? "bg-orange-400" : "bg-[#398AB9]"}`}
                  style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className={overBudget ? "text-red-500 font-semibold" : "text-gray-400"}>
                  {overBudget ? `เกินงบ ฿${fmt(Math.abs(summary.remaining!))}` : `เหลือ ฿${fmt(summary.remaining!)}`}
                </span>
                <span className="text-gray-400">{pct}%</span>
              </div>
            </div>
          )}

          {/* Category breakdown */}
          {Object.keys(summary.byCategory).length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(summary.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amt]) => (
                  <div key={cat} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-2.5 text-center">
                    <p className="text-lg">{CAT_EMOJI[cat] ?? "💰"}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">{CAT_LABELS[cat] ?? cat}</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-slate-200">฿{fmt(amt)}</p>
                  </div>
                ))}
            </div>
          )}

          {/* Expense list */}
          {summary.expenses.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {summary.expenses.map((e) => (
                <div key={e.id} className="flex items-center gap-2 group">
                  <span className="text-sm flex-shrink-0">{CAT_EMOJI[e.category] ?? "💰"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-slate-200 truncate">{e.name}</p>
                    {e.paidBy && <p className="text-[10px] text-gray-400">{e.paidBy}</p>}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 flex-shrink-0">฿{fmt(e.amount)}</p>
                  <button onClick={() => handleDelete(e.id, e.amount, e.category)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add expense form */}
          <form onSubmit={handleAddExpense} className="pt-2 border-t border-gray-100 dark:border-slate-700 space-y-2">
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อรายจ่าย..."
                className="flex-1 text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 dark:bg-slate-700 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#398AB9]/40 min-w-0" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="฿" type="number" min="0"
                className="w-24 text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 dark:bg-slate-700 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#398AB9]/40" />
            </div>
            <div className="flex gap-2">
              <select value={cat} onChange={(e) => setCat(e.target.value)}
                className="flex-1 text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 focus:outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_EMOJI[c]} {CAT_LABELS[c]}</option>)}
              </select>
              <input value={paidBy} onChange={(e) => setPaidBy(e.target.value)} placeholder="จ่ายโดย... (ไม่บังคับ)"
                className="flex-1 text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 dark:bg-slate-700 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none" />
              <button type="submit" disabled={pending || !name.trim() || !amount}
                className="flex-shrink-0 w-8 h-8 bg-[#398AB9] text-white rounded-lg flex items-center justify-center hover:bg-[#1C658C] disabled:opacity-50">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
