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

// Check if blocks table exists
const { rows } = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
console.log("All tables:", rows.map(r => r.table_name).join(', '));

// Try a simple query on users to see if Prisma schema matches
const { rows: userCols } = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position`);
console.log("\nusers columns:", userCols.map(c => `${c.column_name}(${c.data_type})`).join(', '));

await client.end();
