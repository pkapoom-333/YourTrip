import type { Metadata } from "next";
import MapClient from "./MapClient";

export const metadata: Metadata = {
  title: "แผนที่สถานที่ — Your Trip",
  description: "ดูสถานที่ท่องเที่ยว ร้านอาหาร และคาเฟ่ทั่วประเทศไทยบนแผนที่",
};

export default function MapPage() {
  return <MapClient />;
}
