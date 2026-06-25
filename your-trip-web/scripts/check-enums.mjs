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

// Check Postgres enum types
const { rows: enums } = await client.query(`SELECT typname, array_agg(enumlabel ORDER BY enumsortorder) as values FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE typtype = 'e' GROUP BY typname`);
console.log("Enums:", JSON.stringify(enums, null, 2));

// Check notifications table columns
const { rows: notifCols } = await client.query(`SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' ORDER BY ordinal_position`);
console.log("\nnotifications columns:", notifCols.map(c => `${c.column_name}(${c.udt_name})`).join(', '));

await client.end();
