"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Share2, ChevronLeft, ChevronRight, Send, MoreHorizontal, MapPin, ArrowLeft, QrCode, Pencil, Trash2, Loader2 } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { useToast } from "@/components/shared/Toast";
import { QRShareModal } from "@/components/shared/QRShareModal";
import { ReportModal } from "@/components/shared/ReportModal";
import {
  getComments, createComment, toggleLike, toggleSave, editPost, deletePost,
  type PostDetail, type CommentItem,
} from "@/server/actions/posts";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function fmtDate(d: Date | string) {
  const ms = Date.now() - new Date(d).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return "เมื่อกี้";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day} วันที่แล้ว`;
  if (day < 30) return `${Math.floor(day / 7)} สัปดาห์ที่แล้ว`;
  if (day < 365) return `${Math.floor(day / 30)} เดือนที่แล้ว`;
  return `${Math.floor(day / 365)} ปีที่แล้ว`;
}

function hashtagify(text: string) {
  const parts = text.split(/(#\w+)/g);
  return parts.map((p, i) =>
    p.startsWith("#")
      ? <Link key={i} href={`/tag/${encodeURIComponent(p.slice(1))}`}
          className="text-[#398AB9] font-medium hover:underline">{p}</Link>
      : p
  );
}

function CommentBubble({ c, depth = 0 }: { c: CommentItem; depth?: number }) {
  const [showReplies, setShowReplies] = useState(false);
  return (
    <div className={depth > 0 ? "ml-8 mt-2" : ""}>
      <div className="flex gap-3">
        <Avatar name={c.user.name ?? c.user.username ?? "?"} src={c.user.avatarUrl} className={depth > 0 ? "w-7 h-7" : "w-8 h-8"} />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl rounded-tl-none px-3 py-2.5">
            <p className="text-xs font-bold text-gray-800 dark:text-slate-200 mb-0.5">
              {c.user.name ?? c.user.username ?? "ผู้ใช้"}
            </p>
            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
              {hashtagify(c.content)}
            </p>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 ml-2 mt-1">{fmtDate(c.createdAt)}</p>
          {c.replies && c.replies.length > 0 && (
            <button onClick={() => setShowReplies((s) => !s)}
              className="text-[11px] text-[#398AB9] font-medium ml-2 mt-0.5 hover:underline">
              {showReplies ? "ซ่อนการตอบกลับ" : `ดูการตอบกลับ ${c.replies.length} รายการ`}
            </button>
          )}
          {showReplies && c.replies?.map((r) => (
            <CommentBubble key={r.id} c={r} depth={1} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PostDetailClient({ post: initial }: { post: PostDetail }) {
  const router = useRouter();
  const toast = useToast();
  const [post, setPost] = useState(initial);
  const [imgIdx, setImgIdx] = useState(0);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editContent, setEditContent] = useState(initial.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const isOwner = !!currentUserId && currentUserId === post.user.id;

  useEffect(() => {
    getComments(post.id).then(({ data }) => {
      setComments(data);
      setLoadingComments(false);
    });
  }, [post.id]);

  // Get current user to check post ownership
  useEffect(() => {
    void createClient().auth.getUser().then((result: { data: { user: { id: string } | null } }) => {
      setCurrentUserId(result.data.user?.id ?? null);
    });
  }, []);

  // Realtime: new comments from other users appear instantly
  useEffect(() => {
    const supabase = createClient();
    if (!("channel" in supabase)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ch = (supabase as any)
      .channel(`post-comments-${post.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `postId=eq.${post.id}` },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new;
          const newComment: CommentItem = {
            id: row.id as string,
            content: row.content as string,
            createdAt: new Date(row.createdAt as string),
            user: { id: row.userId as string, name: null, avatarUrl: null, username: null },
            replies: [],
          };
          setComments((prev) => {
            if (prev.some((c) => c.id === newComment.id)) return prev;
            return [...prev, newComment];
          });
          setPost((p) => ({ ...p, commentsCount: p.commentsCount + 1 }));
        }
      )
      .subscribe();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => { (supabase as any).removeChannel(ch); };
  }, [post.id]);

  async function handleLike() {
    const was = post.likedByMe;
    setPost((p) => ({ ...p, likedByMe: !was, likesCount: p.likesCount + (was ? -1 : 1) }));
    const likeRes = await toggleLike(post.id) as { error?: { message: string }; data?: unknown };
    if (likeRes.error) {
      setPost((p) => ({ ...p, likedByMe: was, likesCount: p.likesCount + (was ? 1 : -1) }));
      toast.error(likeRes.error.message ?? "เกิดข้อผิดพลาด");
    }
  }

  async function handleSave() {
    const was = post.savedByMe;
    setPost((p) => ({ ...p, savedByMe: !was }));
    const saveRes = await toggleSave(post.id) as { error?: { message: string }; data?: unknown };
    if (saveRes.error) {
      setPost((p) => ({ ...p, savedByMe: was }));
      toast.error(saveRes.error.message ?? "เกิดข้อผิดพลาด");
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    const res = await createComment(post.id, commentText.trim());
    setSubmitting(false);
    if (res.error) { toast.error(typeof res.error === "string" ? res.error : (res.error as {message?:string}).message ?? "เกิดข้อผิดพลาด"); return; }
    if (res.data) {
      setComments((c) => [...c, res.data!]);
      setPost((p) => ({ ...p, commentsCount: p.commentsCount + 1 }));
      setCommentText("");
    }
  }

  async function handleEditSave() {
    if (!editContent.trim() || saving) return;
    setSaving(true);
    const res = await editPost(post.id, editContent.trim());
    setSaving(false);
    if (res.error) { toast.error(res.error.message ?? "เกิดข้อผิดพลาด"); return; }
    setPost((p) => ({ ...p, content: editContent.trim() }));
    setShowEdit(false);
    toast.success("แก้ไขโพสต์แล้ว ✓");
  }

  async function handleDelete() {
    if (!confirm("ลบโพสต์นี้?")) return;
    setDeleting(true);
    const res = await deletePost(post.id);
    setDeleting(false);
    if (res.error) { toast.error(res.error.message ?? "เกิดข้อผิดพลาด"); return; }
    toast.success("ลบโพสต์แล้ว");
    router.replace("/feed");
  }

  const shareUrl = `/post/${post.id}`;

  return (
    <div className="max-w-xl mx-auto pb-32">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-slate-300" />
        </button>
        <span className="flex-1 text-sm font-bold text-gray-900 dark:text-slate-100">โพสต์</span>
        <button onClick={() => setShowQR(true)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
          <QrCode className="w-5 h-5 text-gray-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Author row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href={`/profile/${post.user.id}`}>
          <Avatar name={post.user.name ?? post.user.username ?? "?"} src={post.user.avatarUrl} className="w-11 h-11" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${post.user.id}`}>
            <p className="font-bold text-sm text-gray-900 dark:text-slate-100 hover:text-[#398AB9] transition">
              {post.user.name ?? post.user.username ?? "ผู้ใช้"}
            </p>
          </Link>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">{fmtDate(post.createdAt)}</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu((s) => !s)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-1.5 min-w-[160px] z-30">
              {isOwner && (
                <>
                  <button onClick={() => { setEditContent(post.content); setShowEdit(true); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-[#398AB9]" /> แก้ไขโพสต์
                  </button>
                  <button onClick={() => { setShowMenu(false); handleDelete(); }}
                    disabled={deleting}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#FF4F4F] hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-2">
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    ลบโพสต์
                  </button>
                  <div className="border-t border-gray-100 dark:border-slate-700 my-1" />
                </>
              )}
              {!isOwner && (
                <button onClick={() => { setShowReport(true); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#FF4F4F] hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-2">
                  <span>🚩</span> รายงาน
                </button>
              )}
              <button onClick={() => setShowMenu(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                ยกเลิก
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image carousel */}
      {post.images.length > 0 && (
        <div className="relative bg-black aspect-square overflow-hidden">
          <img src={post.images[imgIdx]} alt=""
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {post.images.length > 1 && (
            <>
              <button onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 transition hover:bg-black/60"
                disabled={imgIdx === 0}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setImgIdx((i) => Math.min(post.images.length - 1, i + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 transition hover:bg-black/60"
                disabled={imgIdx === post.images.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {post.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === imgIdx ? "bg-white w-4" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-1">
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition font-medium text-sm ${
            post.likedByMe ? "text-[#FF4F4F] bg-[#FF4F4F]/8" : "text-gray-500 dark:text-slate-400 hover:text-[#FF4F4F] hover:bg-[#FF4F4F]/5"
          }`}>
          <Heart className={`w-5 h-5 ${post.likedByMe ? "fill-current" : ""}`} />
          <span>{post.likesCount}</span>
        </button>
        {post.likesCount > 0 && (
          <Link href={`/post/${post.id}/likes`}
            className="text-xs text-gray-400 dark:text-slate-500 hover:text-[#398AB9] hover:underline -ml-1 transition">
            ดูทั้งหมด
          </Link>
        )}
        <button onClick={() => textRef.current?.focus()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-slate-400 hover:text-[#398AB9] hover:bg-[#398AB9]/5 transition font-medium">
          <MessageCircle className="w-5 h-5" />
          <span>{post.commentsCount}</span>
        </button>
        <div className="flex-1" />
        <button onClick={handleSave}
          className={`p-2 rounded-xl transition ${
            post.savedByMe ? "text-[#398AB9] bg-[#398AB9]/10" : "text-gray-400 dark:text-slate-500 hover:text-[#398AB9] hover:bg-[#398AB9]/5"
          }`}>
          <Bookmark className={`w-5 h-5 ${post.savedByMe ? "fill-current" : ""}`} />
        </button>
        <button onClick={() => setShowQR(true)}
          className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-[#398AB9] hover:bg-[#398AB9]/5 transition">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
          {hashtagify(post.content)}
        </p>
        {post.place && (
          <Link href={`/place/${post.place.slug}`}
            className="inline-flex items-center gap-1 mt-2 text-xs text-[#398AB9] bg-[#398AB9]/8 px-2.5 py-1 rounded-full hover:bg-[#398AB9]/15 transition">
            <MapPin className="w-3 h-3" />
            {post.place.name}
          </Link>
        )}
        {post.location && !post.place && (
          <p className="flex items-center gap-1 mt-2 text-xs text-gray-400 dark:text-slate-500">
            <MapPin className="w-3 h-3" /> {post.location}
          </p>
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map((t) => (
              <Link key={t} href={`/tag/${encodeURIComponent(t)}`}
                className="text-[11px] font-medium text-[#398AB9] bg-[#398AB9]/8 px-2 py-0.5 rounded-full hover:bg-[#398AB9]/15 transition">
                #{t}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-100 dark:border-slate-800" />

      {/* Comments */}
      <div className="px-4 pt-4 space-y-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300">
          ความคิดเห็น {post.commentsCount > 0 ? `(${post.commentsCount})` : ""}
        </h3>
        {loadingComments ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full w-24" />
                  <div className="h-10 bg-gray-100 dark:bg-slate-700 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10">
            <MessageCircle className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-gray-400 dark:text-slate-500">เป็นคนแรกที่แสดงความคิดเห็น</p>
          </div>
        ) : (
          comments.map((c) => <CommentBubble key={c.id} c={c} />)
        )}
      </div>

      {/* Fixed comment input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 px-4 py-3 z-20 max-w-xl mx-auto">
        <form onSubmit={handleComment} className="flex gap-2 items-end">
          <textarea
            ref={textRef}
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            placeholder="แสดงความคิดเห็น…"
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 px-3.5 py-2.5 focus:outline-none focus:border-[#398AB9] focus:ring-1 focus:ring-[#398AB9]/30 transition"
          />
          <button type="submit" disabled={!commentText.trim() || submitting}
            className="p-2.5 rounded-2xl bg-[#398AB9] text-white disabled:opacity-40 hover:bg-[#1C658C] transition flex-shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

            {/* Report modal */}
      <ReportModal isOpen={showReport} onClose={() => setShowReport(false)} postId={post.id} />

      {/* QR share modal */}
      <QRShareModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        url={shareUrl}
        title={post.user.name ?? "โพสต์"}
        subtitle="สแกนเพื่อดูโพสต์นี้ใน YourTrip"
      />

      {/* Edit post modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
              <p className="font-bold text-gray-900 dark:text-slate-100">แก้ไขโพสต์</p>
              <button onClick={() => setShowEdit(false)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 transition">
                ✕
              </button>
            </div>
            <div className="p-5">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                maxLength={500}
                className="w-full text-sm border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 resize-none bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#398AB9]/30"
              />
              <p className="text-[10px] text-gray-400 dark:text-slate-500 text-right mt-1">{editContent.length}/500</p>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setShowEdit(false)}
                className="flex-1 py-2.5 text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                ยกเลิก
              </button>
              <button onClick={handleEditSave} disabled={saving || !editContent.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-[#398AB9] hover:bg-[#1C658C] text-white rounded-xl transition disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
