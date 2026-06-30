"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "pakpoomtee24@gmail.com").split(",").map((e) => e.trim());

async function requireAdmin(): Promise<string> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    throw new Error("Unauthorized");
  }
  return user.id;
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface AdminUser {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  isGuide: boolean;
  isVerifiedGuide: boolean;
  postCount: number;
  followerCount: number;
  createdAt: string;
}

export interface AdminReport {
  id: string;
  reason: string;
  note: string | null;
  createdAt: string;
  post: {
    id: string;
    content: string;
    userId: string;
    userName: string | null;
  };
  reporter: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export interface DashboardStats {
  totalUsers: number;
  newUsersThisWeek: number;
  totalPosts: number;
  newPostsThisWeek: number;
  totalPlaces: number;
  pendingReports: number;
  pendingGuides: number;
  totalMessages: number;
}

export interface AdminPlace {
  id: string;
  slug: string;
  name: string;
  category: string;
  province: string | null;
  region: string;
  isPublished: boolean;
  isFeatured: boolean;
  reviewCount: number;
  createdAt: string;
}

export interface PlaceFormData {
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  descriptionEn?: string;
  category: string;
  region: string;
  province?: string;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  priceRange: number;
  entryFee?: number;
  openDays: string[];
  openTime?: string;
  closeTime?: string;
  hasWifi: boolean;
  hasAC: boolean;
  hasParking: boolean;
  parkingFee?: number;
  isVegetarian: boolean;
  isAccessible: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  images: string[];
}

type ActionResult = { ok: true; id?: string; slug?: string } | { ok: false; error: string };

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    await requireAdmin();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, newUsersThisWeek,
      totalPosts, newPostsThisWeek,
      totalPlaces, pendingReports, pendingGuides, totalMessages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.post.count(),
      prisma.post.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.place.count(),
      prisma.report.count(),
      prisma.user.count({ where: { isGuide: true, isVerifiedGuide: false } }),
      prisma.message.count(),
    ]);

    return {
      totalUsers, newUsersThisWeek,
      totalPosts, newPostsThisWeek,
      totalPlaces, pendingReports, pendingGuides, totalMessages,
    };
  } catch {
    return {
      totalUsers: 0, newUsersThisWeek: 0,
      totalPosts: 0, newPostsThisWeek: 0,
      totalPlaces: 0, pendingReports: 0, pendingGuides: 0, totalMessages: 0,
    };
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getAdminUsers(opts?: { search?: string; page?: number }): Promise<{
  users: AdminUser[];
  total: number;
}> {
  try {
    await requireAdmin();
    const page = opts?.page ?? 1;
    const take = 20;
    const skip = (page - 1) * take;
    const where = opts?.search
      ? {
          OR: [
            { name: { contains: opts.search, mode: "insensitive" as const } },
            { username: { contains: opts.search, mode: "insensitive" as const } },
            { email: { contains: opts.search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatarUrl: true,
          isVerified: true,
          isGuide: true,
          isVerifiedGuide: true,
          createdAt: true,
          _count: { select: { posts: true, followers: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        avatarUrl: u.avatarUrl,
        isVerified: u.isVerified,
        isGuide: u.isGuide,
        isVerifiedGuide: u.isVerifiedGuide,
        postCount: u._count.posts,
        followerCount: u._count.followers,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
    };
  } catch {
    return { users: [], total: 0 };
  }
}

export async function banUser(userId: string): Promise<void> {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isVerified: false } });
  revalidatePath("/admin/users");
}

export async function verifyUser(userId: string, verified: boolean): Promise<void> {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isVerified: verified } });
  revalidatePath("/admin/users");
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function getAdminReports(): Promise<AdminReport[]> {
  try {
    await requireAdmin();
    // Report schema: { id, postId, post, userId, user (= reporter), reason, note, createdAt }
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        post: { select: { id: true, content: true, userId: true, user: { select: { name: true } } } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
      post: {
        id: r.post.id,
        content: r.post.content,
        userId: r.post.userId,
        userName: r.post.user.name,
      },
      reporter: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
      },
    }));
  } catch {
    return [];
  }
}

export async function dismissReport(reportId: string): Promise<void> {
  await requireAdmin();
  await prisma.report.delete({ where: { id: reportId } });
  revalidatePath("/admin/reports");
}

export async function deleteReportedPost(reportId: string, postId: string): Promise<void> {
  await requireAdmin();
  await prisma.report.deleteMany({ where: { postId } });
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/admin/reports");
}

// ─── Places ──────────────────────────────────────────────────────────────────

export async function getAdminPlaces(opts?: { search?: string; page?: number }): Promise<{
  places: AdminPlace[];
  total: number;
}> {
  try {
    await requireAdmin();
    const page = opts?.page ?? 1;
    const take = 20;
    const skip = (page - 1) * take;
    const where = opts?.search
      ? {
          OR: [
            { name: { contains: opts.search, mode: "insensitive" as const } },
            { province: { contains: opts.search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
          province: true,
          region: true,
          isPublished: true,
          isFeatured: true,
          createdAt: true,
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.place.count({ where }),
    ]);

    return {
      places: places.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        province: p.province,
        region: p.region,
        isPublished: p.isPublished,
        isFeatured: p.isFeatured,
        reviewCount: p._count.reviews,
        createdAt: p.createdAt.toISOString(),
      })),
      total,
    };
  } catch {
    return { places: [], total: 0 };
  }
}

