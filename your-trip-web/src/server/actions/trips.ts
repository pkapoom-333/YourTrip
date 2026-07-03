"use server";
import { revalidatePath } from "next/cache";

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
    return { error: { message: "ไม่สามารถสร้างทริปได้ กรุณาลองใหม่" } };
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

    const { day, title, time, notes, placeId, googlePlaceId, lat, lng, duration, travelTimeTo, cost, imageUrl } = parsed.data;

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
        imageUrl: imageUrl ?? undefined,
        order: maxOrder,
      },
    });

    return { data: { id: item.id, tripId, ...parsed.data } };
  } catch {
    return { error: { message: "ไม่สามารถเพิ่มรายการได้ กรุณาลองใหม่" } };
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
  patch: { duration?: number; travelTimeTo?: number; cost?: number; note?: string; time?: string; imageUrl?: string | null }
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
        ...(patch.imageUrl !== undefined && { imageUrl: patch.imageUrl }),
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

export async function updateTripDayNote(tripId: string, dayNum: number, note: string): Promise<{ ok: boolean }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false };

    await prisma.tripDay.updateMany({
      where: { tripId, day: dayNum, trip: { userId: user.id } },
      data: { note: note || null },
    });
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function updateTripCover(tripId: string, coverImage: string): Promise<{ data?: { success: boolean }; error?: { message: string } }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    await prisma.trip.update({
      where: { id: tripId, userId: user.id },
      data: { coverImage },
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

/** Clone any public trip (or own trip) to the current user's account */
export async function cloneTripToUser(
  tripId: string
): Promise<{ data?: { id: string; title: string }; error?: { message: string } }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "กรุณาเข้าสู่ระบบ" } };

    const original = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [{ isPublic: true }, { userId: user.id }],
      },
      include: {
        days: {
          orderBy: { day: "asc" },
          include: { items: { orderBy: { order: "asc" } } },
        },
      },
    });

    if (!original) return { error: { message: "ไม่พบทริป หรือทริปนี้เป็นส่วนตัว" } };

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
        isPublic: false,
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
    return { error: { message: "ไม่สามารถบันทึกสำเนาทริปได้" } };
  }
}

export async function toggleTripPublic(
  tripId: string
): Promise<{ data: { isPublic: boolean } | null; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "กรุณาเข้าสู่ระบบ" };

    const trip = await prisma.trip.findUnique({ where: { id: tripId, userId: user.id }, select: { isPublic: true } });
    if (!trip) return { data: null, error: "ไม่พบทริป" };

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: { isPublic: !trip.isPublic },
      select: { isPublic: true },
    });
    return { data: { isPublic: updated.isPublic } };
  } catch {
    return { data: null, error: "เกิดข้อผิดพลาด" };
  }
}

// ── Trip Collaboration ───────────────────────────────────────────────
const dbTrips = prisma as any;

export interface TripCollaboratorItem {
  id: string;
  role: string;
  addedAt: Date;
  user: { id: string; name: string | null; avatarUrl: string | null; username: string | null };
}

export async function getTripCollaborators(tripId: string): Promise<{ data: TripCollaboratorItem[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const rows = await dbTrips.tripCollaborator.findMany({
      where: { tripId },
      include: { user: { select: { id: true, name: true, avatarUrl: true, username: true } } },
      orderBy: { addedAt: "asc" },
    });
    return { data: rows as TripCollaboratorItem[] };
  } catch {
    return { data: [] };
  }
}

