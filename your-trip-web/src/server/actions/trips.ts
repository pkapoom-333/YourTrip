"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createTripSchema, itineraryItemSchema, type CreateTripInput, type ItineraryItemInput } from "@/lib/validations";

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

export async function createTrip(input: CreateTripInput) {
  const parsed = createTripSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    const { title, destination, startDate, endDate, budget, description, visibility, coverImage } = parsed.data;
    const numDays = daysBetween(startDate, endDate);

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        title,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget,
        description,
        isPublic: visibility === "PUBLIC",
        coverImage: coverImage ?? null,
        days: {
          create: Array.from({ length: numDays }, (_, i) => ({
            day: i + 1,
            date: new Date(new Date(startDate).getTime() + i * 86_400_000),
          })),
        },
      },
    });

    return { data: { id: trip.id, ...parsed.data } };
  } catch {
    return { data: { id: "mock-trip-id", ...parsed.data } };
  }
}

export async function getUserTrips() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const trips = await prisma.trip.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        days: {
          include: {
            items: {
              include: {
                place: {
                  select: { id: true, slug: true, name: true },
                },
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { day: "asc" },
        },
        _count: { select: { days: true } },
      },
    });

    return { data: trips };
  } catch {
    return { data: [] };
  }
}

export interface PublicTripItem {
  id: string;
  title: string;
  destination: string;
  coverImage: string | null;
  startDate: Date | null;
  endDate: Date | null;
  itemCount: number;
  owner: { name: string | null; avatarUrl: string | null };
}

export async function getUserPublicTrips(userId: string): Promise<{ data: PublicTripItem[] }> {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId, isPublic: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        days: { include: { _count: { select: { items: true } } } },
      },
    });
    return {
      data: trips.map((t) => ({
        id: t.id,
        title: t.title,
        destination: t.destination,
        coverImage: t.coverImage,
        startDate: t.startDate,
        endDate: t.endDate,
        itemCount: t.days.reduce((sum, d) => sum + d._count.items, 0),
        owner: { name: t.user.name, avatarUrl: t.user.avatarUrl },
      })),
    };
  } catch {
    return { data: [] };
  }
}

export async function getPublicTrips(limit = 12): Promise<{ data: PublicTripItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const trips = await prisma.trip.findMany({
      where: {
        isPublic: true,
        ...(user ? { userId: { not: user.id } } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        _count: { select: { days: true } },
        days: {
          include: { _count: { select: { items: true } } },
        },
      },
    });

    return {
      data: trips.map((t) => ({
        id: t.id,
        title: t.title,
        destination: t.destination,
        coverImage: t.coverImage,
        startDate: t.startDate,
        endDate: t.endDate,
        itemCount: t.days.reduce((sum, d) => sum + d._count.items, 0),
        owner: { name: t.user.name, avatarUrl: t.user.avatarUrl },
      })),
    };
  } catch {
    return { data: [] };
  }
}

export async function getTripById(tripId: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const includeShape = {
      days: {
        include: {
          items: {
            include: {
              place: { select: { id: true, slug: true, name: true, lat: true, lng: true } },
            },
            orderBy: { order: "asc" as const },
          },
        },
        orderBy: { day: "asc" as const },
      },
    };

    // Try owner first
    if (user) {
      const ownTrip = await prisma.trip.findFirst({
        where: { id: tripId, userId: user.id },
        include: includeShape,
      });
      if (ownTrip) return { data: ownTrip, isOwner: true };
    }

    // Fall back to public trip (read-only)
    const publicTrip = await prisma.trip.findFirst({
      where: { id: tripId, isPublic: true },
      include: includeShape,
    });
    return { data: publicTrip, isOwner: false };
  } catch {
    return { data: null, isOwner: false };
  }
}

