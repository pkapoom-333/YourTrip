"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, MapPin, User } from "lucide-react";

const nav = [
  { href: "/feed",    icon: Home,       label: "หน้าหลัก" },
  { href: "/explore", icon: Search,     label: "ค้นหา" },
  { href: "/create",  icon: PlusSquare, label: "โพสต์",   highlight: true },
  { href: "/trips",   icon: MapPin,     label: "ทริป" },
  { href: "/profile", icon: User,       label: "โปรไฟล์" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {nav.map(({ href, icon: Icon, label, highlight }) => {
          const active = path === href;
          if (highlight) {
            return (
              <Link key={href} href={href}
                className="flex flex-col items-center -mt-6">
                <div className="w-12 h-12 rounded-2xl bg-[#398AB9] flex items-center justify-center shadow-lg shadow-[#398AB9]/40">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-[#398AB9] font-medium mt-1">{label}</span>
              </Link>
            );
          }
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1">
              <Icon className={`w-5 h-5 ${active ? "text-[#398AB9]" : "text-gray-400"}`} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] ${active ? "text-[#398AB9] font-semibold" : "text-gray-400"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
