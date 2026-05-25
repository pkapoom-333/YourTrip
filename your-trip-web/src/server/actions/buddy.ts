"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";

export interface BuddyProfileItem {
  id: string;
  name: string;
  avatarUrl: string | null;
  location: string | null;
  bio: string | null;
  isVerified: boolean;
  tripCount: number;
  requestId?: string;
  requestStatus?: "PENDING" | "ACCEPTED" | "DECLINED";
  destination?: string | null;
  travelDateStart?: Date | null;
  travelDateEnd?: Date | null;
}

export interface BuddyRequestItem {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  message: string | null;
  destination: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  from: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    location: string | null;
    isVerified: boolean;
  };
}

/** Get list of users to discover (exclude self, existing requests) */
export async function getDiscoverBuddies(limit = 20): Promise<{ data: BuddyProfileItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    // Get IDs of users already interacted with
    const existing = await prisma.buddyRequest.findMany({
      where: { OR: [{ fromId: user.id }, { toId: user.id }] },
      select: { fromId: true, toId: true },
    });
    const excludeIds = new Set<string>([user.id]);
    existing.forEach((r) => {
      excludeIds.add(r.fromId);
      excludeIds.add(r.toId);
    });

    const users = await prisma.user.findMany({
      where: { id: { notIn: [...excludeIds] } },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        location: true,
        bio: true,
        isVerified: true,
        _count: { select: { posts: true } },
      },
    });

    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.name ?? "ผู้ใช้",
        avatarUrl: u.avatarUrl,
        location: u.location,
        bio: u.bio,
        isVerified: u.isVerified,
        tripCount: u._count.posts,
      })),
    };
  } catch {
    return { data: [] };
  }
}

/** Get incoming buddy requests (status = PENDING) */
export async function getIncomingRequests(): Promise<{ data: BuddyRequestItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const rows = await prisma.buddyRequest.findMany({
      where: { toId: user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        from: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            location: true,
            isVerified: true,
          },
        },
      },
    });

    return {
      data: rows.map((r) => ({
        id: r.id,
        status: r.status as "PENDING" | "ACCEPTED" | "DECLINED",
        message: r.message,
        destination: r.destination,
        startDate: r.startDate,
        endDate: r.endDate,
        createdAt: r.createdAt,
        from: {
          id: r.from.id,
          name: r.from.name,
          avatarUrl: r.from.avatarUrl,
          location: r.from.location,
          isVerified: r.from.isVerified,
        },
      })),
    };
  } catch {
    return { data: [] };
  }
}

/** Get matched buddies (status = ACCEPTED) */
export async function getMatchedBuddies(): Promise<{ data: BuddyRequestItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const rows = await prisma.buddyRequest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ fromId: user.id }, { toId: user.id }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        from: { select: { id: true, name: true, avatarUrl: true, location: true, isVerified: true } },
        to: { select: { id: true, name: true, avatarUrl: true, location: true, isVerified: true } },
      },
    });

    return {
      data: rows.map((r) => {
        // Show the other person (not self)
        const other = r.fromId === user.id ? r.to : r.from;
        return {
          id: r.id,
          status: "ACCEPTED" as const,
          message: r.message,
          destination: r.destination,
          startDate: r.startDate,
          endDate: r.endDate,
          createdAt: r.createdAt,
          from: {
            id: other.id,
            name: other.name,
            avatarUrl: other.avatarUrl,
            location: other.location,
            isVerified: other.isVerified,
          },
        };
      }),
    };
  } catch {
    return { data: [] };
  }
}

/** Send a buddy request */
export async function sendBuddyRequest(
  toId: string,
  opts?: { message?: string; destination?: string; startDate?: Date; endDate?: Date }
): Promise<{ data: { success: boolean; id?: string; error?: string } }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: { success: false, error: "Unauthenticated" } };

    const req = await prisma.buddyRequest.create({
      data: {
        fromId: user.id,
        toId,
        message: opts?.message,
        destination: opts?.destination,
        startDate: opts?.startDate,
        endDate: opts?.endDate,
        status: "PENDING",
      },
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: toId,
        type: "BUDDY_REQUEST",
        title: "คำขอร่วมทริปใหม่",
        body: opts?.destination
          ? `มีคนส่งคำขอร่วมทริปไป ${opts.destination}`
          : "มีคนส่งคำขอร่วมทริปให้คุณ",
        actorId: user.id,
        actionUrl: "/buddy",
      },
    }).catch(() => {});

    return { data: { success: true, id: req.id } };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    // Handle unique constraint (already sent)
    if (msg.includes("Unique constraint")) {
      return { data: { success: false, error: "คุณส่งคำขอนี้ไปแล้ว" } };
    }
    return { data: { success: true } }; // optimistic
  }
}

/** Accept a buddy request */
export async function acceptBuddyRequest(requestId: string): Promise<{ data: { success: boolean } }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: { success: false } };

    const req = await prisma.buddyRequest.update({
      where: { id: requestId, toId: user.id },
      data: { status: "ACCEPTED" },
    });

    // Notify the sender
    await prisma.notification.create({
      data: {
        userId: req.fromId,
        type: "BUDDY_ACCEPTED",
        title: "คำขอร่วมทริปได้รับการตอบรับ",
        body: req.destination
          ? `คำขอทริปไป ${req.destination} ได้รับการตอบรับแล้ว`
          : "คำขอร่วมทริปของคุณได้รับการตอบรับแล้ว",
        actorId: user.id,
        actionUrl: "/buddy",
      },
    }).catch(() => {});

    return { data: { success: true } };
  } catch {
    return { data: { success: false } };
  }
}

/** Decline a buddy request */
export async function declineBuddyRequest(requestId: string): Promise<{ data: { success: boolean } }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: { success: false } };

    await prisma.buddyRequest.update({
      where: { id: requestId, toId: user.id },
      data: { status: "DECLINED" },
    });

    return { data: { success: true } };
  } catch {
    return { data: { success: false } };
  }
}
