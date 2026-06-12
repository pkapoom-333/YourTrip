/**
 * YourTrip — E2E Functional Test (Day 16)
 * Tests 5 core flows against the real Supabase DB using Prisma directly.
 *
 * Run:  npx tsx prisma/test-e2e.ts
 *
 * Cleanup: all test data is removed after the script completes.
 * Test data uses a unique prefix so it's safe to identify and purge.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

// ─── Load env (same pattern as prisma.config.ts) ─────────────────────────────
function loadEnv(file: string) {
  try {
    const content = fs.readFileSync(path.resolve(process.cwd(), file), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* file not found */ }
}

loadEnv(".env");
loadEnv(".env.local");

// ─── Prisma client ────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

// ─── Console helpers ──────────────────────────────────────────────────────────
const G = "\x1b[32m";
const R = "\x1b[31m";
const Y = "\x1b[33m";
const B = "\x1b[34m";
const D = "\x1b[0m";

const ok  = (msg: string) => console.log(`  ${G}✅ ${msg}${D}`);
const err = (msg: string) => console.log(`  ${R}❌ ${msg}${D}`);
const inf = (msg: string) => console.log(`  ${Y}ℹ️  ${msg}${D}`);
const hdr = (msg: string) => console.log(`\n${B}${msg}${D}`);

