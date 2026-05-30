"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { PostCard, type PostCardData } from "@/components/features/PostCard";
import { getFeed } from "@/server/actions/posts";
import { Loader2, ImagePlus, MapPin, Smile, Plane } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { Avatar } from "@/components/shared/Avatar";

function fmtTime(d: Date): string {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

function ComposeBox() {
  const { user } = useUser();
  return (
    <Link href="/create" className="block">
      <div className="bg-white md:rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 hover:border-[#398AB9]/40 hover:shadow-sm transition-all cursor-pointer group">
        <Avatar
          src={user?.user_metadata?.avatar_url}
          name={user?.user_metadata?.full_name ?? user?.email ?? "U"}
          className="w-9 h-9 flex-shrink-0"
        />
        <div className="flex-1 bg-gray-50 group-hover:bg-[#398AB9]/5 border border-gray-200 group-hover:border-[#398AB9]/30 rounded-xl px-4 py-2.5 text-sm text-gray-400 transition-all">
          แชร์ประสบการณ์การท่องเที่ยว...
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="p-2 rounded-xl text-[#398AB9] hover:bg-[#398AB9]/10 transition">
            <ImagePlus className="w-4 h-4" />
          </span>
          <span className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-50 transition">
            <MapPin className="w-4 h-4" />
          </span>
          <span className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 transition">
            <Smile className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeedEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-20 h-20 bg-[#398AB9]/10 rounded-full flex items-center justify-center mb-5">
        <Plane className="w-9 h-9 text-[#398AB9]" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">ยังไม่มีโพสต์ในฟีด</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        เป็นคนแรกที่แชร์ประสบการณ์การท่องเที่ยว หรือติดตามนักเดินทางคนอื่น
      </p>
      <div className="flex gap-3">
        <Link href="/create"
          className="bg-[#398AB9] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#1C658C] transition">
          สร้างโพสต์แรก
        </Link>
        <Link href="/explore"
          className="border border-gray-200 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-xl hover:border-[#398AB9] hover:text-[#398AB9] transition">
          สำรวจสถานที่
        </Link>
      </div>
    </div>
  );
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
        saved: p.savedByMe ?? false,
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
      {/* Compose box */}
      <ComposeBox />

      {/* Empty state */}
      {posts.length === 0 && !loading && <FeedEmptyState />}

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
