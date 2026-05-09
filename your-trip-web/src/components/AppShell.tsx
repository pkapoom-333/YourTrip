"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Search, PlusSquare, MapPin, User,
  Compass, Bell, Settings, LogOut,
} from "lucide-react";

const navItems = [
  { href: "/feed",    icon: Home,       label: "หน้าหลัก" },
  { href: "/explore", icon: Compass,    label: "สำรวจ" },
  { href: "/trips",   icon: MapPin,     label: "ทริป" },
  { href: "/profile", icon: User,       label: "โปรไฟล์" },
];

/** Desktop sidebar — hidden on mobile */
function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-40 px-4 py-6">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-[#398AB9] px-3 mb-8 inline-block">
        Your Trip
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-[#398AB9]/10 text-[#398AB9]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}>
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              {label}
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

      {/* Bottom */}
      <div className="space-y-1 pt-4 border-t border-gray-100">
        <Link href="/notifications"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition">
          <Bell className="w-5 h-5" strokeWidth={1.8} />
          การแจ้งเตือน
        </Link>
        <Link href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition">
          <Settings className="w-5 h-5" strokeWidth={1.8} />
          ตั้งค่า
        </Link>
      </div>
    </aside>
  );
}

/** Mobile bottom nav — hidden on desktop */
function BottomNav() {
  const path = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1 min-w-0">
              <Icon className={`w-5 h-5 ${active ? "text-[#398AB9]" : "text-gray-400"}`}
                strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] ${active ? "text-[#398AB9] font-semibold" : "text-gray-400"}`}>
                {label}
              </span>
            </Link>
          );
        })}
        <Link href="/create" className="flex flex-col items-center gap-0.5 px-3 py-1 -mt-4">
          <div className="w-11 h-11 rounded-2xl bg-[#398AB9] flex items-center justify-center shadow-lg shadow-[#398AB9]/30">
            <PlusSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] text-[#398AB9] font-semibold">โพสต์</span>
        </Link>
      </div>
    </nav>
  );
}

/** Wrap app pages with this */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      {/* main content shifts right on desktop */}
      <main className="md:pl-64 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
