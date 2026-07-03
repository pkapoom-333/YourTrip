import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import SearchPageClient from "./SearchPageClient";

export const metadata = {
  title: "ค้นหา — Your Trip",
  description: "ค้นหาสถานที่ โพสต์ และผู้ใช้งาน",
};

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense>
        <SearchPageClient />
      </Suspense>
    </AppShell>
  );
}
