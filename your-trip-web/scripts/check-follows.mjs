import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve } from "path";
function loadEnv(file) {
  try { const content = readFileSync(resolve(process.cwd(), file), "utf-8"); for (const line of content.split("\n")) { const t = line.trim(); if (!t || t.startsWith("#")) continue; const eq = t.indexOf("="); if (eq === -1) continue; const key = t.slice(0, eq).trim(); let val = t.slice(eq + 1).trim(); if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1); if (!process.env[key]) process.env[key] = val; } } catch {}
}
loadEnv(".env"); loadEnv(".env.local");
const require = createRequire(import.meta.url);
const pg = require("pg");
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

// Check follows table
const { rows: cols } = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='follows' ORDER BY ordinal_position`);
console.log("follows columns:", cols.map(c => c.column_name).join(', '));

// Try running the actual _count query that getProfile uses
const userId = 'd65402b8-ee8f-4a3a-bb4a-03a7349b9ab0';
try {
  const { rows } = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM posts WHERE "userId" = $1) as "postsCount",
      (SELECT COUNT(*) FROM follows WHERE "followingId" = $1) as "followersCount",
      (SELECT COUNT(*) FROM follows WHERE "followerId" = $1) as "followingCount",
      (SELECT COUNT(*) FROM trips WHERE "userId" = $1) as "tripsCount"
  `, [userId]);
  console.log("\nCounts for Angelo:", rows[0]);
} catch(e) {
  console.error("Error:", e.message);
}

// Try the tripItem distinct query
try {
  const { rows } = await client.query(`
    SELECT DISTINCT "placeId"
    FROM trip_items
    WHERE "placeId" IS NOT NULL
    AND "dayId" IN (
      SELECT id FROM trip_days
      WHERE "tripId" IN (
        SELECT id FROM trips WHERE "userId" = $1
      )
    )
  `, [userId]);
  console.log("Distinct places:", rows.length);
} catch(e) {
  console.error("tripItem error:", e.message);
}

await client.end();
