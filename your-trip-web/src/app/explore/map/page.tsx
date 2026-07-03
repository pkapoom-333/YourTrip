import { getPlacesForMap } from "@/server/actions/places";
import ExploreMapClient from "./ExploreMapClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "แผนที่สถานที่ท่องเที่ยว — YourTrip" };

export default async function ExploreMapPage() {
  const { data: places } = await getPlacesForMap();
  return <ExploreMapClient places={places} />;
}
