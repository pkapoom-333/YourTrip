"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Hash, Heart, MessageCircle, Bookmark, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPostsByTag } from "@/server/actions/posts";
import { Avatar } from "@/components/shared/Avatar";
import { useToast } from "@/components/shared/Toast";
import { toggleLike, toggleSave } from "@/server/actions/posts";
import { useUser } from "@/hooks/useUser";

// Mirror the post type from getPostsByTag
interface TagPost {
  id: string;
  content: string;
  images: string[];
  tags: string[];
  location: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  likedByMe?: boolean;
  savedByMe?: boolean;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  place: { id: string; slug: string; name: string } | null;
}

interface Props {
  tag: string;
  initialPosts: TagPost[];
  initialNextCursor?: string;
  initialHasMore: boolean;
}

export default function TagPageClient({ tag, initialPosts, initialNextCursor, initialHasMore }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const { error: toastError } = useToast();
  const [posts, setPosts] = useState<TagPost[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likeState, setLikeState] = useState<Record<string, { liked: boolean; count: number }>>(() =>
    Object.fromEntries(initialPosts.map((p) => [p.id, { liked: p.likedByMe ?? p.isLiked ?? false, count: p.likesCount }]))
  );
  const [savedState, setSavedState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialPosts.map((p) => [p.id, p.savedByMe ?? p.isSaved ?? false]))
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await getPostsByTag(tag, nextCursor, 12);
      const newPosts = res.data as unknown as TagPost[];
      setPosts((prev) => [...prev, ...newPosts]);
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);
      setLikeState((prev) => ({
        ...prev,
        ...Object.fromEntries(newPosts.map((p) => [p.id, { liked: p.likedByMe ?? p.isLiked ?? false, count: p.likesCount }])),
      }));
      setSavedState((prev) => ({
        ...prev,
        ...Object.fromEntries(newPosts.map((p) => [p.id, p.savedByMe ?? p.isSaved ?? false])),
      }));
    } catch { toastError("ไม่สามารถโหลดเพิ่มได้"); }
    finally { setLoadingMore(false); }
  }, [hasMore, loadingMore, nextCursor, tag, toastError]);

  async function handleLike(postId: string) {
    if (!user) { router.push("/login"); return; }
    const cur = likeState[postId] ?? { liked: false, count: 0 };
    setLikeState((prev) => ({
      ...prev,
      [postId]: { liked: !cur.liked, count: cur.liked ? cur.count - 1 : cur.count + 1 },
    }));
    try { await toggleLike(postId); }
    catch { setLikeState((prev) => ({ ...prev, [postId]: cur })); }
  }

  async function handleSave(postId: string) {
    if (!user) { router.push("/login"); return; }
    setSavedState((prev) => ({ ...prev, [postId]: !prev[postId] }));
    try { await toggleSave(postId); }
    catch { setSavedState((prev) => ({ ...prev, [postId]: !prev[postId] })); }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#398AB9]/10 flex items-center justify-center">
            <Hash className="w-4 h-4 text-[#398AB9]" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-slate-100">#{tag}</h1>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{posts.length}+ โพสต์</p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4">
            <Hash className="w-8 h-8 text-gray-300 dark:text-slate-500" />
          </div>
          <p className="font-semibold text-gray-600 dark:text-slate-300">ยังไม่มีโพสต์</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">เป็นคนแรกที่แท็ก #{tag}!</p>
          <Link href="/create" className="mt-4 bg-[#398AB9] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#1C658C] transition">
            โพสต์เลย
          </Link>
        </div>
      )}

      {/* Posts grid */}
      {posts.length > 0 && (
        <div className="px-4 py-4 space-y-4">
          {posts.map((post) => {
            const like = likeState[post.id] ?? { liked: post.isLiked, count: post.likesCount };
            const saved = savedState[post.id] ?? post.isSaved;
            const displayName = post.user.name ?? post.user.username ?? "นักเดินทาง";
            const timeAgo = (() => {
              const diff = Date.now() - new Date(post.createdAt).getTime();
              const mins = Math.floor(diff / 60000);
              const hrs = Math.floor(diff / 3600000);
              const days = Math.floor(diff / 86400000);
              if (mins < 60) return `${mins}น.`;
              if (hrs < 24) return `${hrs}ชม.`;
              if (days < 30) return `${days}ว.`;
              return `${Math.floor(days / 30)}เดือน`;
            })();

            return (
              <article key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                {/* Author */}
                <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                  <Link href={`/profile/${post.user.id}`}>
                    <Avatar src={post.user.avatarUrl} name={displayName} className="w-9 h-9" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${post.user.id}`} className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-[#398AB9] transition">
                      {displayName}
                    </Link>
                    {post.place && (
                      <div className="text-[10px] text-[#398AB9] flex items-center gap-1">
                        <span>📍</span>
                        <Link href={`/place/${post.place.slug}`} className="hover:underline">{post.place.name}</Link>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 flex-shrink-0">{timeAgo}</span>
                </div>

                {/* Images */}
                {post.images.length > 0 && (
                  <Link href={`/post/${post.id}`}>
                    <div className={`grid gap-0.5 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {post.images.slice(0, 4).map((img, i) => (
                        <div key={i} className={`overflow-hidden bg-gray-100 dark:bg-slate-700 ${
                          post.images.length === 1 ? "aspect-[4/3]" : "aspect-square"
                        }`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                      ))}
                    </div>
                  </Link>
                )}

                {/* Content */}
                {post.content && (
                  <p className="px-4 pt-3 text-sm text-gray-800 dark:text-slate-200 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                    {post.content.split(/(@\w+|#\w+)/).map((part, i) =>
                      part.startsWith("#") ? (
                        <Link key={i} href={`/tag/${encodeURIComponent(part.slice(1))}`}
                          className="text-[#398AB9] font-medium hover:underline">{part}</Link>
                      ) : part.startsWith("@") ? (
                        <span key={i} className="text-[#398AB9] font-medium">{part}</span>
                      ) : part
                    )}
                  </p>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="px-4 pt-1 pb-2 flex flex-wrap gap-1.5">
                    {post.tags.map((t) => (
                      <Link key={t} href={`/tag/${encodeURIComponent(t)}`}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition ${
                          t === tag
                            ? "bg-[#398AB9] text-white"
                            : "bg-[#398AB9]/8 text-[#398AB9] hover:bg-[#398AB9]/15"
                        }`}>
                        #{t}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 px-2 py-2 border-t border-gray-50 dark:border-slate-700 mt-1">
                  <button onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      like.liked ? "text-[#FF4F4F] bg-red-50 dark:bg-red-900/20" : "text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}>
                    <Heart className={`w-4 h-4 ${like.liked ? "fill-[#FF4F4F]" : ""}`} />
                    {like.count > 0 && <span>{like.count}</span>}
                  </button>
                  <Link href={`/post/${post.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                    <MessageCircle className="w-4 h-4" />
                    {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
                  </Link>
                  <button onClick={() => handleSave(post.id)}
                    className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      saved ? "text-[#398AB9] bg-[#398AB9]/8" : "text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}>
                    <Bookmark className={`w-4 h-4 ${saved ? "fill-[#398AB9]" : ""}`} />
                  </button>
                </div>
              </article>
            );
          })}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2 pb-6">
              <button onClick={loadMore} disabled={loadingMore}
                className="flex items-center gap-2 text-sm font-medium text-[#398AB9] bg-[#398AB9]/8 px-5 py-2.5 rounded-full hover:bg-[#398AB9]/15 transition disabled:opacity-50">
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loadingMore ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
