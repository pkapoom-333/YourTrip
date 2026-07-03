import AppShell from "@/components/AppShell";
import { getUserAchievements } from "@/server/actions/profile";
import AchievementsClient from "./AchievementsClient";

export const metadata = {
  title: "ความสำเร็จ — Your Trip",
  description: "ดูป้ายความสำเร็จของคุณ",
};

export default async function AchievementsPage() {
  const { data } = await getUserAchievements();
  return (
    <AppShell>
      <AchievementsClient achievements={data} />
    </AppShell>
  );
}
