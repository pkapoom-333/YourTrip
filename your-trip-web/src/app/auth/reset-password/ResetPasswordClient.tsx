"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("รหัสผ่านไม่ตรงกัน"); return; }
    if (password.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return; }

    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/feed"), 2500);
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
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">กำลังพาคุณไปยังหน้าหลัก...</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[#398AB9] mb-2">ตั้งรหัสผ่านใหม่</h2>
              <p className="text-sm text-gray-400 dark:text-slate-500 mb-6">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#398AB9]" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="รหัสผ่านใหม่"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10 text-sm bg-[#F8FBFE] dark:bg-slate-700/50 dark:text-slate-200"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#398AB9]" />
                  <input
                    type="password"
                    placeholder="ยืนยันรหัสผ่าน"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#398AB9] focus:ring-2 focus:ring-[#398AB9]/10 text-sm bg-[#F8FBFE] dark:bg-slate-700/50 dark:text-slate-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1C658C] hover:bg-[#398AB9] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-sm shadow-md shadow-[#1C658C]/30"
                >
                  {loading ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
