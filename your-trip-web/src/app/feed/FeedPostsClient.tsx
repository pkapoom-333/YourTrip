"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { PostCard, type PostCardData } from "@/components/features/PostCard";
import { getFeed, getForYouFeed } from "@/server/actions/posts";
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
      <div className="bg-white dark:bg-slate-800 md:rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3 hover:border-[#398AB9]/40 hover:shadow-sm transition-all cursor-pointer group">
        <Avatar
          src={user?.user_metadata?.avatar_url}
          name={user?.user_metadata?.full_name ?? user?.email ?? "U"}
          className="w-9 h-9 flex-shrink-0"
        />
        <div className="flex-1 bg-gray-50 dark:bg-slate-700 group-hover:bg-[#398AB9]/5 border border-gray-200 dark:border-slate-600 group-hover:border-[#398AB9]/30 rounded-xl px-4 py-2.5 text-sm text-gray-400 dark:text-slate-500 transition-all">
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
      <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-2">ยังไม่มีโพสต์ในฟีด</h3>
      <p className="text-sm text-gray-400 dark:text-slate-500 mb-6 max-w-xs">
        เป็นคนแรกที่แชร์ประสบการณ์การท่องเที่ยว หรือติดตามนักเดินทางคนอื่น
      </p>
      <div className="flex gap-3">
        <Link href="/create"
          className="bg-[#398AB9] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#1C658C] transition">
          สร้างโพสต์แรก
        </Link>
        <Link href="/explore"
          className="border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 text-sm font-medium px-5 py-2.5 rounded-xl hover:border-[#398AB9] hover:text-[#398AB9] transition">
          สำรวจสถานที่
        </Link>
      </div>
    </div>
  );
}

// Popular tags shown as filter chips
const POPULAR_TAGS = ["ทั้งหมด", "เที่ยวเหนือ", "ธรรมชาติ", "คาเฟ่", "ต่างประเทศ", "ทะเล", "Hiking", "อาหาร", "โรแมนติก"];

function TagFilterBar({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <div className="bg-white dark:bg-slate-800 md:rounded-2xl border border-gray-100 dark:border-slate-700 px-3 py-2.5 overflow-x-auto scrollbar-none">
      <div className="flex gap-2 w-max">
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => onChange(tag)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              active === tag
                ? "bg-[#398AB9] text-white shadow-sm"
                : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
          >
            {tag === "ทั้งหมด" ? tag : `#${tag}`}
          </button>
        ))}
      </div>
    </div>
  );
}

interface FeedPostsClientProps {
  initialPosts: PostCardData[];
  initialCursor?: string;
  initialHasMore?: boolean;
}

const PULL_THRESHOLD = 70;

type FeedTab = "forYou" | "following";

