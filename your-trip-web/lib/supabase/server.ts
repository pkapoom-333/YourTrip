import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ─── Mock Supabase client for dev without env vars ────────────────────────────
const MOCK_USER = {
  id: "mock-user-id",
  email: "dev@yourtrip.app",
  user_metadata: { full_name: "Dev User", avatar_url: null },
};

function createMockClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
      signInWithOAuth: async () => ({ data: null, error: null }),
    },
  } as unknown as ReturnType<typeof createServerClient>;
}

export async function createClient() {
  // Return mock client when Supabase env vars are not configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return createMockClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookies set by middleware
          }
        },
      },
    }
  );
}
