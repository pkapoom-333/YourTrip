import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/place/"],
        disallow: [
          "/feed",
          "/profile",
          "/trips",
          "/buddy",
          "/notifications",
          "/settings",
          "/create",
          "/post/",
          "/api/",
          "/auth/",
          "/offline",
          "/guide/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
