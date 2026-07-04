import AppShell from "@/components/AppShell";
import { getTripTemplates } from "@/server/actions/trips";
import TripsTemplatesClient from "./TripsTemplatesClient";

export const metadata = {
  title: "เทมเพลตทริป — Your Trip",
  description: "เริ่มวางแผนทริปได้เลยด้วยเทมเพลตสำเร็จรูป",
};

export default async function TripsTemplatesPage() {
  const templates = await getTripTemplates();
  return (
    <AppShell>
      <TripsTemplatesClient templates={templates} />
    </AppShell>
  );
}
