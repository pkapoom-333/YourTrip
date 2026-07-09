/**
 * System User + System Posts Seed — YourTrip
 * Creates the official "YourTrip" account + 10 place-highlight posts
 * so new users never see an empty feed.
 *
 * Run:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-system-user.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const SYSTEM_USER_ID = "system-yourtrip-0000-0000-000000000001";

const systemPosts: Array<{
  content: string;
  tags: string[];
  images: string[];
  location: string;
  placeSlug?: string; // link to Place.slug if it exists in seed-places-real.ts
}> = [
  {
    content:
      "👑 วัดพระแก้ว — หัวใจของกรุงเทพฯ\nวัดที่สำคัญที่สุดในประเทศไทย ประดิษฐานพระแก้วมรกตที่สร้างจากหยกเนื้อเดียวทั้งองค์\nเปิด 08:30–15:30 น. ค่าเข้า 500 บาท",
    tags: ["temple", "history", "city"],
    images: ["https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1000&q=80"],
    location: "พระบรมมหาราชวัง กรุงเทพฯ",
    placeSlug: "wat-phra-kaew-bkk",
  },
  {
    content:
      "🏖️ เกาะพีพี — ชายหาดสวยที่สุดในไทย\nน้ำทะเลสีเขียวมรกต หาดทรายขาวละเอียด ที่อ่าวมาหยาอันโด่งดัง\nเดินทางโดยเรือสปีดโบ้ตจากกระบี่หรือภูเก็ต ~45 นาที",
    tags: ["island", "beach"],
    images: ["https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1000&q=80"],
    location: "เกาะพีพี กระบี่",
    placeSlug: "phi-phi-island-tour",
  },
  {
    content:
      "🌄 ดอยอินทนนท์ — หลังคาประเทศไทย\nทะเลหมอกยามเช้า + ดอกนางพญาเสือโคร่งสีชมพู ฤดูหนาว (ธ.ค.–ก.พ.) ชมดอกไม้สวยที่สุด\nระดับความสูง 2,565 เมตร อากาศหนาวถึง 0°C",
    tags: ["mountain", "nature"],
    images: ["https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80"],
    location: "อ.จอมทอง เชียงใหม่",
  },
  {
    content:
      "🛶 ตลาดน้ำอัมพวา — วิถีชีวิตริมคลอง\nช้อปของกิน นั่งเรือชมหิ่งห้อยยามค่ำ ล่องเรือชมวัดริมน้ำแบบโบราณ\nเปิดวันศุกร์–อาทิตย์ 12:00–21:00 น.",
    tags: ["food", "city"],
    images: ["https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80"],
    location: "อัมพวา สมุทรสงคราม",
  },
  {
    content:
      "🌲 เขาใหญ่ — มรดกโลกทางธรรมชาติ\nอุทยานแห่งชาติแห่งแรกของไทย ผืนป่าดิบชื้นอันอุดมสมบูรณ์ ชมช้างป่า นกเงือก และน้ำตกไทรทอง\nอากาศเย็นสบายตลอดปี เหมาะกับแคมป์ปิ้งดูดาว",
    tags: ["mountain", "nature", "adventure"],
    images: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80"],
    location: "อุทยานแห่งชาติเขาใหญ่ นครราชสีมา",
  },
  {
    content:
      "🏝️ หาดไวท์แซนด์ — ไข่มุกแห่งเกาะช้าง\nหาดทรายขาวยาวที่สุดบนเกาะช้าง น้ำทะเลใสสีฟ้าครามเหมาะกับดำน้ำตื้น\nมีร้านอาหารทะเลสดริมหาดให้เลือกมากมาย",
    tags: ["beach", "island"],
    images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"],
    location: "เกาะช้าง ตราด",
  },
  {
    content:
      "🖼️ ผาแต้ม — ภาพเขียนสีก่อนประวัติศาสตร์\nหน้าผาริมแม่น้ำโขงอายุกว่า 3,000 ปี ชมพระอาทิตย์ขึ้นจุดแรกของประเทศไทย\nเดินชมภาพเขียนสีโบราณรูปมือ ปลา และสัตว์ต่างๆ บนหน้าผา",
    tags: ["nature", "history"],
    images: ["https://images.unsplash.com/photo-1500759285222-a95626b934cb?auto=format&fit=crop&w=1000&q=80"],
    location: "อุทยานแห่งชาติผาแต้ม อุบลราชธานี",
  },
  {
    content:
      "🏛️ เมืองเก่าสุโขทัย — ต้นกำเนิดอาณาจักรไทย\nอุทยานประวัติศาสตร์มรดกโลก ชมซากปรักหักพังเจดีย์และพระพุทธรูปโบราณ\nปั่นจักรยานชมเมืองยามเย็น บรรยากาศงดงามไม่เหมือนที่ไหน",
    tags: ["history", "temple"],
    images: ["https://images.unsplash.com/photo-1598935888738-cd2622bbca7c?auto=format&fit=crop&w=1000&q=80"],
    location: "อุทยานประวัติศาสตร์สุโขทัย",
  },
  {
    content:
      "🌊 หาดนพรัตน์ธารา — ประตูสู่ทะเลกระบี่\nหาดทรายขาวติดภูเขาหินปูน จุดขึ้นเรือไปเกาะปอดะและถ้ำพระนาง\nเดินเที่ยวชายหาดฟรี ไม่มีค่าเข้า เหมาะกับทุกวัย",
    tags: ["beach", "island"],
    images: ["https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80"],
    location: "หาดนพรัตน์ธารา กระบี่",
  },
  {
    content:
      "🌃 ถนนคนเดินเชียงใหม่ — ตลาดคืนวันอาทิตย์สุดคึกคัก\nงานฝีมือ ของกินสตรีทฟู้ด ดนตรีสด เต็มถนนราชดำเนินยาวกว่า 1 กิโลเมตร\nเปิดทุกวันอาทิตย์ 16:00 น. เป็นต้นไป",
    tags: ["city", "food", "nightlife"],
    images: ["https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80"],
    location: "ถนนราชดำเนิน เชียงใหม่",
  },
];

async function main() {
  console.log("\n🌱 Seeding system user + system posts...\n");

  await prisma.user.upsert({
    where: { id: SYSTEM_USER_ID },
    update: {},
    create: {
      id: SYSTEM_USER_ID,
      email: "system@yourtrip.app",
      name: "YourTrip",
      username: "yourtrip",
      avatarUrl: "/icon.svg",
      bio: "แนะนำสถานที่ท่องเที่ยวที่น่าสนใจทั่วประเทศไทย",
      isVerified: true,
      isSystemAccount: true,
      isOnboarded: true,
    },
  });
  console.log("  ✅ System user ready (@yourtrip)");

  let created = 0;
  let skipped = 0;

  for (const post of systemPosts) {
    const existing = await prisma.post.findFirst({
      where: { userId: SYSTEM_USER_ID, content: post.content },
    });
    if (existing) {
      skipped++;
      continue;
    }

    let placeId: string | undefined;
    if (post.placeSlug) {
      const place = await prisma.place.findUnique({ where: { slug: post.placeSlug } });
      placeId = place?.id;
    }

    await prisma.post.create({
      data: {
        userId: SYSTEM_USER_ID,
        content: post.content,
        images: post.images,
        location: post.location,
        tags: post.tags,
        placeId,
        isPublic: true,
        postType: "place_highlight",
        isSystemPost: true,
      },
    });
    process.stdout.write(`  ✅ ${post.location}\n`);
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created} posts | Skipped: ${skipped} (already existed)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
