"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Home, PlusSquare, MapPin, User,
  Compass, Bell, Settings, Users, LogOut, UserSearch, BookMarked, Bookmark, Flame, Search, MessageSquare, Receipt, TrendingUp, Activity, SlidersHorizontal, UserPlus, Navigation, Trophy, Share2 as ShareIcon, CheckSquare, Map,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { getUnreadCount } from "@/server/actions/notifications";
import { getTotalUnreadMessages } from "@/server/actions/messages";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useToast } from "@/components/shared/Toast";

// Desktop sidebar nav (all items)
const sidebarItems = [
  { href: "/feed",          icon: Home,          label: "หน้าหลัก" },
  { href: "/explore",       icon: Compass,       label: "สำรวจ" },
  { href: "/trips",         icon: MapPin,        label: "ทริป" },
  { href: "/messages",      icon: MessageSquare, label: "ข้อความ" },
  { href: "/search",        icon: Search,        label: "ค้นหา" },
  { href: "/compare",       icon: SlidersHorizontal, label: "เปรียบเทียบ" },
  { href: "/people",        icon: UserSearch,    label: "ค้นหาคน" },
  { href: "/saved",          icon: Bookmark,      label: "บันทึกไว้" },
  { href: "/map",             icon: Map,           label: "แผนที่" },
  { href: "/near-me",         icon: Navigation,    label: "ใกล้ฉัน" },
  { href: "/collections",   icon: BookMarked,    label: "คอลเลกชัน" },
  { href: "/trending",      icon: TrendingUp,    label: "กำลังนิยม" },
  { href: "/popular",       icon: Flame,         label: "ยอดนิยม" },
  { href: "/leaderboard",   icon: Trophy,        label: "ลีดเดอร์บอร์ด" },
  { href: "/invite",         icon: ShareIcon,     label: "ชวนเพื่อน" },
  { href: "/activity",      icon: Activity,      label: "กิจกรรม" },
  { href: "/check-ins",      icon: CheckSquare,   label: "เช็คอิน" },
  { href: "/buddy",         icon: Users,         label: "Travel Buddy" },
  { href: "/expense",       icon: Receipt,       label: "หารค่าใช้จ่าย" },
  { href: "/profile",       icon: User,          label: "โปรไฟล์" },
];

// Mobile bottom nav (4 items + center create button)
const mobileNavLeft = [
  { href: "/feed",    icon: Home,          label: "หน้าหลัก" },
  { href: "/explore", icon: Compass,       label: "สำรวจ" },
];
const mobileNavRight = [
  { href: "/messages", icon: MessageSquare, label: "ข้อความ" },
  { href: "/profile",  icon: User,          label: "โปรไฟล์" },
];

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "YT";
}

function getNotifPref(key: string, def = true): boolean {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? def : JSON.parse(raw) as boolean;
  } catch { return def; }
}

function isNotifTypeAllowed(type: string): boolean {
  switch (type) {
    case "LIKE":           return getNotifPref("settings_notif_like");
    case "COMMENT":        return getNotifPref("settings_notif_comment");
    case "MENTION":        return getNotifPref("settings_notif_comment");
    case "FOLLOW":         return getNotifPref("settings_notif_follow");
    case "BUDDY_REQUEST":  return getNotifPref("settings_notif_buddy");
    case "BUDDY_MATCH":    return getNotifPref("settings_notif_buddy");
    default:               return true;
  }
}

