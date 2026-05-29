"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  message?: string;
}

export default function RouteError({ error, reset, message }: RouteErrorProps) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-[#FF4F4F]" />
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {message ?? "บางอย่างผิดปกติ กรุณาลองใหม่อีกครั้ง"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-[#398AB9] text-white text-sm font-medium rounded-xl hover:bg-[#1C658C] transition"
          >
            <RefreshCw className="w-4 h-4" />
            ลองอีกครั้ง
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            <Home className="w-4 h-4" />
            หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
