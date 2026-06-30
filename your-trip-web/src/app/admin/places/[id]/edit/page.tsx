import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PlaceFormClient from "../../PlaceFormClient";

export const metadata = { title: "Admin — แก้ไขสถานที่" };

export default async function AdminEditPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = await prisma.place.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!place) notFound();

  return (
    <PlaceFormClient
      mode="edit"
      placeId={id}
      initialData={{
        name: place.name,
        nameEn: place.nameEn ?? undefined,
        slug: place.slug,
        description: place.description ?? undefined,
        descriptionEn: place.descriptionEn ?? undefined,
        category: place.category,
        region: place.region,
        province: place.province ?? undefined,
        address: place.address ?? undefined,
        lat: place.lat ?? undefined,
        lng: place.lng ?? undefined,
        phone: place.phone ?? undefined,
        website: place.website ?? undefined,
        googleMapsUrl: place.googleMapsUrl ?? undefined,
        priceRange: place.priceRange,
        entryFee: place.entryFee ?? undefined,
        openDays: place.openDays,
        openTime: place.openTime ?? undefined,
        closeTime: place.closeTime ?? undefined,
        hasWifi: place.hasWifi,
        hasAC: place.hasAC,
        hasParking: place.hasParking,
        parkingFee: place.parkingFee ?? undefined,
        isVegetarian: place.isVegetarian,
        isAccessible: place.isAccessible,
        isPublished: place.isPublished,
        isFeatured: place.isFeatured,
        images: place.images.map((img) => img.url),
      }}
    />
  );
}
