"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Bell, Heart, MessageCircle, UserPlus, Users, MapPin, CheckCheck } from "lucide-react";

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

const MOCK: Notif[] = [
  {
    id: "1",
    type: "like",
    actor: "มินตรา พ.",
    actorAvatar: "มต",
    text: "ถูกใจโพสต์ของคุณ",
    subtext: "\"วิวยามเช้าที่ดอยอ่างขาง 🌄 หนาวมากแต่สวยมาก\"",
    time: "5 นาทีที่แล้ว",
    isRead: false,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=80&fit=crop",
  },
  {
    id: "2",
    type: "comment",
    actor: "ภาณุวัฒน์ ร.",
    actorAvatar: "ภว",
    text: "แสดงความคิดเห็นในโพสต์ของคุณ",
    subtext: "\"แบ่งปันเส้นทางด้วยได้ไหมครับ?\"",
    time: "12 นาทีที่แล้ว",
    isRead: false,
  },
  {
    id: "3",
    type: "follow",
    actor: "สิริมา ก.",
    actorAvatar: "สก",
    text: "เริ่มติดตามคุณ",
    time: "1 ชั่วโมงที่แล้ว",
    isRead: false,
  },
  {
    id: "4",
    type: "buddy",
    actor: "ณัฐพล ว.",
    actorAvatar: "ณว",
    text: "ส่งคำขอร่วมทริปมาให้คุณ",
    subtext: "เชียงใหม่ • 15–18 มิ.ย. 2026",
    time: "2 ชั่วโมงที่แล้ว",
    isRead: false,
  },
  {
    id: "5",
    type: "like",
    actor: "พิมพ์พิศา ส.",
    actorAvatar: "พส",
    text: "และอีก 4 คนถูกใจโพสต์ของคุณ",
    subtext: "\"คาเฟ่วิวดอยที่ต้องไป ☕\"",
    time: "5 ชั่วโมงที่แล้ว",
    isRead: true,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=80&h=80&fit=crop",
  },
  {
    id: "6",
    type: "comment",
    actor: "วราภรณ์ จ.",
    actorAvatar: "วจ",
    text: "ตอบกลับความคิดเห็นของคุณ",
    subtext: "\"ใช่เลยค่ะ! ต้องจองล่วงหน้า\"",
    time: "เมื่อวาน",
    isRead: true,
  },
  {
    id: "7",
    type: "buddy",
    actor: "ปิยะดา ล.",
    actorAvatar: "ปล",
    text: "ตอบรับคำขอร่วมทริปของคุณ",
    subtext: "ภูเก็ต • 20–25 มิ.ย. 2026",
    time: "เมื่อวาน",
    isRead: true,
  },
  {
    id: "8",
    type: "system",
    actor: "Your Trip",
    actorAvatar: "YT",
    text: "โปรไฟล์ของคุณได้รับการยืนยันแล้ว",
    subtext: "คุณสามารถสร้างโพสต์และวางแผนทริปได้เต็มรูปแบบ",
    time: "2 วันที่แล้ว",
    isRead: true,
  },
];

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

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(MOCK);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifs.filter((n) => !n.isRead).length;
  const displayed = filter === "unread" ? notifs.filter((n) => !n.isRead) : notifs;

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
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
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">การแจ้งเตือน</h1>
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
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {f === "all" ? "ทั้งหมด" : `ยังไม่ได้อ่าน${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
              </button>
            ))}
          </div>
        </div>

        {/* Notification list */}
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">ไม่มีการแจ้งเตือนใหม่</p>
          </div>
        ) : (
          <div>
            {groups.map((group) => (
              <div key={group.label}>
                <div className="px-4 md:px-6 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {group.label}
                  </span>
                </div>
                {group.items.map((notif) => {
                  const Icon = iconMap[notif.type];
                  const color = colorMap[notif.type];
                  return (
                    <div
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={`flex items-start gap-3 px-4 md:px-6 py-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                        !notif.isRead ? "bg-[#398AB9]/5" : ""
                      }`}
                    >
                      {/* Avatar + Icon badge */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          notif.type === "system" ? "bg-[#398AB9]" : "bg-gray-300"
                        }`}>
                          {notif.actorAvatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${color} flex items-center justify-center border-2 border-white`}>
                          <Icon className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-snug">
                          <span className="font-semibold">{notif.actor}</span>
                          {" "}{notif.text}
                        </p>
                        {notif.subtext && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{notif.subtext}</p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-1">{notif.time}</p>
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
                <p className="text-sm font-medium text-gray-800">ณัฐพล ว.</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  เชียงใหม่ • 15–18 มิ.ย. 2026
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition">
                รับคำขอ
              </button>
              <button className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                ปฏิเสธ
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
