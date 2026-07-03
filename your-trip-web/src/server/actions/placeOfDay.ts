"use server";
import { prisma } from "@/lib/prisma";
import type { PlaceListItem } from "./places";

// Deterministic daily rotation: pick a featured place based on day-of-year
export async function getPlaceOfTheDay(): Promise<{ data: PlaceListItem | null }> {
  try {
    const featuredPlaces = await (prisma as any).place.findMany({
      where: { isFeatured: true },
      select: {
        id: true, slug: true, name: true, nameEn: true, category: true,
        province: true, country: true, region: true, rating: true,
        priceRange: true, coverImage: true, isFeatured: true,
        hasWifi: true, hasParking: true, isAccessible: true,
        lat: true, lng: true, tags: true,
        images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true }, take: 50 },
      },
      orderBy: { name: "asc" }, // consistent ordering
    }) as Array<{
      id: string; slug: string; name: string; nameEn: string | null;
      category: string; province: string | null; country: string; region: string;
      rating: number; priceRange: number; coverImage: string | null;
      isFeatured: boolean; hasWifi: boolean; hasParking: boolean;
      isAccessible: boolean; lat: number | null; lng: number | null; tags: string[];
      images: Array<{ url: string }>; _count: { reviews: number };
      reviews: Array<{ rating: number }>;
    }>;

    if (featuredPlaces.length === 0) return { data: null };

    // Rotate by day-of-year
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const pick = featuredPlaces[dayOfYear % featuredPlaces.length];

    const avgRating = pick.reviews.length > 0
      ? Math.round((pick.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / pick.reviews.length) * 10) / 10
      : pick.rating;

    return {
      data: {
        id: pick.id, slug: pick.slug, name: pick.name, nameEn: pick.nameEn,
        category: pick.category, province: pick.province, country: pick.country,
        region: pick.region, rating: avgRating, reviewCount: pick._count.reviews,
        priceRange: pick.priceRange, coverImage: pick.images[0]?.url ?? pick.coverImage ?? null,
        isFeatured: pick.isFeatured, hasWifi: pick.hasWifi, hasParking: pick.hasParking,
        isAccessible: pick.isAccessible, lat: pick.lat, lng: pick.lng, tags: pick.tags,
      },
    };
  } catch {
    return { data: null };
  }
}
