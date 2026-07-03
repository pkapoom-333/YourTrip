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

// ─── getNearbyPlaces ──────────────────────────────────────────────────────────
// Efficient targeted query: find 3 nearby places in same region OR category.
// Replaces the expensive getPlaces({ take: 50 }) call on place detail pages.

export async function getNearbyPlaces(opts: {
  excludeSlug: string;
  region?: string | null;
  category?: string | null;
  take?: number;
}): Promise<{ data: PlaceListItem[] }> {
  const { excludeSlug, region, category, take = 3 } = opts;
  try {
    const places = await prisma.place.findMany({
      where: {
        isPublished: true,
        slug: { not: excludeSlug },
        OR: [
          ...(region ? [{ region: region }] : []),
          ...(category ? [{ category: category }] : []),
        ],
      },
      take,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    });

    return {
      data: places.map((p) => {
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
        } satisfies PlaceListItem;
      }),
    };
  } catch {
    return { data: [] };
  }
}

// ─── getTopRatedPlaces ────────────────────────────────────────────────────────

export async function getTopRatedPlaces(take = 20): Promise<{ data: PlaceListItem[] }> {
  try {
    const places = await prisma.place.findMany({
      where: { isPublished: true },
      take: 100,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { reviews: true, savedBy: true } },
        reviews: { select: { rating: true } },
      },
    });

    const withRating = places
      .map((p) => {
        const avgRating = p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;
        return {
          avgRating,
          item: {
            id: p.id, slug: p.slug, name: p.name, nameEn: p.nameEn,
            category: p.category, region: p.region, province: p.province,
            country: p.country, priceRange: p.priceRange,
            hasWifi: p.hasWifi, hasParking: p.hasParking, isAccessible: p.isAccessible,
            isFeatured: p.isFeatured, coverImage: p.images[0]?.url ?? null,
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: p._count.reviews, lat: p.lat, lng: p.lng,
            tags: deriveTags(p),
          } satisfies PlaceListItem,
        };
      })
      .filter((p) => p.item.reviewCount >= 1)
      .sort((a, b) => b.avgRating - a.avgRating || b.item.reviewCount - a.item.reviewCount)
      .slice(0, take);

    return { data: withRating.map((p) => p.item) };
  } catch {
    return { data: [] };
  }
}

// ─── getNewPlaces ─────────────────────────────────────────────────────────────

export async function getNewPlaces(take = 20): Promise<{ data: PlaceListItem[] }> {
  try {
    const places = await prisma.place.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { reviews: true, savedBy: true } },
        reviews: { select: { rating: true } },
      },
    });

    return {
      data: places.map((p) => {
        const avgRating = p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;
        return {
          id: p.id, slug: p.slug, name: p.name, nameEn: p.nameEn,
          category: p.category, region: p.region, province: p.province,
          country: p.country, priceRange: p.priceRange,
          hasWifi: p.hasWifi, hasParking: p.hasParking, isAccessible: p.isAccessible,
          isFeatured: p.isFeatured, coverImage: p.images[0]?.url ?? null,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: p._count.reviews, lat: p.lat, lng: p.lng,
          tags: deriveTags(p),
        } satisfies PlaceListItem;
      }),
    };
  } catch {
    return { data: [] };
  }
}

// ─── getPlaceReviews (paginated) ──────────────────────────────────────────────

export interface FullReview {
  id: string;
  rating: number;
  content: string | null;
  images: string[];
  likes: number;
  createdAt: Date;
  user: { id: string; name: string | null; avatarUrl: string | null; username: string | null };
}

