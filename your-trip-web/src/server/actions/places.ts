"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type PlaceCategory = "all" | "attraction" | "restaurant" | "cafe" | "hotel" | "activity";
export type PlaceRegion = "all" | "north" | "south" | "east" | "west" | "central" | "international";

export interface PlaceListItem {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  category: string;
  region: string;
  province: string | null;
  country: string;
  priceRange: number;
  hasWifi: boolean;
  hasParking: boolean;
  isAccessible: boolean;
  isFeatured: boolean;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  lat: number | null;
  lng: number | null;
  tags: string[];
}

export interface PlaceDetail {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  category: string;
  region: string;
  province: string | null;
  country: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  priceRange: number;
  entryFee: number | null;
  openDays: string[];
  openTime: string | null;
  closeTime: string | null;
  hasWifi: boolean;
  hasAC: boolean;
  hasParking: boolean;
  parkingSpots: number | null;
  parkingFee: number | null;
  isVegetarian: boolean;
  isAccessible: boolean;
  images: Array<{ id: string; url: string; caption: string | null; order: number }>;
  reviews: Array<{
    id: string;
    rating: number;
    content: string | null;
    likes: number;
    user: { name: string | null; avatarUrl: string | null };
    createdAt: Date;
  }>;
  rating: number;
  reviewCount: number;
}

// ─── getPlaces ────────────────────────────────────────────────────────────────

/** Derive searchable tags from a place's facility/feature flags */
function deriveTags(p: { hasWifi: boolean; hasParking: boolean; isAccessible: boolean; isVegetarian: boolean; hasAC: boolean; isFeatured: boolean }): string[] {
  const t: string[] = [];
  if (p.hasWifi)       t.push("WiFi");
  if (p.hasParking)    t.push("ที่จอดรถ");
  if (p.isAccessible)  t.push("ผู้พิการ");
  if (p.isVegetarian)  t.push("มังสวิรัติ");
  if (p.hasAC)         t.push("แอร์");
  if (p.isFeatured)    t.push("แนะนำ");
  return t;
}

export async function getPlaces(params?: {
  category?: PlaceCategory;
  region?: PlaceRegion;
  q?: string;
  featured?: boolean;
  tags?: string[];
  take?: number;
  province?: string;
}): Promise<{ data: PlaceListItem[] }> {
  const { category = "all", region = "all", q = "", featured, tags, take = 20, province } = params ?? {};

  try {
    // Build where clause — extended search covers name, nameEn, province, description
    const where = {
      isPublished: true,
      ...(category !== "all" && { category }),
      ...(region !== "all" && { region }),
      ...(featured !== undefined && { isFeatured: featured }),
      ...(province && { province: { contains: province, mode: "insensitive" as const } }),
      // Full-text style search: OR across all relevant text fields (ILIKE)
      // TODO: upgrade to Postgres to_tsvector GIN index when data grows > 10K rows
      ...(q.trim() && {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { nameEn: { contains: q, mode: "insensitive" as const } },
          { province: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { address: { contains: q, mode: "insensitive" as const } },
        ],
      }),
    };

    const places = await prisma.place.findMany({
      where,
      take,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    });

    let data: PlaceListItem[] = places.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        nameEn: p.nameEn,
        category: p.category,
        region: p.region,
        province: p.province,
        country: p.country,
        priceRange: p.priceRange,
        hasWifi: p.hasWifi,
        hasParking: p.hasParking,
        isAccessible: p.isAccessible,
        isFeatured: p.isFeatured,
        coverImage: p.images[0]?.url ?? null,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: p._count.reviews,
        lat: p.lat,
        lng: p.lng,
        tags: deriveTags(p),
      };
    });

    // Tag filter (client-compatible post-processing — no DB column needed)
    if (tags && tags.length > 0) {
      data = data.filter((p) => tags.some((t) => p.tags.includes(t)));
    }

    return { data };
  } catch {
    // DB not available (no .env.local) — return empty
    return { data: [] };
  }
}

// ─── getPlaceBySlug ───────────────────────────────────────────────────────────

