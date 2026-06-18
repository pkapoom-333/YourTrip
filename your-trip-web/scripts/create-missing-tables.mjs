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

const sqls = [
  {
    name: "reports",
    sql: `CREATE TABLE IF NOT EXISTS reports (
      id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "postId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      reason TEXT NOT NULL,
      note TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT reports_pkey PRIMARY KEY (id),
      CONSTRAINT reports_post_fkey FOREIGN KEY ("postId") REFERENCES posts(id) ON DELETE CASCADE,
      CONSTRAINT reports_user_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT reports_postId_userId_key UNIQUE ("postId", "userId")
    );`
  }
];

for (const { name, sql } of sqls) {
  try {
    await client.query(sql);
    console.log(`✓ ${name} table created/ensured`);
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
  }
}

// Final check
const { rows } = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
console.log("\nFinal table list:", rows.map(r => r.table_name).join(', '));

await client.end();