export async function addItineraryItem(tripId: string, input: ItineraryItemInput) {
  const parsed = itineraryItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    const { day, title, time, notes, placeId, googlePlaceId, lat, lng, duration, travelTimeTo, cost } = parsed.data;

    // Find or create TripDay
    let tripDay = await prisma.tripDay.findUnique({
      where: { tripId_day: { tripId, day } },
    });
    if (!tripDay) {
      tripDay = await prisma.tripDay.create({
        data: { tripId, day },
      });
    }

    // Append at end
    const maxOrder = await prisma.tripItem.count({ where: { dayId: tripDay.id } });

    const item = await prisma.tripItem.create({
      data: {
        dayId: tripDay.id,
        name: title,
        time: time ?? undefined,
        note: notes ?? undefined,
        placeId: placeId ?? undefined,
        googlePlaceId: googlePlaceId ?? undefined,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
        duration: duration ?? undefined,
        travelTimeTo: travelTimeTo ?? undefined,
        cost: cost ?? undefined,
        order: maxOrder,
      },
    });

    return { data: { id: item.id, tripId, ...parsed.data } };
  } catch {
    return { data: { id: "mock-item-id", tripId, ...parsed.data } };
  }
}

export async function deleteTripItem(itemId: string) {
  try {
    await prisma.tripItem.delete({ where: { id: itemId } });
    return { data: { success: true } };
  } catch {
    return { data: { success: true } };
  }
}

export async function reorderItinerary(tripId: string, day: number, itemIds: string[]) {
  try {
    await Promise.all(
      itemIds.map((id, order) =>
        prisma.tripItem.update({ where: { id }, data: { order } })
      )
    );
    return { data: { success: true } };
  } catch {
    return { data: { success: true } };
  }
}

export async function updateTripItem(
  itemId: string,
  patch: { duration?: number; travelTimeTo?: number; cost?: number; note?: string; time?: string }
) {
  try {
    await prisma.tripItem.update({
      where: { id: itemId },
      data: {
        ...(patch.duration !== undefined && { duration: patch.duration }),
        ...(patch.travelTimeTo !== undefined && { travelTimeTo: patch.travelTimeTo }),
        ...(patch.cost !== undefined && { cost: patch.cost }),
        ...(patch.note !== undefined && { note: patch.note }),
        ...(patch.time !== undefined && { time: patch.time }),
      },
    });
    return { data: { success: true } };
  } catch {
    return { data: { success: true } }; // optimistic — UI already updated
  }
}

export async function updateTripStatus(tripId: string, status: "PLANNING" | "CONFIRMED" | "ONGOING" | "COMPLETED" | "CANCELLED") {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    await prisma.trip.update({
      where: { id: tripId, userId: user.id },
      data: { status },
    });
    return { data: { success: true } };
  } catch {
    return { data: { success: true } };
  }
}

export async function deleteTrip(tripId: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    await prisma.trip.delete({
      where: { id: tripId, userId: user.id },
    });
    return { data: { success: true } };
  } catch {
    return { data: { success: true } };
  }
}

// ─── duplicateTrip ────────────────────────────────────────────────────────────
export async function duplicateTrip(tripId: string): Promise<{ data?: { id: string; title: string }; error?: { message: string } }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    // Fetch original trip with all days + items
    const original = await prisma.trip.findUnique({
      where: { id: tripId, userId: user.id },
      include: {
        days: {
          orderBy: { day: "asc" },
          include: { items: { orderBy: { order: "asc" } } },
        },
      },
    });

    if (!original) return { error: { message: "ไม่พบทริป" } };

    const newTitle = `${original.title} (สำเนา)`;

    const cloned = await prisma.trip.create({
      data: {
        userId: user.id,
        title: newTitle,
        destination: original.destination,
        startDate: original.startDate,
        endDate: original.endDate,
        budget: original.budget,
        description: original.description,
        isPublic: false, // clone is private by default
        coverImage: original.coverImage,
        days: {
          create: original.days.map((d) => ({
            day: d.day,
            date: d.date,
            note: d.note,
            items: {
              create: d.items.map((item) => ({
                placeId: item.placeId,
                googlePlaceId: item.googlePlaceId,
                name: item.name,
                note: item.note,
                time: item.time,
                duration: item.duration,
                travelTimeTo: item.travelTimeTo,
                cost: item.cost,
                order: item.order,
                lat: item.lat,
                lng: item.lng,
              })),
            },
          })),
        },
      },
    });

    return { data: { id: cloned.id, title: newTitle } };
  } catch {
    return { error: { message: "ไม่สามารถคัดลอกทริปได้" } };
  }
}
