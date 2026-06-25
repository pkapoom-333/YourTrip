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

// Check posts columns
const { rows: cols } = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' ORDER BY ordinal_position`);
console.log("posts columns:", cols.map(c => c.column_name).join(', '));

// Check posts for Angelo
const { rows: posts } = await client.query(`SELECT id, "userId", content, "isPublic" FROM posts WHERE "userId"='d65402b8-ee8f-4a3a-bb4a-03a7349b9ab0' LIMIT 3`);
console.log("\nAngelo's posts sample:", posts);

// Check likes columns
const { rows: likesCols } = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='likes' ORDER BY ordinal_position`);
console.log("\nlikes columns:", likesCols.map(c => c.column_name).join(', '));

// Check comments columns
const { rows: commentsCols } = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' ORDER BY ordinal_position`);
console.log("comments columns:", commentsCols.map(c => c.column_name).join(', '));

await client.end();
