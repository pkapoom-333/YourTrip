"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 bg-[#398AB9]/10 rounded-full flex items-center justify-center mb-6">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#398AB9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่มีการเชื่อมต่ออินเทอร์เน็ต</h1>
      <p className="text-sm text-gray-500 max-w-xs mb-8">
        โปรดตรวจสอบการเชื่อมต่อ WiFi หรือเน็ตมือถือ แล้วลองใหม่อีกครั้ง
      </p>

      <button
        onClick={() => window.location.reload()}
        className="bg-[#398AB9] text-white font-semibold px-8 py-3 rounded-2xl hover:bg-[#1C658C] transition mb-4"
      >
        ลองใหม่
      </button>

      <Link href="/" className="text-sm text-[#398AB9] hover:underline">
        กลับหน้าหลัก
      </Link>

      <p className="mt-12 text-[11px] text-gray-300">Your Trip — สังคมนักเดินทาง</p>
    </div>
  );
}
