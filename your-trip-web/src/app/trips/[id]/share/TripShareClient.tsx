"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy, Check, Share2, MapPin, Calendar,
  CalendarDays, Layers, ChevronRight, Users,
} from "lucide-react";
import { useToast } from "@/components/shared/Toast";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

interface TripShareProps {
  trip: {
    id: string;
    title: string;
    destination: string;
    coverImage: string | null;
    startDate: Date | null;
    endDate: Date | null;
    description: string | null;
    isPublic: boolean;
    dayCount: number;
    placeCount: number;
    ownerName: string | null;
    ownerAvatar: string | null;
  };
}

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}

function daysBetween(start: Date | null, end: Date | null): number {
  if (!start || !end) return 0;
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1);
}

export default function TripShareClient({ trip }: TripShareProps) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();
  const tripUrl = `${SITE_URL}/trips/${trip.id}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(tripUrl);
      setCopied(true);
      success("คัดลอกลิงก์แล้ว!");
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${trip.title} — Your Trip`,
          text: `🗺️ แผนทริป${trip.destination} ${trip.dayCount} วัน${trip.ownerName ? ` โดย ${trip.ownerName}` : ""}`,
          url: tripUrl,
        });
      } catch {}
    } else {
      copyLink();
    }
  }

  const lineMsg = encodeURIComponent(`🗺️ แผนทริป: ${trip.title}\n📍 ${trip.destination}\n🔗 ${tripUrl}`);
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tripUrl)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`แผนทริป "${trip.title}" ที่ ${trip.destination} 🗺️`)}&url=${encodeURIComponent(tripUrl)}`;
  const lineUrl = `https://line.me/R/msg/text/?${lineMsg}`;

  const nights = Math.max(0, daysBetween(trip.startDate, trip.endDate) - 1);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
          {/* Cover image */}
          <div className="relative h-48 bg-gradient-to-br from-[#398AB9] to-[#1C658C]">
            {trip.coverImage ? (
              <img
                src={trip.coverImage}
                alt={trip.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl opacity-30">🗺️</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Badge */}
            <div className="absolute top-3 left-3">
              <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/30">
                🗺️ แผนการเดินทาง
              </span>
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h1 className="text-white font-bold text-xl leading-tight drop-shadow-sm">
                {trip.title}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3 text-white/70" />
                <span className="text-white/80 text-sm">{trip.destination}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 px-4 py-4 border-b border-gray-50 dark:border-slate-700">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[#398AB9] mb-1">
                <CalendarDays className="w-3.5 h-3.5" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                {trip.dayCount > 0 ? trip.dayCount : "?"}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">
                วัน {nights > 0 ? `${nights} คืน` : ""}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[#398AB9] mb-1">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{trip.placeCount}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">สถานที่</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[#398AB9] mb-1">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">
                {trip.startDate ? fmtDate(trip.startDate) : "–"}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">วันเดินทาง</p>
            </div>
          </div>

          {/* Description */}
          {trip.description && (
            <p className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300 line-clamp-2 border-b border-gray-50 dark:border-slate-700">
              {trip.description}
            </p>
          )}

          {/* Owner */}
          {trip.ownerName && (
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 dark:border-slate-700">
              {trip.ownerAvatar ? (
                <img src={trip.ownerAvatar} alt={trip.ownerName}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#398AB9]/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 text-[#398AB9]" />
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-slate-400">
                วางแผนโดย <span className="font-semibold text-gray-700 dark:text-slate-200">{trip.ownerName}</span>
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="px-4 py-4 space-y-2.5">
            <Link
              href={`/trips/${trip.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#398AB9] hover:bg-[#1C658C] text-white text-sm font-semibold rounded-2xl transition"
            >
              ดูแผนทริปแบบเต็ม
              <ChevronRight className="w-4 h-4" />
            </Link>

            <div className="flex gap-2">
              <button
                onClick={nativeShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 text-sm font-medium rounded-2xl transition"
              >
                <Share2 className="w-4 h-4" />
                แชร์
              </button>
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 text-sm font-medium rounded-2xl transition"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "คัดลอกแล้ว!" : "คัดลอก"}
              </button>
            </div>

            {/* Social share */}
            <div className="flex gap-2 pt-1">
              <a href={lineUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-medium rounded-xl transition">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.627.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                LINE
              </a>
              <a href={fbUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1877F2] hover:bg-[#1464d8] text-white text-xs font-medium rounded-xl transition">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a href={xUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-black hover:bg-gray-900 text-white text-xs font-medium rounded-xl transition">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            สร้างด้วย{" "}
            <Link href="/" className="text-[#398AB9] font-semibold hover:underline">Your Trip</Link>
            {" "}— วางแผนทริปได้ง่ายๆ
          </p>
        </div>
      </div>
    </div>
  );
}
