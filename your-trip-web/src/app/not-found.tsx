"use client";

import Link from "next/link";
import { MapPin, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="relative inline-block mb-8">
          <div className="w-40 h-40 bg-[#398AB9]/10 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-16 h-16 text-[#398AB9]" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
            🗺️
          </div>
        </div>

        {/* Text */}
        <h1 className="text-6xl font-black text-[#398AB9] mb-3">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-3">ไม่พบหน้าที่คุณค้นหา</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          ดูเหมือนคุณหลงทาง 🧭<br />
          หน้านี้อาจถูกลบ ย้าย หรือไม่เคยมีอยู่ก็ได้
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#398AB9] text-white rounded-2xl font-semibold hover:bg-[#1C658C] transition-colors shadow-md shadow-[#398AB9]/30"
          >
            <Home className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
          <Link
            href="/explore"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            สำรวจสถานที่
          </Link>
        </div>

        {/* Back button */}
        <button
          onClick={() => history.back()}
          className="mt-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition mx-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
}
