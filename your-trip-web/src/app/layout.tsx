import type { Metadata, Viewport } from "next";
import { Sarabun, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

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
    icon: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
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
    <html lang="th" suppressHydrationWarning className={`${sarabun.variable} ${inter.variable}`}>
      <head>
        {/* Apply dark class before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(JSON.parse(localStorage.getItem('settings_dark_mode')||'false'))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://wujunlagtipvbzappuwx.supabase.co" />
        {/* Register service worker for offline support */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
