"use client";

import { AlertTriangle, RefreshCw, Home, WifiOff, Lock, ServerCrash } from "lucide-react";
import Link from "next/link";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  message?: string;
}

function categoriseError(error: Error): {
  icon: React.ReactNode;
  title: string;
  body: string;
} {
  const msg = error.message?.toLowerCase() ?? "";
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("connect")) {
    return {
      icon: <WifiOff className="w-7 h-7 text-amber-500" />,
      title: "ไม่สามารถเชื่อมต่อได้",
      body: "ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วลองใหม่อีกครั้ง",
    };
  }
  if (msg.includes("unauthorized") || msg.includes("403") || msg.includes("401")) {
    return {
      icon: <Lock className="w-7 h-7 text-[#FF4F4F]" />,
      title: "ไม่มีสิทธิ์เข้าถึง",
      body: "กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ",
    };
  }
  if (msg.includes("500") || msg.includes("server")) {
    return {
      icon: <ServerCrash className="w-7 h-7 text-orange-500" />,
      title: "เซิร์ฟเวอร์มีปัญหา",
      body: "เราทราบปัญหาแล้ว กรุณาลองใหม่ในอีกสักครู่",
    };
  }
  return {
    icon: <AlertTriangle className="w-7 h-7 text-[#FF4F4F]" />,
    title: "เกิดข้อผิดพลาด",
    body: "บางอย่างผิดปกติ กรุณาลองใหม่อีกครั้ง",
  };
}

export default function RouteError({ error, reset, message }: RouteErrorProps) {
  if (process.env.NODE_ENV === "development") {
    console.error("[RouteError]", error);
  }

  const { icon, title, body } = categoriseError(error);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
          {message ?? body}
        </p>
        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="text-[10px] font-mono text-gray-300 mb-4">digest: {error.digest}</p>
        )}
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            <Home className="w-4 h-4" />
            หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
