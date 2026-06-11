"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function toggleSavePlace(placeId: string): Promise<{ saved: boolean }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { saved: false };

    const existing = await prisma.savedPlace.findUnique({
      where: { userId_placeId: { userId: user.id, placeId } },
    });

    if (existing) {
      await prisma.savedPlace.delete({ where: { id: existing.id } });
      return { saved: false };
    } else {
      await prisma.savedPlace.create({ data: { userId: user.id, placeId } });
      return { saved: true };
    }
  } catch {
    return { saved: false };
  }
}

export async function getSavedPlaceIds(): Promise<string[]> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const rows = await prisma.savedPlace.findMany({
      where: { userId: user.id },
      select: { placeId: true },
    });
    return rows.map((r) => r.placeId);
  } catch {
    return [];
  }
}

export interface SavedPlaceItem {
  id: string;
  placeId: string;
  savedAt: Date;
  place: {
    id: string;
    slug: string;
    name: string;
    nameEn: string | null;
    category: string;
    province: string | null;
    coverImage: string | null;
    rating: number;
    reviewCount: number;
    priceRange: number;
    region: string;
  };
}

export async function getSavedPlaces(): Promise<{ data: SavedPlaceItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const rows = await prisma.savedPlace.findMany({
      where: { userId: user.id },
      include: {
        place: {
          select: {
            id: true, slug: true, name: true, nameEn: true,
            category: true, province: true, region: true, priceRange: true,
            images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      data: rows.map((r) => ({
        id: r.id,
        placeId: r.placeId,
        savedAt: r.createdAt,
        place: {
          id: r.place.id,
          slug: r.place.slug,
          name: r.place.name,
          nameEn: r.place.nameEn,
          category: r.place.category,
          province: r.place.province,
          region: r.place.region,
          priceRange: r.place.priceRange,
          coverImage: r.place.images[0]?.url ?? null,
          rating: r.place.reviews.length > 0
            ? r.place.reviews.reduce((s, rv) => s + rv.rating, 0) / r.place.reviews.length
            : 0,
          reviewCount: r.place.reviews.length,
        },
      })),
    };
  } catch {
    return { data: [] };
  }
}

export interface DestinationSuggestion {
  province: string;
  count: number;
  coverImage: string | null;
}

/** Top provinces from the user's saved places — used as trip destination suggestions */
export async function getDestinationSuggestions(take = 5): Promise<{ data: DestinationSuggestion[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const rows = await prisma.savedPlace.findMany({
      where: { userId: user.id },
      select: {
        place: {
          select: {
            province: true,
            images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const map = new Map<string, { count: number; coverImage: string | null }>();
    for (const r of rows) {
      const prov = r.place.province;
      if (!prov) continue;
      const existing = map.get(prov);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(prov, { count: 1, coverImage: r.place.images[0]?.url ?? null });
      }
    }

    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, take)
      .map(([province, { count, coverImage }]) => ({ province, count, coverImage }));

    return { data: sorted };
  } catch {
    return { data: [] };
  }
}
