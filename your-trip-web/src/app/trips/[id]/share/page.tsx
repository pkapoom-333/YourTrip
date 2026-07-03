import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTripById } from "@/server/actions/trips";
import { prisma } from "@/lib/prisma";
import TripShareClient from "./TripShareClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: trip } = await getTripById(id);
  if (!trip) return { title: "แผนทริป" };

  const title = `${trip.title} — Your Trip`;
  const desc = trip.description ?? `แผนการเดินทาง${trip.destination} ${trip.days?.length ?? 0} วัน`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${BASE_URL}/trips/${id}/share`,
      type: "article",
      ...(trip.coverImage
        ? { images: [{ url: trip.coverImage, width: 1200, height: 630, alt: trip.title }] }
        : {}),
    },
    twitter: {
      card: trip.coverImage ? "summary_large_image" : "summary",
      title,
      description: desc,
      ...(trip.coverImage ? { images: [trip.coverImage] } : {}),
    },
  };
}

export default async function TripSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: trip } = await getTripById(id);
  if (!trip || !trip.isPublic) notFound();

  // Count total places across all days
  const placeCount = trip.days.reduce(
    (sum: number, d: { items: unknown[] }) => sum + d.items.length,
    0
  );

  // Get owner info
  const dbAny = prisma as unknown as {
    user: {
      findUnique: (q: {
        where: { id: string };
        select: { name: boolean; avatarUrl: boolean };
      }) => Promise<{ name: string | null; avatarUrl: string | null } | null>;
    };
  };
  const owner = await dbAny.user.findUnique({
    where: { id: (trip as unknown as { userId: string }).userId },
    select: { name: true, avatarUrl: true },
  }).catch(() => null);

  return (
    <TripShareClient
      trip={{
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        coverImage: trip.coverImage,
        startDate: trip.startDate,
        endDate: trip.endDate,
        description: trip.description,
        isPublic: trip.isPublic,
        dayCount: trip.days.length,
        placeCount,
        ownerName: owner?.name ?? null,
        ownerAvatar: owner?.avatarUrl ?? null,
      }}
    />
  );
}
