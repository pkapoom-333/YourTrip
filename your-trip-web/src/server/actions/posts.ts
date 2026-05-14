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

export async function getFeed(cursor?: string) {
  try {
    const posts = await prisma.post.findMany({
      take: 10,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const nextCursor = posts.length === 10 ? posts[posts.length - 1].id : undefined;

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
      })),
      nextCursor,
      hasMore: !!nextCursor,
    };
  } catch {
    return { data: [], nextCursor: undefined, hasMore: false };
  }
}
