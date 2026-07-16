"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Send, Bookmark, MapPin, MoreHorizontal, Flag, Link2, X, ChevronLeft, ChevronRight, Maximize2, Pin, Pencil, Trash2, Loader2 } from "lucide-react";
import { toggleLike, toggleSave, pinPost, reportPost, editPost, deletePost } from "@/server/actions/posts";
import { CommentSection } from "./CommentSection";
import { Avatar } from "@/components/shared/Avatar";
import { useToast } from "@/components/shared/Toast";

const REPORT_REASONS = [
  "สแปมหรือโฆษณา",
  "เนื้อหาไม่เหมาะสม",
  "ข้อมูลเท็จหรือหลอกลวง",
  "การล่วงละเมิดหรือคุกคาม",
  "ละเมิดลิขสิทธิ์",
  "อื่นๆ",
] as const;
type ReportReason = (typeof REPORT_REASONS)[number];

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
  isPinned?: boolean;
  isOwn?: boolean;
  isSystemPost?: boolean;
  postType?: string;
}

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "K" : String(n);
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);
}

function renderCaption(text: string) {
  // Split on both @mentions and #hashtags (including Thai characters)
  const parts = text.split(/([@#][\w฀-๿]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@") && part.length > 1) {
      const username = part.slice(1);
      return (
        <Link key={i} href={`/u/${username}`} className="text-[#398AB9] font-medium hover:underline">
          {part}
        </Link>
      );
    }
    if (part.startsWith("#") && part.length > 1) {
      const tag = part.slice(1);
      return (
        <Link key={i} href={`/tags/${encodeURIComponent(tag)}`} className="text-[#398AB9] font-medium hover:underline">
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | "">("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reported, setReported] = useState(false);
  const [pinned, setPinned] = useState(post.isPinned ?? false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState(post.caption);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [caption, setCaption] = useState(post.caption);
  const { success, error, info } = useToast();
  const router = useRouter();

  // ── Double-tap like + swipe navigation ──────────────────────────────────────
  const [heartBurst, setHeartBurst] = useState<"hidden" | "show" | "fade">("hidden");
  const singleClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef(0);
  const isSwiping = useRef(false);

  function triggerHeartBurst() {
    setHeartBurst("show");
    setTimeout(() => setHeartBurst("fade"), 350);
    setTimeout(() => setHeartBurst("hidden"), 750);
  }

  function handleImageClick() {
    if (isSwiping.current) return;
    if (singleClickTimerRef.current) {
      // Second tap within 350ms → double-tap → like
      clearTimeout(singleClickTimerRef.current);
      singleClickTimerRef.current = null;
      if (!liked) handleLike();
      triggerHeartBurst();
    } else {
      singleClickTimerRef.current = setTimeout(() => {
        singleClickTimerRef.current = null;
        router.push(`/post/${post.id}`);
      }, 350);
    }
  }

  function onImageTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX;
    isSwiping.current = false;
  }

  function onImageTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(dx) > 50 && allImages.length > 1) {
      isSwiping.current = true;
      if (dx < 0) setImgIndex((i) => Math.min(allImages.length - 1, i + 1));
      else setImgIndex((i) => Math.max(0, i - 1));
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

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
    <article className={`bg-white dark:bg-slate-800 border rounded-2xl overflow-hidden ${post.isSystemPost ? "border-gray-100 dark:border-slate-700 border-l-2 border-l-[#398AB9]" : "border-gray-100 dark:border-slate-700"}`}>
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
          <div className="flex items-center gap-1.5">
            {post.user.id ? (
              <Link href={`/profile/${post.user.id}`} className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-[#398AB9] transition">
                {post.user.name}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{post.user.name}</p>
            )}
            {post.isSystemPost && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#398AB9]/10 text-[#398AB9]">
                {post.postType === "trip_idea" ? "✈️ ไอเดียทริป" : "📍 สถานที่แนะนำ"}
              </span>
            )}
          </div>
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
          {pinned && <span className="text-[10px] text-[#398AB9] flex items-center gap-0.5"><Pin className="w-2.5 h-2.5" />ปิน</span>}
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
                  {post.isOwn && (
                    <>
                      <button
                        onClick={async () => {
                          const newVal = !pinned;
                          setPinned(newVal);
                          setMenuOpen(false);
                          await pinPost(String(post.id), newVal);
                        }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition text-left"
                      >
                        <Pin className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        {pinned ? "เลิกปิน" : "ปินโพสต์"}
                      </button>
                      <button
                        onClick={() => { setEditContent(caption); setShowEditModal(true); setMenuOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition text-left"
                      >
                        <Pencil className="w-4 h-4 text-[#398AB9]" />
                        แก้ไขโพสต์
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm("ลบโพสต์นี้?")) return;
                          setMenuOpen(false);
                          setDeleting(true);
                          await deletePost(String(post.id));
                          setDeleting(false);
                        }}
                        disabled={deleting}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-[#FF4F4F] hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
                      >
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        ลบโพสต์
                      </button>
                    </>
                  )}
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

      {/* Post image(s) / video — double-tap to like, swipe to navigate */}
      {allImages.length > 0 && (
      <div
        role="button"
        tabIndex={0}
        onClick={handleImageClick}
        onKeyDown={(e) => e.key === "Enter" && handleImageClick()}
        onTouchStart={onImageTouchStart}
        onTouchEnd={onImageTouchEnd}
        className={`relative overflow-hidden bg-gray-100 dark:bg-slate-700 group/img cursor-pointer select-none ${isVideo(allImages[imgIndex]) ? "aspect-[9/16] max-h-[480px]" : "aspect-[4/3]"}`}
      >
        {isVideo(allImages[imgIndex]) ? (
          <video
            key={allImages[imgIndex]}
            src={allImages[imgIndex]}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
          <img
            src={allImages[imgIndex]}
            alt={post.title ?? ""}
            className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
          />
          {/* Zoom icon — opens lightbox */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLightboxIdx(imgIndex);
              setLightboxOpen(true);
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/60"
            title="ขยายภาพ"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          </>
        )}

        {/* ── Heart burst animation (double-tap like) ── */}
        {heartBurst !== "hidden" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <Heart
              className="w-24 h-24 text-white fill-white drop-shadow-2xl"
              style={{
                transform: heartBurst === "show" ? "scale(1.15)" : "scale(0.3)",
                opacity: heartBurst === "fade" ? 0 : 1,
                transition:
                  heartBurst === "show"
                    ? "transform 0.25s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.1s"
                    : "opacity 0.35s ease-out, transform 0.35s ease-in",
              }}
            />
          </div>
        )}

        {/* Video badge */}
        {isVideo(allImages[imgIndex]) && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">▶ Video</div>
        )}

        {/* Multi-image: counter badge + dots + tap zones */}
        {allImages.length > 1 && (
          <>
            {/* X/N counter badge top-left */}
            <div className="absolute top-2 left-2 bg-black/50 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
              {imgIndex + 1}/{allImages.length}
            </div>
            {/* Dot indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
              {allImages.map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all duration-200 ${i === imgIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
                />
              ))}
            </div>
            {/* Tap zones for prev/next (stop propagation so parent click doesn't fire) */}
            <button
              className="absolute left-0 inset-y-0 w-1/3 z-10"
              onClick={(e) => { e.stopPropagation(); setImgIndex((i) => Math.max(0, i - 1)); }}
              tabIndex={-1}
              aria-label="ภาพก่อนหน้า"
            />
            <button
              className="absolute right-0 inset-y-0 w-1/3 z-10"
              onClick={(e) => { e.stopPropagation(); setImgIndex((i) => Math.min(allImages.length - 1, i + 1)); }}
              tabIndex={-1}
              aria-label="ภาพถัดไป"
            />
          </>
        )}

        {/* Tags overlay */}
        {post.tags.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTagClick) onTagClick(tag);
                  else router.push(`/tag/${encodeURIComponent(tag)}`);
                }}
                className="text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm hover:bg-[#398AB9]/80 transition"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
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
          <span className="text-xs font-medium">{fmt(commentCount)}</span>
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
          {renderCaption(caption)}
        </p>
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} initialCount={post.comments} onCommentCountChange={setCommentCount} />
    </article>

    {/* Image lightbox */}
    {lightboxOpen && allImages.length > 0 && !isVideo(allImages[lightboxIdx]) && (
      <div
        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
        onClick={() => setLightboxOpen(false)}
      >
        {/* Close */}
        <button
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          onClick={() => setLightboxOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
        {/* Counter */}
        {allImages.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium">
            {lightboxIdx + 1} / {allImages.length}
          </div>
        )}
        {/* Image */}
        <img
          src={allImages[lightboxIdx]}
          alt=""
         
          className="max-w-full max-h-full object-contain select-none"
          referrerPolicy="no-referrer"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
        {/* Prev / Next */}
        {allImages.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i - 1 + allImages.length) % allImages.length); }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i + 1) % allImages.length); }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {/* View post link */}
        <Link
          href={`/post/${post.id}`}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs hover:text-white transition underline underline-offset-2"
          onClick={(e) => e.stopPropagation()}
        >
          ดูโพสต์เต็ม →
        </Link>
      </div>
    )}

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
    {/* Edit post modal */}
    {showEditModal && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0">
        <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <p className="font-bold text-gray-900 dark:text-slate-100">แก้ไขโพสต์</p>
            <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={5}
              maxLength={500}
              className="w-full text-sm border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 resize-none bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#398AB9]/30"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">{editContent.length}/500</p>
          </div>
          <div className="flex gap-3 px-5 pb-5">
            <button onClick={() => setShowEditModal(false)}
              className="flex-1 py-2.5 text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              ยกเลิก
            </button>
            <button
              onClick={async () => {
                if (!editContent.trim() || saving) return;
                setSaving(true);
                const res = await editPost(String(post.id), editContent.trim());
                setSaving(false);
                if (res.error) return;
                setCaption(editContent.trim());
                setShowEditModal(false);
              }}
              disabled={saving || !editContent.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-[#398AB9] hover:bg-[#1C658C] text-white rounded-xl transition disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
