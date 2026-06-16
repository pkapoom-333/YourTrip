/**
 * Seed script — YourTrip Phase 1
 * Run: npx prisma db seed
 * (add to package.json: "prisma": { "seed": "npx ts-node prisma/seed.ts" })
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires a driver adapter — DATABASE_URL must be set
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

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

    // ── เพิ่มเติม: South / Restaurant / Hotel / Activity ──
    {
      slug: "koh-phi-phi",
      name: "เกาะพีพี",
      nameEn: "Koh Phi Phi",
      description: "เกาะที่มีชื่อเสียงที่สุดแห่งหนึ่งของไทย ทะเลใสน้ำเขียวมรกต หาดทรายขาว",
      descriptionEn: "One of Thailand's most famous islands with crystal clear turquoise water and white sandy beaches.",
      category: "attraction",
      region: "south",
      province: "กระบี่",
      country: "TH",
      lat: 7.7408, lng: 98.7785,
      priceRange: 3, entryFee: 0,
      openDays: ["Daily"], openTime: null, closeTime: null,
      hasWifi: false, hasAC: false, hasParking: false,
      isVegetarian: false, isAccessible: false, isFeatured: true,
      images: { create: [
        { url: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?auto=format&fit=crop&w=800&q=80", order: 0 },
      ]},
    },
    {
      slug: "koh-samui",
      name: "เกาะสมุย",
      nameEn: "Koh Samui",
      description: "เกาะใหญ่อันดับสองของไทย มีหาดสวย รีสอร์ทหรู และ nightlife คึกคัก",
      descriptionEn: "Thailand's second-largest island known for beautiful beaches, luxury resorts and vibrant nightlife.",
      category: "attraction",
      region: "south",
      province: "สุราษฎร์ธานี",
      country: "TH",
      lat: 9.5120, lng: 100.0136,
      priceRange: 3, entryFee: 0,
      openDays: ["Daily"], openTime: null, closeTime: null,
      hasWifi: false, hasAC: false, hasParking: true,
      isVegetarian: false, isAccessible: false, isFeatured: true,
      images: { create: [
        { url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80", order: 0 },
      ]},
    },
    {
      slug: "krabi-railay",
      name: "หาดไร่เลย์",
      nameEn: "Railay Beach",
      description: "หาดสวยงามที่เข้าถึงได้เฉพาะทางเรือ ล้อมรอบด้วยหน้าผาหินปูนสูงชัน",
      descriptionEn: "A stunning beach accessible only by boat, surrounded by towering limestone cliffs.",
      category: "attraction",
      region: "south",
      province: "กระบี่",
      country: "TH",
      lat: 8.0118, lng: 98.8374,
      priceRange: 2, entryFee: 0,
      openDays: ["Daily"], openTime: null, closeTime: null,
      hasWifi: false, hasAC: false, hasParking: false,
      isVegetarian: false, isAccessible: false, isFeatured: false,
      images: { create: [
        { url: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80", order: 0 },
      ]},
    },
    {
      slug: "bangkok-yaowarat",
      name: "ถนนเยาวราช",
      nameEn: "Yaowarat Chinatown",
      description: "ไชน่าทาวน์ของกรุงเทพฯ เต็มไปด้วยร้านอาหาร อาหารทะเล และของหวานที่อร่อยที่สุด",
      descriptionEn: "Bangkok's Chinatown, packed with amazing seafood restaurants, street food and desserts.",
      category: "restaurant",
      region: "central",
      province: "กรุงเทพมหานคร",
      country: "TH",
      lat: 13.7399, lng: 100.5097,
      priceRange: 2, entryFee: 0,
      openDays: ["Daily"], openTime: "17:00", closeTime: "02:00",
      hasWifi: false, hasAC: false, hasParking: true,
      isVegetarian: true, isAccessible: true, isFeatured: true,
      images: { create: [
        { url: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80", order: 0 },
      ]},
    },
    {
      slug: "chiang-mai-sunday-walking-street",
      name: "ถนนคนเดินวันอาทิตย์",
      nameEn: "Sunday Walking Street",
      description: "ตลาดถนนคนเดินในตัวเมืองเชียงใหม่ มีของที่ระลึก อาหาร และสินค้าหัตถกรรมมากมาย",
      descriptionEn: "A popular Sunday night market in Chiang Mai's old city with handicrafts, food, and souvenirs.",
      category: "attraction",
      region: "north",
      province: "เชียงใหม่",
      country: "TH",
      lat: 18.7884, lng: 98.9877,
      priceRange: 1, entryFee: 0,
      openDays: ["Sunday"], openTime: "17:00", closeTime: "22:00",
      hasWifi: false, hasAC: false, hasParking: true,
      isVegetarian: true, isAccessible: true, isFeatured: false,
      images: { create: [
        { url: "https://images.unsplash.com/photo-1598803596490-9d8e5ea5f36c?auto=format&fit=crop&w=800&q=80", order: 0 },
      ]},
    },
    {
      slug: "phuket-patong",
      name: "หาดป่าตอง",
      nameEn: "Patong Beach",
      description: "หาดที่คึกคักที่สุดของภูเก็ต น้ำทะเลใสสวย มีกิจกรรมทางน้ำมากมาย",
      descriptionEn: "Phuket's liveliest beach with clear water and plenty of water sports activities.",
      category: "attraction",
      region: "south",
      province: "ภูเก็ต",
      country: "TH",
      lat: 7.8967, lng: 98.2975,
      priceRange: 2, entryFee: 0,
      openDays: ["Daily"], openTime: null, closeTime: null,
      hasWifi: false, hasAC: false, hasParking: true,
      isVegetarian: false, isAccessible: true, isFeatured: false,
      images: { create: [
        { url: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80", order: 0 },
      ]},
    },
    {
      slug: "bangkok-cafe-nap",
      name: "Nap Café Bangkok",
      nameEn: "Nap Café Bangkok",
      description: "คาเฟ่บรรยากาศดีในกรุงเทพฯ กาแฟคุณภาพ เบเกอรี่สด และพื้นที่นั่งทำงาน",
      descriptionEn: "A cozy Bangkok café with quality coffee, fresh pastries and co-working friendly space.",
      category: "cafe",
      region: "central",
      province: "กรุงเทพมหานคร",
      country: "TH",
      lat: 13.7563, lng: 100.5018,
      priceRange: 2, entryFee: 0,
      openDays: ["Mon-Sun"], openTime: "08:00", closeTime: "20:00",
      hasWifi: true, hasAC: true, hasParking: false,
      isVegetarian: true, isAccessible: true, isFeatured: false,
      images: { create: [
        { url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80", order: 0 },
      ]},
    },
    {
      slug: "scuba-diving-koh-tao",
      name: "ดำน้ำเกาะเต่า",
      nameEn: "Scuba Diving Koh Tao",
      description: "จุดหมายยอดนิยมสำหรับการเรียนดำน้ำ น้ำใส ปะการังสวย ราคาถูกที่สุดในโลก",
      descriptionEn: "World's most popular scuba diving destination for learning, with clear water and affordable prices.",
      category: "activity",
      region: "south",
      province: "สุราษฎร์ธานี",
      country: "TH",
      lat: 10.0956, lng: 99.8397,
      priceRange: 3, entryFee: 0,
      openDays: ["Daily"], openTime: "08:00", closeTime: "17:00",
      hasWifi: false, hasAC: false, hasParking: false,
      isVegetarian: false, isAccessible: false, isFeatured: true,
      images: { create: [
        { url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", order: 0 },
      ]},
    },
    {
      slug: "khao-yai-national-park",
      name: "อุทยานแห่งชาติเขาใหญ่",
      nameEn: "Khao Yai National Park",
      description: "มรดกโลก UNESCO ป่าดิบเขตร้อนที่สมบูรณ์ที่สุดในเอเชียตะวันออกเฉียงใต้",
      descriptionEn: "UNESCO World Heritage Site and one of the largest intact tropical forests in Southeast Asia.",
      category: "attraction",
      region: "central",
      province: "นครราชสีมา",
      country: "TH",
      lat: 14.4356, lng: 101.3727,
      priceRange: 2, entryFee: 400,
      openDays: ["Daily"], openTime: "06:00", closeTime: "18:00",
      hasWifi: false, hasAC: false, hasParking: true,
      isVegetarian: false, isAccessible: false, isFeatured: false,
      images: { create: [
        { url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80", order: 0 },
      ]},
    },
    {
      slug: "bangkok-grand-palace",
      name: "พระบรมมหาราชวัง",
      nameEn: "The Grand Palace",
      description: "พระราชวังอันยิ่งใหญ่และสง่างาม เป็นสัญลักษณ์ของกรุงเทพฯ และประเทศไทย",
      descriptionEn: "The magnificent Grand Palace is the symbol of Bangkok and Thailand, showcasing traditional Thai architecture.",
      category: "attraction",
      region: "central",
      province: "กรุงเทพมหานคร",
      country: "TH",
      lat: 13.7500, lng: 100.4913,
      priceRange: 2, entryFee: 500,
      openDays: ["Daily"], openTime: "08:30", closeTime: "15:30",
      hasWifi: false, hasAC: false, hasParking: true,
      isVegetarian: false, isAccessible: false, isFeatured: true,
      images: { create: [
        { url: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80", order: 0 },
      ]},
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

  // ─── DEMO USERS + POSTS ──────────────────────────────────────────────────
  // Note: these use fixed UUIDs (not real Supabase Auth UUIDs)
  // They allow feed/explore to show content without requiring a logged-in user.

  const demoUsers = [
    {
      id: "demo-user-001",
      email: "freePeople@demo.yourtrip.app",
      name: "free people",
      username: "free_people",
      avatarUrl: null,
      bio: "นักเดินทางสายธรรมชาติ ✈️ ไปแล้ว 15 ประเทศ",
      location: "เชียงใหม่",
    },
    {
      id: "demo-user-002",
      email: "shygirl@demo.yourtrip.app",
      name: "shy girl",
      username: "shy_girl_travel",
      avatarUrl: null,
      bio: "Solo traveler 🌸 ชอบคาเฟ่และธรรมชาติ",
      location: "กรุงเทพ",
    },
    {
      id: "demo-user-003",
      email: "wanderer@demo.yourtrip.app",
      name: "wanderer",
      username: "wanderer_th",
      avatarUrl: null,
      bio: "Hiking + Photography 📸",
      location: "เชียงราย",
    },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: u,
    });
    console.log(`✅ Demo User: ${u.name}`);
  }

  // Demo posts (linked to real place slugs above)
  const demoPosts = [
    {
      userId: "demo-user-001",
      content: "ช่วงเช้าที่สวยงามบนยอดดอย อากาศเย็นสบาย ทิวทัศน์สุดสวย ❄️ ใครอยากสัมผัสธรรมชาติต้องมาที่นี่ #เที่ยวเหนือ #ธรรมชาติ",
      images: ["https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=800&q=80"],
      tags: ["เที่ยวเหนือ", "ธรรมชาติ"],
      location: "ดอยอินทนนท์, เชียงใหม่",
      isPublic: true,
      placeSlug: "doi-inthanon",
    },
    {
      userId: "demo-user-002",
      content: "คาเฟ่สวย วิวดี กาแฟอร่อย ☕ ต้องมาลอง! บรรยากาศดีมากเลย แนะนำมาช่วงเช้าจะได้วิวหมอกสวยๆ #คาเฟ่ #เที่ยวเหนือ",
      images: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80"],
      tags: ["คาเฟ่", "เที่ยวเหนือ"],
      location: "เชียงใหม่",
      isPublic: true,
      placeSlug: null,
    },
    {
      userId: "demo-user-003",
      content: "วัดร่องขุ่น หรือ White Temple สวยมากๆ ทุกรายละเอียดประณีตมาก ศิลปะระดับโลก 🏛️ ถ้ามาเชียงรายต้องแวะ! #วัด #ต่างประเทศ",
      images: ["https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80"],
      tags: ["วัด", "เชียงราย"],
      location: "วัดร่องขุ่น, เชียงราย",
      isPublic: true,
      placeSlug: "chiang-rai-white-temple",
    },
    {
      userId: "demo-user-001",
      content: "Hiking ดอยอินทนนท์สุดเจ๋ง! 2,565 ม. เหนือทะเล อากาศดี วิวสวย ขอแนะนำมาตอนเช้าๆ เพื่อดูทะเลหมอก 🌄 #Hiking #ธรรมชาติ",
      images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80"],
      tags: ["Hiking", "ธรรมชาติ", "เที่ยวเหนือ"],
      location: "ดอยอินทนนท์, เชียงใหม่",
      isPublic: true,
      placeSlug: "doi-inthanon",
    },
    {
      userId: "demo-user-002",
      content: "ภูเก็ต ทะเลสวย น้ำใส ทรายขาว 🏖️ มาแล้วไม่อยากกลับเลย ถ้าใครชอบทะเลแนะนำเลย! #ทะเล #ภูเก็ต",
      images: ["https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80"],
      tags: ["ทะเล", "ภูเก็ต"],
      location: "ภูเก็ต",
      isPublic: true,
      placeSlug: null,
    },
  ];

  for (const p of demoPosts) {
    const { placeSlug, ...postData } = p;
    let placeId: string | null = null;
    if (placeSlug) {
      const place = await prisma.place.findUnique({ where: { slug: placeSlug }, select: { id: true } });
      placeId = place?.id ?? null;
    }
    await prisma.post.create({
      data: { ...postData, placeId },
    });
    console.log(`✅ Demo Post: ${postData.content.slice(0, 30)}...`);
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
