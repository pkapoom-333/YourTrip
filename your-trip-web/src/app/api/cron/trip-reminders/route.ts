import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/server/actions/push";

/**
 * GET /api/cron/trip-reminders
 * Called by Vercel Cron (daily at 08:00 ICT / 01:00 UTC)
 * Sends push notifications for trips starting in exactly 3 days.
 *
 * Vercel cron.json:
 * { "crons": [{ "path": "/api/cron/trip-reminders", "schedule": "0 1 * * *" }] }
 */
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  // Window: trips starting between 2 days 22h from now and 3 days 2h from now
  const windowStart = new Date(now.getTime() + (3 * 24 - 2) * 60 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + (3 * 24 + 2) * 60 * 60 * 1000);

  try {
    const trips = await (prisma as any).trip.findMany({
      where: {
        startDate: { gte: windowStart, lte: windowEnd },
        status: "upcoming",
      },
      select: {
        id: true,
        title: true,
        userId: true,
        // Also notify collaborators
        collaborators: { select: { userId: true } },
      },
    });

    let sent = 0;
    for (const trip of trips as Array<{
      id: string;
      title: string;
      userId: string;
      collaborators: Array<{ userId: string }>;
    }>) {
      const recipients = [trip.userId, ...trip.collaborators.map((c) => c.userId)];
      const unique = [...new Set(recipients)];

      for (const userId of unique) {
        await sendPushToUser(userId, {
          title: `✈️ อีก 3 วันแล้ว!`,
          body: `ทริป "${trip.title}" กำลังจะมาถึง เตรียมตัวให้พร้อมนะ!`,
          url: `/trips/${trip.id}`,
        });
        sent++;
      }
    }

    return NextResponse.json({ ok: true, tripsChecked: trips.length, notificationsSent: sent });
  } catch (e) {
    console.error("[cron/trip-reminders]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
