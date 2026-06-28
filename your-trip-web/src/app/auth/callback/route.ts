import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/feed";

  if (code) {
    const supabase = await createClient();
    const { error } = await (supabase.auth as any).exchangeCodeForSession(code);
    if (!error) {
      // Sync user to DB on first login
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && prisma) {
          // Check if user already exists (to preserve custom avatar)
          const existing = await prisma.user.findUnique({
            where: { id: user.id },
            select: { avatarUrl: true },
          });
          await prisma.user.upsert({
            where: { id: user.id },
            update: {
              email: user.email ?? "",
              name: user.user_metadata?.full_name ?? null,
              // Only update avatarUrl from Google if user hasn't set a custom one
              ...(existing?.avatarUrl === null || existing?.avatarUrl === undefined
                ? { avatarUrl: user.user_metadata?.avatar_url ?? null }
                : {}),
            },
            create: {
              id: user.id,
              email: user.email ?? "",
              name: user.user_metadata?.full_name ?? null,
              avatarUrl: user.user_metadata?.avatar_url ?? null,
              username: null,
            },
          });
        }
      } catch (e) {
        // Non-fatal — user can still proceed
        console.error("[auth/callback] user sync failed:", e);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
