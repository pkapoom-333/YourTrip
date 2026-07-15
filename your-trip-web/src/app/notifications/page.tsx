"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Bell, Heart, MessageCircle, UserPlus, Users, MapPin, CheckCheck, CornerDownLeft, Send } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/actions/notifications";
import { createComment } from "@/server/actions/posts";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";

type NotifType = "like" | "comment" | "follow" | "buddy" | "system";

interface Notif {
  id: string;
  type: NotifType;
  actor: string;
  actorAvatar: string | null;   // null = use initials fallback
  actorId: string | null;
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

/** Extract postId from actionUrl like "/post/abc123" */
function extractPostId(actionUrl?: string): string | null {
  if (!actionUrl) return null;
  const m = actionUrl.match(/^\/post\/([^/?#]+)/);
  return m ? m[1] : null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  // Quick-reply state
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<Record<string, boolean>>({});
  const [replyDone, setReplyDone] = useState<Record<string, boolean>>({});
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Load real notifications from DB
  useEffect(() => {
    getNotifications(50).then(({ data }) => {
      setNotifs(data.map((n) => ({
        id: n.id,
        type: mapType(n.type),
        actor: n.actorName ?? n.title,
        actorAvatar: n.actorAvatar ?? null,
        actorId: n.actorId,
        text: n.body ?? n.title,
        subtext: undefined,
        time: fmtTime(n.createdAt),
        isRead: n.isRead,
        actionUrl: n.actionUrl ?? undefined,
        image: n.imageUrl ?? undefined,
      })));
    }).catch(() => {});
  }, []);

  // Supabase Realtime — prepend new notifications as they arrive
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    if (!("channel" in supabase)) return;

    const ch = (supabase as any)
      .channel(`notifs-page-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `userId=eq.${user.id}` },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new;
          const newNotif: Notif = {
            id: row.id as string,
            type: mapType(row.type as string),
            actor: (row.title as string | undefined) ?? "Your Trip",
            actorAvatar: (row.imageUrl as string | null) ?? null,
            actorId: (row.actorId as string | null) ?? null,
            text: (row.body as string | undefined) ?? (row.title as string),
            time: fmtTime(new Date(row.createdAt as string)),
            isRead: false,
            actionUrl: (row.actionUrl as string | undefined) ?? "/notifications",
          };
          setNotifs((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
        }
      )
      .subscribe();

    return () => { (supabase as any).removeChannel(ch); };
  }, [user?.id]);

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

  const handleQuickReply = useCallback(async (notifId: string, postId: string) => {
    const text = (replyTexts[notifId] ?? "").trim();
    if (!text) return;
    setReplying((prev) => ({ ...prev, [notifId]: true }));
    try {
      const { error } = await createComment(postId, text);
      if (!error) {
        setReplyDone((prev) => ({ ...prev, [notifId]: true }));
        setReplyTexts((prev) => ({ ...prev, [notifId]: "" }));
        setReplyOpenId(null);
        // auto-clear "replied" badge after 3s
        setTimeout(() => setReplyDone((prev) => { const n = { ...prev }; delete n[notifId]; return n; }), 3000);
      }
    } finally {
      setReplying((prev) => ({ ...prev, [notifId]: false }));
    }
  }, [replyTexts]);

  // Focus the reply textarea when it opens
  useEffect(() => {
    if (replyOpenId && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyOpenId]);

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
                  const postId = notif.type === "comment" ? extractPostId(notif.actionUrl) : null;
                  const isReplyOpen = replyOpenId === notif.id;
                  const isDone = replyDone[notif.id] ?? false;
                  return (
                    <div key={notif.id} className={`border-b border-gray-50 dark:border-slate-700/50 ${!notif.isRead ? "bg-[#398AB9]/5 dark:bg-[#398AB9]/10" : ""}`}>
                      {/* Main row */}
                      <div
                        onClick={() => {
                          if (isReplyOpen) return;
                          markRead(notif.id);
                          if (notif.actionUrl) router.push(notif.actionUrl);
                        }}
                        className="flex items-start gap-3 px-4 md:px-6 py-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50"
                      >
                        {/* Avatar + Icon badge */}
                        <div className="relative flex-shrink-0">
                          <Avatar
                            src={notif.actorAvatar}
                            name={notif.actor}
                            className="w-11 h-11"
                          />
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
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[11px] text-gray-400 dark:text-slate-500">{notif.time}</p>
                            {/* Quick-reply trigger for comment notifications */}
                            {postId && (
                              isDone ? (
                                <span className="text-[11px] text-emerald-500 font-medium">✓ ตอบกลับแล้ว</span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markRead(notif.id);
                                    setReplyOpenId(isReplyOpen ? null : notif.id);
                                  }}
                                  className="flex items-center gap-1 text-[11px] text-[#398AB9] font-medium hover:text-[#1C658C] transition-colors"
                                >
                                  <CornerDownLeft className="w-3 h-3" />
                                  ตอบกลับ
                                </button>
                              )
                            )}
                          </div>
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
                      </div>

                      {/* Inline quick-reply area — only for comment notifications with a postId */}
                      {postId && isReplyOpen && (
                        <div
                          className="px-4 md:px-6 pb-4 pt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-end gap-2 bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2 border border-gray-200 dark:border-slate-600 focus-within:border-[#398AB9] transition-colors">
                            <textarea
                              ref={replyInputRef}
                              rows={2}
                              value={replyTexts[notif.id] ?? ""}
                              onChange={(e) => setReplyTexts((prev) => ({ ...prev, [notif.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleQuickReply(notif.id, postId);
                                }
                                if (e.key === "Escape") setReplyOpenId(null);
                              }}
                              placeholder={`ตอบกลับ ${notif.actor}...`}
                              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 resize-none outline-none min-h-[44px]"
                            />
                            <button
                              onClick={() => handleQuickReply(notif.id, postId)}
                              disabled={!(replyTexts[notif.id] ?? "").trim() || replying[notif.id]}
                              className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#398AB9] disabled:bg-gray-200 dark:disabled:bg-slate-600 text-white disabled:text-gray-400 dark:disabled:text-slate-500 flex items-center justify-center transition-colors hover:bg-[#1C658C] disabled:cursor-not-allowed"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5 ml-1">Enter ส่ง · Esc ยกเลิก</p>
                        </div>
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
