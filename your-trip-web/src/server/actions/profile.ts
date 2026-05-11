"use server";

// TODO: wire to Supabase after DB migration
// import { prisma } from "@/lib/prisma";
// import { createServerClient } from "@/lib/supabase/server";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations";

export async function updateProfile(input: UpdateProfileInput) {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  // TODO: get user from Supabase session
  // const supabase = await createServerClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

  // TODO: upsert user profile in DB
  // await prisma.user.upsert({
  //   where: { id: user.id },
  //   update: {
  //     name: parsed.data.name,
  //     username: parsed.data.username,
  //     bio: parsed.data.bio,
  //     location: parsed.data.location,
  //     website: parsed.data.website,
  //   },
  //   create: {
  //     id: user.id,
  //     email: user.email!,
  //     name: parsed.data.name,
  //     username: parsed.data.username,
  //   },
  // });

  return { data: { success: true, ...parsed.data } };
}

export async function getProfile(userId: string) {
  // TODO: prisma.user.findUnique({ where: { id: userId }, include: { posts: ..., trips: ... } })
  void userId;
  return {
    data: {
      id: "mock-id",
      name: "Your Trip User",
      username: "yourtrip_user",
      bio: "นักเดินทางสายธรรมชาติ",
      location: "กรุงเทพฯ",
      website: "",
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
    },
  };
}

export async function followUser(targetId: string) {
  // TODO: prisma.follow.create({ data: { followerId: user.id, followingId: targetId } })
  void targetId;
  return { data: { following: true } };
}

export async function unfollowUser(targetId: string) {
  // TODO: prisma.follow.delete({ where: { followerId_followingId: { followerId: user.id, followingId: targetId } } })
  void targetId;
  return { data: { following: false } };
}
