import { defineConfig } from "prisma/config";
import * as fs from "fs";
import * as path from "path";

// Load .env manually so Prisma CLI can read DATABASE_URL
function loadEnv(file: string) {
  try {
    const envPath = path.resolve(process.cwd(), file);
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // file not found — skip
  }
}

loadEnv(".env");
loadEnv(".env.local");

const DATABASE_URL = process.env.DATABASE_URL!;
const DIRECT_URL = process.env.DIRECT_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
