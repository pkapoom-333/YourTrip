"use client";

import Link from "next/link";
import { Activity, FileText, Star, Map, UserPlus, Users } from "lucide-react";
import type { FollowingActivityItem } from "@/server/actions/profile";

function timeAgo(d: Date | string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "เพิ่งเมื่อกี้";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return `${Math.floor(days / 7)} สัปดาห์ที่แล้ว`;
}

function Avatar({ user }: { user: { name: string | null; avatarUrl: string | null } }) {
  const initials = (user.name ?? "U").charAt(0).toUpperCase();
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
  ) : (
    <div className="w-10 h-10 bg-[#398AB9] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      {initials}
    </div>
  );
}

function ActivityRow({ item }: { item: FollowingActivityItem }) {
  const actorName = item.actor.name ?? item.actor.username ?? "ผู้ใช้";
  const actorHref = `/profile/${item.actor.id}`;

  let icon = <FileText className="w-4 h-4" />;
  let iconBg = "bg-blue-100 text-blue-600";
  let description: React.ReactNode = null;
  let thumbnail: string | undefined;
  let targetHref = "/feed";

  if (item.type === "post") {
    icon = <FileText className="w-4 h-4" />;
    iconBg = "bg-blue-100 text-blue-600";
    thumbnail = item.payload.postImage;
    targetHref = `/post/${item.payload.postId}`;
    description = (
      <span>
        <Link href={actorHref} className="font-semibold text-gray-900 dark:text-white hover:underline">{actorName}</Link>
        {" "}โพสต์ใหม่
        {item.payload.placeName && (
          <> ที่ <Link href={`/place/${item.payload.placeSlug}`} className="text-[#398AB9] hover:underline">{item.payload.placeName}</Link></>
        )}
      </span>
    );
  } else if (item.type === "review") {
    icon = <Star className="w-4 h-4" />;
    iconBg = "bg-amber-100 text-amber-600";
    thumbnail = item.payload.placeImage;
    targetHref = `/place/${item.payload.placeSlug}`;
    description = (
      <span>
        <Link href={actorHref} className="font-semibold text-gray-900 dark:text-white hover:underline">{actorName}</Link>
        {" "}รีวิว{" "}
        {item.payload.placeName && (
          <Link href={`/place/${item.payload.placeSlug}`} className="text-[#398AB9] hover:underline">{item.payload.placeName}</Link>
        )}
        {item.payload.rating && (
          <span className="ml-1 text-amber-500 font-medium">{"★".repeat(item.payload.rating)}</span>
        )}
      </span>
    );
  } else if (item.type === "trip") {
    icon = <Map className="w-4 h-4" />;
    iconBg = "bg-green-100 text-green-600";
    targetHref = `/trips/${item.payload.tripId}`;
    description = (
      <span>
        <Link href={actorHref} className="font-semibold text-gray-900 dark:text-white hover:underline">{actorName}</Link>
        {" "}สร้างทริป{" "}
        <Link href={targetHref} className="text-[#398AB9] hover:underline">{item.payload.tripName}</Link>
      </span>
    );
  } else if (item.type === "follow") {
    icon = <UserPlus className="w-4 h-4" />;
    iconBg = "bg-purple-100 text-purple-600";
    targetHref = `/profile/${item.payload.targetUserId}`;
    description = (
      <span>
        <Link href={actorHref} className="font-semibold text-gray-900 dark:text-white hover:underline">{actorName}</Link>
        {" "}ติดตาม{" "}
        <Link href={targetHref} className="text-[#398AB9] hover:underline">{item.payload.targetUserName}</Link>
      </span>
    );
  }

  return (
    <div className="flex items-start gap-3 py-4 border-b border-gray-50 dark:border-slate-700/50 last:border-0">
      {/* Avatar with icon badge */}
      <div className="relative flex-shrink-0">
        <Avatar user={item.actor} />
        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${iconBg} border-2 border-white dark:border-slate-800`}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 dark:text-slate-300 leading-snug">{description}</p>
        {item.payload.postContent && (
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">{item.payload.postContent}</p>
        )}
        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">{timeAgo(item.createdAt)}</p>
      </div>

      {/* Thumbnail */}
      {thumbnail && (
        <Link href={targetHref} className="flex-shrink-0">
          <img src={thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover" />
        </Link>
      )}
    </div>
  );
}

export default function ActivityClient({ activities }: { activities: FollowingActivityItem[] }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-[#398AB9] rounded-2xl flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">กิจกรรม</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">สิ่งที่คนที่คุณติดตามทำอยู่</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400 dark:text-slate-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-2">ยังไม่มีกิจกรรม</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            เริ่มติดตามนักท่องเที่ยวเพื่อดูกิจกรรมของพวกเขา
          </p>
          <Link
            href="/search/users"
            className="inline-flex items-center gap-2 bg-[#398AB9] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1C658C] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            ค้นหาผู้ใช้
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-4">
          {activities.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
