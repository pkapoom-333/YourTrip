import PlaceFormClient from "../PlaceFormClient";

export const metadata = { title: "Admin — เพิ่มสถานที่" };

export default function AdminNewPlacePage() {
  return <PlaceFormClient mode="create" />;
}
