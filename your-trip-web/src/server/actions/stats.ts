"use server";
import { prisma } from "@/lib/prisma";

export interface PlatformStats {
  userCount: number;
  postCount: number;
  placeCount: number;
  tripCount: number;
  reviewCount: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const [userCount, postCount, placeCount, tripCount, reviewCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count({ where: { isPublic: true } }),
      prisma.place.count(),
      prisma.trip.count({ where: { isPublic: true } }),
      prisma.review.count(),
    ]);
    return { userCount, postCount, placeCount, tripCount, reviewCount };
  } catch {
    return { userCount: 0, postCount: 0, placeCount: 0, tripCount: 0, reviewCount: 0 };
  }
}
