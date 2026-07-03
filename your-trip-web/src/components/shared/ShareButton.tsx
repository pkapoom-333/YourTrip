"use client";

import { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { QRShareModal } from "./QRShareModal";

interface ShareButtonProps {
  url: string;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: "icon" | "text" | "full";
}

export function ShareButton({ url, title, subtitle, className = "", variant = "icon" }: ShareButtonProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith("http") ? url : `${typeof window !== "undefined" ? window.location.origin : ""}${url}`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: title ?? "YourTrip", url: fullUrl });
        return;
      } catch {
        // User cancelled or not supported — fall through
      }
    }
    setShowQR(true);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowQR(true);
    }
  }

  return (
    <>
      {variant === "icon" && (
        <button onClick={handleShare}
          className={`p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-[#398AB9] hover:bg-[#398AB9]/5 transition ${className}`}
          title="แชร์">
          <Share2 className="w-5 h-5" />
        </button>
      )}
      {variant === "text" && (
        <button onClick={handleShare}
          className={`flex items-center gap-1.5 text-sm text-[#398AB9] hover:underline font-medium ${className}`}>
          <Share2 className="w-4 h-4" />
          แชร์
        </button>
      )}
      {variant === "full" && (
        <div className={`flex gap-2 ${className}`}>
          <button onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#398AB9] text-white text-sm font-bold hover:bg-[#1C658C] transition shadow-sm shadow-[#398AB9]/20">
            <Share2 className="w-4 h-4" />
            แชร์
          </button>
          <button onClick={handleCopy}
            className={`w-11 flex items-center justify-center rounded-2xl border transition ${
              copied ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-[#398AB9] hover:text-[#398AB9]"
            }`}
            title="คัดลอกลิงก์">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
      <QRShareModal isOpen={showQR} onClose={() => setShowQR(false)} url={url} title={title} subtitle={subtitle} />
    </>
  );
}