export async function getPlaceReviews(
  slug: string,
  opts: { sort?: "newest" | "highest" | "lowest" | "helpful"; cursor?: string; take?: number } = {}
): Promise<{ data: FullReview[]; nextCursor: string | null; totalCount: number; ratingBreakdown: Record<number, number> }> {
  try {
    const place = await prisma.place.findUnique({ where: { slug }, select: { id: true } });
    if (!place) return { data: [], nextCursor: null, totalCount: 0, ratingBreakdown: {} };

    const { sort = "newest", cursor, take = 20 } = opts;

    const orderBy =
      sort === "highest" ? { rating: "desc" as const } :
      sort === "lowest"  ? { rating: "asc" as const } :
      sort === "helpful" ? { helpfulCount: "desc" as const } :
      { createdAt: "desc" as const };

    const [reviews, totalCount, breakdown] = await Promise.all([
      prisma.review.findMany({
        where: { placeId: place.id },
        orderBy,
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: {
          id: true, rating: true, content: true,
          images: true, likes: true, createdAt: true,
          user: { select: { id: true, name: true, avatarUrl: true, username: true } },
        },
      }),
      prisma.review.count({ where: { placeId: place.id } }),
      prisma.review.groupBy({
        by: ["rating"],
        where: { placeId: place.id },
        _count: { rating: true },
      }),
    ]);

    const hasMore = reviews.length > take;
    const items = hasMore ? reviews.slice(0, take) : reviews;

    const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const b of breakdown) ratingBreakdown[b.rating] = b._count.rating;

    return {
      data: items as unknown as FullReview[],
      nextCursor: hasMore ? items[items.length - 1].id : null,
      totalCount,
      ratingBreakdown,
    };
  } catch {
    return { data: [], nextCursor: null, totalCount: 0, ratingBreakdown: {} };
  }
}

// ─── getPlacesForMap ──────────────────────────────────────────────────────────

export interface MapPlace {
  id: string;
  slug: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  coverImage: string | null;
  province: string | null;
}

export async function getPlacesForMap(category?: string): Promise<{ data: MapPlace[] }> {
  try {
    const places = await prisma.place.findMany({
      where: {
        isPublished: true,
        lat: { not: null },
        lng: { not: null },
        ...(category ? { category } : {}),
      },
      select: {
        id: true, slug: true, name: true, category: true,
        lat: true, lng: true, province: true,
        images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
      take: 500,
    });

    return {
      data: places
        .filter((p) => p.lat !== null && p.lng !== null)
        .map((p) => {
          const avgRating = p.reviews.length > 0
            ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
            : 0;
          return {
            id: p.id, slug: p.slug, name: p.name, category: p.category,
            lat: p.lat as number, lng: p.lng as number,
            province: p.province,
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: p._count.reviews,
            coverImage: p.images[0]?.url ?? null,
          };
        }),
    };
  } catch {
    return { data: [] };
  }
}

// ── Place Comparison ────────────────────────────────────────────────
const dbPlaces = prisma as any;

export interface ComparePlace {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  category: string;
  province: string | null;
  country: string;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  priceRange: number;
  entryFee: number | null;
  hasWifi: boolean;
  hasAC: boolean;
  hasParking: boolean;
  isVegetarian: boolean;
  isAccessible: boolean;
  openTime: string | null;
  closeTime: string | null;
  description: string | null;
  tags: string[];
}

export async function getPlacesForComparison(slugs: string[]): Promise<{ data: ComparePlace[] }> {
  if (!slugs.length) return { data: [] };
  try {
    const places = await dbPlaces.place.findMany({
      where: { slug: { in: slugs }, isPublished: true },
      select: {
        id: true, slug: true, name: true, nameEn: true, category: true,
        province: true, country: true, priceRange: true, entryFee: true,
        hasWifi: true, hasAC: true, hasParking: true, isVegetarian: true,
        isAccessible: true, openTime: true, closeTime: true, description: true,
        tags: true,
        images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
    });

    const data = (places as Array<{
      id: string; slug: string; name: string; nameEn: string | null; category: string;
      province: string | null; country: string; priceRange: number; entryFee: number | null;
      hasWifi: boolean; hasAC: boolean; hasParking: boolean; isVegetarian: boolean; isAccessible: boolean;
      openTime: string | null; closeTime: string | null; description: string | null; tags: string[];
      images: Array<{ url: string }>; reviews: Array<{ rating: number }>; _count: { reviews: number };
    }>).map((p) => {
      const avg = p.reviews.length
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 0;
      return {
        id: p.id, slug: p.slug, name: p.name, nameEn: p.nameEn,
        category: p.category, province: p.province, country: p.country,
        coverImage: p.images[0]?.url ?? null,
        rating: Math.round(avg * 10) / 10,
        reviewCount: p._count.reviews,
        priceRange: p.priceRange,
        entryFee: p.entryFee,
        hasWifi: p.hasWifi, hasAC: p.hasAC, hasParking: p.hasParking,
        isVegetarian: p.isVegetarian, isAccessible: p.isAccessible,
        openTime: p.openTime, closeTime: p.closeTime,
        description: p.description, tags: p.tags,
      };
    });

    return { data };
  } catch {
    return { data: [] };
  }
}

// ── Unified Search ──────────────────────────────────────────────────
export async function searchPlaces(query: string, take = 8): Promise<{ places: Array<{ id: string; slug: string; name: string; category: string; province: string | null; coverImage: string | null; rating: number }> }> {
  if (!query.trim()) return { places: [] };
  try {
    const results = await dbPlaces.place.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { nameEn: { contains: query, mode: "insensitive" } },
          { province: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true, slug: true, name: true, category: true, province: true,
        images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
        reviews: { select: { rating: true } },
      },
      take,
    });

    return {
      places: (results as Array<{
        id: string; slug: string; name: string; category: string; province: string | null;
        images: Array<{ url: string }>; reviews: Array<{ rating: number }>;
      }>).map((p) => ({
        id: p.id, slug: p.slug, name: p.name, category: p.category, province: p.province,
        coverImage: p.images[0]?.url ?? null,
        rating: p.reviews.length
          ? Math.round(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length * 10) / 10
          : 0,
      })),
    };
  } catch {
    return { places: [] };
  }
}


