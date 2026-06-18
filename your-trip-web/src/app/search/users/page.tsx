import AppShell from "@/components/AppShell";
import UserSearchClient from "@/components/features/UserSearchClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ค้นหาผู้ใช้",
  description: "ค้นหานักท่องเที่ยวและมัคคุเทศก์ใน YourTrip",
};

export default async function SearchUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <AppShell>
      <div className="flex flex-col h-full max-w-lg mx-auto w-full bg-white dark:bg-slate-800 min-h-screen">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 dark:border-slate-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            ค้นหาผู้ใช้
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            ค้นหานักท่องเที่ยวและมัคคุเทศก์
          </p>
        </div>

        <UserSearchClient initialQuery={q ?? ""} />
      </div>
    </AppShell>
  );
}
