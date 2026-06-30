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
        take,
        skip,
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

export async function banUser(userId: string): Promise<{ ok: boolean }> {
  try {
    await requireAdmin();
    // Delete all their posts (cascade will handle likes/comments)
    await prisma.post.deleteMany({ where: { userId } });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function verifyUser(userId: string, verified: boolean): Promise<{ ok: boolean }> {
  try {
    await requireAdmin();
    await prisma.user.update({ where: { id: userId }, data: { isVerified: verified } });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function getAdminReports(): Promise<AdminReport[]> {
  try {
    await requireAdmin();
    const reports = await prisma.report.findMany({
      include: {
        post: { include: { user: { select: { id: true, name: true } } } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
      post: {
        id: r.post.id,
        content: r.post.content,
        userId: r.post.user.id,
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

export async function dismissReport(reportId: string): Promise<{ ok: boolean }> {
  try {
    await requireAdmin();
    await prisma.report.delete({ where: { id: reportId } });
    revalidatePath("/admin/reports");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deleteReportedPost(reportId: string, postId: string): Promise<{ ok: boolean }> {
  try {
    await requireAdmin();
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/admin/reports");
    revalidatePath("/feed");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ─── Guide Applications ───────────────────────────────────────────────────────

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

// ─── Places (Admin CRUD) ──────────────────────────────────────────────────────

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
        take,
        skip,
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
  images?: string[];
}

export async function createPlace(data: PlaceFormData): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    await requireAdmin();

    // Check slug uniqueness
    const existing = await prisma.place.findUnique({ where: { slug: data.slug } });
    if (existing) return { ok: false, error: "Slug นี้ถูกใช้แล้ว" };

    const place = await prisma.place.create({
      data: {
        slug: data.slug,
        name: data.name,
        nameEn: data.nameEn,
        description: data.description,
        descriptionEn: data.descriptionEn,
        category: data.category,
        region: data.region,
        province: data.province,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        phone: data.phone,
        website: data.website,
        googleMapsUrl: data.googleMapsUrl,
        priceRange: data.priceRange,
        entryFee: data.entryFee,
        openDays: data.openDays,
        openTime: data.openTime,
        closeTime: data.closeTime,
        hasWifi: data.hasWifi,
        hasAC: data.hasAC,
        hasParking: data.hasParking,
        parkingFee: data.parkingFee,
        isVegetarian: data.isVegetarian,
        isAccessible: data.isAccessible,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        images: data.images?.length
          ? {
              create: data.images.map((url, i) => ({ url, order: i })),
            }
          : undefined,
      },
    });

    revalidatePath("/admin/places");
    revalidatePath("/explore");
    return { ok: true, id: place.id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function updatePlace(placeId: string, data: Partial<PlaceFormData>): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();

    await prisma.place.update({
      where: { id: placeId },
      data: {
        name: data.name,
        nameEn: data.nameEn,
        description: data.description,
        descriptionEn: data.descriptionEn,
        category: data.category,
        region: data.region,
        province: data.province,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        phone: data.phone,
        website: data.website,
        googleMapsUrl: data.googleMapsUrl,
        priceRange: data.priceRange,
        entryFee: data.entryFee,
        openDays: data.openDays,
        openTime: data.openTime,
        closeTime: data.closeTime,
        hasWifi: data.hasWifi,
        hasAC: data.hasAC,
        hasParking: data.hasParking,
        parkingFee: data.parkingFee,
        isVegetarian: data.isVegetarian,
        isAccessible: data.isAccessible,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
      },
    });

    revalidatePath("/admin/places");
    revalidatePath("/explore");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function deletePlace(placeId: string): Promise<{ ok: boolean }> {
  try {
    await requireAdmin();
    await prisma.place.delete({ where: { id: placeId } });
    revalidatePath("/admin/places");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function togglePlacePublished(placeId: string, isPublished: boolean): Promise<{ ok: boolean }> {
  try {
    await requireAdmin();
    await prisma.place.update({ where: { id: placeId }, data: { isPublished } });
    revalidatePath("/admin/places");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function togglePlaceFeatured(placeId: string, isFeatured: boolean): Promise<{ ok: boolean }> {
  try {
    await requireAdmin();
    await prisma.place.update({ where: { id: placeId }, data: { isFeatured } });
    revalidatePath("/admin/places");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
