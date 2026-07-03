import type { Metadata } from "next";
import { getCollectionById } from "@/server/actions/collections";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: col } = await getCollectionById(id);

  if (!col) {
    return { title: "คอลเลกชัน — Your Trip" };
  }

  const title = `${col.emoji ?? "📍"} ${col.title} — Your Trip`;
  const desc = col.description
    ?? `คอลเลกชัน ${col.placeCount} สถานที่ โดย ${col.user.name ?? "นักเดินทาง"} บน Your Trip`;
  const coverImage = col.coverImages[0] ?? null;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${BASE_URL}/collections/${id}`,
      type: "article",
      ...(coverImage
        ? { images: [{ url: coverImage, width: 1200, height: 630, alt: col.title }] }
        : {}),
    },
    twitter: {
      card: coverImage ? "summary_large_image" : "summary",
      title,
      description: desc,
      ...(coverImage ? { images: [coverImage] } : {}),
    },
  };
}

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
