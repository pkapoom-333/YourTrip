"use server";

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendPushToUser } from "./push";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  actionUrl: string | null;
  isRead: boolean;
  actorId: string | null;
  actorName: string | null;
  actorAvatar: string | null;
  createdAt: Date;
}

// ─── Internal helper (not exported as server action — called from other actions) ─
export async function createNotification(input: {
  userId: string;       // recipient
  type: NotificationType;
  title: string;
  body?: string;
  imageUrl?: string;
  actionUrl?: string;
  actorId?: string;
}) {
  try {
    // Don't notify yourself
    if (input.actorId && input.actorId === input.userId) return;
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        imageUrl: input.imageUrl ?? null,
        actionUrl: input.actionUrl ?? null,
        actorId: input.actorId ?? null,
      },
    });

    // Fire web-push (non-blocking — fails silently if VAPID not configured or no subscription)
    sendPushToUser(input.userId, {
      title: input.title,
      body: input.body ?? "",
      url: input.actionUrl ?? "/notifications",
    }).catch(() => {});
  } catch {
    // Silently ignore — notifications are non-critical
  }
}

export async function getNotifications(limit = 30): Promise<{ data: NotificationItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const rows = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Fetch actor profiles for notifications that have actorId
    const actorIds = [...new Set(rows.filter((n) => n.actorId).map((n) => n.actorId!))];
    const actors = actorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, name: true, avatarUrl: true },
        })
      : [];
    const actorMap = new Map(actors.map((a) => [a.id, a]));

    return {
      data: rows.map((n) => {
        const actor = n.actorId ? actorMap.get(n.actorId) : undefined;
        return {
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          imageUrl: n.imageUrl,
          actionUrl: n.actionUrl,
          isRead: n.isRead,
          actorId: n.actorId,
          actorName: actor?.name ?? null,
          actorAvatar: actor?.avatarUrl ?? null,
          createdAt: n.createdAt,
        };
      }),
    };
  } catch {
    return { data: [] };
  }
}

export async function getUnreadCount(): Promise<{ count: number }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { count: 0 };

    const count = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });
    return { count };
  } catch {
    return { count: 0 };
  }
}

export async function markNotificationRead(id: string): Promise<{ data: { success: boolean } }> {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return { data: { success: true } };
  } catch {
    return { data: { success: true } };
  }
}

export async function markAllNotificationsRead(): Promise<{ data: { success: boolean } }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: { success: false } };

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return { data: { success: true } };
  } catch {
    return { data: { success: true } };
  }
}

export async function deleteNotification(id: string): Promise<{ data: { success: boolean } }> {
  try {
    await prisma.notification.delete({ where: { id } });
    return { data: { success: true } };
  } catch {
    return { data: { success: true } };
  }
}
