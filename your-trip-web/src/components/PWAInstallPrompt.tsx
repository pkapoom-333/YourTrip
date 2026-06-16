"use client";

import { useState, useEffect } from "react";
import { Smartphone, X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (within 3 days)
    const dismissed = localStorage.getItem("pwa_prompt_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    // iOS detection
    const ua = navigator.userAgent;
    const iosDevice = /iphone|ipad|ipod/i.test(ua);
    const safari = /safari/i.test(ua) && !/chrome/i.test(ua);

    if (iosDevice && safari) {
      setIsIOS(true);
      setTimeout(() => setShow(true), 3000);
      return;
    }

    // Android / Chrome: listen for beforeinstallprompt
    function handlePrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 3000);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  function handleDismiss() {
    setShow(false);
    localStorage.setItem("pwa_prompt_dismissed", String(Date.now()));
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setShow(false);
    setDeferredPrompt(null);
  }

  if (!show || isInstalled) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-[#398AB9] rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">ติดตั้ง Your Trip</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">เข้าถึงได้ทุกที่ แม้ออฟไลน์</p>
          </div>
        </div>

        {isIOS ? (
          <div className="text-xs text-gray-600 dark:text-slate-400 space-y-1.5">
            <p className="font-medium text-gray-800 dark:text-slate-200">วิธีติดตั้งบน iPhone/iPad:</p>
            <p>1. แตะปุ่ม <span className="font-semibold">แชร์</span> (□↑) ที่แถบด้านล่าง</p>
            <p>2. เลื่อนลงและแตะ <span className="font-semibold">&quot;Add to Home Screen&quot;</span></p>
            <p>3. แตะ <span className="font-semibold">Add</span></p>
          </div>
        ) : (
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#398AB9] text-white text-sm font-bold rounded-xl hover:bg-[#1C658C] transition"
          >
            <Download className="w-4 h-4" />
            ติดตั้งแอป
          </button>
        )}
      </div>
    </div>
  );
}
