"use client";

/**
 * /profile/passport — shareable travel passport card
 * Shows: avatar, name, travel stats, top visited provinces, travel style badge
 * Has a "Download / Share" button for social media
 */

import { useState, useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import { ChevronLeft, Share2, MapPin, Calendar, Star, Briefcase } from "lucide-react";
import { getProfile, getDeepStats } from "@/server/actions/profile";

const TRAVEL_STYLES = [
  { min: 30, label: "World Explorer", emoji: "🌍", color: "#398AB9" },
  { min: 20, label: "Adventure Seeker", emoji: "🎒", color: "#22C55E" },
  { min: 10, label: "Frequent Flyer", emoji: "✈️", color: "#8B5CF6" },
  { min: 5,  label: "Wanderlust",     emoji: "🗺️", color: "#F59E0B" },
  { min: 1,  label: "New Traveler",   emoji: "🌱", color: "#64748B" },
  { min: 0,  label: "Ready to Fly",  emoji: "🚀", color: "#94A3B8" },
];

function getTravelStyle(provincesVisited: number) {
  return TRAVEL_STYLES.find((s) => provincesVisited >= s.min) ?? TRAVEL_STYLES[TRAVEL_STYLES.length - 1];
}

const PASSPORT_STAMPS = [
  "✈️", "🏔️", "🌊", "🌴", "🏛️", "🗺️", "⛩️", "🏕️", "🌅", "🎭",
  "🍜", "🎪", "🏄", "🧗", "🌺",
];

export default function PassportPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<{
    name: string; username: string; avatarUrl: string | null; bio: string;
  } | null>(null);
  const [stats, setStats] = useState<{
    tripsCount: number; totalDaysPlanned: number;
    placesByProvince: Array<{ province: string; count: number }>;
    reviewsCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      getProfile(),
      getDeepStats(),
    ]).then(([profileRes, statsRes]) => {
      if (profileRes.data) {
        setProfile({
          name: profileRes.data.name ?? "Traveler",
          username: profileRes.data.username ?? "",
          avatarUrl: profileRes.data.avatarUrl ?? null,
          bio: profileRes.data.bio ?? "",
        });
      }
      if (statsRes.data) {
        setStats({
          tripsCount: statsRes.data.tripsCount,
          totalDaysPlanned: statsRes.data.totalDaysPlanned,
          placesByProvince: statsRes.data.placesByProvince,
          reviewsCount: statsRes.data.reviewsCount,
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `${profile?.name ?? "Travel"} Passport`, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const provincesVisited = stats?.placesByProvince.length ?? 0;
  const style = getTravelStyle(provincesVisited);
  const topProvinces = stats?.placesByProvince.slice(0, 6) ?? [];

  // Pseudo-random stamps using province count as seed
  const stamps = PASSPORT_STAMPS.slice(0, Math.min(provincesVisited, PASSPORT_STAMPS.length));

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#398AB9] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <h1 className="font-bold text-gray-900 dark:text-white flex-1">Travel Passport</h1>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-[#398AB9] text-white px-3 py-1.5 rounded-xl text-sm font-medium"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? "คัดลอกแล้ว!" : "แชร์"}
          </button>
        </div>

        {/* Passport Card */}
        <div className="p-4">
          <div
            ref={cardRef}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "linear-gradient(135deg, #0f2942 0%, #1C658C 50%, #398AB9 100%)" }}
          >
            {/* Decorative pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Top section — country & title */}
            <div className="relative px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/50 text-[10px] font-bold tracking-[0.3em] uppercase">Kingdom of Thailand</p>
                  <p className="text-white/90 text-[9px] tracking-[0.2em] uppercase mt-0.5">Travel Passport</p>
                </div>
                <span className="text-4xl">🇹🇭</span>
              </div>

              {/* Passport stamps (decorative) */}
              {stamps.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {stamps.map((s, i) => (
                    <span
                      key={i}
                      className="text-lg opacity-70"
                      style={{ transform: `rotate(${(i * 37) % 30 - 15}deg)` }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* White info section */}
            <div className="bg-white/95 dark:bg-slate-800/95 mx-4 rounded-2xl p-4 mb-4">
              {/* Profile */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#398AB9]/30 flex-shrink-0">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#398AB9] flex items-center justify-center text-white text-2xl font-bold">
                      {profile?.name?.[0] ?? "T"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Full Name</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight truncate">
                    {profile?.name ?? "Traveler"}
                  </p>
                  {profile?.username && (
                    <p className="text-xs text-[#398AB9]">@{profile.username}</p>
                  )}
                  <div
                    className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: style.color }}
                  >
                    {style.emoji} {style.label}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: Briefcase, label: "ทริป", value: stats?.tripsCount ?? 0 },
                  { icon: MapPin,    label: "จังหวัด", value: provincesVisited },
                  { icon: Calendar,  label: "วัน",    value: stats?.totalDaysPlanned ?? 0 },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-2.5 text-center">
                    <Icon className="w-4 h-4 text-[#398AB9] mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-[9px] text-gray-400 dark:text-slate-500 font-medium">{label}</p>
                  </div>
                ))}
              </div>

              {/* Top provinces */}
              {topProvinces.length > 0 && (
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2">Top Destinations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topProvinces.map(({ province, count }) => (
                      <div
                        key={province}
                        className="flex items-center gap-1 bg-[#398AB9]/10 text-[#398AB9] px-2 py-1 rounded-full text-[10px] font-semibold"
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        {province}
                        <span className="opacity-60">×{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topProvinces.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    Check-in ที่สถานที่แรกเพื่อเริ่มเก็บแสตมป์การเดินทาง ✈️
                  </p>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="px-6 pb-5 flex items-center justify-between">
              <p className="text-white/50 text-[9px] tracking-widest font-mono">YOUR-TRIP.APP</p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.min(Math.floor(provincesVisited / 5), 5)
                        ? "text-amber-400 fill-amber-400"
                        : "text-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mx-4 mb-8 p-4 bg-[#398AB9]/8 dark:bg-[#398AB9]/10 rounded-2xl">
          <p className="text-xs font-semibold text-[#398AB9] mb-1">วิธีเพิ่มแสตมป์</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Check-in ที่สถานที่ต่างๆ ผ่านหน้าสถานที่ หรือบันทึกสถานที่ใน collection เพื่อเพิ่มจังหวัดใหม่ในแผนที่
          </p>
        </div>
      </div>
    </AppShell>
  );
}
