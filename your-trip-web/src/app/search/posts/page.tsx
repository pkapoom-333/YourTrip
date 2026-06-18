import AppShell from "@/components/AppShell";
import PostSearchClient from "./PostSearchClient";

export const metadata = { title: "ค้นหาโพสต์" };

export default async function SearchPostsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-5">ค้นหาโพสต์</h1>
        <PostSearchClient initialQuery={q ?? ""} />
      </div>
    </AppShell>
  );
}
