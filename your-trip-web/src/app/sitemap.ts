import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                   lastModified: now, changeFrequency: "daily",   priority: 1   },
    { url: `${BASE_URL}/explore`,      lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/feed`,         lastModified: now, changeFrequency: "hourly",  priority: 0.8 },
    { url: `${BASE_URL}/trips`,        lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/login`,        lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/register`,     lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/forgot-password`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Fetch real place slugs + public user profiles + provinces + public trips from DB
  let placeRoutes: MetadataRoute.Sitemap = [];
  let userRoutes: MetadataRoute.Sitemap = [];
  let provinceRoutes: MetadataRoute.Sitemap = [];
  let tripRoutes: MetadataRoute.Sitemap = [];
  try {
    const [places, users, provinces, publicTrips] = await Promise.all([
      prisma.place.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
        orderBy: { isFeatured: "desc" },
        take: 500,
      }),
      prisma.user.findMany({
        where: { username: { not: null } },
        select: { username: true, updatedAt: true },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
      prisma.place.findMany({
        where: { isPublished: true, province: { not: null } },
        select: { province: true, updatedAt: true },
        distinct: ["province"],
        take: 100,
      }),
      prisma.trip.findMany({
        where: { isPublic: true },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 200,
      }),
    ]);

    placeRoutes = places.map((p) => ({
      url: `${BASE_URL}/place/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    userRoutes = users
      .filter((u) => u.username)
      .map((u) => ({
        url: `${BASE_URL}/u/${u.username}`,
        lastModified: u.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    provinceRoutes = provinces
      .filter((p) => p.province)
      .map((p) => ({
        url: `${BASE_URL}/explore/${encodeURIComponent(p.province!)}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }));

    tripRoutes = publicTrips.map((t) => ({
      url: `${BASE_URL}/trips/${t.id}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable — skip dynamic routes
  }

  return [...staticRoutes, ...provinceRoutes, ...placeRoutes, ...userRoutes, ...tripRoutes];
}
