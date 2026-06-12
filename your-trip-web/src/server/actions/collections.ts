"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";

export interface CollectionListItem {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  isPublic: boolean;
  placeCount: number;
  coverImages: string[];
  createdAt: Date;
  user: { id: string; name: string | null; avatarUrl: string | null };
}

export interface CollectionDetail extends CollectionListItem {
  places: Array<{
    id: string;
    placeId: string;
    note: string | null;
    order: number;
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
    };
  }>;
}

// ─── getUserCollections ───────────────────────────────────────────────────────

export async function getUserCollections(): Promise<{ data: CollectionListItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const rows = await prisma.collection.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { places: true } },
        places: {
          take: 3,
          orderBy: { order: "asc" },
          include: {
            place: {
              select: {
                images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    });

    return {
      data: rows.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        emoji: c.emoji,
        isPublic: c.isPublic,
        placeCount: c._count.places,
        coverImages: c.places.map((p) => p.place.images[0]?.url ?? "").filter(Boolean),
        createdAt: c.createdAt,
        user: c.user,
      })),
    };
  } catch {
    return { data: [] };
  }
}

// ─── getCollectionById ────────────────────────────────────────────────────────

export async function getCollectionById(id: string): Promise<{ data: CollectionDetail | null }> {
  try {
    const c = await prisma.collection.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { places: true } },
        places: {
          orderBy: { order: "asc" },
          include: {
            place: {
              select: {
                id: true, slug: true, name: true, nameEn: true,
                category: true, province: true, priceRange: true,
                images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
                reviews: { select: { rating: true } },
              },
            },
          },
        },
      },
    });

    if (!c) return { data: null };

    return {
      data: {
        id: c.id,
        title: c.title,
        description: c.description,
        emoji: c.emoji,
        isPublic: c.isPublic,
        placeCount: c._count.places,
        coverImages: c.places.slice(0, 3).map((p) => p.place.images[0]?.url ?? "").filter(Boolean),
        createdAt: c.createdAt,
        user: c.user,
        places: c.places.map((p) => ({
          id: p.id,
          placeId: p.placeId,
          note: p.note,
          order: p.order,
          place: {
            id: p.place.id,
            slug: p.place.slug,
            name: p.place.name,
            nameEn: p.place.nameEn,
            category: p.place.category,
            province: p.place.province,
            priceRange: p.place.priceRange,
            coverImage: p.place.images[0]?.url ?? null,
            rating: p.place.reviews.length > 0
              ? p.place.reviews.reduce((s, r) => s + r.rating, 0) / p.place.reviews.length
              : 0,
            reviewCount: p.place.reviews.length,
          },
        })),
      },
    };
  } catch {
    return { data: null };
  }
}

// ─── createCollection ─────────────────────────────────────────────────────────

export async function createCollection(input: {
  title: string;
  description?: string;
  emoji?: string;
  isPublic?: boolean;
}): Promise<{ data?: { id: string }; error?: string }> {
  if (!input.title.trim()) return { error: "กรุณาใส่ชื่อคอลเลกชัน" };
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

    const c = await prisma.collection.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() ?? null,
        emoji: input.emoji ?? "📍",
        isPublic: input.isPublic ?? true,
        userId: user.id,
      },
    });
    return { data: { id: c.id } };
  } catch (e) {
    console.error("[createCollection]", e);
    return { error: "ไม่สามารถสร้างคอลเลกชันได้" };
  }
}

// ─── updateCollection ────────────────────────────────────────────────────────

export async function updateCollection(
  id: string,
  input: { title?: string; description?: string; emoji?: string; isPublic?: boolean }
): Promise<{ error?: string }> {
  if (input.title !== undefined && !input.title.trim()) return { error: "กรุณาใส่ชื่อคอลเลกชัน" };
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

    await prisma.collection.update({
      where: { id, userId: user.id },
      data: {
        ...(input.title !== undefined && { title: input.title.trim() }),
        ...(input.description !== undefined && { description: input.description.trim() || null }),
        ...(input.emoji !== undefined && { emoji: input.emoji }),
        ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
      },
    });
    return {};
  } catch {
    return { error: "ไม่สามารถแก้ไขคอลเลกชันได้" };
  }
}

// ─── addToCollection ──────────────────────────────────────────────────────────

export async function addToCollection(
  collectionId: string,
  placeId: string,
  note?: string
): Promise<{ data?: { id: string }; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

    // Verify ownership
    const col = await prisma.collection.findFirst({ where: { id: collectionId, userId: user.id } });
    if (!col) return { error: "ไม่พบคอลเลกชัน" };

    const item = await prisma.collectionPlace.upsert({
      where: { collectionId_placeId: { collectionId, placeId } },
      create: { collectionId, placeId, note: note?.trim() ?? null },
      update: { note: note?.trim() ?? null },
    });
    // Touch collection updatedAt
    await prisma.collection.update({ where: { id: collectionId }, data: { updatedAt: new Date() } });
    return { data: { id: item.id } };
  } catch {
    return { error: "ไม่สามารถเพิ่มสถานที่ได้" };
  }
}

// ─── removeFromCollection ────────────────────────────────────────────────────

export async function removeFromCollection(
  collectionId: string,
  placeId: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

    await prisma.collectionPlace.delete({
      where: { collectionId_placeId: { collectionId, placeId } },
    });
    return {};
  } catch {
    return {};
  }
}

// ─── deleteCollection ─────────────────────────────────────────────────────────

export async function deleteCollection(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

    await prisma.collection.delete({ where: { id, userId: user.id } });
    return {};
  } catch {
    return { error: "ไม่สามารถลบคอลเลกชันได้" };
  }
}
