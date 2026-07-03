"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { Share2, Copy, Check, Users, Link as LinkIcon, MessageCircle, Gift } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/components/shared/Toast";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-trip-nu.vercel.app";

const SHARE_MESSAGES = [
  "มาร่วมสำรวจสถานที่ท่องเที่ยวด้วยกันบน Your Trip! แอปสังคมนักเดินทาง 🌏",
  "ค้นพบสถานที่ใหม่ วางแผนทริป แชร์ประสบการณ์ — ทุกอย่างในที่เดียว 📍",
  "Your Trip — แพลตฟอร์มนักเดินทางที่ดีที่สุดในไทย ลองเลยนะ! ✈️",
];

export default function InvitePage() {
  const { user } = useUser();
  const { success, info } = useToast();
  const [copied, setCopied] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);

  // Derive a simple invite code from user ID
  const inviteCode = user?.id?.slice(0, 8).toUpperCase() ?? "YOURTRIP";
  const inviteUrl = `${SITE_URL}/register?ref=${inviteCode}`;
  const shareMsg = SHARE_MESSAGES[msgIdx];

  // Rotate message every 5s
  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % SHARE_MESSAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      success("คัดลอกลิงก์แล้ว!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      info("กรุณาคัดลอกลิงก์ด้วยตนเอง");
    }
  }

  async function nativeShare() {
    if (!navigator.share) { copyLink(); return; }
    try {
      await navigator.share({
        title: "Your Trip — สังคมนักเดินทาง",
        text: shareMsg,
        url: inviteUrl,
      });
    } catch {
      // User cancelled
    }
  }

  function lineShare() {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shareMsg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function fbShare() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function xShare() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg + "\n" + inviteUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <AppShell>
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#398AB9]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-10 h-10 text-[#398AB9]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">ชวนเพื่อนร่วมเดินทาง</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            แชร์ Your Trip ให้เพื่อนและครอบครัวร่วมสำรวจสถานที่ท่องเที่ยวด้วยกัน
          </p>
        </div>

        {/* Invite Link Box */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <LinkIcon className="w-4 h-4 text-[#398AB9]" />
            <p className="text-xs font-semibold text-gray-600 dark:text-slate-400">ลิงก์เชิญของคุณ</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-gray-50 dark:bg-slate-700 rounded-xl px-3 py-2.5 border border-gray-200 dark:border-slate-600">
              <p className="text-xs font-mono text-gray-700 dark:text-slate-200 truncate">{inviteUrl}</p>
            </div>
            <button
              onClick={copyLink}
              className={`flex-shrink-0 p-2.5 rounded-xl border transition ${
                copied
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
                  : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-[#398AB9] hover:text-[#398AB9]"
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {user && (
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-2 text-center">
              โค้ดของคุณ: <span className="font-mono font-semibold text-[#398AB9]">{inviteCode}</span>
            </p>
          )}
        </div>

        {/* Share message preview */}
        <div className="bg-[#398AB9]/5 dark:bg-[#398AB9]/10 rounded-2xl p-4 mb-5">
          <p className="text-xs font-semibold text-[#398AB9] mb-1.5">ข้อความที่จะส่ง</p>
          <p className="text-sm text-gray-700 dark:text-slate-200 leading-relaxed transition-all">{shareMsg}</p>
        </div>

        {/* Share buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={nativeShare}
            className="w-full flex items-center gap-3 bg-[#398AB9] hover:bg-[#1C658C] text-white py-3.5 px-4 rounded-2xl font-semibold text-sm transition active:scale-95"
          >
            <Share2 className="w-5 h-5" />
            แชร์เลย
          </button>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={lineShare}
              className="flex flex-col items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-3 px-2 rounded-2xl text-xs font-semibold transition"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
              LINE
            </button>
            <button
              onClick={fbShare}
              className="flex flex-col items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-3 px-2 rounded-2xl text-xs font-semibold transition"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
            <button
              onClick={xShare}
              className="flex flex-col items-center gap-1.5 bg-black hover:bg-gray-800 text-white py-3 px-2 rounded-2xl text-xs font-semibold transition"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#398AB9]" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">ทำไมต้องชวนเพื่อน?</h2>
          </div>
          <div className="space-y-3">
            {[
              { emoji: "🗺️", title: "วางแผนทริปร่วมกัน", desc: "สร้างและแชร์ itinerary กับเพื่อนๆ ได้ทันที" },
              { emoji: "📸", title: "แชร์ประสบการณ์", desc: "โพสต์รูปและรีวิวสถานที่ที่ไปด้วยกัน" },
              { emoji: "🤝", title: "หาเพื่อนร่วมทาง", desc: "เจอคนที่สนใจท่องเที่ยวเหมือนกัน" },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 text-base">
                  {item.emoji}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{item.title}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat bubble icon */}
        <div className="mt-5 flex items-center gap-2 justify-center text-xs text-gray-400 dark:text-slate-500">
          <MessageCircle className="w-3.5 h-3.5" />
          ชวนได้ไม่จำกัด — ยิ่งเยอะยิ่งสนุก!
        </div>
      </div>
    </AppShell>
  );
}
