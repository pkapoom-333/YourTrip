"use client";

/**
 * StoryRing — avatar circle with gradient border when user has active stories.
 * Gradient = unviewed (with spin animation), gray = all viewed, none = no stories.
 */
interface StoryRingProps {
  avatarUrl?: string | null;
  name: string;
  hasStories?: boolean;
  allViewed?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

const SIZES = {
  sm: { outer: "w-10 h-10", avatar: "w-9 h-9", text: "text-xs" },
  md: { outer: "w-14 h-14", avatar: "w-[52px] h-[52px]", text: "text-sm" },
  lg: { outer: "w-20 h-20", avatar: "w-[72px] h-[72px]", text: "text-base" },
};

export default function StoryRing({
  avatarUrl,
  name,
  hasStories = false,
  allViewed = false,
  size = "md",
  onClick,
  className = "",
}: StoryRingProps) {
  const s = SIZES[size];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasUnviewed = hasStories && !allViewed;

  // For unviewed stories: animated conic-gradient ring that slowly spins
  const outerStyle = hasUnviewed
    ? {
        background: "conic-gradient(from 0deg, #f9a825, #e91e8c, #398AB9, #f9a825)",
        animation: "story-ring-spin 4s linear infinite",
      }
    : undefined;

  const ringClass = hasStories
    ? allViewed
      ? "bg-gray-300 dark:bg-slate-600"
      : ""
    : "bg-transparent";

  return (
    <>
      <style>{`
        @keyframes story-ring-spin {
          from { filter: hue-rotate(0deg); }
          to { filter: hue-rotate(360deg); }
        }
      `}</style>
      <button
        onClick={onClick}
        disabled={!onClick}
        className={`${s.outer} rounded-full flex items-center justify-center p-[2.5px] ${ringClass} ${className}`}
        style={outerStyle}
      >
        <div className={`${s.avatar} rounded-full overflow-hidden border-2 border-white dark:border-slate-900 flex-shrink-0`}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                (e.currentTarget.nextSibling as HTMLElement)?.removeAttribute("style");
              }}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center bg-[#398AB9] text-white font-bold ${s.text}`}
            style={avatarUrl ? { display: "none" } : {}}
          >
            {initials}
          </div>
        </div>
      </button>
    </>
  );
}
