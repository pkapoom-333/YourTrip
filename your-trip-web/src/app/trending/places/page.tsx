import AppShell from "@/components/AppShell";
import { getTrendingPlaces } from "@/server/actions/places";
import TrendingPlacesClient from "./TrendingPlacesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สถานที่ยอดนิยม",
  description: "สถานที่ท่องเที่ยวยอดนิยมที่นักเดินทางชาว YourTrip บันทึกและรีวิวมากที่สุด",
};

export default async function TrendingPlacesPage() {
  let places: Awaited<ReturnType<typeof getTrendingPlaces>>["data"] = [];
  try {
    ({ data: places } = await getTrendingPlaces(30));
  } catch {
    places = [];
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🔥</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              สถานที่ยอดนิยม
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            จัดอันดับจากการบันทึกและรีวิวของชุมชน
          </p>
        </div>

        <TrendingPlacesClient initialPlaces={places} />
      </div>
    </AppShell>
  );
}
