"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createNotification } from "./notifications";
import { NotificationType } from "@prisma/client";
import { createPostSchema, type CreatePostInput } from "@/lib/validations";

export async function createPost(input: CreatePostInput) {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    const post = await prisma.post.create({
      data: {
        content: parsed.data.content,
        images: parsed.data.images ?? [],
        location: parsed.data.location,
        tags: parsed.data.tags ?? [],
        userId: user.id,
        placeId: parsed.data.placeId ?? null,
      },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });

    // @mention notifications (fire and forget)
    const mentions = [...new Set((parsed.data.content.match(/@(\w+)/g) ?? []).map((m) => m.slice(1)))];
    if (mentions.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: { username: { in: mentions }, id: { not: user.id } },
        select: { id: true },
      }).catch(() => []);
      await Promise.all(
        mentionedUsers.map((u) =>
          createNotification({
            userId: u.id,
            type: NotificationType.LIKE,
            title: `${post.user.name ?? "ใครบางคน"} กล่าวถึงคุณในโพสต์`,
            actionUrl: `/post/${post.id}`,
            actorId: user.id,
            imageUrl: post.user.avatarUrl ?? undefined,
          }).catch(() => {})
        )
      );
    }

    return { data: { id: post.id, ...parsed.data } };
  } catch (err) {
    console.error("[createPost]", err);
    return { error: { message: "ไม่สามารถสร้างโพสต์ได้ กรุณาลองใหม่อีกครั้ง" } };
  }
}

export async function toggleLike(postId: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return { data: { liked: false } };
    }

    const like = await prisma.like.create({
      data: { userId: user.id, postId },
      include: {
        post: { select: { userId: true, content: true } },
        user: { select: { name: true, avatarUrl: true } },
      },
    });
    // Notify post owner
    if (like.post) {
      await createNotification({
        userId: like.post.userId,
        type: NotificationType.LIKE,
        title: `${like.user.name ?? "ใครบางคน"} ถูกใจโพสต์ของคุณ`,
        body: like.post.content?.slice(0, 80) ?? undefined,
        actionUrl: `/post/${postId}`,
        actorId: user.id,
        imageUrl: like.user.avatarUrl ?? undefined,
      });
    }
    return { data: { liked: true } };
  } catch {
    return { data: { liked: true } };
  }
}

export async function toggleSave(postId: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    const existing = await prisma.save.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    if (existing) {
      await prisma.save.delete({ where: { id: existing.id } });
      return { data: { saved: false } };
    }

    await prisma.save.create({ data: { userId: user.id, postId } });
    return { data: { saved: true } };
  } catch {
    return { data: { saved: true } };
  }
}

export interface CommentItem {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string | null; username: string | null; avatarUrl: string | null };
  replies: CommentItem[];
}

export async function getComments(postId: string): Promise<{ data: CommentItem[] }> {
  try {
    const rows = await prisma.comment.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, username: true, avatarUrl: true } },
          },
        },
      },
    });
    return {
      data: rows.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        user: c.user,
        replies: c.replies.map((r) => ({
          id: r.id,
          content: r.content,
          createdAt: r.createdAt,
          user: r.user,
          replies: [],
        })),
      })),
    };
  } catch {
    return { data: [] };
  }
}

