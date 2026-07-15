"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";

export interface ConversationItem {
  id: string;
  otherUser: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    username: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
    senderId: string;
  } | null;
  unreadCount: number;
}

export interface MessageItem {
  id: string;
  senderId: string;
  content: string;
  type: string;
  mediaUrl: string | null;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function getConversations(): Promise<{ data: ConversationItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const participants = await db.conversationParticipant.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            participants: {
              where: { NOT: { userId: user.id } },
              include: {
                user: { select: { id: true, name: true, avatarUrl: true, username: true } },
              },
              take: 1,
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    const items: ConversationItem[] = participants
      .map((p: {
        lastReadAt: Date | null;
        conversation: {
          id: string;
          participants: Array<{ user: { id: string; name: string | null; avatarUrl: string | null; username: string | null } }>;
          messages: Array<{ content: string; createdAt: Date; senderId: string }>;
        };
      }) => {
        const otherParticipant = p.conversation.participants[0];
        const lastMsg = p.conversation.messages[0] ?? null;
        const unread =
          lastMsg && lastMsg.senderId !== user.id
            ? p.lastReadAt === null || new Date(lastMsg.createdAt) > new Date(p.lastReadAt)
              ? 1
              : 0
            : 0;

        return {
          id: p.conversation.id,
          otherUser: otherParticipant?.user ?? {
            id: "",
            name: "ผู้ใช้ที่ลบแล้ว",
            avatarUrl: null,
            username: null,
          },
          lastMessage: lastMsg
            ? { content: lastMsg.content, createdAt: lastMsg.createdAt, senderId: lastMsg.senderId }
            : null,
          unreadCount: unread,
        };
      })
      .sort((a: ConversationItem, b: ConversationItem) => {
        const aTime = a.lastMessage?.createdAt ?? new Date(0);
        const bTime = b.lastMessage?.createdAt ?? new Date(0);
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

    return { data: items };
  } catch {
    return { data: [] };
  }
}

export async function getOrCreateConversation(
  otherUserId: string
): Promise<{ data: { conversationId: string } | null; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "ไม่ได้เข้าสู่ระบบ" };
    if (user.id === otherUserId) return { data: null, error: "ไม่สามารถสนทนากับตัวเองได้" };

    // Find existing direct conversation between these two users
    const existing = await db.conversationParticipant.findFirst({
      where: {
        userId: user.id,
        conversation: {
          type: "direct",
          participants: { some: { userId: otherUserId } },
        },
      },
    });

    if (existing) {
      return { data: { conversationId: existing.conversationId } };
    }

    const conversation = await db.conversation.create({
      data: {
        type: "direct",
        participants: {
          create: [{ userId: user.id }, { userId: otherUserId }],
        },
      },
    });

    return { data: { conversationId: conversation.id } };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

export async function getMessages(
  conversationId: string,
  cursor?: string
): Promise<{ data: MessageItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    // Verify participant
    const participant = await db.conversationParticipant.findFirst({
      where: { conversationId, userId: user.id },
    });
    if (!participant) return { data: [] };

    const messages = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 50,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return { data: messages as MessageItem[] };
  } catch {
    return { data: [] };
  }
}

export async function sendMessage(
  conversationId: string,
  content: string,
  type = "text",
  mediaUrl?: string
): Promise<{ data: MessageItem | null; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "ไม่ได้เข้าสู่ระบบ" };

    const participant = await db.conversationParticipant.findFirst({
      where: { conversationId, userId: user.id },
    });
    if (!participant) return { data: null, error: "ไม่มีสิทธิ์ส่งข้อความ" };

    const message = await db.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: content.trim() || " ",
        type,
        mediaUrl: mediaUrl ?? null,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Update sender's lastReadAt
    await db.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: user.id } },
      data: { lastReadAt: new Date() },
    });

    return { data: message as MessageItem };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

export async function markConversationRead(conversationId: string): Promise<void> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await db.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: user.id } },
      data: { lastReadAt: new Date() },
    });
  } catch {
    // non-critical
  }
}

export async function getConversationInfo(conversationId: string): Promise<{
  data: {
    otherUser: { id: string; name: string | null; avatarUrl: string | null; username: string | null };
  } | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

    const participants = await db.conversationParticipant.findMany({
      where: { conversationId },
      include: { user: { select: { id: true, name: true, avatarUrl: true, username: true } } },
    });

    const other = participants.find((p: { userId: string }) => p.userId !== user.id);
    if (!other) return { data: null };

    return { data: { otherUser: other.user } };
  } catch {
    return { data: null };
  }
}

export async function searchUsersForDM(
  query: string
): Promise<{ data: Array<{ id: string; name: string | null; username: string | null; avatarUrl: string | null }> }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || query.trim().length < 1) return { data: [] };

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: user.id } },
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { username: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: { id: true, name: true, username: true, avatarUrl: true },
      take: 10,
    });

    return { data: users };
  } catch {
    return { data: [] };
  }
}

export async function getTotalUnreadMessages(): Promise<number> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const participants = await db.conversationParticipant.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
    });

    let count = 0;
    for (const p of participants) {
      const lastMsg = p.conversation.messages[0];
      if (lastMsg && lastMsg.senderId !== user.id) {
        if (!p.lastReadAt || new Date(lastMsg.createdAt) > new Date(p.lastReadAt)) {
          count++;
        }

      }
    }
    return count;
  } catch {
    return 0;
  }
}

// ─── Trip Group Chat ──────────────────────────────────────────────────────────
// These functions use `db` (prisma as any) because the Prisma client was
// generated before the group-chat schema migration added name/avatarUrl/tripId
// to the Conversation model. Will become typed after next `prisma generate`.

export async function createTripGroupChat(
  tripId: string
): Promise<{ data: { conversationId: string } | null; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    // Return existing group chat if already created
    const existing = await db.conversation.findUnique({
      where: { tripId },
      select: { id: true },
    });
    if (existing) return { data: { conversationId: existing.id } };

    // Fetch trip to get title + collaborators
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        collaborators: {
          include: { user: { select: { id: true } } },
        },
      },
    });
    if (!trip) return { data: null, error: "ไม่พบทริป" };

    // Gather all participant user IDs (owner + collaborators)
    const userIds = Array.from(new Set([
      trip.userId,
      ...trip.collaborators.map((c) => c.userId),
    ]));

    // Create group conversation with tripId link
    const conversation = await db.conversation.create({
      data: {
        type: "group",
        name: trip.title,
        tripId,
        participants: {
          create: userIds.map((uid) => ({ userId: uid })),
        },
      },
      select: { id: true },
    });

    return { data: { conversationId: conversation.id } };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

export async function getTripGroupChat(
  tripId: string
): Promise<{ data: { id: string; name: string | null; participantCount: number } | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

    const conversation = await db.conversation.findUnique({
      where: { tripId },
      include: { participants: true },
    });

    if (!conversation) return { data: null };

    return {
      data: {
        id: conversation.id,
        name: conversation.name ?? null,
        participantCount: conversation.participants.length,
      },
    };
  } catch {
    return { data: null };
  }
}
