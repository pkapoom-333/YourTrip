import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve } from "path";

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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}
loadEnv(".env"); loadEnv(".env.local");

const require = createRequire(import.meta.url);
const pg = require("pg");
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS blocks (
      id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "blockerId" TEXT NOT NULL,
      "blockedId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT blocks_pkey PRIMARY KEY (id),
      CONSTRAINT blocks_blocker_fkey FOREIGN KEY ("blockerId") REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT blocks_blocked_fkey FOREIGN KEY ("blockedId") REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT blocks_blockerId_blockedId_key UNIQUE ("blockerId", "blockedId")
    );
  `);
  console.log("✓ blocks table created");
} catch (err) {
  console.error("Error:", err.message);
}

await client.end();
