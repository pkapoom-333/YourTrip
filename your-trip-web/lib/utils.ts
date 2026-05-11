import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format large numbers: 10200 → "10.2K" */
export function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

/** Format THB currency: 1500 → "฿1,500" */
export function fmtBaht(n: number): string {
  return "฿" + n.toLocaleString("th-TH");
}

/** Price range: 1 → "฿", 2 → "฿฿", etc. */
export function priceRange(level: number): string {
  return "฿".repeat(Math.min(Math.max(level, 1), 4));
}

/** Relative time in Thai */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);

  if (secs < 60) return "เมื่อกี้";
  if (secs < 3600) return `${Math.floor(secs / 60)} นาทีที่แล้ว`;
  if (secs < 86400) return `${Math.floor(secs / 3600)} ชั่วโมงที่แล้ว`;
  if (secs < 86400 * 7) return `${Math.floor(secs / 86400)} วันที่แล้ว`;
  if (secs < 86400 * 30) return `${Math.floor(secs / 86400 / 7)} สัปดาห์ที่แล้ว`;
  if (secs < 86400 * 365) return `${Math.floor(secs / 86400 / 30)} เดือนที่แล้ว`;
  return `${Math.floor(secs / 86400 / 365)} ปีที่แล้ว`;
}

/** Format date to Thai locale */
export function fmtDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format date range */
export function fmtDateRange(start: Date | string, end: Date | string): string {
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  const days = Math.round((e.getTime() - s.getTime()) / 86400000);
  const startStr = s.toLocaleDateString("th-TH", { month: "short", day: "numeric" });
  const endStr = e.toLocaleDateString("th-TH", { month: "short", day: "numeric", year: "numeric" });
  return `${startStr} – ${endStr} (${days} วัน)`;
}

/** Get initials from name or email */
export function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "YT";
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

/** Generate slug from Thai/English text */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .trim();
}

/** Check if URL is valid */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/** Clamp number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Sleep for n milliseconds */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