function mapPost(p: {
  id: string; content: string; images: string[]; location: string | null;
  tags: string[]; createdAt: Date; user: { id: string; name: string | null; username: string | null; avatarUrl: string | null };
  likesCount: number; commentsCount: number; likedByMe: boolean; savedByMe: boolean;
  place: { id: string; slug: string; name: string } | null;
}): PostCardData {
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

export function FeedPostsClient({ initialPosts, initialCursor, initialHasMore = false }: FeedPostsClientProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>("forYou");
  const [posts, setPosts] = useState<PostCardData[]>(initialPosts);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [activeTag, setActiveTag] = useState("ทั้งหมด");
  const [refreshing, setRefreshing] = useState(false);
  const [pullDelta, setPullDelta] = useState(0);
  const touchStartY = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Client-side filter by tag
  const filteredPosts = activeTag === "ทั้งหมด"
    ? posts
    : posts.filter((p) => p.tags.includes(activeTag));

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = activeTab === "forYou"
        ? await getForYouFeed(cursor)
        : await getFeed(cursor, true);
      setPosts((prev) => [...prev, ...(result.data as any[]).map(mapPost)]);
      setCursor(result.nextCursor);
      setHasMore(result.data.length === 10);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [cursor, hasMore, loading, activeTab]);

  async function switchTab(tab: FeedTab) {
    if (tab === activeTab || loading) return;
    setActiveTab(tab);
    setActiveTag("ทั้งหมด");
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = tab === "forYou"
        ? await getForYouFeed(undefined)
        : await getFeed(undefined, true);
      setPosts((result.data as any[]).map(mapPost));
      setCursor(result.nextCursor);
      setHasMore(result.data.length === 10);
    } catch { /* silent */ } finally { setLoading(false); }
  }

  async function refreshFeed() {
    if (refreshing || loading) return;
    setRefreshing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = activeTab === "forYou"
        ? await getForYouFeed(undefined)
        : await getFeed(undefined, true);
      const { data, nextCursor } = { data: result.data as any[], nextCursor: result.nextCursor };
      const more = result.data.length === 10;
      setPosts(data.map(mapPost));
      setCursor(nextCursor);
      setHasMore(more);
    } catch { /* silent */ } finally { setRefreshing(false); }
  }

  function onTouchStart(e: React.TouchEvent) {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!touchStartY.current) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && window.scrollY === 0) setPullDelta(Math.min(delta, PULL_THRESHOLD + 30));
    else setPullDelta(0);
  }
  function onTouchEnd() {
    if (pullDelta >= PULL_THRESHOLD) refreshFeed();
    setPullDelta(0);
    touchStartY.current = 0;
  }

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

  const pullProgress = Math.min(pullDelta / PULL_THRESHOLD, 1);
  const showPullIndicator = pullDelta > 10 || refreshing;

  return (
    <div className="space-y-3"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {showPullIndicator && (
        <div className="flex justify-center py-1 -mb-1">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
            refreshing || pullProgress >= 1
              ? "border-[#398AB9] bg-[#398AB9]/10"
              : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
          }`}
            style={{ transform: `scale(${0.5 + pullProgress * 0.5})` }}>
            <Loader2 className={`w-4 h-4 text-[#398AB9] ${refreshing ? "animate-spin" : ""}`}
              style={{ transform: refreshing ? undefined : `rotate(${pullProgress * 360}deg)` }} />
          </div>
        </div>
      )}

      {/* Feed tabs: For You / Following */}
      <div className="bg-white dark:bg-slate-800 md:rounded-2xl border border-gray-100 dark:border-slate-700 flex overflow-hidden">
        {(["forYou", "following"] as FeedTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === tab
                ? "border-[#398AB9] text-[#398AB9]"
                : "border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
            }`}
          >
            {tab === "forYou" ? "สำหรับคุณ" : "ติดตาม"}
          </button>
        ))}
      </div>

      {/* Compose box */}
      <ComposeBox />

      {/* Tag filter chips */}
      <TagFilterBar active={activeTag} onChange={setActiveTag} />

      {/* Empty state */}
      {posts.length === 0 && !loading && activeTab === "following" && (
        <div className="bg-white dark:bg-slate-800 md:rounded-2xl border border-gray-100 dark:border-slate-700 py-16 flex flex-col items-center gap-3 text-center px-6">
          <span className="text-4xl">👥</span>
          <p className="text-sm font-bold text-gray-900 dark:text-slate-100">ยังไม่มีโพสต์จากคนที่คุณติดตาม</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 max-w-xs">ติดตามนักเดินทางเพื่อดูโพสต์ของพวกเขาที่นี่</p>
          <Link href="/search/users" className="mt-1 bg-[#398AB9] text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-[#1C658C] transition">
            ค้นหาคน
          </Link>
        </div>
      )}
      {posts.length === 0 && !loading && activeTab === "forYou" && <FeedEmptyState />}

      {filteredPosts.length === 0 && posts.length > 0 && !loading && (
        <div className="bg-white dark:bg-slate-800 md:rounded-2xl border border-gray-100 dark:border-slate-700 py-12 text-center text-sm text-gray-400 dark:text-slate-500">
          ไม่มีโพสต์ที่แท็ก #{activeTag}
        </div>
      )}

      {filteredPosts.map((post) => (
        <PostCard key={String(post.id)} post={post} onTagClick={(tag) => setActiveTag(tag)} />
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
        <p className="text-center text-xs text-gray-400 dark:text-slate-500 py-4">
          คุณดูโพสต์ทั้งหมดแล้ว 🎉
        </p>
      )}
    </div>
  )
;
}