export async function getPlaceBySlug(slug: string): Promise<{ data: PlaceDetail | null }> {
  try {
    // Fetch display reviews (10 most recent) and all ratings separately
    const [p, allRatings] = await Promise.all([
      prisma.place.findUnique({
        where: { slug },
        include: {
          images: { orderBy: { order: "asc" } },
          reviews: {
            include: { user: { select: { name: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      }),
      prisma.review.aggregate({
        where: { place: { slug } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    if (!p) return { data: null };

    const avgRating = allRatings._avg.rating ?? 0;

    return {
      data: {
        ...p,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allRatings._count.rating,
      },
    };
  } catch {
    return { data: null };
  }
}

// ─── getFeaturedPlaces ────────────────────────────────────────────────────────

export async function getFeaturedPlaces(take = 6): Promise<{ data: PlaceListItem[] }> {
  return getPlaces({ featured: true, take });
}

// ─── createReview ─────────────────────────────────────────────────────────────

export interface CreateReviewInput {
  placeId: string;
  rating: number; // 1-5
  content?: string;
}

export async function createReview(
  input: CreateReviewInput
): Promise<{ data: { id: string } | null; error?: string }> {
  if (input.rating < 1 || input.rating > 5) {
    return { data: null, error: "คะแนนต้องอยู่ระหว่าง 1-5" };
  }
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "กรุณาเข้าสู่ระบบ" };

    const review = await prisma.review.upsert({
      where: { placeId_userId: { placeId: input.placeId, userId: user.id } },
      create: {
        placeId: input.placeId,
        userId: user.id,
        rating: input.rating,
        content: input.content ?? null,
        images: [],
      },
      update: {
        rating: input.rating,
        content: input.content ?? null,
      },
    });

    return { data: { id: review.id } };
  } catch {
    return { data: { id: `mock-review-${Date.now()}` } };
  }
}

export interface PlacePickerItem {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  province: string | null;
  category: string;
  lat: number | null;
  lng: number | null;
}

/** ค้นหา place สำหรับ trip item picker (ไม่ต้อง auth) */
export async function searchPlacesForTrip(query: string, take = 8): Promise<{ data: PlacePickerItem[] }> {
  if (!query.trim()) return { data: [] };
  try {
    const rows = await prisma.place.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { nameEn: { contains: query, mode: "insensitive" } },
          { province: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, slug: true, name: true, nameEn: true, province: true, category: true, lat: true, lng: true },
      take,
    });
    return { data: rows };
  } catch {
    return { data: [] };
  }
}

// ─── getTrendingPlaces ────────────────────────────────────────────────────────
// Score = saves×2 + reviews×3 + featured×5 + 7-day-review-bonus×4

export async function getTrendingPlaces(take = 20): Promise<{ data: PlaceListItem[] }> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const places = await prisma.place.findMany({
      where: { isPublished: true },
      take: 100, // fetch more, then rank in JS
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { reviews: true, savedBy: true } },
        reviews: {
          select: { rating: true, createdAt: true },
        },
      },
    });

    const scored = places.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;

      const recentReviews = p.reviews.filter((r) => r.createdAt >= sevenDaysAgo).length;

      const score =
        p._count.savedBy * 2 +
        p._count.reviews * 3 +
        (p.isFeatured ? 5 : 0) +
        recentReviews * 4;

      return {
        item: {
          id: p.id,
          slug: p.slug,
          name: p.name,
          nameEn: p.nameEn,
          category: p.category,
          region: p.region,
          province: p.province,
          country: p.country,
          priceRange: p.priceRange,
          hasWifi: p.hasWifi,
          hasParking: p.hasParking,
          isAccessible: p.isAccessible,
          isFeatured: p.isFeatured,
          coverImage: p.images[0]?.url ?? null,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: p._count.reviews,
          lat: p.lat,
          lng: p.lng,
          tags: deriveTags(p),
        } satisfies PlaceListItem,
        score,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return { data: scored.slice(0, take).map((s) => s.item) };
  } catch {
    return { data: [] };
  }
}
