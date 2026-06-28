"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Trash2, Eye } from "lucide-react";
import { markStoryViewed, deleteStory, getStoryViewers } from "@/server/actions/stories";
import type { StoryGroup, StoryItem } from "@/server/actions/stories";

interface StoryViewerProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  myUserId: string | null;
  onClose: () => void;
}

export default function StoryViewer({ groups, initialGroupIndex, myUserId, onClose }: StoryViewerProps) {
  const [groupIdx, setGroupIdx] = useState(initialGroupIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<Array<{ userId: string; name: string; avatarUrl: string | null; viewedAt: Date }>>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const group = groups[groupIdx];
  const story: StoryItem | undefined = group?.stories[storyIdx];
  const isOwn = group?.userId === myUserId;
  const duration = story?.duration ?? 5000;
  const TICK = 50; // ms per progress tick

  // Auto-advance progress
  useEffect(() => {
    if (!story || paused) return;
    setProgress(0);

    if (story.mediaType !== "video") {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (TICK / duration) * 100;
          if (next >= 100) {
            clearInterval(timerRef.current!);
            advance();
            return 100;
          }
          return next;
        });
      }, TICK);
    }

    // Mark as viewed
    markStoryViewed(story.id).catch(() => {});

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIdx, storyIdx, paused]);

  const advance = useCallback(() => {
    const g = groups[groupIdx];
    if (storyIdx < g.stories.length - 1) {
      setStoryIdx((i) => i + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx((i) => i + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  }, [groups, groupIdx, storyIdx, onClose]);

  const goBack = useCallback(() => {
    if (storyIdx > 0) {
      setStoryIdx((i) => i - 1);
    } else if (groupIdx > 0) {
      setGroupIdx((i) => i - 1);
      setStoryIdx(0);
    }
  }, [groupIdx, storyIdx]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") advance();
      if (e.key === "ArrowLeft") goBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, goBack, onClose]);

  // Touch/swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setPaused(true);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    setPaused(false);
    // Swipe down → close
    if (dy > 80 && Math.abs(dy) > Math.abs(dx)) { onClose(); return; }
    // Tap left/right thirds
    const screenW = window.innerWidth;
    const tapX = e.changedTouches[0].clientX;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      if (tapX < screenW / 3) goBack();
      else advance();
    }
  };

  // Video ended → advance
  const handleVideoEnded = () => advance();

  const handleDelete = async () => {
    if (!story) return;
    await deleteStory(story.id);
    if (group.stories.length <= 1) {
      if (groupIdx < groups.length - 1) { setGroupIdx((i) => i + 1); setStoryIdx(0); }
      else onClose();
    } else {
      advance();
    }
  };

  const handleShowViewers = async () => {
    if (!story || !isOwn) return;
    const { data } = await getStoryViewers(story.id);
    setViewers(data);
    setShowViewers(true);
    setPaused(true);
  };

  if (!group || !story) return null;

  const initials = group.userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const timeLeft = Math.max(0, Math.round((new Date(story.expiresAt).getTime() - Date.now()) / 3600000));

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-2 pt-2">
        {group.stories.map((s, i) => (
          <div key={s.id} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{
                width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-5 left-0 right-0 z-10 flex items-center px-3 pt-2">
        <div className="flex items-center gap-2 flex-1">
          {group.userAvatarUrl ? (
            <img src={group.userAvatarUrl} alt={group.userName} className="w-9 h-9 rounded-full object-cover border-2 border-white/60" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#398AB9] flex items-center justify-center text-white text-sm font-bold border-2 border-white/60">
              {initials}
            </div>
          )}
          <div>
            <p className="text-white text-sm font-semibold leading-none">{group.userName}</p>
            <p className="text-white/60 text-[11px] mt-0.5">{timeLeft > 0 ? `${timeLeft} ชม.` : "< 1 ชม."}</p>
          </div>
        </div>
        {isOwn && (
          <button onClick={handleDelete} className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white mr-1">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Media */}
      <div className="w-full h-full max-w-md mx-auto relative flex items-center justify-center">
        {story.mediaType === "video" ? (
          <video
            key={story.id}
            src={story.mediaUrl}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            onEnded={handleVideoEnded}
            onPlay={() => setProgress(0)}
          />
        ) : (
          <img
            key={story.id}
            src={story.mediaUrl}
            alt={story.caption ?? "story"}
            className="w-full h-full object-contain select-none"
            draggable={false}
          />
        )}

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-16 left-0 right-0 px-4">
            <p className="text-white text-sm text-center drop-shadow-lg bg-black/30 rounded-xl px-3 py-2">
              {story.caption}
            </p>
          </div>
        )}

        {/* Tap zones (invisible) */}
        <button className="absolute left-0 top-0 w-1/3 h-full z-5" onClick={goBack} />
        <button className="absolute right-0 top-0 w-1/3 h-full z-5" onClick={advance} />
      </div>

      {/* Nav arrows (desktop) */}
      <button
        onClick={goBack}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 items-center justify-center text-white z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={advance}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 items-center justify-center text-white z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Viewer count (owner) */}
      {isOwn && (
        <button
          onClick={handleShowViewers}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-white/80 text-sm z-20 hover:text-white"
        >
          <Eye className="w-4 h-4" />
          <span>ผู้ชม {group.stories[storyIdx] ? story.viewedByMe ? "" : "" : ""}</span>
        </button>
      )}

      {/* Viewers panel */}
      {showViewers && (
        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md rounded-t-2xl p-4 z-30 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">ผู้ชม {viewers.length} คน</h3>
            <button onClick={() => { setShowViewers(false); setPaused(false); }}>
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
          {viewers.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-4">ยังไม่มีผู้ชม</p>
          ) : (
            viewers.map((v) => {
              const vi = (v.name ?? "U").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={v.userId} className="flex items-center gap-2 py-2 border-b border-white/10 last:border-0">
                  {v.avatarUrl ? (
                    <img src={v.avatarUrl} alt={v.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#398AB9] flex items-center justify-center text-white text-xs font-bold">{vi}</div>
                  )}
                  <span className="text-white text-sm">{v.name}</span>
                  <span className="ml-auto text-white/40 text-xs">
                    {Math.round((Date.now() - new Date(v.viewedAt).getTime()) / 60000)} นาทีที่แล้ว
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
