import { Suspense } from "react";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import AppShell from "@/components/AppShell";
import { getMyExpenseGroups } from "@/server/actions/expense";

export const metadata = { title: "หารค่าใช้จ่าย — YourTrip" };

async function ExpenseGroupList() {
  const groups = await getMyExpenseGroups().catch(() => []);

  if (groups.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-5xl mb-4">💰</div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">ยังไม่มีกลุ่มหารค่าใช้จ่าย</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">สร้างกลุ่มเพื่อเริ่มหารค่าใช้จ่ายกับเพื่อน</p>
        <Link
          href="/expense/new"
          className="inline-flex items-center gap-2 bg-[#398AB9] text-white px-5 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          สร้างกลุ่มใหม่
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50 dark:divide-slate-800">
      {groups.map((g: (typeof groups)[0]) => {
        const totalExpenses = 0; // loaded on detail page
        return (
          <Link key={g.id} href={`/expense/${g.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#398AB9]/10 flex items-center justify-center text-2xl flex-shrink-0">
              {g.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white truncate">{g.name}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                {g.members.length} คน · {g._count.expenses} รายการ
              </div>
            </div>
            <div className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
              {new Date(g.updatedAt).toLocaleDateString("th-TH", { month: "short", day: "numeric" })}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function ExpensePage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#398AB9]" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">หารค่าใช้จ่าย</h1>
          </div>
          <Link
            href="/expense/new"
            className="flex items-center gap-1.5 bg-[#398AB9] text-white px-3 py-1.5 rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            สร้างกลุ่ม
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 mt-3 mx-3 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <Suspense fallback={<div className="p-8 text-center text-gray-400 text-sm">กำลังโหลด...</div>}>
            <ExpenseGroupList />
          </Suspense>
        </div>
      </div>
    </AppShell>
  );
}
