"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Send, Bookmark, MapPin, MoreHorizontal, Flag, Link2, X } from "lucide-react";
import { toggleLike, toggleSave, reportPost, REPORT_REASONS, type ReportReason } from "@/server/actions/posts";
import { CommentSection } from "./CommentSection";
import { Avatar } from "@/components/shared/Avatar";
import { useToast } from "@/components/shared/Toast";

export interface PostCardData {
  id: number | string;
  slug?: string;
  user: {
    id?: string;
    name: string;
    bg?: string;
    initials?: string;
    avatarUrl?: string | null;
    location?: string;
  };
  title?: string;
  caption: string;
  img?: string;
  images?: string[];
  likes: number;
  comments: number;
  shares?: number;
  liked: boolean;
  saved: boolean;
  time: string;
  tags: string[];
  place?: { id: string; slug: string; name: string } | null;
}

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "K" : String(n);
}

function renderCaption(text: string) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@") && part.length > 1) {
      const username = part.slice(1);
      return (
        <Link key={i} href={`/u/${username}`} className="text-[#398AB9] font-medium hover:underline">
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function PostCard({ post, onTagClick }: { post: PostCardData; onTagClick?: (tag: string) => void }) {
  const allImages = post.images?.length ? post.images : (post.img ? [post.img] : []);
  const [imgIndex, setImgIndex] = useState(0);
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | "">("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reported, setReported] = useState(false);
  const { success, error, info } = useToast();
  const router = useRouter();

  async function handleLike() {
    if (isLiking) return;
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    setIsLiking(true);
    try {
      await toggleLike(String(post.id));
    } catch {
      setLiked(liked);
      setLikeCount((c) => liked ? c + 1 : c - 1);
      error("ไม่สามารถกดถูกใจได้ กรุณาลองใหม่");
    } finally {
      setIsLiking(false);
    }
  }

  async function handleSave() {
    const next = !saved;
    setSaved(next);
    try {
      await toggleSave(String(post.id));
      if (next) success("บันทึกโพสต์แล้ว ✓");
    } catch {
      setSaved(saved);
      error("ไม่สามารถบันทึกได้ กรุณาลองใหม่");
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`;
    const text = post.caption.slice(0, 100);
    if (navigator.share) {
      try { await navigator.share({ title: post.user.name, text, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      info("คัดลอกลิงก์แล้ว ✓");
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/post/${post.id}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    info("คัดลอกลิงก์แล้ว ✓");
    setMenuOpen(false);
  }

  async function handleReport() {
    if (!reportReason) return;
    setReportSubmitting(true);
    await reportPost(String(post.id), reportReason as ReportReason);
    setReportSubmitting(false);
    setReported(true);
    setReportOpen(false);
    success("ส่งรายงานแล้ว ขอบคุณ ✓");
  }

  return (
    <>
    <article className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden">
      {/* Post header */}
      <div className="flex items-center gap-3 p-3.5">
        {post.user.id ? (
          <Link href={`/profile/${post.user.id}`}>
            <Avatar src={post.user.avatarUrl} name={post.user.name} />
          </Link>
        ) : (
          <Avatar src={post.user.avatarUrl} name={post.user.name} />
        )}
        <div className="flex-1 min-w-0">
          {post.user.id ? (
            <Link href={`/profile/${post.user.id}`} className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-[#398AB9] transition">
              {post.user.name}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{post.user.name}</p>
          )}
          {/* Place badge (linked to DB place) — takes priority over free-text location */}
          {post.place ? (
            <Link href={`/place/${post.place.slug}`}
              className="flex items-center gap-1 text-[11px] text-[#398AB9] hover:underline transition truncate w-fit">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              {post.place.name}
            </Link>
          ) : post.user.location ? (
            <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
              <MapPin className="w-2.5 h-2.5" />
              <span className="truncate">{post.user.location}</span>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 dark:text-slate-500">{post.time}</span>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition p-1 -m-1 rounded-lg"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-6 z-50 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-[140px]">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition text-left"
                  >
                    <Link2 className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                    คัดลอกลิงก์
                  </button>
                  {!reported && (
                    <button
                      onClick={() => { setMenuOpen(false); setReportOpen(true); }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
                    >
                      <Flag className="w-4 h-4" />
                      แจ้งปัญหา
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Post image(s) */}
      {allImages.length > 0 && (
      <Link href={`/post/${post.id}`} className="block">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-slate-700">
        <img
          src={allImages[imgIndex]}
          alt={post.title ?? ""}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
        />
        {/* Multi-image indicators */}
        {allImages.length > 1 && (
          <>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setImgIndex(i); }}
                  className={`rounded-full transition-all ${i === imgIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
                />
              ))}
            </div>
            <button
              className="absolute left-0 inset-y-0 w-1/3"
              onClick={(e) => { e.preventDefault(); setImgIndex((i) => Math.max(0, i - 1)); }}
            />
            <button
              className="absolute right-0 inset-y-0 w-1/3"
              onClick={(e) => { e.preventDefault(); setImgIndex((i) => Math.min(allImages.length - 1, i + 1)); }}
            />
          </>
        )}
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.preventDefault();
                  if (onTagClick) onTagClick(tag);
                  else router.push(`/tags/${encodeURIComponent(tag)}`);
                }}
                className="text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm hover:bg-[#398AB9]/80 transition"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
      </Link>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-0.5 px-3 pt-3 pb-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all ${
            liked ? "text-[#FF4F4F] bg-red-50 dark:bg-red-500/10" : "text-gray-400 dark:text-slate-500 hover:text-[#FF4F4F] hover:bg-red-50 dark:hover:bg-red-500/10"
          }`}
        >
          <Heart className={`w-5 h-5 transition-transform ${liked ? "scale-110 fill-current" : ""}`} />
          <span className="text-xs font-medium">{fmt(likeCount)}</span>
        </button>
        <Link href={`/post/${post.id}`}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-gray-400 dark:text-slate-500 hover:text-[#398AB9] hover:bg-[#398AB9]/5 transition">
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-medium">{fmt(post.comments)}</span>
        </Link>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-gray-400 dark:text-slate-500 hover:text-[#398AB9] hover:bg-[#398AB9]/5 transition"
        >
          <Send className="w-5 h-5" />
          {post.shares !== undefined && (
            <span className="text-xs font-medium">{fmt(post.shares)}</span>
          )}
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          className={`p-1.5 rounded-xl transition-all ${
            saved ? "text-[#398AB9] bg-[#398AB9]/10" : "text-gray-400 dark:text-slate-500 hover:text-[#398AB9] hover:bg-[#398AB9]/5"
          }`}
        >
          <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-2">
        <p className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
          <span className="font-semibold mr-1">{post.user.name}</span>
          {renderCaption(post.caption)}
        </p>
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} initialCount={post.comments} />
    </article>

    {/* Report modal */}
    {reportOpen && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0">
        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">แจ้งปัญหาโพสต์</h3>
            <button onClick={() => setReportOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">เลือกเหตุผลที่ตรงที่สุด</p>
          <div className="space-y-1.5 mb-4">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReportReason(r)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition ${
                  reportReason === r
                    ? "bg-[#398AB9] text-white font-medium"
                    : "bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={handleReport}
            disabled={!reportReason || reportSubmitting}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-50"
          >
            {reportSubmitting ? "กำลังส่ง..." : "ส่งรายงาน"}
          </button>
        </div>
      </div>
    )}
    </>
  );
}
