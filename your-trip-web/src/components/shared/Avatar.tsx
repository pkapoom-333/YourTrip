"use client";

import { useState } from "react";

const COLORS = [
  "bg-[#398AB9]", "bg-emerald-400", "bg-violet-400",
  "bg-amber-400",  "bg-rose-400",   "bg-pink-400",
];

function bgFor(name: string) {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

interface AvatarProps {
  src?: string | null;
  name: string;
  className?: string;
}

export function Avatar({ src, name, className = "w-10 h-10" }: AvatarProps) {
  const [broken, setBroken] = useState(false);
  const initials = name.trim().charAt(0).toUpperCase();

  if (!src || broken) {
    return (
      <div className={`${className} ${bgFor(name)} rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className={`${className} rounded-full object-cover flex-shrink-0`}
    />
  );
}
