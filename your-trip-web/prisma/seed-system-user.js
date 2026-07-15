/**
 * System User + System Posts Seed — YourTrip (Plain JS version using pg)
 * Avoids Prisma 7 + PrismaPg adapter upsert bug
 */
const { Client } = require('pg');
const crypto = require('crypto');
const path = require('path');

// Load .env.local manually
const fs = require('fs');
const envFile = path.join(__dirname, '../.env.local');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}

const SYSTEM_USER_ID = 'system-yourtrip-0000-0000-000000000001';

const systemPosts = [
  {
    content: '👑 วัดพระแก้ว — หัวใจของกรุงเทพฯ\nวัดที่สำคัญที่สุดในประเทศไทย ประดิษฐานพระแก้วมรกตที่สร้างจากหยกเนื้อเดียวทั้งองค์\nเปิด 08:30–15:30 น. ค่าเข้า 500 บาท',
    tags: ['temple', 'history', 'city'],
    images: ['https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1000&q=80'],
    location: 'พระบรมมหาราชวัง กรุงเทพฯ',
  },
  {
    content: '🏖️ เกาะพีพี — ชายหาดสวยที่สุดในไทย\nน้ำทะเลสีเขียวมรกต หาดทรายขาวละเอียด ที่อ่าวมาหยาอันโด่งดัง\nเดินทางโดยเรือสปีดโบ้ตจากกระบี่หรือภูเก็ต ~45 นาที',
    tags: ['island', 'beach'],
    images: ['https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1000&q=80'],
    location: 'เกาะพีพี กระบี่',
  },
  {
    content: '🌄 ดอยอินทนนท์ — หลังคาประเทศไทย\nทะเลหมอกยามเช้า + ดอกนางพญาเสือโคร่งสีชมพู ฤดูหนาว (ธ.ค.–ก.พ.) ชมดอกไม้สวยที่สุด\nระดับความสูง 2,565 เมตร อากาศหนาวถึง 0°C',
    tags: ['mountain', 'nature'],
    images: ['https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80'],
    location: 'อ.จอมทอง เชียงใหม่',
  },
  {
    content: '🛶 ตลาดน้ำอัมพวา — วิถีชีวิตริมคลอง\nช้อปของกิน นั่งเรือชมหิ่งห้อยยามค่ำ ล่องเรือชมวัดริมน้ำแบบโบราณ\nเปิดวันศุกร์–อาทิตย์ 12:00–21:00 น.',
    tags: ['food', 'city'],
    images: ['https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80'],
    location: 'อัมพวา สมุทรสงคราม',
  },
  {
    content: '🌲 เขาใหญ่ — มรดกโลกทางธรรมชาติ\nอุทยานแห่งชาติแห่งแรกของไทย ผืนป่าดิบชื้นอันอุดมสมบูรณ์ ชมช้างป่า นกเงือก และน้ำตกไทรทอง\nอากาศเย็นสบายตลอดปี เหมาะกับแคมป์ปิ้งดูดาว',
    tags: ['mountain', 'nature', 'adventure'],
    images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80'],
    location: 'อุทยานแห่งชาติเขาใหญ่ นครราชสีมา',
  },
  {
    content: '🏝️ หาดไวท์แซนด์ — ไข่มุกแห่งเกาะช้าง\nหาดทรายขาวยาวที่สุดบนเกาะช้าง น้ำทะเลใสสีฟ้าครามเหมาะกับดำน้ำตื้น\nมีร้านอาหารทะเลสดริมหาดให้เลือกมากมาย',
    tags: ['beach', 'island'],
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'],
    location: 'เกาะช้าง ตราด',
  },
  {
    content: '🖼️ ผาแต้ม — ภาพเขียนสีก่อนประวัติศาสตร์\nหน้าผาริมแม่น้ำโขงอายุกว่า 3,000 ปี ชมพระอาทิตย์ขึ้นจุดแรกของประเทศไทย\nเดินชมภาพเขียนสีโบราณรูปมือ ปลา และสัตว์ต่างๆ บนหน้าผา',
    tags: ['nature', 'history'],
    images: ['https://images.unsplash.com/photo-1500759285222-a95626b934cb?auto=format&fit=crop&w=1000&q=80'],
    location: 'อุทยานแห่งชาติผาแต้ม อุบลราชธานี',
  },
  {
    content: '🏛️ เมืองเก่าสุโขทัย — ต้นกำเนิดอาณาจักรไทย\nอุทยานประวัติศาสตร์มรดกโลก ชมซากปรักหักพังเจดีย์และพระพุทธรูปโบราณ\nปั่นจักรยานชมเมืองยามเย็น บรรยากาศงดงามไม่เหมือนที่ไหน',
    tags: ['history', 'temple'],
    images: ['https://images.unsplash.com/photo-1598935888738-cd2622bbca7c?auto=format&fit=crop&w=1000&q=80'],
    location: 'อุทยานประวัติศาสตร์สุโขทัย',
  },
  {
    content: '🌊 หาดนพรัตน์ธารา — ประตูสู่ทะเลกระบี่\nหาดทรายขาวติดภูเขาหินปูน จุดขึ้นเรือไปเกาะปอดะและถ้ำพระนาง\nเดินเที่ยวชายหาดฟรี ไม่มีค่าเข้า เหมาะกับทุกวัย',
    tags: ['beach', 'island'],
    images: ['https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80'],
    location: 'หาดนพรัตน์ธารา กระบี่',
  },
  {
    content: '🌃 ถนนคนเดินเชียงใหม่ — ตลาดคืนวันอาทิตย์สุดคึกคัก\nงานฝีมือ ของกินสตรีทฟู้ด ดนตรีสด เต็มถนนราชดำเนินยาวกว่า 1 กิโลเมตร\nเปิดทุกวันอาทิตย์ 16:00 น. เป็นต้นไป',
    tags: ['city', 'food', 'nightlife'],
    images: ['https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80'],
    location: 'ถนนราชดำเนิน เชียงใหม่',
  },
];

