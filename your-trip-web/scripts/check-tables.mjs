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

// List all tables
const { rows: tables } = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
console.log("Tables:", tables.map(r => r.table_name));

// Check columns on users-like table
for (const t of tables.map(r => r.table_name)) {
  if (t.toLowerCase().includes('user') || t.toLowerCase().includes('trip')) {
    const { rows: cols } = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`, [t]);
    console.log(`\n${t} columns:`, cols.map(c => c.column_name));
  }
}

await client.end();
