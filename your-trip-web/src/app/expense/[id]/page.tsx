import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getExpenseGroup, getGroupBalances } from "@/server/actions/expense";
import ExpenseGroupClient from "./ExpenseGroupClient";

export default async function ExpenseGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [group, { balances, simplifiedDebts }] = await Promise.all([
    getExpenseGroup(id),
    getGroupBalances(id),
  ]);

  if (!group) notFound();

  return (
    <AppShell>
      <ExpenseGroupClient group={group} balances={balances} simplifiedDebts={simplifiedDebts} />
    </AppShell>
  );
}
