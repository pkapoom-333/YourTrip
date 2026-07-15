"use server";

import { revalidatePath } from "next/cache";
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
        ...(parsed.data.gender ? { gender: parsed.data.gender } : {}),
        ...(parsed.data.dateOfBirth ? { dateOfBirth: new Date(parsed.data.dateOfBirth) } : {}),
        ...(parsed.data.interests !== undefined ? { interests: parsed.data.interests } : {}),
        ...(parsed.data.avatarUrl ? { avatarUrl: parsed.data.avatarUrl } : {}),
      },
      create: {
        id: user.id,
        email: user.email!,
        name: parsed.data.name,
        username: parsed.data.username,
        ...(parsed.data.interests !== undefined ? { interests: parsed.data.interests } : {}),
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

    const [user, placesVisited, totalTripDays] = await Promise.all([
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
      prisma.tripDay.count({ where: { trip: { userId: targetId } } }).catch(() => 0),
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
        totalTripDays,
      },
    };
  } catch {
    return { data: null };
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
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
    return { error: { message: msg } };
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
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
    return { error: { message: msg } };
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

export async function blockUser(targetId: string): Promise<{ ok: boolean }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === targetId) return { ok: false };

    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: targetId } },
      create: { blockerId: user.id, blockedId: targetId },
      update: {},
    });
    // Also unfollow both directions
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: user.id, followingId: targetId },
          { followerId: targetId, followingId: user.id },
        ],
      },
    }).catch(() => {});
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function unblockUser(targetId: string): Promise<{ ok: boolean }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false };

    await prisma.block.delete({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: targetId } },
    });
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function getBlockedUsers(): Promise<{ data: { id: string; name: string | null; username: string | null; avatarUrl: string | null }[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const blocks = await prisma.block.findMany({
      where: { blockerId: user.id },
      include: { blocked: { select: { id: true, name: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { data: blocks.map((b) => b.blocked) };
  } catch {
    return { data: [] };
  }
}

// ─── Recent Activity feed ─────────────────────────────────────────────────────

export type ActivityItem =
  | { kind: "post";   id: string; image: string | null; caption: string; likesCount: number; createdAt: Date }
  | { kind: "trip";   id: string; title: string; destination: string; coverImage: string | null; createdAt: Date }
  | { kind: "review"; id: string; placeName: string; placeSlug: string; rating: number; content: string | null; createdAt: Date };

export async function getRecentActivity(
  userId?: string,
  take = 15
): Promise<{ data: ActivityItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const targetId = userId ?? authUser?.id;
    if (!targetId) return { data: [] };

    const [posts, trips, reviews] = await Promise.all([
      prisma.post.findMany({
        where: { userId: targetId, ...(userId ? { isPublic: true } : {}) },
        orderBy: { createdAt: "desc" },
        take,
        include: { _count: { select: { likes: true } } },
      }),
      prisma.trip.findMany({
        where: { userId: targetId, ...(userId ? { isPublic: true } : {}) },
        orderBy: { createdAt: "desc" },
        take,
        select: { id: true, title: true, destination: true, coverImage: true, createdAt: true },
      }),
      prisma.review.findMany({
        where: { userId: targetId },
        orderBy: { createdAt: "desc" },
        take,
        include: { place: { select: { name: true, slug: true } } },
      }),
    ]);

    const items: ActivityItem[] = [
      ...posts.map((p): ActivityItem => ({
        kind: "post",
        id: p.id,
        image: p.images[0] ?? null,
        caption: p.content,
        likesCount: p._count.likes,
        createdAt: p.createdAt,
      })),
      ...trips.map((t): ActivityItem => ({
        kind: "trip",
        id: t.id,
        title: t.title,
        destination: t.destination,
        coverImage: t.coverImage,
        createdAt: t.createdAt,
      })),
      ...reviews.map((r): ActivityItem => ({
        kind: "review",
        id: r.id,
        placeName: r.place.name,
        placeSlug: r.place.slug,
        rating: r.rating,
        content: r.content ?? null,
        createdAt: r.createdAt,
      })),
    ];

    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return { data: items.slice(0, take) };
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

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function completeOnboarding(data: {
  username: string;
  name: string;
  interests: string[];
  followUserIds?: string[];
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "ไม่ได้เข้าสู่ระบบ" };

    // Validate username uniqueness
    const existing = await prisma.user.findFirst({
      where: { username: data.username, id: { not: user.id } },
    });
    if (existing) return { ok: false, error: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" };

    await (prisma as any).user.update({
      where: { id: user.id },
      data: {
        username: data.username.trim(),
        name: data.name.trim(),
        interests: data.interests,
        isOnboarded: true,
      },
    });

    // Follow suggested users
    if (data.followUserIds?.length) {
      for (const followId of data.followUserIds) {
        await prisma.follow.upsert({
          where: { followerId_followingId: { followerId: user.id, followingId: followId } },
          update: {},
          create: { followerId: user.id, followingId: followId },
        });
      }
    }

    revalidatePath("/feed");
    revalidatePath("/profile");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function checkOnboardingStatus(): Promise<{ isOnboarded: boolean }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isOnboarded: true }; // not logged in → don't show

    const dbUser = await (prisma as any).user.findUnique({
      where: { id: user.id },
      select: { isOnboarded: true },
    });
    return { isOnboarded: dbUser?.isOnboarded ?? false };
  } catch {
    return { isOnboarded: true };
  }
}

export async function getSuggestedUsersForOnboarding(): Promise<Array<{
  id: string; name: string | null; username: string | null;
  avatarUrl: string | null; isGuide: boolean; _count: { followers: number };
}>> {
  try {
    const users = await (prisma as any).user.findMany({
      where: { isVerified: true },
      select: {
        id: true, name: true, username: true, avatarUrl: true,
        isGuide: true, _count: { select: { followers: true } },
      },
      orderBy: { followers: { _count: "desc" } },
      take: 8,
    });
    return users;
  } catch {
    return [];
  }
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

export interface FollowingActivityItem {
  id: string;
  type: "post" | "review" | "trip" | "follow";
  actor: { id: string; name: string | null; avatarUrl: string | null; username: string | null };
  payload: {
    postId?: string;
    postContent?: string;
    postImage?: string;
    placeSlug?: string;
    placeName?: string;
    placeImage?: string;
    tripId?: string;
    tripName?: string;
    targetUserId?: string;
    targetUserName?: string;
    rating?: number;
  };
  createdAt: Date;
}

export async function getFollowingActivity(limit = 30): Promise<{ data: FollowingActivityItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    // Get list of followed user IDs
    const follows = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    const followedIds = follows.map((f) => f.followingId);
    if (followedIds.length === 0) return { data: [] };

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // last 30 days

    // Fetch recent posts, reviews, trips, follows in parallel
    const [posts, reviews, trips, newFollows] = await Promise.all([
      prisma.post.findMany({
        where: { userId: { in: followedIds }, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true, content: true, images: true, createdAt: true,
          user: { select: { id: true, name: true, avatarUrl: true, username: true } },
          place: { select: { slug: true, name: true, images: { take: 1, select: { url: true } } } },
        },
      }),
      (prisma as any).review.findMany({
        where: { userId: { in: followedIds }, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, username: true } },
          place: { select: { slug: true, name: true, images: { take: 1, select: { url: true } } } },
        },
      }),
      prisma.trip.findMany({
        where: { userId: { in: followedIds }, isPublic: true, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true, title: true, createdAt: true,
          user: { select: { id: true, name: true, avatarUrl: true, username: true } },
        },
      }),
      prisma.follow.findMany({
        where: { followerId: { in: followedIds }, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          createdAt: true,
          follower: { select: { id: true, name: true, avatarUrl: true, username: true } },
          following: { select: { id: true, name: true, avatarUrl: true, username: true } },
        },
      }),
    ]);

    const items: FollowingActivityItem[] = [];

    for (const p of posts) {
      items.push({
        id: `post-${p.id}`,
        type: "post",
        actor: p.user,
        payload: {
          postId: p.id,
          postContent: p.content?.slice(0, 100),
          postImage: Array.isArray(p.images) ? (p.images as string[])[0] : undefined,
          placeSlug: p.place?.slug,
          placeName: p.place?.name,
        },
        createdAt: p.createdAt,
      });
    }

    for (const r of reviews) {
      items.push({
        id: `review-${r.id}`,
        type: "review",
        actor: r.user,
        payload: {
          placeSlug: r.place?.slug,
          placeName: r.place?.name,
          placeImage: r.place?.images?.[0]?.url,
          rating: r.rating,
        },
        createdAt: r.createdAt,
      });
    }

    for (const t of trips) {
      items.push({
        id: `trip-${t.id}`,
        type: "trip",
        actor: t.user,
        payload: { tripId: t.id, tripName: t.title },
        createdAt: t.createdAt,
      });
    }

    for (const f of newFollows) {
      items.push({
        id: `follow-${f.follower.id}-${f.following.id}`,
        type: "follow",
        actor: f.follower,
        payload: { targetUserId: f.following.id, targetUserName: f.following.name ?? f.following.username ?? "" },
        createdAt: f.createdAt,
      });
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { data: items.slice(0, limit) };
  } catch {
    return { data: [] as FollowingActivityItem[] };
  }
}

// ─── Deep Stats ───────────────────────────────────────────────────────────────

export interface DeepStats {
  postsPerMonth: Array<{ month: string; count: number }>;
  placesByProvince: Array<{ province: string; count: number }>;
  placesByCategory: Array<{ category: string; count: number }>;
  tripsCount: number;
  totalDaysPlanned: number;
  totalPlacesInTrips: number;
  reviewsCount: number;
  avgRatingGiven: number;
  joinedDaysAgo: number;
  savedPlacesCount: number;
  followersCount: number;
  followingCount: number;
}

export async function getDeepStats(targetUserId?: string): Promise<{ data: DeepStats | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = targetUserId ?? user?.id;
    if (!userId) return { data: null };

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        _count: { select: { followers: true, following: true } },
      },
    });
    if (!dbUser) return { data: null };

    const since12Months = new Date();
    since12Months.setMonth(since12Months.getMonth() - 11);
    since12Months.setDate(1);

    const [posts, savedPlaces, trips, reviews] = await Promise.all([
      prisma.post.findMany({
        where: { userId, createdAt: { gte: since12Months } },
        select: { createdAt: true, place: { select: { province: true, category: true } } },
      }),
      (prisma as any).savedPlace.findMany({
        where: { userId },
        select: { place: { select: { province: true, category: true } } },
      }),
      prisma.trip.findMany({
        where: { userId },
        select: {
          _count: { select: { days: true } },
          days: { select: { _count: { select: { items: true } } } },
        },
      }),
      (prisma as any).review.findMany({
        where: { userId },
        select: { rating: true },
      }),
    ]);

    // Posts per month (last 12)
    const monthCounts: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthCounts[key] = 0;
    }
    for (const p of posts) {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthCounts) monthCounts[key]++;
    }
    const postsPerMonth = Object.entries(monthCounts).map(([month, count]) => ({ month, count }));

    // Places by province from saved places
    const provCounts: Record<string, number> = {};
    for (const sp of savedPlaces) {
      const prov = sp.place?.province ?? "ไม่ระบุ";
      provCounts[prov] = (provCounts[prov] ?? 0) + 1;
    }
    const placesByProvince = Object.entries(provCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([province, count]) => ({ province, count }));

    // Places by category
    const catCounts: Record<string, number> = {};
    for (const sp of savedPlaces) {
      const cat = sp.place?.category ?? "other";
      catCounts[cat] = (catCounts[cat] ?? 0) + 1;
    }
    const placesByCategory = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));

    const tripsCount = trips.length;
    const totalDaysPlanned = trips.reduce((s, t) => s + t._count.days, 0);
    const totalPlacesInTrips = trips.reduce((s, t) =>
      s + t.days.reduce((ds, d) => ds + d._count.items, 0), 0);

    const reviewsCount = reviews.length;
    const avgRatingGiven = reviewsCount > 0
      ? Math.round((reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviewsCount) * 10) / 10
      : 0;

    const joinedDaysAgo = Math.floor((Date.now() - new Date(dbUser.createdAt).getTime()) / 86_400_000);
    const savedPlacesCount = savedPlaces.length;

    return {
      data: {
        postsPerMonth,
        placesByProvince,
        placesByCategory,
        tripsCount,
        totalDaysPlanned,
        totalPlacesInTrips,
        reviewsCount,
        avgRatingGiven,
        joinedDaysAgo,
        savedPlacesCount,
        followersCount: dbUser._count.followers,
        followingCount: dbUser._count.following,
      },
    };
  } catch {
    return { data: null };
  }
}

