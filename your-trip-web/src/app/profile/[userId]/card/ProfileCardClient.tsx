"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Share2, MapPin, PenLine, Compass, Users, Shield, Star } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { useToast } from "@/components/shared/Toast";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

type Profile = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location?: string | null;
  website?: string | null;
  isVerifiedGuide: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  tripsCount: number;
  placesVisited?: number;
};

export default function ProfileCardClient({ profile, userId }: { profile: Profile; userId: string }) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const profileUrl = `${SITE_URL}/profile/${userId}`;
  const cardUrl = `${SITE_URL}/profile/${userId}/card`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      success("คัดลอกลิงก์แล้ว!");
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name ?? profile.username} — Your Trip`,
          text: profile.bio ?? `ดูโปรไฟล์นักเดินทางของ ${profile.name} บน Your Trip`,
          url: profileUrl,
        });
      } catch {}
    } else {
      copyLink();
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
          {/* Header gradient */}
          <div className="h-24 bg-gradient-to-br from-[#398AB9] to-[#1C658C] relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 0%, transparent 50%)" }} />
          </div>

          {/* Avatar */}
          <div className="px-6 pb-6">
            <div className="-mt-12 mb-4">
              <Avatar
                name={profile.name ?? "User"}
                src={profile.avatarUrl}
                className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg"
              />
            </div>

            {/* Name & badge */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                {profile.name ?? profile.username ?? "นักเดินทาง"}
              </h1>
              {profile.isVerifiedGuide && (
                <span className="flex items-center gap-1 bg-[#398AB9]/10 text-[#398AB9] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" /> ไกด์
                </span>
              )}
            </div>

            {profile.username && (
              <p className="text-sm text-gray-400 dark:text-slate-500 mb-2">@{profile.username}</p>
            )}

            {profile.bio && (
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">{profile.bio}</p>
            )}

            {profile.location && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mb-4">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { v: profile.postsCount, l: "โพสต์", icon: PenLine },
                { v: profile.tripsCount, l: "ทริป", icon: Compass },
                { v: profile.followersCount, l: "ผู้ติดตาม", icon: Users },
                { v: profile.placesVisited ?? 0, l: "สถานที่", icon: Star },
              ].map(({ v, l, icon: Icon }) => (
                <div key={l} className="flex flex-col items-center py-3 bg-gray-50 dark:bg-slate-700 rounded-2xl">
                  <Icon className="w-3.5 h-3.5 text-[#398AB9] mb-1" />
                  <span className="text-base font-bold text-gray-900 dark:text-slate-100">{v}</span>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">{l}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Link
                href={`/profile/${userId}`}
                className="flex-1 py-2.5 bg-[#398AB9] hover:bg-[#1C658C] text-white text-sm font-semibold rounded-2xl text-center transition"
              >
                ดูโปรไฟล์
              </Link>
              <button
                onClick={nativeShare}
                className="py-2.5 px-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 rounded-2xl transition flex items-center gap-1.5 text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                แชร์
              </button>
              <button
                onClick={copyLink}
                className="p-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 rounded-2xl transition"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer brand */}
        <div className="text-center mt-5">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            พบกันบน{" "}
            <Link href="/" className="text-[#398AB9] font-semibold hover:underline">
              Your Trip
            </Link>
            {" "}— สังคมนักเดินทาง
          </p>
          <p className="text-[11px] text-gray-300 dark:text-slate-600 mt-1">{cardUrl}</p>
        </div>
      </div>
    </div>
  );
}
