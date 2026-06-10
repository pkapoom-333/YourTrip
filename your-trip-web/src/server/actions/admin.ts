"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "pakpoomtee24@gmail.com").split(",").map((e) => e.trim());

async function requireAdmin(): Promise<string> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    throw new Error("Unauthorized");
  }
  return user.id;
}

export interface GuideApplicant {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isVerifiedGuide: boolean;
  followerCount: number;
  postCount: number;
}

export async function getGuideApplications(): Promise<{
  pending: GuideApplicant[];
  approved: GuideApplicant[];
}> {
  try {
    await requireAdmin();

    const applicants = await prisma.user.findMany({
      where: { isGuide: true },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        isVerifiedGuide: true,
        _count: { select: { followers: true, posts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped: GuideApplicant[] = applicants.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      isVerifiedGuide: u.isVerifiedGuide,
      followerCount: u._count.followers,
      postCount: u._count.posts,
    }));

    return {
      pending: mapped.filter((u) => !u.isVerifiedGuide),
      approved: mapped.filter((u) => u.isVerifiedGuide),
    };
  } catch {
    return { pending: [], approved: [] };
  }
}

export async function approveGuide(userId: string): Promise<{ ok: boolean }> {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { isGuide: true, isVerifiedGuide: true },
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function rejectGuide(userId: string): Promise<{ ok: boolean }> {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { isGuide: false, isVerifiedGuide: false },
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
