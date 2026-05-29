"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import {
  ChevronLeft, Heart, Bookmark, Send, MapPin, MoreHorizontal,
} from "lucide-react";
import {
  getPostById, toggleLike, toggleSave,
  type PostDetail,
} from "@/server/actions/posts";
import { CommentSection } from "@/components/features/CommentSection";

const AVATAR_COLORS = [
  "bg-[#398AB9]", "bg-emerald-500", "bg-violet-500",
  "bg-orange-400", "bg-pink-400", "bg-amber-500",
];

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "K" : String(n);
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    getPostById(id).then(({ data }) => {
      if (!data) { setNotFound(true); setLoading(false); return; }
      setPost(data);
      setLikeCount(data.likesCount);
      setLiked(data.likedByMe);
      setSaved(data.savedByMe);
      setLoading(false);
    });
  }, [id]);

  async function handleLike() {
    setLiked((v) => !v);
    setLikeCount((n) => liked ? n - 1 : n + 1);
    toggleLike(id).catch(() => {
      setLiked((v) => !v);
      setLikeCount((n) => liked ? n + 1 : n - 1);
    });
  }

  async function handleSave() {
    setSaved((v) => !v);
    toggleSave(id).catch(() => setSaved((v) => !v));
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: post?.content.slice(0, 60), url: location.href });
    } else {
      await navigator.clipboard.writeText(location.href);
    }
  }

  const avatarColor = AVATAR_COLORS[(post?.user?.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  const initials = (post?.user?.name ?? "U").charAt(0).toUpperCase();

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="h-14 bg-gray-100 mb-4" />
          <div className="aspect-square bg-gray-200 mb-4" />
          <div className="px-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (notFound || !post) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <p className="text-gray-500 font-medium">ไม่พบโพสต์นี้</p>
          <button onClick={() => router.back()}
            className="mt-4 text-sm text-[#398AB9] font-medium hover:underline">
            กลับ
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-900 flex-1">โพสต์</span>
        <button className="text-gray-400 hover:text-gray-600 transition">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-50">
          <Link href={`/profile/${post.user.id}`} className="flex-shrink-0">
            {post.user.avatarUrl ? (
              <img src={post.user.avatarUrl} alt={post.user.name ?? ""}
                className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                {initials}
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${post.user.id}`}
              className="text-sm font-semibold text-gray-900 hover:text-[#398AB9] transition">
              {post.user.name}
            </Link>
            {post.user.username && (
              <p className="text-[11px] text-gray-400">@{post.user.username}</p>
            )}
          </div>
          <span className="text-[11px] text-gray-400">{fmtDate(post.createdAt)}</span>
        </div>

        {/* Image carousel */}
        {post.images.length > 0 && (
          <div className="relative bg-black">
            <img
              src={post.images[imgIndex]}
              alt=""
              className="w-full aspect-square object-cover"
            />
            {/* Image counter */}
            {post.images.length > 1 && (
              <>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {post.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === imgIndex ? "bg-white w-4" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
                {/* Prev/Next tap zones */}
                <button
                  className="absolute left-0 inset-y-0 w-1/3"
                  onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
                />
                <button
                  className="absolute right-0 inset-y-0 w-1/3"
                  onClick={() => setImgIndex((i) => Math.min(post.images.length - 1, i + 1))}
                />
              </>
            )}
          </div>
        )}

        {/* Location + tags */}
        {(post.location || post.tags.length > 0) && (
          <div className="px-4 py-2 bg-white flex flex-wrap items-center gap-2 border-b border-gray-50">
            {post.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3 text-[#398AB9]" />
                {post.location}
              </div>
            )}
            {post.tags.map((tag) => (
              <span key={tag} className="text-[11px] bg-[#398AB9]/10 text-[#398AB9] px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 px-3 pt-3 pb-1 bg-white">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              liked ? "text-[#FF4F4F] bg-red-50" : "text-gray-400 hover:text-[#FF4F4F] hover:bg-red-50"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-current scale-110" : ""} transition-transform`} />
            <span className="text-sm font-medium">{fmt(likeCount)}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-400 hover:text-[#398AB9] hover:bg-[#398AB9]/5 transition"
          >
            <Send className="w-5 h-5" />
            <span className="text-sm font-medium">แชร์</span>
          </button>
          <div className="flex-1" />
          <button
            onClick={handleSave}
            className={`p-2 rounded-xl transition-all ${
              saved ? "text-[#398AB9] bg-[#398AB9]/10" : "text-gray-400 hover:text-[#398AB9] hover:bg-[#398AB9]/5"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Caption */}
        <div className="px-4 pb-3 bg-white">
          <p className="text-sm text-gray-800 leading-relaxed">
            <Link href={`/profile/${post.user.id}`}
              className="font-semibold mr-1.5 hover:text-[#398AB9] transition">
              {post.user.name}
            </Link>
            {post.content}
          </p>
        </div>

        {/* Comment section */}
        <div className="bg-white border-t border-gray-100">
          <CommentSection postId={post.id} initialCount={post.commentsCount} />
        </div>
      </div>
    </AppShell>
  );
}
