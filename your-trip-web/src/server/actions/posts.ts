"use server";

// TODO: wire to Supabase after DB migration
// import { prisma } from "@/lib/prisma";
// import { createServerClient } from "@/lib/supabase/server";
import { createPostSchema, type CreatePostInput } from "@/lib/validations";

export async function createPost(input: CreatePostInput) {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  // TODO: get user from Supabase session
  // const supabase = await createServerClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

  // TODO: create post in DB
  // const post = await prisma.post.create({
  //   data: {
  //     content: parsed.data.content,
  //     images: parsed.data.images ?? [],
  //     location: parsed.data.location,
  //     tags: parsed.data.tags ?? [],
  //     userId: user.id,
  //   },
  // });

  return { data: { id: "mock-post-id", ...parsed.data } };
}

export async function toggleLike(postId: string) {
  // TODO: wire to DB
  // const supabase = await createServerClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };
  //
  // const existing = await prisma.like.findUnique({
  //   where: { userId_postId: { userId: user.id, postId } },
  // });
  // if (existing) {
  //   await prisma.like.delete({ where: { id: existing.id } });
  //   return { data: { liked: false } };
  // }
  // await prisma.like.create({ data: { userId: user.id, postId } });
  return { data: { liked: true } };
}

export async function toggleSave(postId: string) {
  // TODO: wire to DB
  return { data: { saved: true } };
}

export async function getFeed(cursor?: string) {
  // TODO: wire to DB with pagination
  // const posts = await prisma.post.findMany({
  //   take: 10,
  //   ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  //   orderBy: { createdAt: "desc" },
  //   include: { user: true, _count: { select: { likes: true, comments: true } } },
  // });
  return { data: [], nextCursor: undefined, hasMore: false };
}
