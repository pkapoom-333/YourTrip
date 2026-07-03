import { notFound } from "next/navigation";
import { getPlaceBySlug, getPlaceReviews } from "@/server/actions/places";
import AppShell from "@/components/AppShell";
import PlaceReviewsClient from "./PlaceReviewsClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: place } = await getPlaceBySlug(slug);
  if (!place) return { title: "รีวิว" };
  return { title: `รีวิว ${place.name} — YourTrip` };
}

export default async function PlaceReviewsPage({ params }: Props) {
  const { slug } = await params;
  const [{ data: place }, { data: reviews, nextCursor, totalCount, ratingBreakdown }] = await Promise.all([
    getPlaceBySlug(slug),
    getPlaceReviews(slug, { sort: "helpful", take: 20 }),
  ]);

  if (!place) notFound();

  return (
    <AppShell>
      <PlaceReviewsClient
        place={{ id: place.id, slug, name: place.name, rating: place.rating, reviewCount: place.reviewCount }}
        initialReviews={reviews}
        initialCursor={nextCursor}
        totalCount={totalCount}
        ratingBreakdown={ratingBreakdown}
      />
    </AppShell>
  );
}