export async function addTripCollaborator(
  tripId: string,
  targetUserId: string,
  role = "editor"
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "ไม่ได้เข้าสู่ระบบ" };

    // Verify ownership
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: user.id } });
    if (!trip) return { ok: false, error: "ไม่มีสิทธิ์" };
    if (targetUserId === user.id) return { ok: false, error: "ไม่สามารถเพิ่มตัวเองได้" };

    await dbTrips.tripCollaborator.upsert({
      where: { tripId_userId: { tripId, userId: targetUserId } },
      create: { tripId, userId: targetUserId, role },
      update: { role },
    });

    revalidatePath(`/trips/${tripId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function removeTripCollaborator(
  tripId: string,
  targetUserId: string
): Promise<{ ok: boolean }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false };

    await dbTrips.tripCollaborator.delete({
      where: { tripId_userId: { tripId, userId: targetUserId } },
    });

    revalidatePath(`/trips/${tripId}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ── Trip Templates ────────────────────────────────────────────────────
export interface TripTemplate {
  id: string;
  title: string;
  destination: string;
  duration: number; // days
  coverImage: string;
  tags: string[];
  highlights: string[];
  days: Array<{
    day: number;
    theme: string;
    items: Array<{ name: string; type: string; time?: string; note?: string }>;
  }>;
}

const TRIP_TEMPLATES: TripTemplate[] = [
  {
    id: "chiang-mai-3d",
    title: "เชียงใหม่ 3 วัน 2 คืน",
    destination: "เชียงใหม่",
    duration: 3,
    coverImage: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800",
    tags: ["วัด", "ธรรมชาติ", "อาหาร", "วัฒนธรรม"],
    highlights: ["ดอยอินทนนท์", "วัดพระธาตุดอยสุเทพ", "ถนนคนเดินวันเสาร์"],
    days: [
      {
        day: 1, theme: "วัดและเมืองเก่า",
        items: [
          { name: "วัดพระธาตุดอยสุเทพ", type: "place", time: "08:00", note: "ชมวิวเมืองเชียงใหม่" },
          { name: "วัดเชดีหลวง", type: "place", time: "10:30" },
          { name: "ข้าวซอยอิสลาม", type: "food", time: "12:00", note: "ข้าวซอยชื่อดัง" },
          { name: "ถนนนิมมานเหมินทร์", type: "activity", time: "15:00" },
          { name: "ถนนคนเดินท่าแพ", type: "activity", time: "19:00" },
        ],
      },
      {
        day: 2, theme: "ธรรมชาติและดอย",
        items: [
          { name: "ดอยอินทนนท์", type: "place", time: "06:00", note: "ยอดดอยสูงสุดในไทย" },
          { name: "น้ำตกวชิรธาร", type: "place", time: "09:00" },
          { name: "พระมหาธาตุนภเมทนีดล", type: "place", time: "10:30" },
          { name: "ร้านอาหารบนดอย", type: "food", time: "12:00" },
          { name: "ตลาดช้าง", type: "activity", time: "16:00" },
        ],
      },
      {
        day: 3, theme: "คาเฟ่และช้อปปิ้ง",
        items: [
          { name: "คาเฟ่แนะนำย่านนิมมาน", type: "food", time: "09:00" },
          { name: "เซ็นทรัล เฟสติวัล เชียงใหม่", type: "activity", time: "11:00" },
          { name: "ไนท์บาซ่าร์", type: "activity", time: "18:00", note: "ช้อปปิ้งของฝาก" },
        ],
      },
    ],
  },
  {
    id: "bangkok-weekend",
    title: "กรุงเทพฯ วีคเอนด์",
    destination: "กรุงเทพมหานคร",
    duration: 2,
    coverImage: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
    tags: ["วัด", "อาหาร", "ช้อปปิ้ง", "กลางคืน"],
    highlights: ["วัดพระแก้ว", "ตลาดจตุจักร", "เยาวราช"],
    days: [
      {
        day: 1, theme: "ย่านประวัติศาสตร์",
        items: [
          { name: "วัดพระศรีรัตนศาสดาราม (วัดพระแก้ว)", type: "place", time: "08:00" },
          { name: "พระบรมมหาราชวัง", type: "place", time: "09:30" },
          { name: "วัดโพธิ์", type: "place", time: "11:00" },
          { name: "เยาวราช — ข้าวมันไก่ประตูผี", type: "food", time: "13:00" },
          { name: "เยาวราชตลาดกลางคืน", type: "activity", time: "19:00" },
        ],
      },
      {
        day: 2, theme: "ช้อปปิ้งและคาเฟ่",
        items: [
          { name: "ตลาดจตุจักร", type: "activity", time: "09:00", note: "เปิดเฉพาะ Sat-Sun" },
          { name: "Terminal 21", type: "activity", time: "13:00" },
          { name: "ย่านทองหล่อ — คาเฟ่และร้านอาหาร", type: "food", time: "16:00" },
          { name: "Asiatique The Riverfront", type: "activity", time: "19:00" },
        ],
      },
    ],
  },
  {
    id: "phuket-5d",
    title: "ภูเก็ต 5 วัน 4 คืน",
    destination: "ภูเก็ต",
    duration: 5,
    coverImage: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800",
    tags: ["ทะเล", "เกาะ", "ดำน้ำ", "พักผ่อน"],
    highlights: ["หาดป่าตอง", "เกาะพีพี", "แหลมพรหมเทพ"],
    days: [
      {
        day: 1, theme: "เดินทางมาถึงและหาดป่าตอง",
        items: [
          { name: "เช็คอินโรงแรม", type: "hotel", time: "14:00" },
          { name: "หาดป่าตอง", type: "place", time: "16:00" },
          { name: "บางลาวอล์กกิ้งสตรีท", type: "activity", time: "20:00" },
        ],
      },
      {
        day: 2, theme: "ทัวร์เกาะพีพี",
        items: [
          { name: "ท่าเรือรัษฎา", type: "transport", time: "07:30", note: "ออกเดินทาง" },
          { name: "เกาะพีพีดอน", type: "place", time: "09:00" },
          { name: "อ่าวมาหยา", type: "place", time: "11:00", note: "ว่ายน้ำและดำน้ำดูปะการัง" },
          { name: "กลับภูเก็ต", type: "transport", time: "16:00" },
        ],
      },
      {
        day: 3, theme: "หาดกะรน และ ราไวย์",
        items: [
          { name: "หาดกะรน", type: "place", time: "09:00" },
          { name: "ตลาดปลาราไวย์", type: "food", time: "12:00", note: "อาหารทะเลสด" },
          { name: "แหลมพรหมเทพ", type: "place", time: "17:00", note: "ชมพระอาทิตย์ตก" },
        ],
      },
      {
        day: 4, theme: "เมืองเก่าและวัฒนธรรม",
        items: [
          { name: "ย่านเมืองเก่าภูเก็ต", type: "place", time: "09:00" },
          { name: "วัดฉลอง", type: "place", time: "11:00" },
          { name: "ตลาดอาหารสด", type: "food", time: "12:30" },
          { name: "FantaSea ภูเก็ต", type: "activity", time: "18:00" },
        ],
      },
      {
        day: 5, theme: "ช้อปปิ้งและกลับบ้าน",
        items: [
          { name: "Jungceylon Mall", type: "activity", time: "10:00" },
          { name: "สนามบินภูเก็ต", type: "transport", time: "14:00", note: "เช็คอิน 2 ชั่วโมงก่อนบิน" },
        ],
      },
    ],
  },
  {
    id: "pai-3d",
    title: "ปาย 3 วัน บรรยากาศหมอก",
    destination: "ปาย, แม่ฮ่องสอน",
    duration: 3,
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    tags: ["ธรรมชาติ", "หมอก", "ผจญภัย", "คาเฟ่"],
    highlights: ["ถ้ำปลา", "ต้นน้ำไหลหยด", "ทุ่งดอกไม้"],
    days: [
      {
        day: 1, theme: "เดินทางและสำรวจตัวเมือง",
        items: [
          { name: "เดินทางจากเชียงใหม่ (3 ชม.)", type: "transport", time: "07:00" },
          { name: "ถนนคนเดินปาย", type: "activity", time: "11:00" },
          { name: "คาเฟ่ปาย", type: "food", time: "14:00" },
          { name: "สะพานประวัติศาสตร์ปาย", type: "place", time: "16:00" },
          { name: "ตลาดกลางคืนปาย", type: "activity", time: "19:00" },
        ],
      },
      {
        day: 2, theme: "ธรรมชาติรอบปาย",
        items: [
          { name: "ต้นน้ำไหลหยด", type: "place", time: "08:00" },
          { name: "ถ้ำปลา", type: "place", time: "10:00" },
          { name: "โป่งน้ำร้อนท่าปาย", type: "place", time: "13:00" },
          { name: "พระธาตุแม่เย็น", type: "place", time: "16:00", note: "ชมวิวเมืองปาย" },
        ],
      },
      {
        day: 3, theme: "ไร่ดอกไม้และกลับ",
        items: [
          { name: "ไร่กาแฟปาย / คาเฟ่ยามเช้า", type: "food", time: "07:00" },
          { name: "ทุ่งดอกไม้ป่า", type: "place", time: "09:00" },
          { name: "เดินทางกลับเชียงใหม่", type: "transport", time: "13:00" },
        ],
      },
    ],
  },
  {
    id: "kanchanaburi-2d",
    title: "กาญจนบุรี 2 วัน ป่าและสงคราม",
    destination: "กาญจนบุรี",
    duration: 2,
    coverImage: "https://images.unsplash.com/photo-1596142001416-1f9eefd55281?w=800",
    tags: ["ประวัติศาสตร์", "ธรรมชาติ", "แม่น้ำ", "ล่องแพ"],
    highlights: ["สะพานข้ามแม่น้ำแคว", "เอราวัณ", "ล่องแพ"],
    days: [
      {
        day: 1, theme: "ประวัติศาสตร์สงครามโลก",
        items: [
          { name: "สะพานข้ามแม่น้ำแคว", type: "place", time: "08:00" },
          { name: "พิพิธภัณฑ์สงคราม JEATH", type: "place", time: "10:00" },
          { name: "ล่องแพแม่น้ำแคว", type: "activity", time: "14:00" },
          { name: "ตลาดริมน้ำแม่กลอง", type: "activity", time: "17:00" },
        ],
      },
      {
        day: 2, theme: "น้ำตกเอราวัณ",
        items: [
          { name: "น้ำตกเอราวัณ ชั้น 1-7", type: "place", time: "08:00", note: "ว่ายน้ำได้ชั้น 1-2" },
          { name: "ถ้ำพระธาตุ", type: "place", time: "13:00" },
          { name: "เดินทางกลับกรุงเทพฯ", type: "transport", time: "16:00" },
        ],
      },
    ],
  },
  {
    id: "samui-4d",
    title: "เกาะสมุย 4 วัน สวรรค์ทะเลใต้",
    destination: "เกาะสมุย, สุราษฎร์ธานี",
    duration: 4,
    coverImage: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
    tags: ["ทะเล", "เกาะ", "ดำน้ำ", "พักผ่อน", "สปา"],
    highlights: ["หาดบ่อผุด", "ดำน้ำเกาะอ่างทอง", "Big Buddha"],
    days: [
      {
        day: 1, theme: "มาถึงและชิลล์",
        items: [
          { name: "เช็คอินรีสอร์ท", type: "hotel", time: "14:00" },
          { name: "หาดบ่อผุด", type: "place", time: "16:00" },
          { name: "อาหารทะเลริมหาด", type: "food", time: "19:00" },
        ],
      },
      {
        day: 2, theme: "ทัวร์เกาะอ่างทอง",
        items: [
          { name: "ท่าเรือ — เกาะอ่างทอง", type: "transport", time: "08:00" },
          { name: "ดำน้ำและว่ายน้ำ", type: "activity", time: "10:00" },
          { name: "กลับเกาะสมุย", type: "transport", time: "16:00" },
          { name: "สปาเย็น", type: "activity", time: "18:00" },
        ],
      },
      {
        day: 3, theme: "สำรวจเกาะสมุย",
        items: [
          { name: "Big Buddha (วัดพระใหญ่)", type: "place", time: "09:00" },
          { name: "น้ำตกนาเมือง", type: "place", time: "11:00" },
          { name: "Fisherman's Village", type: "activity", time: "17:00" },
          { name: "Chaweng Night Life", type: "activity", time: "20:00" },
        ],
      },
      {
        day: 4, theme: "ผ่อนคลายและกลับ",
        items: [
          { name: "โยคะยามเช้า / สปา", type: "activity", time: "08:00" },
          { name: "ชอปปิ้งของฝาก Central Festival", type: "activity", time: "11:00" },
          { name: "สนามบินสมุย", type: "transport", time: "15:00" },
        ],
      },
    ],
  },
];

export function getTripTemplates(): TripTemplate[] {
  return TRIP_TEMPLATES;
}

export function getTripTemplate(id: string): TripTemplate | null {
  return TRIP_TEMPLATES.find((t) => t.id === id) ?? null;
}

export async function createTripFromTemplate(
  templateId: string
): Promise<{ data?: { id: string }; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

    const tpl = getTripTemplate(templateId);
    if (!tpl) return { error: "ไม่พบ template" };

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        title: tpl.title,
        destination: tpl.destination,
        coverImage: tpl.coverImage,
        status: "PLANNING",
        isPublic: false,
        days: {
          create: tpl.days.map((d) => ({
            day: d.day,
            note: d.theme,
            items: {
              create: d.items.map((item, idx) => ({
                name: item.name,
                type: item.type,
                time: item.time,
                note: item.note,
                order: idx,
              })),
            },
          })),
        },
      },
    });

    revalidatePath("/trips");
    return { data: { id: trip.id } };
  } catch (e) {
    return { error: String(e) };
  }
}

