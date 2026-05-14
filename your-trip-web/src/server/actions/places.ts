"use server";

import { prisma } from "@/lib/prisma";

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

export async function getPlaces(params?: {
  category?: PlaceCategory;
  region?: PlaceRegion;
  q?: string;
  featured?: boolean;
  take?: number;
}): Promise<{ data: PlaceListItem[] }> {
  const { category = "all", region = "all", q = "", featured, take = 20 } = params ?? {};

  try {
    const where = {
      isPublished: true,
      ...(category !== "all" && { category }),
      ...(region !== "all" && { region }),
      ...(featured !== undefined && { isFeatured: featured }),
      ...(q.trim() && {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { nameEn: { contains: q, mode: "insensitive" as const } },
          { province: { contains: q, mode: "insensitive" as const } },
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

    const data: PlaceListItem[] = places.map((p) => {
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
      };
    });

    return { data };
  } catch {
    // DB not available (no .env.local) — return empty
    return { data: [] };
  }
}

// ─── getPlaceBySlug ───────────────────────────────────────────────────────────

export async function getPlaceBySlug(slug: string): Promise<{ data: PlaceDetail | null }> {
  try {
    const p = await prisma.place.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        reviews: {
          include: { user: { select: { name: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!p) return { data: null };

    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;

    return {
      data: {
        ...p,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
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
