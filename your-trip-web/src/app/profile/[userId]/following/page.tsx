import AppShell from "@/components/AppShell";
import Link from "next/link";
import { ChevronLeft, Users } from "lucide-react";
import { getFollowing, getProfile } from "@/server/actions/profile";
import { createClient as createServerClient } from "@/lib/supabase/server";
import UserListRow from "@/components/features/UserListRow";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function FollowingPage({ params }: PageProps) {
  const { userId } = await params;

  const [{ data: following }, { data: profile }, supabase] = await Promise.all([
    getFollowing(userId),
    getProfile(userId),
    createServerClient(),
  ]);
  const { data: { user: me } } = await supabase.auth.getUser();

  const displayName = profile?.username ? `@${profile.username}` : profile?.name ?? "ผู้ใช้";

  return (
    <AppShell>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <Link
          href={`/profile/${userId}`}
          className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{displayName}</p>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">กำลังติดตาม</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900">
        <div className="flex border-b border-gray-100 dark:border-slate-700">
          <Link
            href={`/profile/${userId}/followers`}
            className="flex-1 text-center py-3 border-b-2 border-transparent text-gray-400 dark:text-slate-500 text-sm font-medium hover:text-gray-700 dark:hover:text-slate-200"
          >
            ผู้ติดตาม
          </Link>
          <Link
            href={`/profile/${userId}/following`}
            className="flex-1 text-center py-3 border-b-2 border-[#398AB9] text-[#398AB9] text-sm font-semibold"
          >
            กำลังติดตาม
          </Link>
        </div>

        {following.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <Users className="w-12 h-12 text-gray-200 dark:text-slate-700 mb-4" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">ยังไม่ได้ติดตามใคร</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {following.map((u) => (
              <UserListRow key={u.id} user={u} selfId={me?.id} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
