"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 bg-slate-800 text-white text-sm py-2 px-4 animate-in slide-in-from-top-2 duration-300">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span>คุณออฟไลน์อยู่ — เนื้อหาบางส่วนอาจไม่อัปเดต</span>
    </div>
  );
}
