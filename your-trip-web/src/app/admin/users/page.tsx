import { getAdminUsers } from "@/server/actions/admin";
import AdminUsersClient from "./AdminUsersClient";

export const metadata = { title: "Admin — ผู้ใช้" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const page = Number(params.page ?? 1);
  const { users, total } = await getAdminUsers({ search, page });

  return <AdminUsersClient initialUsers={users} total={total} initialSearch={search} initialPage={page} />;
}