// ── Discover People ──────────────────────────────────────────────────
const dbProfile = prisma as any;

export interface DiscoverUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isGuide: boolean;
  isVerifiedGuide: boolean;
  followersCount: number;
  postsCount: number;
  isFollowing: boolean;
  mutualFollowers: number;
  interests: string[];
}

export async function getDiscoverUsers(limit = 20): Promise<{ data: DiscoverUser[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const myFollows = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    const followingIds = new Set(myFollows.map((f) => f.followingId));

    const candidates = await dbProfile.user.findMany({
      where: {
        id: { not: user.id, notIn: Array.from(followingIds) },
      },
      select: {
        id: true, name: true, username: true, avatarUrl: true, bio: true,
        isGuide: true, isVerifiedGuide: true, interests: true,
        _count: { select: { followers: true, posts: true } },
      },
      orderBy: { followers: { _count: "desc" } },
      take: limit,
    });

    const myFollowerIds = (await prisma.follow.findMany({
      where: { followingId: user.id },
      select: { followerId: true },
    })).map((f) => f.followerId);

    const data: DiscoverUser[] = await Promise.all(
      (candidates as Array<{
        id: string; name: string | null; username: string | null; avatarUrl: string | null;
        bio: string | null; isGuide: boolean; isVerifiedGuide: boolean; interests: string[];
        _count: { followers: number; posts: number };
      }>).map(async (u) => {
        const mutual = await prisma.follow.count({
          where: {
            followingId: u.id,
            followerId: { in: myFollowerIds },
          },
        });
        return {
          id: u.id,
          name: u.name,
          username: u.username,
          avatarUrl: u.avatarUrl,
          bio: u.bio ?? null,
          isGuide: u.isGuide,
          isVerifiedGuide: u.isVerifiedGuide,
          followersCount: u._count.followers,
          postsCount: u._count.posts,
          isFollowing: followingIds.has(u.id),
          mutualFollowers: mutual,
          interests: u.interests ?? [],
        };
      })
    );

    return { data };
  } catch {
    return { data: [] };
  }
}

