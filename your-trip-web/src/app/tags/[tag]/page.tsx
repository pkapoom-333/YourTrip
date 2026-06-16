import AppShell from "@/components/AppShell";
import { getPostsByTag } from "@/server/actions/posts";
import TagFeedClient from "./TagFeedClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} | YourTrip`,
    description: `โพสต์และสถานที่ท่องเที่ยวที่แท็ก #${decoded} บน YourTrip`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  let initialPosts: Awaited<ReturnType<typeof getPostsByTag>>["data"] = [];
  let nextCursor: string | undefined;
  let hasMore = false;
  try {
    ({ data: initialPosts, nextCursor, hasMore } = await getPostsByTag(decoded, undefined, 12));
  } catch {
    initialPosts = [];
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl font-black text-[#398AB9]">#</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 break-words">
              {decoded}
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {initialPosts.length > 0
              ? `${initialPosts.length}+ โพสต์`
              : "ยังไม่มีโพสต์ในแท็กนี้"}
          </p>
        </div>

        <TagFeedClient
          tag={decoded}
          initialPosts={initialPosts}
          initialCursor={nextCursor}
          initialHasMore={hasMore}
        />
      </div>
    </AppShell>
  );
}
