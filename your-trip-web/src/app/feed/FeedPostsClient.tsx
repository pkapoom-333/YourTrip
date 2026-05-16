"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PostCard, type PostCardData } from "@/components/features/PostCard";
import { getFeed } from "@/server/actions/posts";
import { Loader2 } from "lucide-react";

function fmtTime(d: Date): string {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

interface FeedPostsClientProps {
  initialPosts: PostCardData[];
  initialCursor?: string;
  initialHasMore?: boolean;
}

export function FeedPostsClient({ initialPosts, initialCursor, initialHasMore = false }: FeedPostsClientProps) {
  const [posts, setPosts] = useState<PostCardData[]>(initialPosts);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const { data, nextCursor, hasMore: more } = await getFeed(cursor);
      const newPosts: PostCardData[] = data.map((p) => ({
        id: p.id,
        caption: p.content,
        img: p.images?.[0] ?? undefined,
        user: {
          id: p.user?.id ?? undefined,
          name: p.user?.name ?? "YourTrip User",
          avatarUrl: p.user?.avatarUrl ?? undefined,
          location: p.location ?? undefined,
        },
        likes: p.likesCount,
        comments: p.commentsCount,
        saved: false,
        time: fmtTime(p.createdAt),
        tags: p.tags ?? [],
      }));

      setPosts((prev) => [...prev, ...newPosts]);
      setCursor(nextCursor);
      setHasMore(more);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={String(post.id)} post={post} />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-[#398AB9] animate-spin" />
        </div>
      )}

      {/* Manual load more (fallback) */}
      {!loading && hasMore && (
        <button
          onClick={loadMore}
          className="w-full py-3 text-sm text-[#398AB9] font-medium hover:bg-[#398AB9]/5 rounded-xl transition"
        >
          โหลดเพิ่มเติม
        </button>
      )}

      {/* End of feed */}
      {!hasMore && posts.length > 0 && (
        <p className="text-center text-xs text-gray-400 py-4">
          คุณดูโพสต์ทั้งหมดแล้ว 🎉
        </p>
      )}
    </div>
  );
}