// ── Packing List ──────────────────────────────────────────────────────
const dbPack = prisma as any;

export interface PackingItemData {
  id: string;
  name: string;
  category: string;
  isPacked: boolean;
  order: number;
}

const DEFAULT_PACKING_ITEMS: Array<{ name: string; category: string }> = [
  // Documents
  { name: "บัตรประชาชน / พาสปอร์ต", category: "documents" },
  { name: "บัตร ATM / บัตรเครดิต", category: "documents" },
  { name: "ตั๋ว / ใบจอง", category: "documents" },
  // Electronics
  { name: "โทรศัพท์มือถือ + ที่ชาร์จ", category: "electronics" },
  { name: "Power Bank", category: "electronics" },
  { name: "หูฟัง", category: "electronics" },
  // Clothing
  { name: "เสื้อผ้า", category: "clothing" },
  { name: "รองเท้า", category: "clothing" },
  { name: "ร่ม / เสื้อกันฝน", category: "clothing" },
  // Toiletries
  { name: "แปรงสีฟัน + ยาสีฟัน", category: "toiletries" },
  { name: "ครีมกันแดด", category: "toiletries" },
  { name: "ยารักษาโรคประจำตัว", category: "toiletries" },
  // Other
  { name: "กระเป๋าเงิน / เงินสด", category: "other" },
  { name: "กล้องถ่ายรูป", category: "electronics" },
];