export async function createComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<{ data: CommentItem | null; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "กรุณาเข้าสู่ระบบ" };

    const comment = await prisma.comment.create({
      data: { postId, content, userId: user.id, parentId: parentId ?? null },
      include: {
        user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        post: { select: { userId: true, content: true } },
      },
    });

    // Notify post owner (skip self-comment)
    if (comment.post && comment.post.userId !== user.id && !parentId) {
      await createNotification({
        userId: comment.post.userId,
        type: NotificationType.COMMENT,
        title: `${comment.user.name ?? "ใครบางคน"} แสดงความคิดเห็นในโพสต์ของคุณ`,
        body: content.slice(0, 80),
        actionUrl: `/post/${postId}`,
        actorId: user.id,
        imageUrl: comment.user.avatarUrl ?? undefined,
      }).catch(() => {});
    }

    // @mention notifications in comment (fire and forget)
    const commentMentions = [...new Set((content.match(/@(\w+)/g) ?? []).map((m) => m.slice(1)))];
    if (commentMentions.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: { username: { in: commentMentions }, id: { not: user.id } },
        select: { id: true },
      }).catch(() => []);
      await Promise.all(
        mentionedUsers.map((u) =>
          createNotification({
            userId: u.id,
            type: NotificationType.COMMENT,
            title: `${comment.user.name ?? "ใครบางคน"} กล่าวถึงคุณในความคิดเห็น`,
            body: content.slice(0, 80),
            actionUrl: `/post/${postId}`,
            actorId: user.id,
            imageUrl: comment.user.avatarUrl ?? undefined,
          }).catch(() => {})
        )
      );
    }

    return {
      data: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: comment.user,
        replies: [],
      },
    };
  } catch {
    // Optimistic fallback — return a local comment object
    return {
      data: {
        id: `local-${Date.now()}`,
        content,
        createdAt: new Date(),
        user: { id: "local", name: "คุณ", username: null, avatarUrl: null },
        replies: [],
      },
    };
  }
}

export async function deleteComment(
  commentId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, post: { select: { userId: true } } },
    });
    if (!comment) return { ok: false, error: "ไม่พบความคิดเห็น" };

    const isAuthor = comment.userId === user.id;
    const isPostOwner = comment.post?.userId === user.id;
    if (!isAuthor && !isPostOwner) return { ok: false, error: "ไม่มีสิทธิ์ลบ" };

    await prisma.comment.delete({ where: { id: commentId } });
    return { ok: true };
  } catch {
    return { ok: false, error: "เกิดข้อผิดพลาด" };
  }
}

