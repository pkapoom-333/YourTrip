"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  duration: number;
  expiresAt: Date;
  createdAt: Date;
  viewedByMe: boolean;
}

export interface StoryGroup {
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  stories: StoryItem[];
  allViewed: boolean; // true if current user has viewed all stories in group
}

// Get all active stories (not expired) grouped by user
// Returns own story group first, then followed users, then others
export async function getStories(): Promise<{ data: StoryGroup[]; myUserId: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const myId = user?.id ?? null;

    const now = new Date();

    // Fetch active stories with user info and view status
    const stories = await (prisma as any).story.findMany({
      where: { expiresAt: { gt: now } },
      include: {
        user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        views: myId ? { where: { viewerId: myId }, select: { id: true } } : false,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by userId
    const groups = new Map<string, StoryGroup>();
    for (const s of stories as any[]) {
      const uid = s.user.id;
      if (!groups.has(uid)) {
        groups.set(uid, {
          userId: uid,
          userName: s.user.name ?? s.user.username ?? "Traveler",
          userAvatarUrl: s.user.avatarUrl,
          stories: [],
          allViewed: false,
        });
      }
      const group = groups.get(uid)!;
      const viewedByMe = myId ? (s.views as Array<{ id: string }>).length > 0 : false;
      group.stories.push({
        id: s.id,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        caption: s.caption,
        duration: s.duration,
        expiresAt: s.expiresAt,
        createdAt: s.createdAt,
        viewedByMe,
      });
    }

    // Mark allViewed per group
    for (const group of groups.values()) {
      group.allViewed = group.stories.every((s) => s.viewedByMe);
      // Sort stories within group oldest first
      group.stories.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    let result = Array.from(groups.values());

    // Sort: own story first, then unviewed groups, then viewed
    result.sort((a, b) => {
      if (a.userId === myId) return -1;
      if (b.userId === myId) return 1;
      if (!a.allViewed && b.allViewed) return -1;
      if (a.allViewed && !b.allViewed) return 1;
      return 0;
    });

    return { data: result, myUserId: myId };
  } catch (e) {
    console.error("[getStories]", e);
    return { data: [], myUserId: null };
  }
}

// Get own stories (for own story ring)
export async function getMyStories(): Promise<{ data: StoryItem[] }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const now = new Date();
    const stories = await (prisma as any).story.findMany({
      where: { userId: user.id, expiresAt: { gt: now } },
      orderBy: { createdAt: "asc" },
    });

    return {
      data: (stories as any[]).map((s) => ({
        id: s.id,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        caption: s.caption,
        duration: s.duration,
        expiresAt: s.expiresAt,
        createdAt: s.createdAt,
        viewedByMe: true,
      })),
    };
  } catch {
    return { data: [] };
  }
}

// Mark a story as viewed
export async function markStoryViewed(storyId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await (prisma as any).storyView.upsert({
      where: { storyId_viewerId: { storyId, viewerId: user.id } },
      update: {},
      create: { storyId, viewerId: user.id },
    });
  } catch {
    // Non-fatal
  }
}

// Create a story (call after uploading media)
export async function createStory(input: {
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  duration?: number;
}): Promise<{ data: { id: string } | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "กรุณาเข้าสู่ระบบ" };

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const story = await (prisma as any).story.create({
      data: {
        userId: user.id,
        mediaUrl: input.mediaUrl,
        mediaType: input.mediaType,
        caption: input.caption ?? null,
        duration: input.duration ?? (input.mediaType === "video" ? 15000 : 5000),
        expiresAt,
      },
    });

    return { data: { id: story.id } };
  } catch (e) {
    console.error("[createStory]", e);
    return { data: null, error: "ไม่สามารถสร้างสตอรี่ได้" };
  }
}

// Delete own story
export async function deleteStory(storyId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

    await (prisma as any).story.deleteMany({
      where: { id: storyId, userId: user.id },
    });

    return {};
  } catch {
    return { error: "ไม่สามารถลบสตอรี่ได้" };
  }
}

// Get story viewer list for a story (owner only)
export async function getStoryViewers(storyId: string): Promise<{
  data: Array<{ userId: string; name: string; avatarUrl: string | null; viewedAt: Date }>;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const views = await (prisma as any).storyView.findMany({
      where: { storyId, story: { userId: user.id } },
      include: { viewer: { select: { id: true, name: true, username: true, avatarUrl: true } } },
      orderBy: { viewedAt: "desc" },
    });

    return {
      data: (views as any[]).map((v) => ({
        userId: v.viewer.id,
        name: v.viewer.name ?? v.viewer.username ?? "Traveler",
        avatarUrl: v.viewer.avatarUrl,
        viewedAt: v.viewedAt,
      })),
    };
  } catch {
    return { data: [] };
  }
}
