import { Suspense } from "react";
import { getPlacesForComparison, searchPlacesForTrip } from "@/server/actions/places";
import CompareClient from "./CompareClient";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "เปรียบเทียบสถานที่ — Your Trip",
  description: "เปรียบเทียบสถานที่ท่องเที่ยวแบบ side-by-side",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>;
}) {
  const sp = await searchParams;
  const slugs = sp.slugs ? sp.slugs.split(",").filter(Boolean).slice(0, 3) : [];
  const { data: places } = await getPlacesForComparison(slugs);

  return (
    <AppShell>
      <Suspense>
        <CompareClient initialPlaces={places} />
      </Suspense>
    </AppShell>
  );
}
