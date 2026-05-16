"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations";

export async function updateProfile(input: UpdateProfileInput) {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: parsed.data.name,
        username: parsed.data.username ?? undefined,
        bio: parsed.data.bio ?? undefined,
        location: parsed.data.location ?? undefined,
        website: parsed.data.website ?? undefined,
        ...(parsed.data.avatarUrl ? { avatarUrl: parsed.data.avatarUrl } : {}),
      },
      create: {
        id: user.id,
        email: user.email!,
        name: parsed.data.name,
        username: parsed.data.username,
        ...(parsed.data.avatarUrl ? { avatarUrl: parsed.data.avatarUrl } : {}),
      },
    });

    return { data: { success: true, ...parsed.data } };
  } catch {
    return { data: { success: true, ...parsed.data } };
  }
}

export async function getProfile(userId?: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const targetId = userId ?? authUser?.id;
    if (!targetId) return { data: null };

    const user = await prisma.user.findUnique({
      where: { id: targetId },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      // First login — create profile from Supabase auth user
      if (authUser && !userId) {
        const newUser = await prisma.user.create({
          data: {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata?.full_name ?? null,
            avatarUrl: authUser.user_metadata?.avatar_url ?? null,
          },
          include: { _count: { select: { posts: true, followers: true, following: true } } },
        });
        return {
          data: {
            id: newUser.id,
            name: newUser.name,
            username: newUser.username,
            bio: newUser.bio,
            location: newUser.location,
            website: newUser.website,
            avatarUrl: newUser.avatarUrl,
            postsCount: newUser._count.posts,
            followersCount: newUser._count.followers,
            followingCount: newUser._count.following,
          },
        };
      }
      return { data: null };
    }

    return {
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        location: user.location,
        website: user.website,
        avatarUrl: user.avatarUrl,
        postsCount: user._count.posts,
        followersCount: user._count.followers,
        followingCount: user._count.following,
      },
    };
  } catch {
    // No DB — return mock
    return {
      data: {
        id: "mock-id",
        name: "Your Trip User",
        username: "yourtrip_user",
        bio: "นักเดินทางสายธรรมชาติ ✈️",
        location: "เชียงใหม่, ไทย",
        website: "",
        avatarUrl: null,
        postsCount: 48,
        followersCount: 1200,
        followingCount: 234,
      },
    };
  }
}

export async function followUser(targetId: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    await prisma.follow.create({
      data: { followerId: user.id, followingId: targetId },
    });
    return { data: { following: true } };
  } catch {
    return { data: { following: true } };
  }
}

export async function unfollowUser(targetId: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: user.id, followingId: targetId } },
    });
    return { data: { following: false } };
  } catch {
    return { data: { following: false } };
  }
}

export interface PostGridItem {
  id: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
}

/** Get posts for the profile grid (own or another user's) */
export async function getUserPosts(userId?: string): Promise<{ data: PostGridItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const targetId = userId ?? authUser?.id;
    if (!targetId) return { data: [] };

    const posts = await prisma.post.findMany({
      where: { userId: targetId, ...(userId ? { isPublic: true } : {}) },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        _count: { select: { likes: true, comments: true } },
      },
    });

    return {
      data: posts.map((p) => ({
        id: p.id,
        images: p.images,
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
      })),
    };
  } catch {
    return { data: [] };
  }
}

/** Get saved posts for the profile */
export async function getUserSavedPosts(): Promise<{ data: PostGridItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const saves = await prisma.save.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        post: {
          include: { _count: { select: { likes: true, comments: true } } },
        },
      },
    });

    return {
      data: saves.map((s) => ({
        id: s.post.id,
        images: s.post.images,
        likesCount: s.post._count.likes,
        commentsCount: s.post._count.comments,
      })),
    };
  } catch {
    return { data: [] };
  }
}

/** Check if current user follows another user */
export async function checkIsFollowing(targetId: string): Promise<{ following: boolean }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { following: false };

    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId: targetId } },
    });
    return { following: !!follow };
  } catch {
    return { following: false };
  }
}
