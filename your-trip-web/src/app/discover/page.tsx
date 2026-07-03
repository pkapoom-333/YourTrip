import AppShell from "@/components/AppShell";
import { getDiscoverUsers } from "@/server/actions/profile";
import DiscoverClient from "./DiscoverClient";

export const metadata = {
  title: "ค้นพบคน — Your Trip",
  description: "ค้นพบนักเดินทางและผู้นำเที่ยวที่น่าติดตาม",
};

export default async function DiscoverPage() {
  const { data: users } = await getDiscoverUsers(30);
  return (
    <AppShell>
      <DiscoverClient users={users} />
    </AppShell>
  );
}