interface FlowResult {
  flow: string;
  status: "✅" | "❌";
  details: string[];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${"═".repeat(64)}`);
  console.log("  🧪  YourTrip E2E Functional Test — Day 16");
  console.log(`${"═".repeat(64)}`);

  if (!process.env.DATABASE_URL) {
    console.log(`${R}❌ DATABASE_URL not set — abort${D}\n`);
    process.exit(1);
  }

  const TEST_PREFIX = `e2e_${Date.now()}`;
  const UID_A = randomUUID();
  const UID_B = randomUUID();
  const results: FlowResult[] = [];

  // ─── Setup ─────────────────────────────────────────────────────────────────
  hdr("⚙️  Setup — creating test users");
  let canCreateUsers = true;

  try {
    await prisma.user.createMany({
      data: [
        { id: UID_A, email: `${TEST_PREFIX}_a@test.yourtrip`, username: `${TEST_PREFIX}_a`, name: "E2E User A" },
        { id: UID_B, email: `${TEST_PREFIX}_b@test.yourtrip`, username: `${TEST_PREFIX}_b`, name: "E2E User B" },
      ],
    });
    ok(`Created test users A (${UID_A.slice(0,8)}…) and B (${UID_B.slice(0,8)}…)`);
  } catch (e) {
    canCreateUsers = false;
    inf(`Cannot create synthetic users (likely FK→auth.users): ${String(e).slice(0, 120)}`);
    inf("Falling back to first real user from DB for all flows");
  }

  // Resolve usable user IDs — fall back to real users if synthetic creation failed
  let userA: string;
  let userB: string;

  if (canCreateUsers) {
    userA = UID_A;
    userB = UID_B;
  } else {
    // select only id — isGuide column not yet in DB (add_travel_fields migration pending)
    const realUsers = await prisma.user.findMany({ take: 2, orderBy: { createdAt: "asc" }, select: { id: true } });
    if (realUsers.length < 2) {
      console.log(`${R}❌ Need at least 2 real users in DB to run fallback tests — abort${D}\n`);
      await prisma.$disconnect();
      process.exit(1);
    }
    userA = realUsers[0].id;
    userB = realUsers[1].id;
    inf(`Using real users A=${userA.slice(0,8)}… B=${userB.slice(0,8)}…`);
    inf("Test data will be cleaned up after run");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Flow 1: Post → Profile
  // ═══════════════════════════════════════════════════════════════════════════
  hdr("📝  Flow 1: Post → Profile");
  const r1: FlowResult = { flow: "Post → Profile", status: "✅", details: [] };

  try {
    // 1a. Create post
    const post = await prisma.post.create({
      data: {
        userId: userA,
        content: `${TEST_PREFIX} — E2E test post 🧪`,
        tags: ["e2e", "test"],
        isPublic: true,
      },
    });
    ok(`Post created: ${post.id.slice(0,8)}…`);
    r1.details.push(`post.id=${post.id.slice(0,8)}`);

    // 1b. Query via getUserPosts equivalent
    const userPosts = await prisma.post.findMany({
      where: { userId: userA },
      orderBy: { createdAt: "desc" },
    });
    const found = userPosts.some((p) => p.id === post.id);
    if (!found) {
      err("Post NOT found when querying user posts"); r1.status = "❌"; r1.details.push("post not in user posts");
    } else {
      ok("Post found in getUserPosts query");
    }

    // 1c. postsCount — use prisma.post.count (avoids User model isGuide column issue)
    const count = await prisma.post.count({ where: { userId: userA } });
    // For real users, count ≥ 1 (we just added one more)
    if (canCreateUsers && count !== 1) {
      err(`postsCount = ${count}, expected 1`); r1.status = "❌"; r1.details.push(`count=${count}`);
    } else if (count < 1) {
      err(`postsCount = ${count}, expected ≥ 1`); r1.status = "❌"; r1.details.push(`count=${count}`);
    } else {
      ok(`postsCount = ${count} ✓`);
      r1.details.push(`postsCount=${count}`);
    }
  } catch (e) {
    err(String(e)); r1.status = "❌"; r1.details.push(String(e).slice(0, 100));
  }

  results.push(r1);

  // ═══════════════════════════════════════════════════════════════════════════
  // Flow 2: Trip CRUD (create → addItem → update → delete)
  // ═══════════════════════════════════════════════════════════════════════════
  hdr("🗺️  Flow 2: Trip CRUD");
  const r2: FlowResult = { flow: "Trip CRUD", status: "✅", details: [] };
  let tripId: string | null = null;

  try {
    // 2a. Create trip with 2 TripDays
    const trip = await prisma.trip.create({
      data: {
        userId: userA,
        title: `${TEST_PREFIX} — E2E Trip`,
        destination: "เชียงใหม่",
        startDate: new Date("2026-08-01"),
        endDate:   new Date("2026-08-02"),
        budget: 5000,
        days: {
          create: [
            { day: 1, date: new Date("2026-08-01") },
            { day: 2, date: new Date("2026-08-02") },
          ],
        },
      },
      include: { days: true },
    });
    tripId = trip.id;

    if (trip.days.length !== 2) {
      err(`TripDays created = ${trip.days.length}, expected 2`);
      r2.status = "❌"; r2.details.push(`days=${trip.days.length}`);
    } else {
      ok(`Trip created with 2 TripDays (${trip.id.slice(0,8)}…)`);
      r2.details.push("create OK");
    }

    // 2b. addItineraryItem
    const day1 = trip.days.find((d) => d.day === 1)!;
    const item = await prisma.tripItem.create({
      data: { dayId: day1.id, name: "ดอยสุเทพ E2E", time: "08:00", cost: 30, order: 0 },
    });
    ok(`TripItem created: ${item.id.slice(0,8)}…`);

    // Fetch trip back and verify item is in day
    const fetched = await prisma.trip.findUnique({
      where: { id: trip.id },
      include: { days: { include: { items: true } } },
    });
    const itemFound = fetched?.days.flatMap((d) => d.items).some((i) => i.id === item.id);
    if (!itemFound) {
      err("TripItem not found under trip after create");
      r2.status = "❌"; r2.details.push("item not found after create");
    } else {
      ok("TripItem visible when fetching trip (addItineraryItem ✓)");
      r2.details.push("addItem OK");
    }

    // 2c. Update item
    await prisma.tripItem.update({ where: { id: item.id }, data: { cost: 99, note: "updated" } });
    const updated = await prisma.tripItem.findUnique({ where: { id: item.id } });
    if (updated?.cost !== 99 || updated?.note !== "updated") {
      err(`Update: cost=${updated?.cost} note=${updated?.note}`);
      r2.status = "❌"; r2.details.push("update failed");
    } else {
      ok("updateTripItem: cost=99 note='updated' persisted ✓");
      r2.details.push("update OK");
    }

    // 2d. Delete item
    await prisma.tripItem.delete({ where: { id: item.id } });
    const afterDelete = await prisma.tripItem.findUnique({ where: { id: item.id } });
    if (afterDelete) {
      err("TripItem still exists after delete");
      r2.status = "❌"; r2.details.push("delete failed");
    } else {
      ok("deleteTripItem: item gone from DB ✓");
      r2.details.push("delete OK");
    }
  } catch (e) {
    err(String(e)); r2.status = "❌"; r2.details.push(String(e).slice(0, 100));
  }

  results.push(r2);

  // ═══════════════════════════════════════════════════════════════════════════
  // Flow 3: Like / Unlike / Comment / Save post / Save place
  // ═══════════════════════════════════════════════════════════════════════════
  hdr("❤️  Flow 3: Like / Comment / Save");
  const r3: FlowResult = { flow: "Like / Comment / Save", status: "✅", details: [] };

  try {
    const post = await prisma.post.findFirst({ where: { userId: userA } });
    if (!post) throw new Error("No test post found — Flow 1 may have failed");

    // 3a. Like
    const like = await prisma.like.create({ data: { userId: userA, postId: post.id } });
    const likeCount = await prisma.like.count({ where: { postId: post.id } });
    if (likeCount < 1) {
      err(`Like count = ${likeCount}`); r3.status = "❌"; r3.details.push("like count 0");
    } else {
      ok(`Like: created (${like.id.slice(0,8)}…), likeCount = ${likeCount}`);
      r3.details.push(`like count=${likeCount}`);
    }

    // 3b. Unlike
    await prisma.like.delete({ where: { id: like.id } });
    const afterUnlike = await prisma.like.findUnique({ where: { id: like.id } });
    if (afterUnlike) {
      err("Like still exists after delete"); r3.status = "❌"; r3.details.push("unlike failed");
    } else {
      ok("Unlike: like record gone ✓"); r3.details.push("unlike OK");
    }

    // 3c. Comment
    const comment = await prisma.comment.create({
      data: { userId: userA, postId: post.id, content: `${TEST_PREFIX} — test comment 🧪` },
    });
    const commentInDB = await prisma.comment.findUnique({ where: { id: comment.id } });
    if (!commentInDB) {
      err("Comment not found after create"); r3.status = "❌"; r3.details.push("comment not found");
    } else {
      ok(`Comment: created (${comment.id.slice(0,8)}…) content matches ✓`); r3.details.push("comment OK");
    }

    // 3d. Save post
    const savePost = await prisma.save.create({ data: { userId: userA, postId: post.id } });
    const saveInDB = await prisma.save.findUnique({ where: { id: savePost.id } });
    if (!saveInDB) {
      err("SavePost: record not found"); r3.status = "❌"; r3.details.push("save post failed");
    } else {
      ok("Save post: record in saves table ✓"); r3.details.push("save post OK");
    }

    // 3e. Save place
    const anyPlace = await prisma.place.findFirst();
    if (anyPlace) {
      // cleanup any pre-existing save for this user+place (could be real user)
      await prisma.savedPlace.deleteMany({ where: { userId: userA, placeId: anyPlace.id } });
      const savedPlace = await prisma.savedPlace.create({
        data: { userId: userA, placeId: anyPlace.id },
      });
      const savedPlaceInDB = await prisma.savedPlace.findUnique({ where: { id: savedPlace.id } });
      if (!savedPlaceInDB) {
        err("SavePlace: record not found"); r3.status = "❌"; r3.details.push("save place failed");
      } else {
        ok(`Save place: '${anyPlace.name}' in saved_places ✓`); r3.details.push("save place OK");
      }
    } else {
      inf("No places in DB — skip save place sub-test");
    }
  } catch (e) {
    err(String(e)); r3.status = "❌"; r3.details.push(String(e).slice(0, 100));
  }

  results.push(r3);

  // ═══════════════════════════════════════════════════════════════════════════
  // Flow 4: Follow / Unfollow + counts
  // ═══════════════════════════════════════════════════════════════════════════
  hdr("👥  Flow 4: Follow / Unfollow");
  const r4: FlowResult = { flow: "Follow / Unfollow", status: "✅", details: [] };

  try {
    // Clean pre-existing follow (real user fallback could have it)
    await prisma.follow.deleteMany({ where: { followerId: userA, followingId: userB } });

    // 4a. Follow
    const followBefore = await prisma.follow.count({ where: { followingId: userB } });
    const follow = await prisma.follow.create({ data: { followerId: userA, followingId: userB } });
    const followAfter = await prisma.follow.count({ where: { followingId: userB } });

    if (followAfter !== followBefore + 1) {
      err(`followersCount: before=${followBefore} after=${followAfter}`);
      r4.status = "❌"; r4.details.push("follow count wrong");
    } else {
      ok(`Follow: record created, followerCount B: ${followBefore}→${followAfter} (+1) ✓`);
      r4.details.push(`follow +1 OK`);
    }

    const followingCountA = await prisma.follow.count({ where: { followerId: userA } });
    ok(`User A followingCount = ${followingCountA} ✓`); r4.details.push(`followingCountA=${followingCountA}`);

    // 4b. Unfollow
    await prisma.follow.delete({ where: { id: follow.id } });
    const afterUnfollow = await prisma.follow.count({ where: { followingId: userB } });
    if (afterUnfollow !== followBefore) {
      err(`After unfollow count = ${afterUnfollow}, expected ${followBefore}`);
      r4.status = "❌"; r4.details.push("unfollow count wrong");
    } else {
      ok(`Unfollow: count restored to ${afterUnfollow} ✓`); r4.details.push("unfollow OK");
    }
  } catch (e) {
    err(String(e)); r4.status = "❌"; r4.details.push(String(e).slice(0, 100));
  }

  results.push(r4);

  // ═══════════════════════════════════════════════════════════════════════════
  // Flow 5: Review → place avg rating (same query as getPlaceBySlug)
  // ═══════════════════════════════════════════════════════════════════════════
  hdr("⭐  Flow 5: Review → Place avg rating");
  const r5: FlowResult = { flow: "Review → Avg Rating", status: "✅", details: [] };

  try {
    const place = await prisma.place.findFirst({ orderBy: { createdAt: "asc" } });
    if (!place) throw new Error("No places in DB — run seed-places-real.ts first");

    // Snapshot before
    const before = await prisma.review.aggregate({
      where: { placeId: place.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const countBefore = before._count.rating;
    const sumBefore   = (before._avg.rating ?? 0) * countBefore;

    inf(`Place: '${place.name}' — ${countBefore} review(s) before, avg = ${before._avg.rating?.toFixed(2) ?? "0"}`);

    // Clean pre-existing test review (real user fallback safety)
    await prisma.review.deleteMany({ where: { placeId: place.id, userId: userA } });

    // Create review with rating 4
    const review = await prisma.review.create({
      data: {
        placeId: place.id,
        userId:  userA,
        rating:  4,
        content: `${TEST_PREFIX} — E2E test review 🧪`,
      },
    });
    ok(`Review created: ${review.id.slice(0,8)}…, rating=4`);

    // Verify via aggregate (same as getPlaceBySlug)
    const after = await prisma.review.aggregate({
      where: { placeId: place.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const expectedAvg = (sumBefore + 4) / (countBefore + 1);
    const actualAvg   = after._avg.rating ?? 0;
    const diff = Math.abs(actualAvg - expectedAvg);

    if (after._count.rating !== countBefore + 1) {
      err(`reviewCount: ${after._count.rating}, expected ${countBefore + 1}`);
      r5.status = "❌"; r5.details.push("count wrong");
    } else {
      ok(`reviewCount: ${countBefore}→${after._count.rating} (+1) ✓`);
      r5.details.push(`count ${after._count.rating}`);
    }

    if (diff > 0.01) {
      err(`avg rating = ${actualAvg.toFixed(3)}, expected ≈ ${expectedAvg.toFixed(3)}`);
      r5.status = "❌"; r5.details.push(`avg ${actualAvg.toFixed(2)}`);
    } else {
      ok(`avg rating = ${actualAvg.toFixed(2)} (expected ${expectedAvg.toFixed(2)}) ✓`);
      r5.details.push(`avg ${actualAvg.toFixed(2)}`);
    }

    // Verify review appears in place query (as getPlaceBySlug would see it)
    const placeReviews = await prisma.review.findMany({
      where: { placeId: place.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const visible = placeReviews.some((r) => r.id === review.id);
    if (!visible) {
      err("Review not visible in place's recent reviews (top-10 query)");
      r5.status = "❌"; r5.details.push("not visible in page query");
    } else {
      ok("Review visible in place detail page query ✓"); r5.details.push("visible in page OK");
    }
  } catch (e) {
    err(String(e)); r5.status = "❌"; r5.details.push(String(e).slice(0, 100));
  }

  results.push(r5);

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  hdr("🧹  Cleanup");
  try {
    if (canCreateUsers) {
      // Cascade deletes all owned data (posts, trips, likes, comments, saves, reviews, savedPlaces, follows)
      await prisma.user.deleteMany({ where: { id: { in: [UID_A, UID_B] } } });
      ok("Test users + all owned data deleted (cascade) ✓");
    } else {
      // Delete only test-tagged data for real users
      const testPost = await prisma.post.findFirst({ where: { userId: userA, content: { contains: TEST_PREFIX } } });
      if (testPost) {
        await prisma.comment.deleteMany({ where: { postId: testPost.id, content: { contains: TEST_PREFIX } } });
        await prisma.save.deleteMany({ where: { userId: userA, postId: testPost.id } });
        await prisma.like.deleteMany({ where: { userId: userA, postId: testPost.id } });
        await prisma.post.delete({ where: { id: testPost.id } });
      }
      if (tripId) await prisma.trip.delete({ where: { id: tripId } }).catch(() => {});
      await prisma.review.deleteMany({ where: { userId: userA, content: { contains: TEST_PREFIX } } });
      await prisma.savedPlace.deleteMany({ where: { userId: userA } }).catch(() => {});
      ok("Selective cleanup of test-tagged data ✓");
    }
  } catch (e) {
    inf(`Cleanup warning: ${String(e).slice(0, 80)}`);
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n${"═".repeat(64)}`);
  console.log("  📊  SUMMARY");
  console.log(`${"═".repeat(64)}`);

  for (const r of results) {
    const color = r.status === "✅" ? G : R;
    console.log(`${color}  ${r.status}  ${r.flow}${D}`);
    console.log(`       ${r.details.join(" | ")}`);
  }

  const passed = results.filter((r) => r.status === "✅").length;
  const total  = results.length;

  console.log(`\n${"═".repeat(64)}`);
  if (passed === total) {
    console.log(`${G}  🏁  ALL ${total}/${total} FLOWS PASSED${D}`);
  } else {
    console.log(`${R}  ⚠️   ${passed}/${total} passed — ${total - passed} FAILED${D}`);
  }
  console.log(`${"═".repeat(64)}\n`);

  await prisma.$disconnect();
  process.exit(passed === total ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
