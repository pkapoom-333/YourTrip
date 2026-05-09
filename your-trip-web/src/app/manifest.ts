import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Your Trip — สังคมนักเดินทาง",
    short_name: "Your Trip",
    description: "ค้นพบสถานที่สวยงาม แบ่งปันประสบการณ์ท่องเที่ยว",
    start_url: "/feed",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#398AB9",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["travel", "social", "lifestyle"],
  };
}
