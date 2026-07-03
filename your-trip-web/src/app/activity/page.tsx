import AppShell from "@/components/AppShell";
import { getFollowingActivity } from "@/server/actions/profile";
import ActivityClient from "./ActivityClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "กิจกรรม — YourTrip" };

export default async function ActivityPage() {
  const { data: activities } = await getFollowingActivity(40);
  return (
    <AppShell>
      <ActivityClient activities={activities} />
    </AppShell>
  );
}
