/**
 * Web Push notification helper
 *
 * Requires VAPID keys in env:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT  (e.g. mailto:pakpoomtee24@gmail.com)
 *
 * Run: node scripts/generate-vapid-keys.js  to generate the keys.
 *
 * Package: npm install web-push --save  (run from your-trip-web/)
 * Types:   npm install --save-dev @types/web-push
 *
 * TODO: install web-push once npm is available, then uncomment the import below.
 */

import webpush from "web-push";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

/**
 * Send a web push notification to a single subscription JSON string.
 * Returns true on success, false if subscription is expired/invalid.
 */
export async function sendWebPush(
  subscriptionJson: string,
  payload: PushPayload
): Promise<boolean> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@yourtrip.app";

  if (!publicKey || !privateKey) {
    // VAPID not configured — skip silently (dev mode)
    return false;
  }

  let subscription: PushSubscriptionJSON;
  try {
    subscription = JSON.parse(subscriptionJson) as PushSubscriptionJSON;
  } catch {
    return false;
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/notifications",
        icon: payload.icon ?? "/icon.svg",
      })
    );
    return true;
  } catch (e: unknown) {
    // 410 Gone = subscription expired → caller should clear it from DB
    if (e && typeof e === "object" && "statusCode" in e && (e as { statusCode: number }).statusCode === 410) {
      return false;
    }
    console.error("[sendWebPush]", e);
    return false;
  }
}
