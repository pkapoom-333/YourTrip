/**
 * Validate required environment variables at startup.
 * Call once from a server-side entry point (e.g. prisma.ts or a server action).
 * Logs warnings (never throws) so the app degrades gracefully.
 */

interface EnvSpec {
  key: string;
  required: boolean;
  hint?: string;
}

const ENV_SPECS: EnvSpec[] = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    hint: "Get from: Supabase dashboard → Project Settings → API",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    hint: "Get from: Supabase dashboard → Project Settings → API",
  },
  {
    key: "DATABASE_URL",
    required: true,
    hint: "postgres://... — found in Supabase dashboard or prisma.config.ts",
  },
  {
    key: "CLOUDINARY_CLOUD_NAME",
    required: false,
    hint: "Required for image upload — set in Vercel or .env.local",
  },
  {
    key: "CLOUDINARY_API_KEY",
    required: false,
    hint: "Required for image upload",
  },
  {
    key: "CLOUDINARY_API_SECRET",
    required: false,
    hint: "Required for image upload",
  },
  {
    key: "NEXT_PUBLIC_SITE_URL",
    required: false,
    hint: "Set to your Vercel URL, e.g. https://your-trip-nu.vercel.app",
  },
];

let checked = false;

export function validateEnv(): void {
  if (checked || process.env.NODE_ENV === "test") return;
  checked = true;

  const missing: EnvSpec[] = [];
  const optional: EnvSpec[] = [];

  for (const spec of ENV_SPECS) {
    const val = process.env[spec.key];
    if (!val || val.trim() === "") {
      if (spec.required) missing.push(spec);
      else optional.push(spec);
    }
  }

  if (missing.length > 0) {
    console.error("\n⛔ [YourTrip] Missing required environment variables:");
    for (const s of missing) {
      console.error(`  • ${s.key}${s.hint ? `\n    → ${s.hint}` : ""}`);
    }
    console.error("  → Create your-trip-web/.env.local and add these values.\n");
  }

  if (optional.length > 0 && process.env.NODE_ENV === "development") {
    console.warn("\n⚠️  [YourTrip] Optional env vars not set (features may be disabled):");
    for (const s of optional) {
      console.warn(`  • ${s.key}${s.hint ? ` — ${s.hint}` : ""}`);
    }
    console.warn("");
  }
}
