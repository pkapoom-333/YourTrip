"use client";

import { useState, useEffect, useCallback } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [subscribing, setSubscribing] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  useEffect(() => {
    if (!isSupported) { setPermission("unsupported"); return; }
    setPermission(Notification.permission as PushPermission);

    // Check existing subscription
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => setSubscription(sub));
    }).catch(() => {});
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !VAPID_PUBLIC_KEY) return false;
    setSubscribing(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== "granted") return false;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      setSubscription(sub);

      // TODO: send sub to server for storage
      // await fetch("/api/push/subscribe", { method: "POST", body: JSON.stringify(sub) })
      return true;
    } catch {
      return false;
    } finally {
      setSubscribing(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;
    try {
      await subscription.unsubscribe();
      setSubscription(null);
      return true;
    } catch { return false; }
  }, [subscription]);

  return {
    isSupported,
    permission,
    subscription,
    subscribing,
    isSubscribed: !!subscription,
    subscribe,
    unsubscribe,
  };
}
