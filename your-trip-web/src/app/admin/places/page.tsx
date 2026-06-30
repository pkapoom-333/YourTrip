import { getAdminPlaces } from "@/server/actions/admin";
import AdminPlacesClient from "./AdminPlacesClient";

export const metadata = { title: "Admin — สถานที่" };

export default async function AdminPlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const page = Number(params.page ?? 1);
  const { places, total } = await getAdminPlaces({ search, page });

  return <AdminPlacesClient initialPlaces={places} total={total} initialSearch={search} initialPage={page} />;
}