async function main() {
  const connStr = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connStr) throw new Error('No DATABASE_URL or DIRECT_URL in env');

  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('\n🌱 Seeding system user + system posts...\n');

  // Upsert system user
  await client.query(`
    INSERT INTO users (id, email, name, username, "avatarUrl", bio, "isVerified", "isSystemAccount", "isOnboarded", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, true, true, true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      "isVerified" = true,
      "isSystemAccount" = true,
      "updatedAt" = NOW()
  `, [
    SYSTEM_USER_ID,
    'system@yourtrip.app',
    'YourTrip',
    'yourtrip',
    '/icon.svg',
    'แนะนำสถานที่ท่องเที่ยวที่น่าสนใจทั่วประเทศไทย',
  ]);
  console.log('  ✅ System user ready (@yourtrip)');

  let created = 0;
  let skipped = 0;

  for (const post of systemPosts) {
    const existing = await client.query(
      'SELECT id FROM posts WHERE "userId" = $1 AND content = $2 LIMIT 1',
      [SYSTEM_USER_ID, post.content]
    );
    if (existing.rows.length > 0) {
      skipped++;
      continue;
    }

    const postId = crypto.randomUUID();
    await client.query(`
      INSERT INTO posts (id, content, images, location, tags, "userId", "isPublic", "postType", "isSystemPost", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, true, 'place_highlight', true, NOW(), NOW())
    `, [
      postId,
      post.content,
      post.images,       // TEXT[] — pg handles JS arrays natively
      post.location,
      post.tags,         // TEXT[] — pg handles JS arrays natively
      SYSTEM_USER_ID,
    ]);
    created++;
  }

  console.log(`  ✅ Posts: ${created} created, ${skipped} skipped`);
  await client.end();
  console.log('\n✅ Seed complete!\n');
}

main().catch(e => { console.error(e); process.exit(1); });
