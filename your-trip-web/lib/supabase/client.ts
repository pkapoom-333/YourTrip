import { createBrowserClient } from "@supabase/ssr";

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder";

const MOCK_USER = {
  id: "mock-user-id",
  email: "dev@yourtrip.app",
  user_metadata: { full_name: "Dev User", avatar_url: null },
};

function createMockBrowserClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
      getSession: async () => ({
        data: {
          session: {
            user: MOCK_USER,
            access_token: "mock-token",
            refresh_token: "mock-refresh",
          },
        },
        error: null,
      }),
      onAuthStateChange: (_event: unknown, _session: unknown) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signOut: async () => ({ error: null }),
      signInWithOAuth: async () => ({ data: null, error: null }),
    },
  } as unknown as ReturnType<typeof createBrowserClient>;
}

export function createClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return createMockBrowserClient();
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
