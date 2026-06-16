"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { PostCard, type PostCardData } from "@/components/features/PostCard";
import { getPostsByTag } from "@/server/actions/posts";
import { Loader2, Hash } from "lucide-react";

function fmtTime(d: Date): string {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

type RawPost = {
  id: string;
  content: string;
  images: string[];
  location: string | null;
  tags: string[];
  createdAt: Date;
  user: { id: string; name: string | null; username: string | null; avatarUrl: string | null };
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  place: { id: string; slug: string; name: string } | null;
};

function toCard(p: RawPost): PostCardData {
  return {
    id: p.id,
    caption: p.content,
    img: p.images?.[0] ?? undefined,
    images: p.images ?? [],
    user: {
      id: p.user?.id ?? undefined,
      name: p.user?.name ?? "YourTrip User",
      avatarUrl: p.user?.avatarUrl ?? undefined,
      location: p.location ?? undefined,
    },
    likes: p.likesCount,
    comments: p.commentsCount,
    liked: p.likedByMe ?? false,
    saved: p.savedByMe ?? false,
    time: fmtTime(p.createdAt),
    tags: p.tags ?? [],
    place: p.place ?? null,
  };
}

interface Props {
  tag: string;
  initialPosts: RawPost[];
  initialCursor?: string;
  initialHasMore: boolean;
}

export default function TagFeedClient({ tag, initialPosts, initialCursor, initialHasMore }: Props) {
  const [posts, setPosts] = useState<PostCardData[]>(initialPosts.map(toCard));
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { data, nextCursor, hasMore: more } = await getPostsByTag(tag, cursor, 12);
      setPosts((prev) => [...prev, ...(data as RawPost[]).map(toCard)]);
      setCursor(nextCursor);
      setHasMore(more);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [tag, cursor, hasMore, loading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1, rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  if (posts.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 dark:text-slate-500">
        <Hash className="w-12 h-12 opacity-30" />
        <p className="text-sm font-medium">ยังไม่มีโพสต์ในแท็ก #{tag}</p>
        <p className="text-xs text-center">เป็นคนแรกที่แชร์ด้วยแท็กนี้!</p>
        <Link href="/create" className="mt-2 bg-[#398AB9] text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-[#1C658C] transition">
          สร้างโพสต์
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={String(post.id)} post={post} />
      ))}

      <div ref={sentinelRef} className="h-4" />

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-[#398AB9] animate-spin" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-slate-500 py-4">
          โพสต์ทั้งหมดในแท็ก #{tag} 🎉
          </p>
      )}
    </div>
  );
}
