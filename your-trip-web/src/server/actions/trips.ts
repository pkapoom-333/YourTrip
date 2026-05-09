"use server";

// TODO: wire to Supabase after DB migration
import { createTripSchema, itineraryItemSchema, type CreateTripInput, type ItineraryItemInput } from "@/lib/validations";

export async function createTrip(input: CreateTripInput) {
  const parsed = createTripSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }
  // TODO: prisma.trip.create(...)
  return { data: { id: "mock-trip-id", ...parsed.data } };
}

export async function getUserTrips() {
  // TODO: prisma.trip.findMany({ where: { userId: user.id } })
  return { data: [] };
}

export async function addItineraryItem(tripId: string, input: ItineraryItemInput) {
  const parsed = itineraryItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }
  // TODO: prisma.itineraryItem.create(...)
  return { data: { id: "mock-item-id", tripId, ...parsed.data } };
}

export async function reorderItinerary(tripId: string, day: number, itemIds: string[]) {
  // TODO: update order in bulk
  return { data: { success: true } };
}

export async function deleteTrip(tripId: string) {
  // TODO: prisma.trip.delete({ where: { id: tripId } })
  return { data: { success: true } };
}
