import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

// Force all pages to be dynamically rendered — this app requires auth so no static prerender
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourtrip.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Your Trip — สังคมนักเดินทาง",
    template: "%s | Your Trip",
  },
  description:
    "ค้นพบสถานที่สวยงาม แบ่งปันประสบการณ์ท่องเที่ยว วางแผนทริป และหาเพื่อนร่วมทางในแอปเดียว",
  keywords: ["ท่องเที่ยว", "travel", "เที่ยวไทย", "วางแผนทริป", "สังคมนักเดินทาง", "yourtrip"],
  authors: [{ name: "YourTrip Team" }],
  creator: "YourTrip",
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: BASE_URL,
    siteName: "Your Trip",
    title: "Your Trip — สังคมนักเดินทาง",
    description:
      "ค้นพบสถานที่สวยงาม แบ่งปันประสบการณ์ท่องเที่ยว วางแผนทริป และหาเพื่อนร่วมทางในแอปเดียว",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Your Trip — สังคมนักเดินทาง",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Trip — สังคมนักเดินทาง",
    description: "ค้นพบสถานที่สวยงาม แบ่งปันประสบการณ์ท่องเที่ยว",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Your Trip",
  },
  icons: {
    apple: "/icon-192.png",
    icon: "/icon-192.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#398AB9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
