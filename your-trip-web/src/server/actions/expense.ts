"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemberBalance {
  memberId: string;
  name: string;
  avatarUrl: string | null;
  color: string;
  promptPay: string | null;
  bankAccount: string | null;
  bankName: string | null;
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

export interface SimplifiedDebt {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  toPromptPay: string | null;
  toBankAccount: string | null;
  toBankName: string | null;
  amount: number;
}

// ─── Expense Groups ───────────────────────────────────────────────────────────

export async function createExpenseGroup(data: {
  name: string;
  description?: string;
  emoji?: string;
  members: Array<{ name: string; userId?: string; promptPay?: string; bankAccount?: string; bankName?: string; color?: string }>;
}) {
  const user = await getAuthUser();

  const group = await prisma.expenseGroup.create({
    data: {
      name: data.name,
      description: data.description,
      emoji: data.emoji ?? "💰",
      createdById: user.id,
      inviteCode: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
      members: {
        create: data.members.map((m) => ({
          name: m.name,
          userId: m.userId,
          promptPay: m.promptPay,
          bankAccount: m.bankAccount,
          bankName: m.bankName,
          color: m.color ?? "#398AB9",
        })),
      },
    },
    include: { members: true },
  });

  revalidatePath("/expense");
  return group;
}

export async function getMyExpenseGroups() {
  const user = await getAuthUser();

  const groups = await prisma.expenseGroup.findMany({
    where: {
      OR: [
        { createdById: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      members: true,
      _count: { select: { expenses: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return groups;
}

export async function getExpenseGroup(groupId: string) {
  const user = await getAuthUser();

  const group = await prisma.expenseGroup.findFirst({
    where: {
      id: groupId,
      OR: [
        { createdById: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      members: true,
      expenses: {
        include: {
          paidBy: true,
          splits: { include: { member: true } },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  return group;
}

export async function addExpenseGroupMember(groupId: string, member: {
  name: string;
  userId?: string;
  promptPay?: string;
  bankAccount?: string;
  bankName?: string;
  color?: string;
}) {
  await getAuthUser();

  await prisma.expenseGroupMember.create({
    data: {
      groupId,
      name: member.name,
      userId: member.userId,
      promptPay: member.promptPay,
      bankAccount: member.bankAccount,
      bankName: member.bankName,
      color: member.color ?? "#398AB9",
    },
  });

  revalidatePath(`/expense/${groupId}`);
}

export async function updateMemberPaymentInfo(memberId: string, data: {
  promptPay?: string;
  bankAccount?: string;
  bankName?: string;
}) {
  await getAuthUser();
  await prisma.expenseGroupMember.update({
    where: { id: memberId },
    data,
  });
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function addExpense(data: {
  groupId: string;
  name: string;
  amount: number;
  paidById: string;
  splitType: "equal" | "custom";
  notes?: string;
  category?: string;
  date?: Date;
  customSplits?: Array<{ memberId: string; amount: number }>;
}) {
  await getAuthUser();

  const members = await prisma.expenseGroupMember.findMany({
    where: { groupId: data.groupId },
  });

  let splits: Array<{ memberId: string; amount: number }>;

  if (data.splitType === "equal") {
    const perPerson = Math.round((data.amount / members.length) * 100) / 100;
    splits = members.map((m) => ({ memberId: m.id, amount: perPerson }));
  } else {
    splits = data.customSplits ?? members.map((m) => ({ memberId: m.id, amount: data.amount / members.length }));
  }

  const expense = await prisma.expense.create({
    data: {
      groupId: data.groupId,
      name: data.name,
      amount: data.amount,
      paidById: data.paidById,
      splitType: data.splitType,
      notes: data.notes,
      category: data.category ?? "general",
      date: data.date ?? new Date(),
      splits: {
        create: splits,
      },
    },
    include: { splits: true, paidBy: true },
  });

  revalidatePath(`/expense/${data.groupId}`);
  return expense;
}

export async function deleteExpense(expenseId: string, groupId: string) {
  await getAuthUser();
  await prisma.expenseSplit.deleteMany({ where: { expenseId } });
  await prisma.expense.delete({ where: { id: expenseId } });
  revalidatePath(`/expense/${groupId}`);
}

export async function markSplitPaid(splitId: string, groupId: string) {
  await getAuthUser();
  await prisma.expenseSplit.update({ where: { id: splitId }, data: { isPaid: true } });
  revalidatePath(`/expense/${groupId}`);
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function recordPayment(data: {
  groupId: string;
  fromId: string;
  toId: string;
  amount: number;
  note?: string;
}) {
  await getAuthUser();
  await prisma.paymentRecord.create({ data });
  revalidatePath(`/expense/${data.groupId}`);
}

// ─── Balance Calculation ──────────────────────────────────────────────────────

export async function getGroupBalances(groupId: string): Promise<{
  balances: MemberBalance[];
  simplifiedDebts: SimplifiedDebt[];
}> {
  const group = await prisma.expenseGroup.findUnique({
    where: { id: groupId },
    include: {
      members: true,
      expenses: {
        include: { splits: true },
      },
    },
  });

  if (!group) return { balances: [], simplifiedDebts: [] };

  // Calculate raw balances
  const balanceMap = new Map<string, { paid: number; owed: number }>();
  for (const m of group.members) {
    balanceMap.set(m.id, { paid: 0, owed: 0 });
  }

  for (const exp of group.expenses) {
    // Person who paid gets credit
    const payer = balanceMap.get(exp.paidById);
    if (payer) payer.paid += exp.amount;

    // Each split person owes their portion
    for (const split of exp.splits) {
      const member = balanceMap.get(split.memberId);
      if (member) member.owed += split.amount;
    }
  }

  const balances: MemberBalance[] = group.members.map((m) => {
    const b = balanceMap.get(m.id) ?? { paid: 0, owed: 0 };
    return {
      memberId: m.id,
      name: m.name,
      avatarUrl: m.avatarUrl,
      color: m.color,
      promptPay: m.promptPay,
      bankAccount: m.bankAccount,
      bankName: m.bankName,
      totalPaid: b.paid,
      totalOwed: b.owed,
      netBalance: b.paid - b.owed, // positive = others owe you, negative = you owe others
    };
  });

  // Simplify debts (greedy algorithm)
  const simplifiedDebts = simplifyDebts(balances, group.members);

  return { balances, simplifiedDebts };
}

function simplifyDebts(
  balances: MemberBalance[],
  members: Array<{ id: string; name: string; promptPay: string | null; bankAccount: string | null; bankName: string | null }>
): SimplifiedDebt[] {
  const net = balances.map((b) => ({ id: b.memberId, net: b.netBalance }));
  const debts: SimplifiedDebt[] = [];

  const creditors = net.filter((n) => n.net > 0.01).sort((a, b) => b.net - a.net);
  const debtors = net.filter((n) => n.net < -0.01).sort((a, b) => a.net - b.net);

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const amount = Math.min(creditor.net, -debtor.net);

    if (amount > 0.01) {
      const toMember = members.find((m) => m.id === creditor.id);
      const fromMember = members.find((m) => m.id === debtor.id);
      if (toMember && fromMember) {
        debts.push({
          fromId: debtor.id,
          fromName: fromMember.name,
          toId: creditor.id,
          toName: toMember.name,
          toPromptPay: toMember.promptPay,
          toBankAccount: toMember.bankAccount,
          toBankName: toMember.bankName,
          amount: Math.round(amount * 100) / 100,
        });
      }
    }

    creditor.net -= amount;
    debtor.net += amount;

    if (creditor.net < 0.01) ci++;
    if (debtor.net > -0.01) di++;
  }

  return debts;
}

// ─── Invite Link ─────────────────────────────────────────────────────────────

export async function getGroupByInviteCode(inviteCode: string) {
  const group = await prisma.expenseGroup.findUnique({
    where: { inviteCode },
    include: {
      members: true,
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
  return group ?? null;
}

export async function joinGroupByInviteCode(inviteCode: string, memberName: string) {
  const user = await getAuthUser();

  const group = await prisma.expenseGroup.findUnique({ where: { inviteCode } });
  if (!group) throw new Error("ไม่พบกลุ่มนี้");

  // Check if user already in group
  const existing = await prisma.expenseGroupMember.findFirst({
    where: { groupId: group.id, userId: user.id },
  });
  if (existing) return { groupId: group.id };

  await prisma.expenseGroupMember.create({
    data: {
      groupId: group.id,
      userId: user.id,
      name: memberName,
      color: ["#398AB9","#FF4F4F","#22C55E","#F59E0B","#8B5CF6","#EC4899"][
        Math.floor(Math.random() * 6)
      ],
    },
  });

  revalidatePath("/expense");
  return { groupId: group.id };
}

export async function regenerateInviteCode(groupId: string) {
  const user = await getAuthUser();
  const group = await prisma.expenseGroup.findFirst({
    where: { id: groupId, createdById: user.id },
  });
  if (!group) throw new Error("ไม่มีสิทธิ์");

  const newCode = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  await prisma.expenseGroup.update({
    where: { id: groupId },
    data: { inviteCode: newCode },
  });
  revalidatePath(`/expense/${groupId}`);
  return { inviteCode: newCode };
}

export async function createExpenseGroupForTrip(
  tripId: string,
  opts?: { syncCollaborators?: boolean }
) {
  const user = await getAuthUser();

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { collaborators: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } },
  });
  if (!trip) throw new Error("ไม่พบทริป");

  const existing = await prisma.expenseGroup.findUnique({ where: { tripId } });
  if (existing) return { groupId: existing.id };

  const members: Array<{ name: string; userId?: string; avatarUrl?: string; color?: string }> = [
    { name: trip.userId === user.id ? "ฉัน" : "เจ้าของทริป", userId: trip.userId },
  ];
  if (opts?.syncCollaborators) {
    for (const c of trip.collaborators) {
      if (c.userId === trip.userId) continue;
      members.push({ name: c.user.name ?? "สมาชิก", userId: c.userId, avatarUrl: c.user.avatarUrl ?? undefined });
    }
  }

  const group = await prisma.expenseGroup.create({
    data: {
      name: trip.title,
      emoji: "💰",
      tripId,
      createdById: user.id,
      inviteCode: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
      members: {
        create: members.map((m, i) => ({
          name: m.name,
          userId: m.userId,
          avatarUrl: m.avatarUrl,
          color: ["#398AB9","#FF4F4F","#22C55E","#F59E0B","#8B5CF6","#EC4899"][i % 6],
        })),
      },
    },
  });

  revalidatePath(`/trips/${tripId}`);
  return { groupId: group.id };
}

export async function getExpenseGroupByTripId(tripId: string) {
  const group = await prisma.expenseGroup.findUnique({
    where: { tripId },
    include: { members: true, _count: { select: { expenses: true } } },
  });
  return group ?? null;
}