// Called ONCE in AppShell — never from Sidebar/BottomNav directly
function useNotificationBadge() {
  const { user } = useUser();
  const [unread, setUnread] = useState(0);
  const [msgUnread, setMsgUnread] = useState(0);
  const { info } = useToast();
  const infoRef = useRef(info);
  useEffect(() => { infoRef.current = info; }, [info]);

  // Initial fetch
  useEffect(() => {
    getUnreadCount().then(({ count }) => setUnread(count)).catch(() => {});
    getTotalUnreadMessages().then((n) => setMsgUnread(n)).catch(() => {});
  }, []);

  // Supabase Realtime — notifications
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`notif-badge-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `userId=eq.${user.id}` },
        (payload: { new: Record<string, unknown> }) => {
          setUnread((n) => n + 1);
          const title = payload.new.title as string | undefined;
          const type = (payload.new.type as string | undefined) ?? "";
          if (title && isNotifTypeAllowed(type) && getNotifPref("settings_notif_push")) {
            infoRef.current(`🔔 ${title}`);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // Supabase Realtime — new messages directed to current user
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`msg-badge-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: { new: Record<string, unknown> }) => {
          // Only count messages sent by others
          if (payload.new.senderId !== user.id) {
            setMsgUnread((n) => n + 1);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return { unread, setUnread, msgUnread, setMsgUnread };
}

interface BadgeProps {
  unread: number;
  setUnread: (n: number) => void;
  msgUnread: number;
  setMsgUnread: (n: number) => void;
}

/** Desktop sidebar — hidden on mobile */
function Sidebar({ unread, setUnread, msgUnread, setMsgUnread }: BadgeProps) {
  const path = usePathname();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (path === "/notifications") setUnread(0);
    if (path.startsWith("/messages")) setMsgUnread(0);
  }, [path, setUnread, setMsgUnread]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Your Trip User";
  const initials = getInitials(user?.user_metadata?.full_name as string | undefined, user?.email);

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 z-40 px-4 py-6">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-[#398AB9] px-3 mb-8 inline-block">
        Your Trip
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {sidebarItems.map(({ href, icon: Icon, label }) => {
          const active = path === href || path.startsWith(href + "/");
          const isMsg = href === "/messages";
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-[#398AB9]/10 text-[#398AB9]"
                  : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-100"
              }`}>
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
                {isMsg && msgUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 bg-[#398AB9] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {msgUnread > 9 ? "9+" : msgUnread}
                  </span>
                )}
              </div>
              {label}
              {isMsg && msgUnread > 0 && (
                <span className="ml-auto text-[11px] font-bold bg-[#398AB9] text-white px-1.5 py-0.5 rounded-full">
                  {msgUnread}
                </span>
              )}
            </Link>
          );
        })}

        {/* Create post */}
        <Link href="/create"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-[#398AB9] text-white hover:bg-[#1C658C] transition-colors mt-4">
          <PlusSquare className="w-5 h-5" />
          โพสต์ใหม่
        </Link>
      </nav>

      {/* Bottom utilities */}
      <div className="space-y-1 pt-4 border-t border-gray-100 dark:border-slate-700">
        <Link href="/notifications"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
            path === "/notifications"
              ? "bg-[#398AB9]/10 text-[#398AB9]"
              : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
          }`}>
          <div className="relative">
            <Bell className="w-5 h-5" strokeWidth={1.8} />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </div>
          การแจ้งเตือน
          {unread > 0 && (
            <span className="ml-auto text-[11px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </Link>
        <Link href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
            path === "/settings"
              ? "bg-[#398AB9]/10 text-[#398AB9]"
              : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
          }`}>
          <Settings className="w-5 h-5" strokeWidth={1.8} />
          ตั้งค่า
        </Link>
      </div>

      {/* User card */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-[#398AB9] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{displayName}</p>
            {user?.email && (
              <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{user.email}</p>
            )}
          </div>
          {user && (
            <button
              onClick={handleSignOut}
              title="ออกจากระบบ"
              className="text-gray-300 dark:text-slate-500 hover:text-red-400 transition p-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

/** Mobile bottom nav — hidden on desktop */
function BottomNav({ unread, setUnread, msgUnread, setMsgUnread }: BadgeProps) {
  const path = usePathname();

  useEffect(() => {
    if (path === "/notifications") setUnread(0);
    if (path.startsWith("/messages")) setMsgUnread(0);
  }, [path, setUnread, setMsgUnread]);

  function NavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
    const active = path === href || path.startsWith(href + "/");
    const isMsg = href === "/messages";
    const badge = isMsg ? msgUnread : 0;
    return (
      <Link href={href}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[52px] relative ${active ? "text-[#398AB9]" : "text-gray-400 dark:text-slate-500"}`}
      >
        <div className="relative">
          <Icon className={`w-5 h-5 ${active ? "text-[#398AB9]" : ""}`} />
          {badge > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4F4F] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </div>
        <span className={`text-[10px] font-medium ${active ? "text-[#398AB9]" : ""}`}>{label}</span>
      </Link>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {mobileNavLeft.map((item) => <NavItem key={item.href} {...item} />)}

        {/* Center create button */}
        <Link href="/create"
          className="flex flex-col items-center gap-0.5 relative -top-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#398AB9] shadow-lg shadow-[#398AB9]/30 flex items-center justify-center transition hover:bg-[#1C658C] active:scale-95">
            <PlusSquare className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-medium text-[#398AB9]">โพสต์</span>
        </Link>

        {mobileNavRight.map((item) => <NavItem key={item.href} {...item} />)}
      </div>
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { unread, setUnread, msgUnread, setMsgUnread } = useNotificationBadge();
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900">
      <Sidebar unread={unread} setUnread={setUnread} msgUnread={msgUnread} setMsgUnread={setMsgUnread} />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav unread={unread} setUnread={setUnread} msgUnread={msgUnread} setMsgUnread={setMsgUnread} />
    </div>
  );
}
