"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#398AB9] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#1C658C] rounded-full opacity-40" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#1C658C] rounded-full opacity-30" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-white inline-block">Your Trip</Link>
          <p className="text-white/65 text-sm mt-1">สังคมแห่งการท่องเที่ยว</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl">
          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">ส่งลิงก์แล้ว!</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                ตรวจสอบอีเมล <span className="font-semibold text-gray-700 dark:text-slate-300">{email}</span> เพื่อรีเซ็ตรหัสผ่าน
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">
                ไม่ได้รับอีเมล? ตรวจสอบโฟลเดอร์ Spam หรือ
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="w-full py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                ลองอีกครั้ง
              </button>
              <Link href="/login" className="block text-center text-[#398AB9] text-sm font-medium mt-4 hover:underline">
                กลับไปล็อกอิน
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <Link href="/login" className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 mb-6 transition">
                <ArrowLeft className="w-4 h-4" />
                กลับไปล็อกอิน
              </Link>

              <h2 className="text-2xl font-bold text-[#398AB9] mb-2">ลืมรหัสผ่าน?</h2>
              <p className="text-sm text-gray-400 dark:text-slate-500 mb-6">
                กรอกอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#398AB9]" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10 text-sm bg-[#F8FBFE] dark:bg-slate-700/50 text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1C658C] hover:bg-[#398AB9] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-sm shadow-md shadow-[#1C658C]/30"
                >
                  {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
