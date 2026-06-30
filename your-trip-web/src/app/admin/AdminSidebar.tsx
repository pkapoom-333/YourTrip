"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Flag, MapPin, ShieldCheck,
  MessageSquare, ChevronRight, Menu, X, BarChart2, FileText, Megaphone,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/admin/users", label: "ผู้ใช้", icon: Users },
  { href: "/admin/reports", label: "รายงาน", icon: Flag },
  { href: "/admin/places", label: "สถานที่", icon: MapPin },
  { href: "/admin/guides", label: "ไกด์", icon: ShieldCheck },
  { href: "/admin/messages", label: "ข้อความ", icon: MessageSquare },
  { href: "/admin/content", label: "โพสต์", icon: FileText },
  { href: "/admin/broadcast", label: "Broadcast", icon: Megaphone },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? "bg-[#398AB9] text-white"
                : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            {active && <ChevronRight className="w-3 h-3 ml-auto" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setOpen(true)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-gray-900 dark:text-white">Admin Panel</span>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="bg-black/40 absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-56 h-full p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#398AB9]">Admin</span>
              <button onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <NavLinks />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex-col p-4 gap-6 z-30">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 bg-[#398AB9] rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm">Admin Panel</span>
        </div>
        <NavLinks />
        <div className="mt-auto">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </aside>
    </>
  );
}