export async function createPlace(data: PlaceFormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    let slug = data.slug;
    const existing = await prisma.place.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const { images, ...rest } = data;
    const place = await prisma.place.create({
      data: {
        ...rest,
        slug,
        images: {
          create: images.map((url, i) => ({ url, order: i })),
        },
      },
    });

    revalidatePath("/admin/places");
    revalidatePath("/explore");
    return { ok: true, id: place.id, slug: place.slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}

export async function updatePlace(placeId: string, data: PlaceFormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { images, ...rest } = data;

    await prisma.$transaction([
      prisma.placeImage.deleteMany({ where: { placeId } }),
      prisma.place.update({
        where: { id: placeId },
        data: {
          ...rest,
          images: {
            create: images.map((url, i) => ({ url, order: i })),
          },
        },
      }),
    ]);

    revalidatePath("/admin/places");
    revalidatePath(`/place/${data.slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}

export async function deletePlace(placeId: string): Promise<void> {
  await requireAdmin();
  await prisma.placeImage.deleteMany({ where: { placeId } });
  await prisma.place.delete({ where: { id: placeId } });
  revalidatePath("/admin/places");
}

export async function togglePlacePublished(placeId: string, isPublished: boolean): Promise<void> {
  await requireAdmin();
  await prisma.place.update({ where: { id: placeId }, data: { isPublished } });
  revalidatePath("/admin/places");
}

export async function togglePlaceFeatured(placeId: string, isFeatured: boolean): Promise<void> {
  await requireAdmin();
  await prisma.place.update({ where: { id: placeId }, data: { isFeatured } });
  revalidatePath("/admin/places");
}

// ─── Guides ──────────────────────────────────────────────────────────────────

export async function getGuideApplications(): Promise<{ pending: GuideApplicant[]; approved: GuideApplicant[] }> {
  try {
    await requireAdmin();

    const mapUser = (u: {
      id: string;
      name: string | null;
      username: string | null;
      email: string | null;
      avatarUrl: string | null;
      bio: string | null;
      isVerifiedGuide: boolean;
      _count: { followers: number; posts: number };
    }): GuideApplicant => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      isVerifiedGuide: u.isVerifiedGuide,
      followerCount: u._count.followers,
      postCount: u._count.posts,
    });

    const select = {
      id: true,
      name: true,
      username: true,
      email: true,
      avatarUrl: true,
      bio: true,
      isVerifiedGuide: true,
      _count: { select: { followers: true, posts: true } },
    } as const;

    const [pending, approved] = await Promise.all([
      prisma.user.findMany({ where: { isGuide: true, isVerifiedGuide: false }, select }),
      prisma.user.findMany({ where: { isGuide: true, isVerifiedGuide: true }, select }),
    ]);

    return { pending: pending.map(mapUser), approved: approved.map(mapUser) };
  } catch {
    return { pending: [], approved: [] };
  }
}

export async function approveGuide(userId: string): Promise<void> {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isVerifiedGuide: true } });
  revalidatePath("/admin/guides");
}

export async function rejectGuide(userId: string): Promise<void> {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isGuide: false } });
  revalidatePath("/admin/guides");
}

// ── Analytics ────────────────────────────────────────────────────────────────
export interface DailyCount { date: string; count: number }
export interface AdminAnalytics {
  usersByDay: DailyCount[];
  postsByDay: DailyCount[];
  topPlaces: { id: string; name: string; saveCount: number; reviewCount: number }[];
  topTags: { tag: string; count: number }[];
  contentTypes: { type: string; count: number }[];
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      return { usersByDay: [], postsByDay: [], topPlaces: [], topTags: [], contentTypes: [] };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Users per day (last 30 days)
    const users = await (prisma as any).user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });
    const usersByDay = aggregateByDay(users.map((u: { createdAt: Date }) => u.createdAt));

    // Posts per day (last 30 days)
    const posts = await (prisma as any).post.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, type: true },
    });
    const postsByDay = aggregateByDay(posts.map((p: { createdAt: Date }) => p.createdAt));

    // Content type distribution
    const typeCounts: Record<string, number> = {};
    for (const p of posts as Array<{ type: string | null }>) {
      const t = p.type ?? "text";
      typeCounts[t] = (typeCounts[t] ?? 0) + 1;
    }
    const contentTypes = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    // Top places by saves + reviews
    const places = await (prisma as any).place.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        _count: { select: { savedByUsers: true, reviews: true } },
      },
      orderBy: { savedByUsers: { _count: "desc" } },
    });
    const topPlaces = places.map((p: {
      id: string; name: string;
      _count: { savedByUsers: number; reviews: number };
    }) => ({
      id: p.id, name: p.name,
      saveCount: p._count.savedByUsers,
      reviewCount: p._count.reviews,
    }));

    // Top tags
    const postTags = await (prisma as any).post.findMany({
      select: { tags: true },
      where: { tags: { isEmpty: false } },
    });
    const tagCounts: Record<string, number> = {};
    for (const p of postTags as Array<{ tags: string[] }>) {
      for (const tag of p.tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return { usersByDay, postsByDay, topPlaces, topTags, contentTypes };
  } catch {
    return { usersByDay: [], postsByDay: [], topPlaces: [], topTags: [], contentTypes: [] };
  }
}

function aggregateByDay(dates: Date[]): DailyCount[] {
  const counts: Record<string, number> = {};
  // Fill last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    counts[d.toISOString().slice(0, 10)] = 0;
  }
  for (const d of dates) {
    const key = new Date(d).toISOString().slice(0, 10);
    if (key in counts) counts[key]++;
  }
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}
