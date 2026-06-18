/**
 * One-shot migration: add columns that exist in schema.prisma but not yet in production DB.
 * Uses DIRECT_URL (port 5432) to bypass pgBouncer.
 */
import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
function loadEnv(file) {
  try {
    const content = readFileSync(resolve(process.cwd(), file), "utf-8");
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}

loadEnv(".env");
loadEnv(".env.local");

const require = createRequire(import.meta.url);
const pg = require("pg");

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL or DIRECT_URL found");
  process.exit(1);
}

console.log("Connecting to DB (direct)...");
const client = new pg.Client({ connectionString: url });
await client.connect();
console.log("Connected.");

const migrations = [
  {
    name: "add_guide_fields",
    sql: `ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "isGuide" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "isVerifiedGuide" BOOLEAN NOT NULL DEFAULT false;`
  },
  {
    name: "add_trip_item_fields",
    sql: `ALTER TABLE "TripItem"
      ADD COLUMN IF NOT EXISTS "googlePlaceId" TEXT,
      ADD COLUMN IF NOT EXISTS "travelTimeTo" INTEGER,
      ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION;`
  }
];

for (const m of migrations) {
  try {
    console.log(`Running: ${m.name}`);
    await client.query(m.sql);
    console.log(`  ✓ Done`);
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`);
  }
}

await client.end();
console.log("All done.");