export async function getPackingList(tripId: string): Promise<{ data: PackingItemData[] }> {
  try {
    const rows = await dbPack.packingItem.findMany({
      where: { tripId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return { data: rows as PackingItemData[] };
  } catch {
    return { data: [] };
  }
}

export async function initPackingList(tripId: string): Promise<{ ok: boolean }> {
  try {
    const existing = await dbPack.packingItem.count({ where: { tripId } });
    if (existing > 0) return { ok: true };
    await dbPack.packingItem.createMany({
      data: DEFAULT_PACKING_ITEMS.map((item, i) => ({ tripId, ...item, order: i })),
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function addPackingItem(
  tripId: string,
  name: string,
  category = "other"
): Promise<{ data: PackingItemData | null }> {
  try {
    const count = await dbPack.packingItem.count({ where: { tripId } });
    const item = await dbPack.packingItem.create({
      data: { tripId, name: name.trim(), category, order: count },
    });
    return { data: item as PackingItemData };
  } catch {
    return { data: null };
  }
}

export async function togglePackingItem(
  itemId: string,
  isPacked: boolean
): Promise<{ ok: boolean }> {
  try {
    await dbPack.packingItem.update({ where: { id: itemId }, data: { isPacked } });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deletePackingItem(itemId: string): Promise<{ ok: boolean }> {
  try {
    await dbPack.packingItem.delete({ where: { id: itemId } });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ── Trip Budget Tracker ───────────────────────────────────────────────
const dbExp = prisma as any;

export interface TripExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  paidBy: string | null;
  date: Date;
}

export interface BudgetSummary {
  budget: number | null;
  totalSpent: number;
  remaining: number | null;
  byCategory: Record<string, number>;
  expenses: TripExpenseItem[];
}

export async function getTripBudget(tripId: string): Promise<{ data: BudgetSummary | null }> {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { budget: true },
    });
    if (!trip) return { data: null };

    const expenses = await dbExp.tripExpense.findMany({
      where: { tripId },
      orderBy: { date: "desc" },
    }) as TripExpenseItem[];

    const totalSpent = expenses.reduce((s: number, e: TripExpenseItem) => s + e.amount, 0);
    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
    }

    return {
      data: {
        budget: trip.budget,
        totalSpent,
        remaining: trip.budget != null ? trip.budget - totalSpent : null,
        byCategory,
        expenses,
      },
    };
  } catch {
    return { data: null };
  }
}

export async function addTripExpense(
  tripId: string,
  name: string,
  amount: number,
  category = "other",
  paidBy?: string
): Promise<{ data: TripExpenseItem | null }> {
  try {
    const item = await dbExp.tripExpense.create({
      data: { tripId, name: name.trim(), amount, category, paidBy: paidBy ?? null },
    });
    revalidatePath(`/trips/${tripId}`);
    return { data: item as TripExpenseItem };
  } catch {
    return { data: null };
  }
}

export async function deleteTripExpense(expenseId: string): Promise<{ ok: boolean }> {
  try {
    await dbExp.tripExpense.delete({ where: { id: expenseId } });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function updateTripBudget(tripId: string, budget: number): Promise<{ ok: boolean }> {
  try {
    await prisma.trip.update({ where: { id: tripId }, data: { budget } });
    revalidatePath(`/trips/${tripId}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
