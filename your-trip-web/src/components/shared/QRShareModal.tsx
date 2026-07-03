"use client";

import { useState, useEffect } from "react";
import { X, Share2, Copy, Check, Download, QrCode } from "lucide-react";

interface QRShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  subtitle?: string;
}

export function QRShareModal({ isOpen, onClose, url, title, subtitle }: QRShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const fullUrl = url.startsWith("http") ? url : `https://yourtrip.app${url}`;

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  if (!isOpen) return null;

  // Use qrserver.com — free, no signup, HTTPS, reliable
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&color=398AB9&bgcolor=F8FAFC&data=${encodeURIComponent(fullUrl)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: title ?? "Your Trip", url: fullUrl });
    } catch {}
  }

  function downloadQR() {
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = "yourtrip-qr.png";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#398AB9]" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">แชร์ลิงก์</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center px-5 pt-5 pb-4">
          {title && <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1 text-center">{title}</p>}
          {subtitle && <p className="text-xs text-gray-400 dark:text-slate-500 mb-4 text-center">{subtitle}</p>}

          <div className="p-3 bg-[#F8FAFC] dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt="QR Code"
              width={220}
              height={220}
              className="rounded-lg"
              loading="lazy"
            />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-3 text-center">
            สแกน QR เพื่อเปิดลิงก์
          </p>
        </div>

        {/* URL bar */}
        <div className="mx-5 mb-4 flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 rounded-xl px-3 py-2.5">
          <p className="flex-1 text-xs text-gray-600 dark:text-slate-300 truncate font-mono">{fullUrl}</p>
          <button onClick={copyLink}
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition ${
              copied
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-[#398AB9]/10 text-[#398AB9] hover:bg-[#398AB9]/20"
            }`}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "คัดลอกแล้ว" : "คัดลอก"}
          </button>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 px-5 pb-5">
          <button
            onClick={downloadQR}
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 px-4 py-2.5 rounded-xl transition">
            <Download className="w-4 h-4" />
            บันทึก QR
          </button>
          {canNativeShare ? (
            <button
              onClick={nativeShare}
              className="flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-[#398AB9] hover:bg-[#1C658C] px-4 py-2.5 rounded-xl transition">
              <Share2 className="w-4 h-4" />
              แชร์
            </button>
          ) : (
            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-[#398AB9] hover:bg-[#1C658C] px-4 py-2.5 rounded-xl transition">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
