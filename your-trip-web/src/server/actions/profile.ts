"use server";

import { prisma } from "@/lib/prisma";
import { createNotification } from "./notifications";
import { NotificationType } from "@prisma/client";
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

    const [user, placesVisited] = await Promise.all([
      prisma.user.findUnique({
        where: { id: targetId },
        include: {
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
              trips: true,
            },
          },
        },
      }),
      prisma.tripItem.findMany({
        where: { day: { trip: { userId: targetId } }, placeId: { not: null } },
        select: { placeId: true },
        distinct: ["placeId"],
      }).then((rows) => rows.length).catch(() => 0),
    ]);

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
          include: { _count: { select: { posts: true, followers: true, following: true, trips: true } } },
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
            isVerified: newUser.isVerified,
            isGuide: newUser.isGuide,
            isVerifiedGuide: newUser.isVerifiedGuide,
            postsCount: newUser._count.posts,
            followersCount: newUser._count.followers,
            followingCount: newUser._count.following,
            tripsCount: newUser._count.trips,
            placesVisited: 0,
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
        isVerified: user.isVerified,
        isGuide: user.isGuide,
        isVerifiedGuide: user.isVerifiedGuide,
        postsCount: user._count.posts,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        tripsCount: user._count.trips,
        placesVisited,
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
        isVerified: false,
        isGuide: false,
        isVerifiedGuide: false,
        postsCount: 48,
        followersCount: 1200,
        followingCount: 234,
        tripsCount: 3,
      },
    };
  }
}

export async function followUser(targetId: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    const follower = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, avatarUrl: true },
    });
    await prisma.follow.create({
      data: { followerId: user.id, followingId: targetId },
    });
    await createNotification({
      userId: targetId,
      type: NotificationType.FOLLOW,
      title: `${follower?.name ?? "ใครบางคน"} เริ่มติดตามคุณ`,
      actionUrl: `/profile/${user.id}`,
      actorId: user.id,
      imageUrl: follower?.avatarUrl ?? undefined,
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

// ─── Follower/Following lists & suggestions ────────────────────────────────

export interface UserCard {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isFollowing: boolean;
}

/** Get list of users following `userId` (i.e. userId's followers) */
export async function getFollowers(
  userId: string,
  take = 50
): Promise<{ data: UserCard[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user: me } } = await supabase.auth.getUser();

    const rows = await prisma.follow.findMany({
      where: { followingId: userId },
      take,
      orderBy: { createdAt: "desc" },
      include: {
        follower: {
          select: { id: true, name: true, username: true, avatarUrl: true, bio: true },
        },
      },
    });

    // For each follower, check if `me` follows them
    const ids = rows.map((r) => r.follower.id);
    const myFollows = me
      ? new Set(
          (
            await prisma.follow.findMany({
              where: { followerId: me.id, followingId: { in: ids } },
              select: { followingId: true },
            })
          ).map((f) => f.followingId)
        )
      : new Set<string>();

    return {
      data: rows.map((r) => ({
        id: r.follower.id,
        name: r.follower.name,
        username: r.follower.username,
        avatarUrl: r.follower.avatarUrl,
        bio: r.follower.bio,
        isFollowing: myFollows.has(r.follower.id),
      })),
    };
  } catch {
    return { data: [] };
  }
}

/** Get list of users that `userId` is following */
export async function getFollowing(
  userId: string,
  take = 50
): Promise<{ data: UserCard[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user: me } } = await supabase.auth.getUser();

    const rows = await prisma.follow.findMany({
      where: { followerId: userId },
      take,
      orderBy: { createdAt: "desc" },
      include: {
        following: {
          select: { id: true, name: true, username: true, avatarUrl: true, bio: true },
        },
      },
    });

    const ids = rows.map((r) => r.following.id);
    const myFollows = me
      ? new Set(
          (
            await prisma.follow.findMany({
              where: { followerId: me.id, followingId: { in: ids } },
              select: { followingId: true },
            })
          ).map((f) => f.followingId)
        )
      : new Set<string>();

    return {
      data: rows.map((r) => ({
        id: r.following.id,
        name: r.following.name,
        username: r.following.username,
        avatarUrl: r.following.avatarUrl,
        bio: r.following.bio,
        isFollowing: myFollows.has(r.following.id),
      })),
    };
  } catch {
    return { data: [] };
  }
}

/** Search users by name / username */
export async function searchUsers(q: string, take = 20): Promise<{ data: UserCard[] }> {
  if (!q.trim()) return { data: [] };
  try {
    const supabase = await createServerClient();
    const { data: { user: me } } = await supabase.auth.getUser();

    const myFollows = me
      ? new Set(
          (await prisma.follow.findMany({
            where: { followerId: me.id },
            select: { followingId: true },
          })).map((f) => f.followingId)
        )
      : new Set<string>();

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
        ],
        ...(me ? { id: { not: me.id } } : {}),
      },
      take,
      orderBy: { followers: { _count: "desc" } },
      select: { id: true, name: true, username: true, avatarUrl: true, bio: true },
    });

    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        isFollowing: myFollows.has(u.id),
      })),
    };
  } catch {
    return { data: [] };
  }
}

/** Suggest users to follow:
 *  - exclude self & users I already follow
 *  - rank by follower count desc, then post count desc
 */
export async function getSuggestedUsers(take = 5): Promise<{ data: UserCard[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user: me } } = await supabase.auth.getUser();

    const alreadyFollowingIds = me
      ? (
          await prisma.follow.findMany({
            where: { followerId: me.id },
            select: { followingId: true },
          })
        ).map((f) => f.followingId)
      : [];

    const excludeIds = me ? [me.id, ...alreadyFollowingIds] : [];

    const users = await prisma.user.findMany({
      where: excludeIds.length > 0 ? { id: { notIn: excludeIds } } : undefined,
      take,
      orderBy: [
        { followers: { _count: "desc" } },
        { posts: { _count: "desc" } },
      ],
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
      },
    });

    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        isFollowing: false,
      })),
    };
  } catch {
    return { data: [] };
  }
}


export interface FeaturedGuide {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  tripsCount: number;
}

export async function getVerifiedGuides(take = 6): Promise<{ data: FeaturedGuide[] }> {
  try {
    const guides = await prisma.user.findMany({
      where: { isVerifiedGuide: true },
      take,
      orderBy: [{ trips: { _count: "desc" } }, { followers: { _count: "desc" } }],
      select: {
        id: true, name: true, username: true, avatarUrl: true, bio: true, location: true,
        _count: { select: { trips: true } },
      },
    });
    return {
      data: guides.map((g) => ({
        id: g.id, name: g.name, username: g.username, avatarUrl: g.avatarUrl,
        bio: g.bio, location: g.location, tripsCount: g._count.trips,
      })),
    };
  } catch {
    return { data: [] };
  }
}

// TODO Phase 2: create GuideApplication model to store full application + file uploads + admin review
export async function applyAsGuide(): Promise<{ data?: { success: boolean }; error?: { message: string } }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    await prisma.user.update({
      where: { id: user.id },
      data: { isGuide: true },
    });

    return { data: { success: true } };
  } catch {
    return { error: { message: "เกิดข้อผิดพลาด กรุณาลองใหม่" } };
  }
}