// ── User Achievements ────────────────────────────────────────────────
export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;   // 0-100
  maxValue?: number;
  currentValue?: number;
}

export async function getUserAchievements(targetUserId?: string): Promise<{ data: Achievement[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = targetUserId ?? user?.id;
    if (!userId) return { data: [] };

    // Fetch all stats in parallel
    const [postsCount, reviewsCount, tripsCount, followersCount, savedCount, checkInsCount] = await Promise.all([
      prisma.post.count({ where: { userId } }),
      prisma.review.count({ where: { userId } }),
      prisma.trip.count({ where: { userId } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.save.count({ where: { userId } }),
      dbProfile.checkIn.count({ where: { userId } }).catch(() => 0),
    ]);

    const ACHIEVEMENTS: Array<Omit<Achievement, 'earned' | 'progress'> & {
      check: () => boolean;
      current: () => number;
      max: number;
    }> = [
      {
        id: "first-post", title: "โพสต์แรก", emoji: "📸",
        description: "โพสต์รูปภาพหรือเรื่องราวแรกของคุณ",
        check: () => postsCount >= 1, current: () => postsCount, max: 1,
      },
      {
        id: "explorer-5", title: "นักสำรวจ", emoji: "🗺️",
        description: "โพสต์ 5 โพสต์",
        check: () => postsCount >= 5, current: () => postsCount, max: 5,
      },
      {
        id: "pro-poster-20", title: "นักโพสต์มือโปร", emoji: "🌟",
        description: "โพสต์ 20 โพสต์",
        check: () => postsCount >= 20, current: () => postsCount, max: 20,
      },
      {
        id: "first-trip", title: "ทริปแรก", emoji: "✈️",
        description: "วางแผนทริปแรกของคุณ",
        check: () => tripsCount >= 1, current: () => tripsCount, max: 1,
      },
      {
        id: "trip-planner", title: "นักวางแผนทริป", emoji: "🗓️",
        description: "วางแผนทริปครบ 5 ทริป",
        check: () => tripsCount >= 5, current: () => tripsCount, max: 5,
      },
      {
        id: "first-review", title: "นักวิจารณ์", emoji: "⭐",
        description: "เขียนรีวิวสถานที่แรก",
        check: () => reviewsCount >= 1, current: () => reviewsCount, max: 1,
      },
      {
        id: "review-pro", title: "นักวิจารณ์มือโปร", emoji: "🏆",
        description: "เขียนรีวิว 10 ครั้ง",
        check: () => reviewsCount >= 10, current: () => reviewsCount, max: 10,
      },
      {
        id: "popular-10", title: "คนดัง", emoji: "👑",
        description: "มีผู้ติดตาม 10 คน",
        check: () => followersCount >= 10, current: () => followersCount, max: 10,
      },
      {
        id: "collector", title: "นักสะสม", emoji: "🔖",
        description: "บันทึกสถานที่ 10 แห่ง",
        check: () => savedCount >= 10, current: () => savedCount, max: 10,
      },
      {
        id: "check-in-5", title: "นักเช็คอิน", emoji: "📍",
        description: "เช็คอินสถานที่ 5 แห่ง",
        check: () => (checkInsCount as number) >= 5, current: () => checkInsCount as number, max: 5,
      },
    ];

    const data: Achievement[] = ACHIEVEMENTS.map((a) => ({
      id: a.id, title: a.title, description: a.description, emoji: a.emoji,
      earned: a.check(),
      currentValue: a.current(),
      maxValue: a.max,
      progress: Math.min(100, Math.round((a.current() / a.max) * 100)),
    }));

    return { data };
  } catch {
    return { data: [] };
  }
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export interface LeaderboardUser {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  isVerifiedGuide: boolean;
  score: number;
  postsCount: number;
  reviewsCount: number;
  tripsCount: number;
  followersCount: number;
}

export async function getLeaderboard(
  type: "posts" | "reviews" | "trips" | "followers" = "posts",
  take = 20,
): Promise<{ data: LeaderboardUser[] }> {
  try {
    const orderField =
      type === "posts" ? { posts: { _count: "desc" as const } }
      : type === "reviews" ? { reviews: { _count: "desc" as const } }
      : type === "trips" ? { trips: { _count: "desc" as const } }
      : undefined;

    const users = await prisma.user.findMany({
      take,
      where: {},
      orderBy: orderField,
      include: {
        _count: {
          select: {
            posts: true,
            reviews: true,
            trips: true,
            followers: true,
          },
        },
      },
    });

    const withScore = users.map((u) => {
      const p = u._count.posts;
      const r = u._count.reviews;
      const t = u._count.trips;
      const f = u._count.followers;
      const score = p * 3 + r * 5 + t * 4 + f;
      return {
        id: u.id,
        name: u.name ?? u.email?.split("@")[0] ?? "User",
        username: u.username,
        avatarUrl: u.avatarUrl,
        isVerifiedGuide: u.isVerifiedGuide ?? false,
        score,
        postsCount: p,
        reviewsCount: r,
        tripsCount: t,
        followersCount: f,
      };
    });

    if (type === "followers") {
      withScore.sort((a, b) => b.followersCount - a.followersCount);
    }

    return { data: withScore };
  } catch {
    return { data: [] };
  }
}

/** Return ISO date strings (YYYY-MM-DD) for all user activity in the last ~12 months */
export async function getUserActivityDates(targetUserId?: string): Promise<{ data: string[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = targetUserId ?? user?.id;
    if (!userId) return { data: [] };

    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);

    const toDateStr = (d: Date) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    };

    const dbAny = prisma as unknown as {
      post: { findMany: (q: unknown) => Promise<Array<{ createdAt: Date }>> };
      checkIn: { findMany: (q: unknown) => Promise<Array<{ createdAt: Date }>> };
      review: { findMany: (q: unknown) => Promise<Array<{ createdAt: Date }>> };
    };

    const [posts, checkIns, reviews] = await Promise.all([
      dbAny.post.findMany({ where: { authorId: userId, createdAt: { gte: since } }, select: { createdAt: true } }).catch(() => [] as Array<{ createdAt: Date }>),
      dbAny.checkIn.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }).catch(() => [] as Array<{ createdAt: Date }>),
      dbAny.review.findMany({ where: { authorId: userId, createdAt: { gte: since } }, select: { createdAt: true } }).catch(() => [] as Array<{ createdAt: Date }>),
    ]);

    const all: string[] = [
      ...posts.map((p) => toDateStr(p.createdAt)),
      ...checkIns.map((c) => toDateStr(c.createdAt)),
      ...reviews.map((r) => toDateStr(r.createdAt)),
    ];

    return { data: all };
  } catch {
    return { data: [] };
  }
}
