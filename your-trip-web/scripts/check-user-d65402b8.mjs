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

const userId = 'd65402b8-ee8f-4a3a-bb4a-03a7349b9ab0';

const { rows: user } = await client.query(`SELECT * FROM users WHERE id=$1`, [userId]);
console.log("User:", user[0]);

const { rows: postCount } = await client.query(`SELECT COUNT(*) FROM posts WHERE "userId"=$1`, [userId]);
const { rows: followerCount } = await client.query(`SELECT COUNT(*) FROM follows WHERE "followingId"=$1`, [userId]);
const { rows: tripCount } = await client.query(`SELECT COUNT(*) FROM trips WHERE "userId"=$1`, [userId]);
console.log("Stats:", { posts: postCount[0].count, followers: followerCount[0].count, trips: tripCount[0].count });

await client.end();
