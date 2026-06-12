import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ExploreClient from "./ExploreClient";
import { getPlaces } from "@/server/actions/places";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export const metadata: Metadata = {
  title: "สำรวจสถานที่ | Your Trip",
  description: "ค้นพบสถานที่ท่องเที่ยว ร้านอาหาร คาเฟ่ พร้อมรีวิวจากชุมชนนักเดินทางจริง",
  alternates: { canonical: `${SITE_URL}/explore` },
};
import { getSavedPlaceIds } from "@/server/actions/savedPlaces";

export default async function ExplorePage() {
  const [{ data: places }, savedIds] = await Promise.all([
    getPlaces({ take: 50 }),
    getSavedPlaceIds(),
  ]);

  return (
    <AppShell>
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <span className="text-lg font-bold text-[#398AB9]">สำรวจ</span>
      </header>
      <ExploreClient initialPlaces={places} initialSaved={savedIds} />
    </AppShell>
  );
}
