"use client";

import { useState, useRef, useEffect } from "react";
import { Heart, Send, MoreHorizontal, Trash2 } from "lucide-react";
import { getComments, createComment, deleteComment } from "@/server/actions/posts";
import { useUser } from "@/hooks/useUser";

interface Comment {
  id: string;
  userId?: string;
  author: string;
  avatar: string;
  avatarBg: string;
  text: string;
  time: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}


function CommentItem({
  comment,
  myId,
  onLike,
  onReply,
  onDelete,
}: {
  comment: Comment;
  myId?: string;
  onLike: (id: string) => void;
  onReply: (author: string) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const canDelete = myId && comment.userId === myId;

  return (
    <div className="flex gap-2.5">
      <div className={`w-7 h-7 ${comment.avatarBg} rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5`}>
        {comment.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 dark:bg-slate-700/60 rounded-2xl px-3 py-2.5">
          <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 mb-0.5">{comment.author}</p>
          <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{comment.text}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-[10px] text-gray-400 dark:text-slate-500">{comment.time}</span>
          <button
            onClick={() => onLike(comment.id)}
            className={`flex items-center gap-0.5 text-[10px] font-medium transition ${
              comment.isLiked ? "text-[#FF4F4F]" : "text-gray-400 hover:text-[#FF4F4F]"
            }`}
          >
            <Heart className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`} />
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </button>
          <button
            onClick={() => onReply(comment.author)}
            className="text-[10px] text-gray-400 hover:text-[#398AB9] font-medium transition"
          >
            ตอบกลับ
          </button>
          {canDelete && (
            <div className="relative ml-auto">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 transition"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 bottom-6 w-28 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(comment.id); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ลบ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CommentSectionProps {
  postId: string | number;
  initialCount?: number;
}

function fmtComment(d: Date): string {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "เมื่อกี้";
  if (mins < 60) return `${mins} นาที`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชม.`;
  return `${Math.floor(hrs / 24)} วัน`;
}

export function CommentSection({ postId, initialCount = 0 }: CommentSectionProps) {
  const { user: me } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load real comments when expanded
  useEffect(() => {
    if (!isExpanded || loaded) return;
    const id = typeof postId === "number" ? String(postId) : postId;
    setLoaded(true);
    getComments(id).then(({ data }) => {
      setComments(data.map((c) => ({
        id: c.id,
        userId: c.user.id,
        author: c.user.username ?? c.user.name ?? "ผู้ใช้",
        avatar: (c.user.name ?? c.user.username ?? "ผ").charAt(0).toUpperCase(),
        avatarBg: "bg-[#398AB9]",
        text: c.content,
        time: fmtComment(c.createdAt),
        likes: 0,
        isLiked: false,
      })));
    }).catch(() => {});
  }, [isExpanded, loaded, postId]);

  function handleLike(id: string) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  }

  function handleReply(author: string) {
    setInput(`@${author} `);
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function handleDelete(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    const id = typeof postId === "number" ? String(postId) : postId;
    if (!id.startsWith("mock")) {
      await deleteComment(commentId).catch(() => {});
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    // Optimistic update
    const optimistic: Comment = {
      id: `opt-${Date.now()}`,
      author: "คุณ",
      avatar: "YT",
      avatarBg: "bg-[#398AB9]",
      text,
      time: "เมื่อกี้",
      likes: 0,
      isLiked: false,
    };
    setComments((prev) => [...prev, optimistic]);
    setInput("");

    // Wire to server action (fire-and-forget, replace optimistic ID if success)
    const id = typeof postId === "number" ? String(postId) : postId;
    if (!id.startsWith("mock")) {
      createComment(id, text).then(({ data }) => {
        if (!data) return;
        setComments((prev) =>
          prev.map((c) => c.id === optimistic.id ? { ...c, id: data.id } : c)
        );
      }).catch(() => {});
    }
  }

  const totalCount = initialCount + comments.length;

  return (
    <div className="border-t border-gray-50 dark:border-slate-700">
      {/* Expand/collapse toggle */}
      {!isExpanded && totalCount > 0 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="px-4 py-2 text-xs text-gray-400 dark:text-slate-500 hover:text-[#398AB9] transition w-full text-left"
        >
          ดูความคิดเห็นทั้ง {totalCount} รายการ
        </button>
      )}

      {/* Comment list */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-3 max-h-60 overflow-y-auto">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              myId={me?.id}
              onLike={handleLike}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5 px-4 py-3">
        <div className="w-7 h-7 bg-[#398AB9] rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
          YT
        </div>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="แสดงความคิดเห็น..."
          className="flex-1 text-xs text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/60 rounded-full px-3.5 py-2 outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-[#398AB9]/30 transition placeholder:text-gray-400 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="text-[#398AB9] disabled:text-gray-300 hover:text-[#1C658C] transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
