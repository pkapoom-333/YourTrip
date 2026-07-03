import AppShell from "@/components/AppShell";
import { getPostsByTag } from "@/server/actions/posts";
import TagPageClient from "./TagPageClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} — Your Trip`,
    description: `โพสต์ท่องเที่ยวที่แท็ก #${decoded}`,
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const { data: rawPosts, nextCursor, hasMore } = await getPostsByTag(decoded, undefined, 12);
  const initialPosts = rawPosts as unknown as Parameters<typeof TagPageClient>[0]["initialPosts"];
  return (
    <AppShell>
      <TagPageClient
        tag={decoded}
        initialPosts={initialPosts}
        initialNextCursor={nextCursor}
        initialHasMore={hasMore}
      />
    </AppShell>
  );
}
