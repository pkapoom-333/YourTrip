import type { Metadata } from "next";
import { getTripById } from "@/server/actions/trips";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";
const DEFAULT_COVER = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const { data: trip } = await getTripById(id);

  if (!trip || !trip.isPublic) {
    return { title: "ทริป" };
  }

  const title = `${trip.title}`;
  const description = trip.description
    ?? `แผนทริป ${trip.destination} ${trip.days.length} วัน`;
  const image = trip.coverImage ?? DEFAULT_COVER;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/trips/${id}`,
      images: [{ url: image, width: 1200, height: 630, alt: trip.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: { canonical: `${SITE_URL}/trips/${id}` },
  };
}

export default function TripDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
