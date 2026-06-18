/**
 * Test getProfile-equivalent query directly against DB
 */
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

// Get a sample user
const { rows: users } = await client.query(`SELECT id, name, username, "isGuide", "isVerifiedGuide" FROM users LIMIT 3`);
console.log("Sample users:", users);

// Count posts per user
if (users.length > 0) {
  const userId = users[0].id;
  const { rows: postCount } = await client.query(`SELECT COUNT(*) FROM posts WHERE "userId"=$1`, [userId]);
  const { rows: followerCount } = await client.query(`SELECT COUNT(*) FROM follows WHERE "followingId"=$1`, [userId]);
  const { rows: followingCount } = await client.query(`SELECT COUNT(*) FROM follows WHERE "followerId"=$1`, [userId]);
  const { rows: tripCount } = await client.query(`SELECT COUNT(*) FROM trips WHERE "userId"=$1`, [userId]);
  console.log(`\nUser ${userId} stats:`, {
    posts: postCount[0].count,
    followers: followerCount[0].count,
    following: followingCount[0].count,
    trips: tripCount[0].count
  });
}

// Check if blocks table exists
const { rows: blockTable } = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='blocks'`);
console.log("\nblocks table exists:", blockTable.length > 0);

await client.end();
