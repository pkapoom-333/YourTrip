import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * GET  — returns the VAPID public key so the client can subscribe
 * POST — stores the user's PushSubscription object
 */

export async function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) {
    return NextResponse.json({ error: "VAPID not configured" }, { status: 503 });
  }
  return NextResponse.json({ publicKey: key });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate minimal push subscription shape
  if (!body.endpoint || typeof body.endpoint !== "string") {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  try {
    await (prisma as any).user.update({
      where: { id: user.id },
      data: { pushSubscription: JSON.stringify(body) },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[push/subscribe] DB error:", e);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await (prisma as any).user.update({
      where: { id: user.id },
      data: { pushSubscription: null },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
