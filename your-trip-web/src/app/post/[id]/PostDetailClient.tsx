"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import {
  ChevronLeft, Heart, Bookmark, Send, MapPin, MoreHorizontal,
  Pencil, Trash2, X, Check,
} from "lucide-react";
import {
  toggleLike, toggleSave, editPost, deletePost,
  type PostDetail,
} from "@/server/actions/posts";
import { CommentSection } from "@/components/features/CommentSection";
import { Avatar } from "@/components/shared/Avatar";
import { useUser } from "@/hooks/useUser";

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "K" : String(n);
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function renderCaption(text: string) {
  return text.split(/(@\w+)/g).map((part, i) => {
    if (part.startsWith("@") && part.length > 1) {
      return (
        <Link key={i} href={`/u/${part.slice(1)}`} className="text-[#398AB9] font-medium hover:underline">
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function PostDetailClient({
  post: initialPost,
  meId,
}: {
  post: PostDetail;
  meId?: string;
}) {
  const router = useRouter();
  const { user: me } = useUser();

  const [post, setPost] = useState(initialPost);
  const [liked, setLiked] = useState(initialPost.likedByMe);
  const [saved, setSaved] = useState(initialPost.savedByMe);
  const [likeCount, setLikeCount] = useState(initialPost.likesCount);
  const [imgIndex, setImgIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleLike() {
    setLiked((v) => !v);
    setLikeCount((n) => liked ? n - 1 : n + 1);
    toggleLike(post.id).catch(() => {
      setLiked((v) => !v);
      setLikeCount((n) => liked ? n + 1 : n - 1);
    });
  }

  async function handleSave() {
    setSaved((v) => !v);
    toggleSave(post.id).catch(() => setSaved((v) => !v));
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: post.content.slice(0, 60), url: location.href });
    } else {
      await navigator.clipboard.writeText(location.href);
    }
  }

  async function handleEditSave() {
    if (!editContent.trim()) return;
    setEditSaving(true);
    const { error } = await editPost(post.id, editContent);
    setEditSaving(false);
    if (!error) {
      setPost((p) => ({ ...p, content: editContent.trim() }));
      setEditMode(false);
    }
  }

  async function handleDelete() {
    const { error } = await deletePost(post.id);
    if (!error) router.replace("/feed");
  }

  const isOwner = (!!me && me.id === post.user.id) || meId === post.user.id;

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 flex-1">โพสต์</span>
        {isOwner && (
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => { setEditContent(post!.content); setEditMode(true); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                  <Pencil className="w-4 h-4 text-[#398AB9]" /> แก้ไข
                </button>
                <button
                  onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  <Trash2 className="w-4 h-4" /> ลบโพสต์
                </button>
              </div>
            )}
          </div>
        )}
      </header>
      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-xl">
            <p className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-1">ลบโพสต์นี้?</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">การลบโพสต์จะไม่สามารถกู้คืนได้</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition">ยกเลิก</button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 rounded-xl text-sm text-white font-medium hover:bg-red-600 transition">ลบ</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-50 dark:border-slate-700">
          <Link href={`/profile/${post.user.id}`}>
            <Avatar src={post.user.avatarUrl} name={post.user.name ?? "U"} />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${post.user.id}`}
              className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-[#398AB9] transition">
              {post.user.name}
            </Link>
            {post.user.username && (
              <p className="text-[11px] text-gray-400 dark:text-slate-500">@{post.user.username}</p>
            )}
          </div>
          <span className="text-[11px] text-gray-400 dark:text-slate-500">{fmtDate(post.createdAt)}</span>
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
        {(post.place || post.location || post.tags.length > 0) && (
          <div className="px-4 py-2 bg-white dark:bg-slate-800 flex flex-wrap items-center gap-2 border-b border-gray-50 dark:border-slate-700">
            {post.place ? (
              <Link href={`/place/${post.place.slug}`}
                className="flex items-center gap-1 text-xs text-[#398AB9] hover:underline font-medium">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {post.place.name}
              </Link>
            ) : post.location ? (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                <MapPin className="w-3 h-3 text-[#398AB9]" />
                {post.location}
              </div>
            ) : null}
            {post.tags.map((tag) => (
              <span key={tag} className="text-[11px] bg-[#398AB9]/10 text-[#398AB9] px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 px-3 pt-3 pb-1 bg-white dark:bg-slate-800">
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

        {/* Caption / Edit mode */}
        <div className="px-4 pb-3 bg-white dark:bg-slate-800">
          {editMode ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full text-sm text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-700/50 border border-[#398AB9]/40 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#398AB9]/20 resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-xs text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                  <X className="w-3.5 h-3.5" /> ยกเลิก
                </button>
                <button onClick={handleEditSave} disabled={editSaving}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#398AB9] text-white rounded-lg text-xs font-medium hover:bg-[#1C658C] transition disabled:opacity-60">
                  <Check className="w-3.5 h-3.5" /> {editSaving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
              <Link href={`/profile/${post.user.id}`}
                className="font-semibold mr-1.5 hover:text-[#398AB9] dark:text-slate-100 transition">
                {post.user.name}
              </Link>
              {renderCaption(post.content)}
            </p>
          )}
        </div>

        {/* Comment section */}
        <div className="bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
          <CommentSection postId={post.id} initialCount={post.commentsCount} />
        </div>
      </div>
    </AppShell>
  );
}
