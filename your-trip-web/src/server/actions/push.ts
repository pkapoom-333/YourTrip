"use server";

import { prisma } from "@/lib/prisma";
import { sendWebPush, type PushPayload } from "@/lib/push";

/**
 * Send a web-push notification to one user (by userId).
 * Reads their pushSubscription from DB, calls sendWebPush.
 * If subscription is stale (returns false), clears it from DB.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true },
    });

    if (!user?.pushSubscription) return;

    const ok = await sendWebPush(user.pushSubscription as string, payload);

    // If subscription expired, clear it so we don't waste DB reads next time
    if (!ok) {
      await (prisma as any).user.update({
        where: { id: userId },
        data: { pushSubscription: null },
      });
    }
  } catch (e) {
    console.error("[sendPushToUser]", userId, e);
  }
}

/**
 * Send push to multiple users (batch).
 * Runs in parallel — failures don't block others.
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload
): Promise<void> {
  await Promise.allSettled(userIds.map((id) => sendPushToUser(id, payload)));
}
