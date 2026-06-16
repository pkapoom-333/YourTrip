"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Bell, Heart, MessageCircle, UserPlus, Users, MapPin, CheckCheck } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/actions/notifications";

type NotifType = "like" | "comment" | "follow" | "buddy" | "system";

interface Notif {
  id: string;
  type: NotifType;
  actor: string;
  actorAvatar: string;
  text: string;
  subtext?: string;
  time: string;
  isRead: boolean;
  actionUrl?: string;
  image?: string;
}


const iconMap: Record<NotifType, React.ElementType> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  buddy: Users,
  system: Bell,
};

const colorMap: Record<NotifType, string> = {
  like: "bg-red-500",
  comment: "bg-[#398AB9]",
  follow: "bg-emerald-500",
  buddy: "bg-violet-500",
  system: "bg-amber-500",
};

// Map DB notification type → local NotifType
function mapType(t: string): NotifType {
  const m: Record<string, NotifType> = {
    LIKE: "like", COMMENT: "comment", FOLLOW: "follow",
    BUDDY_REQUEST: "buddy", BUDDY_ACCEPTED: "buddy", SYSTEM: "system",
  };
  return m[t] ?? "system";
}

function fmtTime(d: Date): string {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  if (hrs < 48) return "เมื่อวาน";
  return `${Math.floor(hrs / 24)} วันที่แล้ว`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Load real notifications from DB
  useEffect(() => {
    getNotifications(50).then(({ data }) => {
      setNotifs(data.map((n) => ({
        id: n.id,
        type: mapType(n.type),
        actor: n.title,
        actorAvatar: n.title.charAt(0),
        text: n.body ?? n.title,
        subtext: undefined,
        time: fmtTime(n.createdAt),
        isRead: n.isRead,
        actionUrl: n.actionUrl ?? undefined,
        image: n.imageUrl ?? undefined,
      })));
    }).catch(() => {});
  }, []);

  const unreadCount = notifs.filter((n) => !n.isRead).length;
  const displayed = filter === "unread" ? notifs.filter((n) => !n.isRead) : notifs;

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markAllNotificationsRead().catch(() => {});
  }

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    markNotificationRead(id).catch(() => {});
  }

  // Group by today / yesterday / earlier
  const groups: { label: string; items: Notif[] }[] = [
    {
      label: "ใหม่",
      items: displayed.filter((n) => ["นาที", "ชั่วโมง"].some((k) => n.time.includes(k))),
    },
    {
      label: "เมื่อวาน",
      items: displayed.filter((n) => n.time === "เมื่อวาน"),
    },
    {
      label: "ก่อนหน้านี้",
      items: displayed.filter((n) => n.time.includes("วัน")),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">การแจ้งเตือน</h1>
              {unreadCount > 0 && (
                <span className="text-xs font-bold bg-[#398AB9] text-white px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs text-[#398AB9] hover:text-[#1C658C] font-medium"
              >
                <CheckCheck className="w-4 h-4" />
                อ่านทั้งหมด
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-[#398AB9] text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {f === "all" ? "ทั้งหมด" : `ยังไม่ได้อ่าน${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
              </button>
            ))}
          </div>
        </div>

        {/* Notification list */}
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="w-20 h-20 bg-[#398AB9]/8 rounded-full flex items-center justify-center mb-5">
              <Bell className="w-9 h-9 text-[#398AB9]/40" />
            </div>
            <p className="font-semibold text-gray-700 dark:text-slate-200 mb-1">
              {filter === "unread" ? "ไม่มีการแจ้งเตือนที่ยังไม่ได้อ่าน" : "ยังไม่มีการแจ้งเตือน"}
            </p>
            <p className="text-sm text-gray-400 dark:text-slate-500 max-w-xs">
              {filter === "unread"
                ? "คุณอ่านทุกอย่างหมดแล้ว 🎉"
                : "เมื่อมีคนถูกใจโพสต์ คอมเมนต์ หรือติดตามคุณ จะแสดงที่นี่"}
            </p>
            {filter === "unread" && (
              <button
                onClick={() => setFilter("all")}
                className="mt-4 text-sm text-[#398AB9] font-medium hover:underline"
              >
                ดูทั้งหมด
              </button>
            )}
          </div>
        ) : (
          <div>
            {groups.map((group) => (
              <div key={group.label}>
                <div className="px-4 md:px-6 py-2 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                    {group.label}
                  </span>
                </div>
                {group.items.map((notif) => {
                  const Icon = iconMap[notif.type];
                  const color = colorMap[notif.type];
                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markRead(notif.id);
                        if (notif.actionUrl) router.push(notif.actionUrl);
                      }}
                      className={`flex items-start gap-3 px-4 md:px-6 py-4 border-b border-gray-50 dark:border-slate-700/50 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 ${
                        !notif.isRead ? "bg-[#398AB9]/5 dark:bg-[#398AB9]/10" : ""
                      }`}
                    >
                      {/* Avatar + Icon badge */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          notif.type === "system" ? "bg-[#398AB9]" : "bg-gray-300 dark:bg-slate-600"
                        }`}>
                          {notif.actorAvatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${color} flex items-center justify-center border-2 border-white dark:border-slate-800`}>
                          <Icon className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-slate-200 leading-snug">
                          <span className="font-semibold">{notif.actor}</span>
                          {" "}{notif.text}
                        </p>
                        {notif.subtext && (
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{notif.subtext}</p>
                        )}
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">{notif.time}</p>
                      </div>

                      {/* Image preview or unread dot */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        {notif.image && (
                          <img
                            src={notif.image}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        )}
                        {!notif.isRead && !notif.image && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#398AB9] mt-1" />
                        )}
                        {!notif.isRead && notif.image && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#398AB9]" />
                        )}
                      </div>

                      {/* Buddy request action buttons */}
                      {notif.type === "buddy" && notif.isRead === false && (
                        <div className="absolute" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Buddy request card (special treatment) */}
        {displayed.some((n) => n.type === "buddy" && !n.isRead) && (
          <div className="m-4 bg-violet-50 border border-violet-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-violet-600" />
              <p className="text-sm font-semibold text-violet-800">คำขอร่วมทริป</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-300 flex items-center justify-center text-white text-sm font-bold">ณว</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-200">ณัฐพล ว.</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  เชียงใหม่ • 15–18 มิ.ย. 2026
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition">
                รับคำขอ
              </button>
              <button className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                ปฏิเสธ
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
