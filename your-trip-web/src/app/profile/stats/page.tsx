import { getDeepStats } from "@/server/actions/profile";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import StatsClient from "./StatsClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "สถิติการท่องเที่ยว — YourTrip" };

export default async function ProfileStatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: stats } = await getDeepStats();

  return (
    <AppShell>
      <StatsClient stats={stats} />
    </AppShell>
  );
}
