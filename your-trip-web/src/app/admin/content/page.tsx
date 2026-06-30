import { getAdminPosts } from "@/server/actions/admin";
import AdminContentClient from "./AdminContentClient";

export const metadata = { title: "Admin — Content Moderation" };

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const page = Number(params.page ?? 1);
  const filter = (params.filter ?? "all") as "all" | "reported" | "hidden";
  const { posts, total } = await getAdminPosts({ search, page, filter });
  return <AdminContentClient initialPosts={posts} total={total} initialSearch={search} initialPage={page} initialFilter={filter} />;
}
