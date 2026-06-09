import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import TripsClient, { type TripSummary } from "./TripsClient";
import { getUserTrips } from "@/server/actions/trips";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

export const metadata: Metadata = {
  title: "ทริปของฉัน | Your Trip",
  description: "วางแผนทริป สร้าง itinerary รายวัน ติดตามงบประมาณ และจัดการการเดินทางของคุณ",
  alternates: { canonical: `${SITE_URL}/trips` },
};

const fmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" });

function mapStatus(raw: string): TripSummary["status"] {
  if (raw === "COMPLETED")          return "completed";
  if (raw === "CANCELLED")          return "cancelled";
  if (raw === "CONFIRMED" || raw === "ONGOING") return "upcoming";
  return "planning"; // PLANNING default
}

export default async function TripsPage() {
  const { data: rawTrips } = await getUserTrips();

  const trips: TripSummary[] = (rawTrips as Awaited<ReturnType<typeof getUserTrips>>["data"]).map((t) => {
    const allItems = t.days.flatMap((d) => d.items);
    const destinations = allItems
      .map((i) => i.place?.name ?? i.name)
      .filter(Boolean)
      .slice(0, 6);

    return {
      id: t.id,
      title: t.title,
      status: mapStatus(t.status),
      startDate: t.startDate ? fmt.format(t.startDate) : "—",
      endDate:   t.endDate   ? fmt.format(t.endDate)   : "—",
      members: 1,  // solo until team-trip feature added
      places: allItems.length,
      img: t.coverImage ?? "",
      destinations,
    };
  });

  return (
    <AppShell>
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <span className="text-lg font-bold text-[#398AB9]">ทริปของฉัน</span>
      </header>
      <TripsClient initialTrips={trips} />
    </AppShell>
  );
}