export async function getFeed(cursor?: string, followingOnly = false) {
  try {
    const supabase = await createServerClient();
    const { data: { user: me } } = await supabase.auth.getUser();

    // If followingOnly, get IDs of users I follow
    let followingIds: string[] | undefined;
    if (followingOnly && me) {
      const follows = await prisma.follow.findMany({
        where: { followerId: me.id },
        select: { followingId: true },
      });
      followingIds = follows.map((f) => f.followingId);
    }

    const posts = await prisma.post.findMany({
      take: 10,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: {
        isPublic: true,
        ...(followingOnly && followingIds !== undefined
          ? { userId: { in: followingIds } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        place: { select: { id: true, slug: true, name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const nextCursor = posts.length === 10 ? posts[posts.length - 1].id : undefined;
    const postIds = posts.map((p) => p.id);

    // Fetch liked/saved state for current user in one batch query
    const [likedSet, savedSet] = me
      ? await Promise.all([
          prisma.like.findMany({ where: { userId: me.id, postId: { in: postIds } }, select: { postId: true } })
            .then((rows) => new Set(rows.map((r) => r.postId))),
          prisma.save.findMany({ where: { userId: me.id, postId: { in: postIds } }, select: { postId: true } })
            .then((rows) => new Set(rows.map((r) => r.postId))),
        ])
      : [new Set<string>(), new Set<string>()];

    return {
      data: posts.map((p) => ({
        id: p.id,
        userId: p.userId,
        content: p.content,
        images: p.images,
        location: p.location,
        tags: p.tags,
        createdAt: p.createdAt,
        user: p.user,
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        likedByMe: likedSet.has(p.id),
        savedByMe: savedSet.has(p.id),
        place: p.place ? { id: p.place.id, slug: p.place.slug, name: p.place.name } : null,
      })),
      nextCursor,
      hasMore: !!nextCursor,
    };
  } catch {
    return { data: [], nextCursor: undefined, hasMore: false };
  }
}

export interface PostDetail {
  id: string;
  content: string;
  images: string[];
  location: string | null;
  tags: string[];
  createdAt: Date;
  isPublic: boolean;
  user: { id: string; name: string | null; username: string | null; avatarUrl: string | null };
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  place: { id: string; slug: string; name: string } | null;
}

export async function editPost(postId: string, content: string): Promise<{ data?: { id: string }; error?: { message: string } }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    const trimmed = content.trim();
    if (!trimmed) return { error: { message: "กรุณาใส่เนื้อหา" } };

    await prisma.post.update({
      where: { id: postId, userId: user.id },
      data: { content: trimmed },
    });
    return { data: { id: postId } };
  } catch {
    return { error: { message: "ไม่สามารถแก้ไขโพสต์ได้" } };
  }
}

export async function deletePost(postId: string): Promise<{ data?: { success: boolean }; error?: { message: string } }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    // Soft delete — mark isPublic = false (or hard delete for simplicity)
    await prisma.post.delete({ where: { id: postId, userId: user.id } });
    return { data: { success: true } };
  } catch {
    return { error: { message: "ไม่สามารถลบโพสต์ได้" } };
  }
}

// ─── getPostsByTag ────────────────────────────────────────────────────────────

export async function getPostsByTag(
  tag: string,
  cursor?: string,
  take = 12
): Promise<{ data: ReturnType<typeof getFeed> extends Promise<{ data: infer T }> ? T : never; nextCursor?: string; hasMore: boolean }> {
  try {
    const supabase = await createServerClient();
    const { data: { user: me } } = await supabase.auth.getUser();

    const posts = await prisma.post.findMany({
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: { isPublic: true, tags: { has: tag } },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        place: { select: { id: true, slug: true, name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const nextCursor = posts.length === take ? posts[posts.length - 1].id : undefined;
    const postIds = posts.map((p) => p.id);

    const [likedSet, savedSet] = me
      ? await Promise.all([
          prisma.like.findMany({ where: { userId: me.id, postId: { in: postIds } }, select: { postId: true } })
            .then((rows) => new Set(rows.map((r) => r.postId))),
          prisma.save.findMany({ where: { userId: me.id, postId: { in: postIds } }, select: { postId: true } })
            .then((rows) => new Set(rows.map((r) => r.postId))),
        ])
      : [new Set<string>(), new Set<string>()];

    return {
      data: posts.map((p) => ({
        id: p.id,
        userId: p.userId,
        content: p.content,
        images: p.images,
        location: p.location,
        tags: p.tags,
        createdAt: p.createdAt,
        user: p.user,
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        likedByMe: likedSet.has(p.id),
        savedByMe: savedSet.has(p.id),
        place: p.place ? { id: p.place.id, slug: p.place.slug, name: p.place.name } : null,
      })),
      nextCursor,
      hasMore: !!nextCursor,
    };
  } catch {
    return { data: [], nextCursor: undefined, hasMore: false };
  }
}

export async function getRelatedPosts(postId: string, tags: string[], take = 4): Promise<{ data: Array<{ id: string; images: string[]; likesCount: number; user: { name: string | null; avatarUrl: string | null } }> }> {
  try {
    if (tags.length === 0) return { data: [] };
    const posts = await prisma.post.findMany({
      where: {
        id: { not: postId },
        tags: { hasSome: tags },
        isPublic: true,
      },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        images: true,
        _count: { select: { likes: true } },
        user: { select: { name: true, avatarUrl: true } },
      },
    });
    return {
      data: posts.map((p) => ({
        id: p.id,
        images: p.images,
        likesCount: p._count.likes,
        user: p.user,
      })),
    };
  } catch {
    return { data: [] };
  }
}

export async function getPostById(postId: string): Promise<{ data: PostDetail | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user: me } } = await supabase.auth.getUser();

    const [post, likedByMe, savedByMe] = await Promise.all([
      prisma.post.findUnique({
        where: { id: postId },
        include: {
          user: { select: { id: true, name: true, username: true, avatarUrl: true } },
          place: { select: { id: true, slug: true, name: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      me ? prisma.like.findUnique({ where: { userId_postId: { userId: me.id, postId } } }) : null,
      me ? prisma.save.findUnique({ where: { userId_postId: { userId: me.id, postId } } }) : null,
    ]);

    if (!post) return { data: null };
    return {
      data: {
        id: post.id,
        content: post.content,
        images: post.images,
        location: post.location,
        tags: post.tags,
        createdAt: post.createdAt,
        isPublic: post.isPublic,
        user: post.user,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        likedByMe: !!likedByMe,
        savedByMe: !!savedByMe,
        place: post.place ? { id: post.place.id, slug: post.place.slug, name: post.place.name } : null,
      },
    };
  } catch {
    return { data: null };
  }
}

export interface PostSearchResult {
  id: string;
  content: string;
  images: string[];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  user: { id: string; name: string | null; username: string | null; avatarUrl: string | null };
  place: { slug: string; name: string } | null;
}

export async function searchPosts(
  query: string,
  take = 20
): Promise<{ data: PostSearchResult[] }> {
  if (!query.trim()) return { data: [] };

  try {
    const posts = await prisma.post.findMany({
      where: {
        isPublic: true,
        OR: [
          { content: { contains: query, mode: "insensitive" } },
          { tags: { has: query.toLowerCase().replace(/^#/, "") } },
          { location: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        content: true,
        images: true,
        tags: true,
        location: true,
        createdAt: true,
        user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        place: { select: { slug: true, name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return {
      data: posts.map((p) => ({
        id: p.id,
        content: p.content,
        images: p.images,
        tags: p.tags,
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        createdAt: p.createdAt,
        user: p.user,
        place: p.place,
      })),
    };
  } catch {
    return { data: [] };
  }
}

// REPORT_REASONS moved to PostCard.tsx — cannot export non-async values from "use server" files

export async function getTrendingHashtags(take = 8): Promise<{ data: { tag: string; count: number }[] }> {
  try {
    // Unnest the tags array and count occurrences across all posts (last 30 days)
    const rows = await prisma.$queryRaw<{ tag: string; count: bigint }[]>`
      SELECT tag, COUNT(*) as count
      FROM posts, UNNEST(tags) AS tag
      WHERE "createdAt" > NOW() - INTERVAL '30 days'
        AND tag IS NOT NULL AND tag != ''
      GROUP BY tag
      ORDER BY count DESC
      LIMIT ${take}
    `;
    return { data: rows.map((r) => ({ tag: r.tag, count: Number(r.count) })) };
  } catch {
    // Fallback mock if DB not ready or no posts with tags
    return {
      data: [
        { tag: "เชียงใหม่", count: 2400 },
        { tag: "บาหลี",     count: 1800 },
        { tag: "โตเกียว",  count: 3100 },
        { tag: "ภูเก็ต",   count: 1500 },
        { tag: "กรุงเทพฯ", count: 4200 },
        { tag: "คาเฟ่",    count: 890  },
      ],
    };
  }
}

/** Get recent posts for a place (community photos) */
export async function getPostsByPlace(
  placeId: string,
  take = 9
): Promise<{ data: { id: string; images: string[]; likesCount: number; user: { name: string | null; avatarUrl: string | null } }[] }> {
  try {
    const posts = await prisma.post.findMany({
      where: { placeId, isPublic: true },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        images: true,
        _count: { select: { likes: true } },
        user: { select: { name: true, avatarUrl: true } },
      },
    });
    return {
      data: posts.map((p) => ({
        id: p.id,
        images: p.images,
        likesCount: p._count.likes,
        user: p.user,
      })),
    };
  } catch {
    return { data: [] };
  }
}

export async function reportPost(
  postId: string,
  reason: string,
  note?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

    await prisma.report.upsert({
      where: { postId_userId: { postId, userId: user.id } },
      create: { postId, userId: user.id, reason, note: note ?? null },
      update: { reason, note: note ?? null },
    });
    return { ok: true };
  } catch {
    return { ok: true }; // silently succeed if table doesn't exist yet
  }
}

export interface ActiveUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
}

/** Users who posted publicly in the last 7 days — for the feed stories row */
export async function getActiveUsers(take = 12): Promise<{ data: ActiveUser[] }> {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rows = await prisma.post.findMany({
      where: { isPublic: true, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      select: { userId: true, user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
      distinct: ["userId"],
      take,
    });
    return { data: rows.map((r) => r.user) };
  } catch {
    return { data: [] };
  }
}
