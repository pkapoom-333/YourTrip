/**
 * Seed script — YourTrip Phase 1
 * Run: npx prisma db seed
 * (add to package.json: "prisma": { "seed": "npx ts-node prisma/seed.ts" })
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── PLACES ───────────────────────────────────────────────────────────────

  const places = [
    // ── ภาคเหนือ ──
    {
      slug: "doi-inthanon",
      name: "ดอยอินทนนท์",
      nameEn: "Doi Inthanon",
      description: "ยอดเขาที่สูงที่สุดในประเทศไทย สูง 2,565 เมตร เหนือระดับน้ำทะเล มีสภาพอากาศเย็นสบายตลอดปี",
      descriptionEn: "The highest peak in Thailand at 2,565 meters above sea level with cool weather year-round.",
      category: "attraction",
      region: "north",
      province: "เชียงใหม่",
      country: "TH",
      address: "อุทยานแห่งชาติดอยอินทนนท์ จ.เชียงใหม่",
      lat: 18.5884, lng: 98.4868,
      priceRange: 2, entryFee: 300,
      openDays: ["Daily"], openTime: "06:00", closeTime: "18:00",
      hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 200,
      isVegetarian: false, isAccessible: false,
      isFeatured: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80", order: 0 },
          { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80", order: 1 },
        ],
      },
    },
    {
      slug: "doi-ang-khang",
      name: "ดอยอ่างขาง",
      nameEn: "Doi Ang Khang",
      description: "สวนดอกไม้เมืองหนาวในหุบเขา อากาศเย็นจัด มีสวนดอกไม้นานาพันธุ์และหมู่บ้านชาวเขา",
      descriptionEn: "A highland garden in a valley with cool temperatures, flower gardens, and hilltribe villages.",
      category: "attraction",
      region: "north",
      province: "เชียงใหม่",
      country: "TH",
      address: "ต.แม่งอน อ.ฝาง จ.เชียงใหม่",
      lat: 19.5282, lng: 98.9912,
      priceRange: 1, entryFee: 50,
      openDays: ["Daily"], openTime: "06:00", closeTime: "18:00",
      hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 100,
      isVegetarian: false, isAccessible: false,
      isFeatured: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
    {
      slug: "chiang-rai-white-temple",
      name: "วัดร่องขุ่น (วัดขาว)",
      nameEn: "Wat Rong Khun (White Temple)",
      description: "ศิลปกรรมร่วมสมัยที่งดงาม วัดสีขาวล้วนประดับกระจกแก้วสะท้อนแสงสว่างจ้า",
      descriptionEn: "A contemporary Buddhist temple entirely covered in white plaster and glass pieces.",
      category: "attraction",
      region: "north",
      province: "เชียงราย",
      country: "TH",
      address: "Pa O Don Chai, Mueang Chiang Rai",
      lat: 19.8286, lng: 99.7631,
      priceRange: 1, entryFee: 100,
      openDays: ["Mon", "Tue", "Wed", "Thu", "Fri"], openTime: "08:00", closeTime: "17:00",
      hasWifi: true, hasAC: false, hasParking: true, parkingSpots: 300,
      isVegetarian: false, isAccessible: true,
      isFeatured: false,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },

    // ── ภาคใต้ ──
    {
      slug: "phuket-phi-phi",
      name: "หมู่เกาะพีพี",
      nameEn: "Phi Phi Islands",
      description: "หมู่เกาะสวรรค์น้ำใสทะเลฟ้า มีหาดทรายขาว น้ำทะเลสีเทอร์ควอยซ์ และโขดหินปูนตระการตา",
      descriptionEn: "Paradise islands with crystal clear waters, white sandy beaches, and dramatic limestone cliffs.",
      category: "attraction",
      region: "south",
      province: "กระบี่",
      country: "TH",
      address: "หมู่เกาะพีพี อ.เมือง จ.กระบี่",
      lat: 7.7407, lng: 98.7784,
      priceRange: 3, entryFee: 400,
      openDays: ["Daily"], openTime: "08:00", closeTime: "17:00",
      hasWifi: false, hasAC: false, hasParking: false,
      isVegetarian: false, isAccessible: false,
      isFeatured: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
    {
      slug: "samui-chaweng",
      name: "หาดเฉวง เกาะสมุย",
      nameEn: "Chaweng Beach, Koh Samui",
      description: "หาดทรายขาวทอดยาว น้ำใสทะเลสงบ เหมาะสำหรับว่ายน้ำและกิจกรรมทางน้ำ",
      descriptionEn: "Long stretch of white sand with calm clear water, perfect for swimming and water activities.",
      category: "attraction",
      region: "south",
      province: "สุราษฎร์ธานี",
      country: "TH",
      address: "หาดเฉวง เกาะสมุย จ.สุราษฎร์ธานี",
      lat: 9.5374, lng: 100.0623,
      priceRange: 2, entryFee: 0,
      openDays: ["Daily"], openTime: "00:00", closeTime: "23:59",
      hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 50,
      isVegetarian: false, isAccessible: false,
      isFeatured: false,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },

    // ── กลาง / กรุงเทพฯ ──
    {
      slug: "bangkok-grand-palace",
      name: "พระบรมมหาราชวัง",
      nameEn: "Grand Palace",
      description: "อดีตพระราชวังหลวงแห่งราชอาณาจักรไทย รวมถึงวัดพระแก้วที่ศักดิ์สิทธิ์ที่สุดของประเทศ",
      descriptionEn: "The former royal palace and home of Wat Phra Kaew, the most sacred Buddhist temple in Thailand.",
      category: "attraction",
      region: "central",
      province: "กรุงเทพมหานคร",
      country: "TH",
      address: "Na Phra Lan Rd, Phra Nakhon, Bangkok",
      lat: 13.7500, lng: 100.4913,
      priceRange: 2, entryFee: 500,
      openDays: ["Daily"], openTime: "08:30", closeTime: "15:30",
      hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 100,
      isVegetarian: false, isAccessible: false,
      isFeatured: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
    {
      slug: "chatuchak-market",
      name: "ตลาดนัดจตุจักร",
      nameEn: "Chatuchak Weekend Market",
      description: "ตลาดนัดสุดสัปดาห์ที่ใหญ่ที่สุดในโลก มีสินค้ามากกว่า 15,000 ร้านค้า",
      descriptionEn: "One of the world's largest weekend markets with over 15,000 stalls selling everything imaginable.",
      category: "attraction",
      region: "central",
      province: "กรุงเทพมหานคร",
      country: "TH",
      address: "Kamphaengphet 2 Rd, Chatuchak, Bangkok",
      lat: 13.7999, lng: 100.5500,
      priceRange: 1, entryFee: 0,
      openDays: ["Sat", "Sun"], openTime: "09:00", closeTime: "18:00",
      hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 500,
      isVegetarian: true, isAccessible: true,
      isFeatured: false,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1598803596490-9d8e5ea5f36c?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },

    // ── ต่างประเทศ ──
    {
      slug: "bali-ubud-terraces",
      name: "นาขั้นบันได อูบูด บาหลี",
      nameEn: "Tegallalang Rice Terraces, Ubud",
      description: "นาขั้นบันไดที่ได้รับการขึ้นทะเบียน UNESCO ทิวทัศน์สีเขียวงดงามล้อมรอบด้วยธรรมชาติ",
      descriptionEn: "UNESCO-listed rice terraces offering stunning green landscape and traditional Balinese culture.",
      category: "attraction",
      region: "international",
      province: "บาหลี",
      country: "ID",
      address: "Tegallalang, Kecamatan Tegallalang, Kabupaten Gianyar, Bali",
      lat: -8.4313, lng: 115.2767,
      priceRange: 2, entryFee: null,
      openDays: ["Daily"], openTime: "07:00", closeTime: "18:00",
      hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 50,
      isVegetarian: true, isAccessible: false,
      isFeatured: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
    {
      slug: "swiss-alps",
      name: "เทือกเขาแอลป์ สวิตเซอร์แลนด์",
      nameEn: "Swiss Alps",
      description: "เทือกเขาที่สวยงามที่สุดในยุโรป หิมะขาวโพลน ทิวทัศน์ยอดเขา สวรรค์ของนักไฮกิ้ง",
      descriptionEn: "Europe's most stunning mountain range with snow-capped peaks, perfect for hiking and skiing.",
      category: "attraction",
      region: "international",
      province: "สวิตเซอร์แลนด์",
      country: "CH",
      address: "Swiss Alps, Switzerland",
      lat: 46.8182, lng: 8.2275,
      priceRange: 4, entryFee: null,
      openDays: ["Daily"], openTime: "00:00", closeTime: "23:59",
      hasWifi: false, hasAC: false, hasParking: true,
      isVegetarian: false, isAccessible: false,
      isFeatured: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
    {
      slug: "santorini",
      name: "ซานโตรีนี กรีซ",
      nameEn: "Santorini, Greece",
      description: "เกาะภูเขาไฟในทะเลอีเจียน บ้านสีขาวโพลน โบสถ์หลังคาสีน้ำเงิน และทะเลสีฟ้าใส",
      descriptionEn: "A volcanic island in the Aegean Sea with iconic white-washed buildings and blue-domed churches.",
      category: "attraction",
      region: "international",
      province: "กรีซ",
      country: "GR",
      address: "Santorini, South Aegean, Greece",
      lat: 36.3932, lng: 25.4615,
      priceRange: 4, entryFee: null,
      openDays: ["Daily"], openTime: "00:00", closeTime: "23:59",
      hasWifi: false, hasAC: false, hasParking: false,
      isVegetarian: false, isAccessible: false,
      isFeatured: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },

    // ── ร้านอาหาร / คาเฟ่ ──
    {
      slug: "nimman-coffee-chiangmai",
      name: "Ristr8to Lab",
      nameEn: "Ristr8to Lab",
      description: "คาเฟ่สเปเชียลตี้คอฟฟี่ชื่อดังย่านนิมมานเหมินท์ บรรยากาศดี กาแฟคุณภาพระดับโลก",
      descriptionEn: "Famous specialty coffee lab on Nimman, known for award-winning baristas and exceptional brews.",
      category: "cafe",
      region: "north",
      province: "เชียงใหม่",
      country: "TH",
      address: "Nimmanhaeminda Rd, Su Thep, Mueang Chiang Mai",
      lat: 18.8022, lng: 98.9680,
      priceRange: 2, entryFee: 0,
      openDays: ["Daily"], openTime: "07:00", closeTime: "18:00",
      hasWifi: true, hasAC: true, hasParking: true, parkingSpots: 20,
      isVegetarian: true, isAccessible: true,
      isFeatured: false,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
  ];

  // Upsert places
  for (const place of places) {
    const { images, ...placeData } = place;
    await prisma.place.upsert({
      where: { slug: placeData.slug },
      update: {},
      create: {
        ...placeData,
        images,
      },
    });
    console.log(`✅ Place: ${placeData.name}`);
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
