import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import NearMeClient from "./NearMeClient";

export const metadata: Metadata = {
  title: "ใกล้ฉัน — Your Trip",
  description: "ค้นพบสถานที่ท่องเที่ยว ร้านอาหาร และคาเฟ่ใกล้คุณ พร้อมระยะทางและข้อมูลครบ",
};

export default function NearMePage() {
  return (
    <AppShell>
      <NearMeClient />
    </AppShell>
  );
}
