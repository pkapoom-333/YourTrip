"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface PWAInstallState {
  /** true if the browser can show a native install prompt (Android/Chrome) */
  canInstall: boolean;
  /** true if running in standalone mode (already installed) */
  isInstalled: boolean;
  /** true on iOS Safari (show manual instructions instead of native prompt) */
  isIOS: boolean;
  /** Trigger the native install prompt (Android/Chrome only) */
  triggerInstall: () => Promise<boolean>;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed?
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true);
    if (standalone) { setIsInstalled(true); return; }

    // iOS Safari detection
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/chrome/i.test(ua)) {
      setIsIOS(true);
      return;
    }

    // Chrome / Android
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") { setIsInstalled(true); return true; }
    return false;
  };

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    isIOS,
    triggerInstall,
  };
}
