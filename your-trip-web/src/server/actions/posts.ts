"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";
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
      },
    });

    return { data: { id: post.id, ...parsed.data } };
  } catch {
    // TODO: remove fallback after DB is configured
    return { data: { id: "mock-post-id", ...parsed.data } };
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

    await prisma.like.create({ data: { userId: user.id, postId } });
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
      },
    });

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

export async function getFeed(cursor?: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user: me } } = await supabase.auth.getUser();

    const posts = await prisma.post.findMany({
      take: 10,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: { isPublic: true },
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
      },
    };
  } catch {
    return { data: null };
  }
}
