import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                  lastModified: now, changeFrequency: "daily",   priority: 1   },
    { url: `${BASE_URL}/explore`,     lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/login`,       lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/register`,    lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Fetch real place slugs from DB
  let placeRoutes: MetadataRoute.Sitemap = [];
  try {
    const places = await prisma.place.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { isFeatured: "desc" },
      take: 200,
    });
    placeRoutes = places.map((p) => ({
      url: `${BASE_URL}/place/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable — skip dynamic routes
  }

  return [...staticRoutes, ...placeRoutes];
}