// ── Check-in ──────────────────────────────────────────────────────────
const dbCheckIn = prisma as any;

export async function checkInToPlace(
  placeId: string,
  note?: string
): Promise<{ ok: boolean; error?: string; checkInCount?: number }> {
  try {
    const { createClient: sc } = await import("@/lib/supabase/server");
    const supabase = await sc();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

    await dbCheckIn.checkIn.create({
      data: { userId: user.id, placeId, note: note?.trim() || null },
    });

    const count = await dbCheckIn.checkIn.count({ where: { placeId } });
    return { ok: true, checkInCount: count };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function getPlaceCheckIns(
  placeId: string,
  take = 10
): Promise<{ data: Array<{ id: string; note: string | null; createdAt: Date; user: { id: string; name: string | null; avatarUrl: string | null } }>; totalCount: number }> {
  try {
    const rows = await dbCheckIn.checkIn.findMany({
      where: { placeId },
      orderBy: { createdAt: "desc" },
      take,
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    const totalCount = await dbCheckIn.checkIn.count({ where: { placeId } });
    return { data: rows, totalCount };
  } catch {
    return { data: [], totalCount: 0 };
  }
}

export async function getUserCheckInStatus(
  placeId: string
): Promise<{ hasCheckedIn: boolean; totalCheckIns: number }> {
  try {
    const { createClient: sc } = await import("@/lib/supabase/server");
    const supabase = await sc();
    const { data: { user } } = await supabase.auth.getUser();
    const totalCheckIns = await dbCheckIn.checkIn.count({ where: { placeId } });
    if (!user) return { hasCheckedIn: false, totalCheckIns };

    const existing = await dbCheckIn.checkIn.findFirst({
      where: { placeId, userId: user.id },
    });
    return { hasCheckedIn: !!existing, totalCheckIns };
  } catch {
    return { hasCheckedIn: false, totalCheckIns: 0 };
  }
}

// ─── getPlacesNearCoords ───────────────────────────────────────────────────────
// Returns places sorted by Haversine distance to given coordinates.

export async function getPlacesNearCoords(opts: {
  lat: number;
  lng: number;
  radiusKm?: number;
  take?: number;
}): Promise<{ data: Array<PlaceListItem & { distance: number }> }> {
  const { lat, lng, radiusKm = 50, take = 10 } = opts;

  function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  try {
    const places = await prisma.place.findMany({
      where: { isPublished: true, lat: { not: null }, lng: { not: null } },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    });

    const withDist = places
      .map((p) => {
        const avgRating = p.reviews.length > 0
          ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
          : 0;
        return {
          id: p.id, slug: p.slug, name: p.name, nameEn: p.nameEn,
          category: p.category, region: p.region, province: p.province,
          country: p.country, priceRange: p.priceRange,
          hasWifi: p.hasWifi, hasParking: p.hasParking,
          isAccessible: p.isAccessible, isFeatured: p.isFeatured,
          coverImage: p.images[0]?.url ?? null,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: p._count.reviews,
          lat: p.lat, lng: p.lng,
          tags: deriveTags(p),
          distance: haversine(lat, lng, p.lat!, p.lng!),
        };
      })
      .filter((p) => p.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, take);

    return { data: withDist };
  } catch {
    return { data: [] };
  }
}

// ─── getRecommendedPlaces ─────────────────────────────────────────────────────
const dbRec = prisma as any;

export async function getRecommendedPlaces(take = 6): Promise<{ data: PlaceListItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user: me } } = await supabase.auth.getUser();

    const savedIds: string[] = me
      ? (await prisma.savedPlace.findMany({ where: { userId: me.id }, select: { placeId: true } }))
          .map((s: { placeId: string }) => s.placeId)
      : [];

    const places = await dbRec.place.findMany({
      where: savedIds.length > 0 ? { id: { notIn: savedIds }, isFeatured: true } : { isFeatured: true },
      orderBy: [{ reviewCount: "desc" }, { rating: "desc" }],
      take: take * 2,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    }) as Array<{
      id: string; slug: string; name: string; nameEn: string | null;
      category: string; province: string | null; country: string; region: string;
      rating: number; priceRange: number; coverImage: string | null;
      isFeatured: boolean; hasWifi: boolean; hasParking: boolean;
      isAccessible: boolean; lat: number | null; lng: number | null; tags: string[];
      images: Array<{ url: string }>; _count: { reviews: number };
      reviews: Array<{ rating: number }>;
    }>;

    // top-up if not enough
    if (places.length < take) {
      const extra = await dbRec.place.findMany({
        where: { id: { notIn: [...savedIds, ...places.map((p: { id: string }) => p.id)] }, isFeatured: false },
        orderBy: [{ reviewCount: "desc" }],
        take: take - places.length,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          _count: { select: { reviews: true } },
          reviews: { select: { rating: true } },
        },
      });
      places.push(...extra);
    }

    return {
      data: places.slice(0, take).map((p) => {
        const avgRating = p.reviews.length > 0
          ? Math.round((p.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / p.reviews.length) * 10) / 10
          : p.rating;
        return {
          id: p.id, slug: p.slug, name: p.name, nameEn: p.nameEn,
          category: p.category, province: p.province, country: p.country, region: p.region,
          rating: avgRating, reviewCount: p._count.reviews, priceRange: p.priceRange,
          coverImage: p.images[0]?.url ?? p.coverImage ?? null,
          isFeatured: p.isFeatured, hasWifi: p.hasWifi, hasParking: p.hasParking,
          isAccessible: p.isAccessible, lat: p.lat, lng: p.lng, tags: p.tags,
        };
      }),
    };
  } catch {
    return { data: [] };
  }
}

// ─── getUserCheckIns ─────────────────────────────────────────────────────────
export interface UserCheckIn {
  id: string;
  placeId: string;
  placeName: string;
  placeSlug: string;
  province: string | null;
  coverImage: string | null;
  lat: number | null;
  lng: number | null;
  category: string;
  note: string | null;
  checkedAt: Date;
}

export async function getUserCheckIns(): Promise<{ data: UserCheckIn[] }> {
  try {
    const { createClient: sc } = await import("@/lib/supabase/server");
    const supabase = await sc();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const rows = await dbCheckIn.checkIn.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        place: {
          include: { images: { orderBy: { order: "asc" }, take: 1 } },
        },
      },
      take: 200,
    });

    return {
      data: rows.map((r: typeof rows[number]) => ({
        id: r.id,
        placeId: r.placeId,
        placeName: r.place.name,
        placeSlug: r.place.slug,
        province: r.place.province,
        coverImage: r.place.images[0]?.url ?? null,
        lat: r.place.lat,
        lng: r.place.lng,
        category: r.place.category,
        note: r.note,
        checkedAt: r.createdAt,
      })),
    };
  } catch {
    return { data: [] };
  }
}
