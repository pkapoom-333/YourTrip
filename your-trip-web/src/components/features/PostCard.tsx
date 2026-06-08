"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Send, Bookmark, MapPin, MoreHorizontal } from "lucide-react";
import { toggleLike, toggleSave } from "@/server/actions/posts";
import { CommentSection } from "./CommentSection";
import { Avatar } from "@/components/shared/Avatar";

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
  likes: number;
  comments: number;
  shares?: number;
  saved: boolean;
  time: string;
  tags: string[];
  place?: { id: string; slug: string; name: string } | null;
}

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "K" : String(n);
}

export function PostCard({ post, onTagClick }: { post: PostCardData; onTagClick?: (tag: string) => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);

  async function handleLike() {
    if (isLiking) return;
    // Optimistic update
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    setIsLiking(true);
    try {
      await toggleLike(String(post.id));
    } catch {
      // Revert on error
      setLiked(liked);
      setLikeCount((c) => liked ? c + 1 : c - 1);
    } finally {
      setIsLiking(false);
    }
  }

  async function handleSave() {
    setSaved(!saved);
    try {
      await toggleSave(String(post.id));
    } catch {
      setSaved(saved);
    }
  }

  return (
    <article className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
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
            <Link href={`/profile/${post.user.id}`} className="text-sm font-semibold text-gray-900 hover:text-[#398AB9] transition">
              {post.user.name}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-gray-900">{post.user.name}</p>
          )}
          {/* Place badge (linked to DB place) — takes priority over free-text location */}
          {post.place ? (
            <Link href={`/place/${post.place.slug}`}
              className="flex items-center gap-1 text-[11px] text-[#398AB9] hover:underline transition truncate w-fit">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              {post.place.name}
            </Link>
          ) : post.user.location ? (
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <MapPin className="w-2.5 h-2.5" />
              <span className="truncate">{post.user.location}</span>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">{post.time}</span>
          <button className="text-gray-400 hover:text-gray-600 transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Post image */}
      {post.img && (
      <Link href={`/post/${post.id}`} className="block">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={post.img}
          alt={post.title ?? ""}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
        />
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => { e.preventDefault(); onTagClick?.(tag); }}
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
            liked ? "text-[#FF4F4F] bg-red-50" : "text-gray-400 hover:text-[#FF4F4F] hover:bg-red-50"
          }`}
        >
          <Heart className={`w-5 h-5 transition-transform ${liked ? "scale-110 fill-current" : ""}`} />
          <span className="text-xs font-medium">{fmt(likeCount)}</span>
        </button>
        <Link href={`/post/${post.id}`}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-gray-400 hover:text-[#398AB9] hover:bg-[#398AB9]/5 transition">
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-medium">{fmt(post.comments)}</span>
        </Link>
        {post.shares !== undefined && (
        <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-gray-400 hover:text-[#398AB9] hover:bg-[#398AB9]/5 transition">
          <Send className="w-5 h-5" />
          <span className="text-xs font-medium">{fmt(post.shares)}</span>
        </button>
        )}
        <div className="flex-1" />
        <button
          onClick={handleSave}
          className={`p-1.5 rounded-xl transition-all ${
            saved ? "text-[#398AB9] bg-[#398AB9]/10" : "text-gray-400 hover:text-[#398AB9] hover:bg-[#398AB9]/5"
          }`}
        >
          <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-2">
        <p className="text-sm text-gray-800 leading-relaxed">
          <span className="font-semibold mr-1">{post.user.name}</span>
          {post.caption}
        </p>
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} initialCount={post.comments} />
    </article>
  );
}
