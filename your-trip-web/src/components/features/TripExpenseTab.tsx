"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Users, Plus, ArrowRight, Loader2 } from "lucide-react";
import { createExpenseGroupForTrip, getExpenseGroupByTripId } from "@/server/actions/expense";

type ExpenseGroupSummary = {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  members: Array<{ id: string; name: string; color: string }>;
  _count: { expenses: number };
};

interface Props {
  tripId: string;
  tripTitle: string;
}

export default function TripExpenseTab({ tripId, tripTitle }: Props) {
  const router = useRouter();
  const [group, setGroup] = useState<ExpenseGroupSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getExpenseGroupByTripId(tripId).then((g) => {
      setGroup(g as ExpenseGroupSummary | null);
      setLoaded(true);
    });
  }, [tripId]);

  function handleCreate() {
    startTransition(async () => {
      const result = await createExpenseGroupForTrip(tripId, { syncCollaborators: true });
      router.push(`/expense/${result.groupId}`);
    });
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#398AB9]" />
      </div>
    );
  }

  // No group yet — empty state
  if (!group) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-[#398AB9]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-[#398AB9]" />
        </div>
        <h3 className="text-base font-bold text-gray-800 dark:text-slate-200 mb-1">
          ยังไม่มีกลุ่มหารค่าใช้จ่าย
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          สร้างกลุ่มเพื่อติดตามค่าใช้จ่ายและหารบิลกับเพื่อนในทริปนี้
        </p>
        <button
          onClick={handleCreate}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-[#398AB9] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1C658C] transition disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          สร้าง Expense Group
        </button>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
          สมาชิกทริปจะถูกเพิ่มเป็นสมาชิกกลุ่มอัตโนมัติ
        </p>
      </div>
    );
  }

  // Group exists — show summary
  const totalMembers = group.members.length;
  const expenseCount = group._count.expenses;

  return (
    <div className="p-4 space-y-3">
      {/* Group card */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{group.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 dark:text-slate-200 truncate">{group.name}</h3>
            {group.description && (
              <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{group.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-[#398AB9]/8 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[#398AB9] mb-1">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-slate-200">{totalMembers}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">สมาชิก</p>
          </div>
          <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
              <Wallet className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-slate-200">{expenseCount}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">รายการ</p>
          </div>
        </div>

        {/* Member chips */}
        <div className="flex gap-2 flex-wrap mb-4">
          {group.members.slice(0, 5).map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: m.color }}
            >
              {m.name}
            </div>
          ))}
          {totalMembers > 5 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
              +{totalMembers - 5} คน
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/expense/${group.id}`)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#398AB9] text-white rounded-xl text-sm font-semibold hover:bg-[#1C658C] transition"
          >
            <Wallet className="w-4 h-4" />
            จัดการค่าใช้จ่าย
          </button>
          <button
            onClick={() => router.push(`/expense/${group.id}`)}
            className="p-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-500 dark:text-slate-400 hover:border-[#398AB9] hover:text-[#398AB9] transition"
            title="ดูทั้งหมด"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-slate-500 text-center">
        จัดการรายละเอียดทั้งหมดได้ที่{" "}
        <button
          onClick={() => router.push(`/expense/${group.id}`)}
          className="text-[#398AB9] underline underline-offset-2"
        >
          หน้าหารค่าใช้จ่าย
        </button>
      </p>
    </div>
  );
}
