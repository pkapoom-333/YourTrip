/**
 * Real Thai Places Seed — YourTrip SD-1 + SD-2
 * ~60 places across 10 provinces, all with lat/lng
 *
 * Run:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-places-real.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

// category: "attraction" | "restaurant" | "cafe" | "hotel" | "activity"
// region:   "north" | "south" | "east" | "west" | "central" | "international"
// priceRange: 1=฿  2=฿฿  3=฿฿฿  4=฿฿฿฿

const places = [

  // ══════════════════════════════════════════════════════════════
  // เชียงใหม่
  // ══════════════════════════════════════════════════════════════
  {
    slug: "doi-suthep-temple",
    name: "วัดพระธาตุดอยสุเทพ",
    nameEn: "Doi Suthep Temple",
    description: "วัดศักดิ์สิทธิ์คู่เมืองเชียงใหม่บนยอดเขาสูง 1,073 เมตร มีบันได 309 ขั้น วิวเมืองเชียงใหม่ทั้งเมือง สัญลักษณ์ของภาคเหนือ",
    descriptionEn: "Sacred mountain temple at 1,073m with 309-step naga staircase and panoramic views over Chiang Mai — the North's iconic landmark.",
    category: "attraction", region: "north", province: "เชียงใหม่", country: "TH",
    address: "ต.สุเทพ อ.เมือง จ.เชียงใหม่",
    lat: 18.8047, lng: 98.9219,
    priceRange: 1, entryFee: 30,
    openDays: ["Daily"], openTime: "06:00", closeTime: "20:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 200,
    isVegetarian: false, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80", order: 0 },
      { url: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80", order: 1 },
    ]},
  },
  {
    slug: "nimman-road-chiangmai",
    name: "ย่านนิมมานเหมินท์",
    nameEn: "Nimmanhaemin Road",
    description: "ย่านฮิปสเตอร์ใจกลางเชียงใหม่ เต็มไปด้วยคาเฟ่สไตล์มินิมอล ร้านอาหาร แกลเลอรี่ และบูติกมีเอกลักษณ์ คึกคักทั้งกลางวันและกลางคืน",
    descriptionEn: "Chiang Mai's hippest neighborhood full of minimalist cafés, restaurants, art galleries and boutiques — buzzing day and night.",
    category: "attraction", region: "north", province: "เชียงใหม่", country: "TH",
    address: "ถ.นิมมานเหมินท์ ต.สุเทพ อ.เมือง จ.เชียงใหม่",
    lat: 18.7995, lng: 98.9676,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: "10:00", closeTime: "22:00",
    hasWifi: true, hasAC: false, hasParking: true, parkingSpots: 100,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "sunday-walking-street-wualai",
    name: "ถนนคนเดินวันอาทิตย์ (วัวลาย)",
    nameEn: "Sunday Walking Street Wualai",
    description: "ตลาดเดินเท้าทุกวันอาทิตย์บนถนนวัวลาย สินค้าหัตถกรรม อาหารพื้นเมือง การแสดงวัฒนธรรม บรรยากาศสีสันสวยงาม",
    descriptionEn: "Every Sunday night market on Wualai Road with handicrafts, local food, and cultural performances.",
    category: "attraction", region: "north", province: "เชียงใหม่", country: "TH",
    address: "ถ.วัวลาย ต.หายยา อ.เมือง จ.เชียงใหม่",
    lat: 18.7762, lng: 98.9912,
    priceRange: 1, entryFee: 0,
    openDays: ["Sun"], openTime: "16:00", closeTime: "22:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 150,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1598803596490-9d8e5ea5f36c?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "ristr8to-lab-coffee",
    name: "Ristr8to Lab Coffee",
    nameEn: "Ristr8to Lab",
    description: "คาเฟ่สเปเชียลตี้ระดับโลก เจ้าของเคยชนะแชมป์บาริสต้าระดับนานาชาติ กาแฟคุณภาพสูง บรรยากาศมินิมอลสะอาดตา",
    descriptionEn: "World-class specialty coffee lab. National barista champion-level brews with freshly roasted single-origin beans.",
    category: "cafe", region: "north", province: "เชียงใหม่", country: "TH",
    address: "ซ.นิมมานเหมินท์ 3 ต.สุเทพ จ.เชียงใหม่",
    lat: 18.7997, lng: 98.9683,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: "07:30", closeTime: "18:00",
    hasWifi: true, hasAC: true, hasParking: true, parkingSpots: 20,
    isVegetarian: true, isAccessible: true, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80", order: 0 },
      { url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80", order: 1 },
    ]},
  },
  {
    slug: "khao-soi-islam",
    name: "ข้าวซอยอิสลาม",
    nameEn: "Khao Soi Islam",
    description: "ร้านข้าวซอยมุสลิมเก่าแก่ที่มีชื่อเสียงที่สุดในเชียงใหม่ เปิดมานานกว่า 70 ปี น้ำแกงข้นเข้มข้น เนื้อนุ่มหลุดกระดูก",
    descriptionEn: "Famous Muslim Khao Soi restaurant open 70+ years. Rich coconut curry broth with tender fall-off-the-bone meat.",
    category: "restaurant", region: "north", province: "เชียงใหม่", country: "TH",
    address: "185/3 ถ.ช้างเผือก ต.ช้างเผือก อ.เมือง จ.เชียงใหม่",
    lat: 18.7853, lng: 98.9991,
    priceRange: 1, entryFee: 0,
    openDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], openTime: "09:00", closeTime: "16:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 15,
    isVegetarian: false, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "night-bazaar-chiangmai",
    name: "ไนท์บาซาร์เชียงใหม่",
    nameEn: "Chiang Mai Night Bazaar",
    description: "ตลาดกลางคืนชื่อดังย่านช้างคลาน ของที่ระลึก หัตถกรรม เสื้อผ้า อาหารริมทาง การแสดงพื้นเมือง เปิดทุกคืน",
    descriptionEn: "Famous night market on Chang Khlan Road with handicrafts, souvenirs, street food and nightly folk performances.",
    category: "attraction", region: "north", province: "เชียงใหม่", country: "TH",
    address: "ถ.ช้างคลาน อ.เมือง จ.เชียงใหม่",
    lat: 18.7881, lng: 99.0048,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "18:00", closeTime: "24:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 300,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

  // ══════════════════════════════════════════════════════════════
  // กรุงเทพมหานคร
  // ══════════════════════════════════════════════════════════════
  {
    slug: "wat-phra-kaew-bkk",
    name: "วัดพระแก้ว",
    nameEn: "Temple of the Emerald Buddha",
    description: "วัดที่ศักดิ์สิทธิ์ที่สุดในประเทศไทย ภายในพระบรมมหาราชวัง ประดิษฐานพระพุทธมหามณีรัตนปฏิมากร (พระแก้วมรกต)",
    descriptionEn: "Thailand's most sacred temple inside the Grand Palace, home of the revered Emerald Buddha statue.",
    category: "attraction", region: "central", province: "กรุงเทพมหานคร", country: "TH",
    address: "ถ.นาพระลาน เขตพระนคร กรุงเทพฯ",
    lat: 13.7516, lng: 100.4927,
    priceRange: 2, entryFee: 500,
    openDays: ["Daily"], openTime: "08:30", closeTime: "15:30",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 100,
    isVegetarian: false, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80", order: 0 },
      { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80", order: 1 },
    ]},
  },
  {
    slug: "wat-arun-bkk",
    name: "วัดอรุณราชวราราม (วัดแจ้ง)",
    nameEn: "Wat Arun (Temple of Dawn)",
    description: "วัดสัญลักษณ์ริมแม่น้ำเจ้าพระยา ปรางค์สูง 82 เมตรประดับด้วยกระเบื้องเคลือบ สวยที่สุดยามพระอาทิตย์ตก",
    descriptionEn: "Iconic riverside temple with an 82m prang decorated with colorful porcelain — spectacular at sunset.",
    category: "attraction", region: "central", province: "กรุงเทพมหานคร", country: "TH",
    address: "158 ถ.อรุณอมรินทร์ เขตบางกอกใหญ่ กรุงเทพฯ",
    lat: 13.7437, lng: 100.4888,
    priceRange: 1, entryFee: 100,
    openDays: ["Daily"], openTime: "08:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: false,
    isVegetarian: false, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "asiatique-riverfront",
    name: "อเมเซียทีค เดอะ ริเวอร์ฟร้อนท์",
    nameEn: "Asiatique The Riverfront",
    description: "ตลาดกลางคืนริมแม่น้ำเจ้าพระยา โกดังเก่าสมัยอาณานิคม ร้านอาหาร ช็อปปิ้ง ชิงช้าสวรรค์ วิวตึกระฟ้าสวยงาม",
    descriptionEn: "Riverside night market in converted colonial warehouses with restaurants, shopping, a Ferris wheel and stunning city views.",
    category: "attraction", region: "central", province: "กรุงเทพมหานคร", country: "TH",
    address: "2194 ถ.เจริญกรุง เขตบางคอแหลม กรุงเทพฯ",
    lat: 13.7197, lng: 100.4975,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: "17:00", closeTime: "24:00",
    hasWifi: true, hasAC: false, hasParking: true, parkingSpots: 400,
    isVegetarian: true, isAccessible: true, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1541744573515-478c959628a0?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "lumphini-park-bkk",
    name: "สวนลุมพินี",
    nameEn: "Lumpini Park",
    description: "สวนสาธารณะใจกลางกรุงเทพฯ พื้นที่สีเขียวกว่า 500 ไร่ เหมาะออกกำลังกาย พายเรือ พักผ่อน มีมอนิเตอร์วาร์าณสีในบึงน้ำ",
    descriptionEn: "Bangkok's green lung — 500-rai park perfect for jogging, rowing, relaxing, with monitor lizards in the lake.",
    category: "attraction", region: "central", province: "กรุงเทพมหานคร", country: "TH",
    address: "ถ.พระราม 4 เขตปทุมวัน กรุงเทพฯ",
    lat: 13.7307, lng: 100.5415,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "04:30", closeTime: "21:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 200,
    isVegetarian: false, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "icon-siam-bkk",
    name: "ไอคอนสยาม",
    nameEn: "ICONSIAM",
    description: "ศูนย์การค้าริมแม่น้ำระดับ World Class มีตลาดน้ำในร่ม SookSiam จำลองวิถีไทย 77 จังหวัด แบรนด์หรู ร้านอาหารพรีเมียม",
    descriptionEn: "World-class riverside mall with indoor floating market SookSiam showcasing all 77 Thai provinces, luxury brands and premium dining.",
    category: "attraction", region: "central", province: "กรุงเทพมหานคร", country: "TH",
    address: "299 ถ.เจริญนคร เขตคลองสาน กรุงเทพฯ",
    lat: 13.7228, lng: 100.5094,
    priceRange: 3, entryFee: 0,
    openDays: ["Daily"], openTime: "10:00", closeTime: "22:00",
    hasWifi: true, hasAC: true, hasParking: true, parkingSpots: 2000,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "roots-coffee-bkk",
    name: "Roots Coffee Roaster",
    nameEn: "Roots Coffee Roaster",
    description: "คาเฟ่คั่วกาแฟสเปเชียลตี้ชั้นนำในกรุงเทพฯ เลือกเมล็ดจากเกษตรกรในประเทศ บรรยากาศมินิมอล",
    descriptionEn: "Bangkok's leading specialty coffee roaster sourcing from Thai farmers. Minimalist space with exceptional single-origin brews.",
    category: "cafe", region: "central", province: "กรุงเทพมหานคร", country: "TH",
    address: "ถ.เจริญกรุง เขตสีลม กรุงเทพฯ",
    lat: 13.7213, lng: 100.5154,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: "08:00", closeTime: "19:00",
    hasWifi: true, hasAC: true, hasParking: false,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

  // ══════════════════════════════════════════════════════════════
  // ภูเก็ต
  // ══════════════════════════════════════════════════════════════
  {
    slug: "promthep-cape-phuket",
    name: "แหลมพรหมเทพ",
    nameEn: "Promthep Cape",
    description: "จุดชมพระอาทิตย์ตกที่ดีที่สุดในภูเก็ต ปลายสุดทางใต้ของเกาะ วิวทะเลอันดามัน 180 องศา",
    descriptionEn: "Phuket's best sunset viewpoint at the island's southernmost tip with 180-degree Andaman Sea views.",
    category: "attraction", region: "south", province: "ภูเก็ต", country: "TH",
    address: "ต.ราไวย์ อ.เมือง จ.ภูเก็ต",
    lat: 7.7643, lng: 98.3038,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: null, closeTime: null,
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 100,
    isVegetarian: false, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "phuket-town-old",
    name: "เมืองเก่าภูเก็ต",
    nameEn: "Phuket Old Town",
    description: "ย่านชิโนโปรตุกีสเก่าแก่ อาคารสีสันสวย คาเฟ่อาร์ต ร้านอาหาร ถนนถลางถ่ายรูปสวย",
    descriptionEn: "Historic Sino-Portuguese neighborhood with colorful buildings, artsy cafés, restaurants and the famous Thalang Road.",
    category: "attraction", region: "south", province: "ภูเก็ต", country: "TH",
    address: "ถ.ถลาง ต.ตลาดใหญ่ อ.เมือง จ.ภูเก็ต",
    lat: 7.8831, lng: 98.3918,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "09:00", closeTime: "22:00",
    hasWifi: true, hasAC: false, hasParking: true, parkingSpots: 80,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "kata-beach-phuket",
    name: "หาดกะตะ",
    nameEn: "Kata Beach",
    description: "หาดทรายขาวเงียบสงบ น้ำทะเลใสมาก เหมาะว่ายน้ำและเล่นเซิร์ฟ สวยงามยามพระอาทิตย์ตก เงียบกว่าป่าตอง",
    descriptionEn: "Beautiful quiet white sand beach with clear water, perfect for swimming and surfing — much calmer than Patong.",
    category: "attraction", region: "south", province: "ภูเก็ต", country: "TH",
    address: "ต.กะรน อ.เมือง จ.ภูเก็ต",
    lat: 7.8204, lng: 98.2985,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: null, closeTime: null,
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 100,
    isVegetarian: false, isAccessible: false, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "phang-nga-bay-park",
    name: "อุทยานแห่งชาติอ่าวพังงา",
    nameEn: "Phang Nga Bay National Park",
    description: "อ่าวงดงามล้อมรอบด้วยเกาะหินปูน โด่งดังจาก James Bond Island เกาะปันหยีหมู่บ้านลอยน้ำ",
    descriptionEn: "Stunning bay with dramatic limestone karsts, the famous James Bond Island, and Ko Panyi floating fishing village.",
    category: "attraction", region: "south", province: "พังงา", country: "TH",
    address: "ต.เกาะปันหยี อ.เมืองพังงา จ.พังงา",
    lat: 8.2721, lng: 98.4852,
    priceRange: 3, entryFee: 300,
    openDays: ["Daily"], openTime: "07:00", closeTime: "17:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 100,
    isVegetarian: false, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

  // ══════════════════════════════════════════════════════════════
  // เกาะสมุย
  // ══════════════════════════════════════════════════════════════
  {
    slug: "chaweng-beach-koh-samui",
    name: "หาดเฉวง เกาะสมุย",
    nameEn: "Chaweng Beach Koh Samui",
    description: "หาดที่ยาวและสวยที่สุดในเกาะสมุย ทรายขาว น้ำทะเลใส ร้านอาหาร บาร์ กิจกรรมทางน้ำ คึกคักทั้งกลางวันและกลางคืน",
    descriptionEn: "Koh Samui's longest and most beautiful beach with white sand, clear water, restaurants, bars and water sports.",
    category: "attraction", region: "south", province: "สุราษฎร์ธานี", country: "TH",
    address: "ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี",
    lat: 9.5335, lng: 100.0614,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: null, closeTime: null,
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 50,
    isVegetarian: false, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", order: 0 },
      { url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80", order: 1 },
    ]},
  },
  {
    slug: "big-buddha-koh-samui",
    name: "วัดพระใหญ่ (Big Buddha) เกาะสมุย",
    nameEn: "Big Buddha Temple Koh Samui",
    description: "พระพุทธรูปทองขนาดใหญ่ 12 เมตร บนเกาะเล็กเชื่อมสะพาน สัญลักษณ์เกาะสมุย วิวทะเลสวยงาม บรรยากาศสงบร่มรื่น",
    descriptionEn: "12-meter golden Buddha on a small islet connected by causeway — the iconic symbol of Koh Samui with lovely sea views.",
    category: "attraction", region: "south", province: "สุราษฎร์ธานี", country: "TH",
    address: "ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี",
    lat: 9.5698, lng: 100.0624,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "07:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 80,
    isVegetarian: false, isAccessible: false, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "fishermans-village-samui",
    name: "หมู่บ้านชาวประมง บ่อผุด",
    nameEn: "Bo Phut Fisherman's Village",
    description: "ย่านชาวประมงเก่าแก่ อาคารไม้จีนยุโรปสวยงาม ร้านซีฟู้ดสด คาเฟ่บาร์ Walking Street ทุกคืนวันศุกร์",
    descriptionEn: "Charming old Chinese-European wooden buildings, fresh seafood restaurants, cafés and Friday Walking Street.",
    category: "attraction", region: "south", province: "สุราษฎร์ธานี", country: "TH",
    address: "ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี",
    lat: 9.5544, lng: 100.0131,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: "18:00", closeTime: "23:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 50,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1476514525405-8d4b4c284c1e?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

  // ══════════════════════════════════════════════════════════════
  // กระบี่
  // ══════════════════════════════════════════════════════════════
  {
    slug: "railay-beach-krabi",
    name: "หาดไร่เลย์",
    nameEn: "Railay Beach",
    description: "หาดสวยเข้าถึงได้ทางเรือเท่านั้น ล้อมรอบด้วยผาหินปูนสูงชัน ทรายขาว น้ำใส เหมาะปีนผาและดำน้ำตื้น",
    descriptionEn: "Paradise beach accessible only by boat, surrounded by towering limestone cliffs — perfect for rock climbing and snorkeling.",
    category: "attraction", region: "south", province: "กระบี่", country: "TH",
    address: "ต.อ่าวนาง อ.เมือง จ.กระบี่",
    lat: 8.0114, lng: 98.8376,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: null, closeTime: null,
    hasWifi: false, hasAC: false, hasParking: false,
    isVegetarian: false, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80", order: 0 },
      { url: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80", order: 1 },
    ]},
  },
  {
    slug: "tiger-cave-temple-krabi",
    name: "วัดถ้ำเสือ (Wat Tham Suea)",
    nameEn: "Tiger Cave Temple",
    description: "วัดบนยอดเขา ปีนบันได 1,237 ขั้น ชมวิว 360 องศาของกระบี่ เมืองและทะเล เหนื่อยแต่คุ้มมากๆ",
    descriptionEn: "Hilltop temple with 1,237 steps to the summit. 360-degree views of Krabi city and sea — exhausting but absolutely worth it.",
    category: "attraction", region: "south", province: "กระบี่", country: "TH",
    address: "ต.เขาทอง อ.เมือง จ.กระบี่",
    lat: 8.1064, lng: 98.9446,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "06:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 50,
    isVegetarian: false, isAccessible: false, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "four-islands-tour-krabi",
    name: "ทัวร์ 4 เกาะ กระบี่",
    nameEn: "Four Islands Tour Krabi",
    description: "ทัวร์เรือชมเกาะสวยสี่เกาะ น้ำทะเลสีเขียวมรกต หาดทรายขาว หาดสีชมพู ดำน้ำตื้นปะการัง",
    descriptionEn: "Boat tour to four stunning islands with emerald water, white sand, a pink beach and coral snorkeling.",
    category: "activity", region: "south", province: "กระบี่", country: "TH",
    address: "ท่าเรืออ่าวนาง อ.เมือง จ.กระบี่",
    lat: 7.5590, lng: 99.0500,
    priceRange: 2, entryFee: 800,
    openDays: ["Daily"], openTime: "08:00", closeTime: "17:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 50,
    isVegetarian: false, isAccessible: false, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

  // ══════════════════════════════════════════════════════════════
  // เชียงราย
  // ══════════════════════════════════════════════════════════════
  {
    slug: "white-temple-chiang-rai",
    name: "วัดร่องขุ่น (วัดขาว)",
    nameEn: "White Temple Chiang Rai",
    description: "ผลงานศิลปะร่วมสมัยของอาจารย์เฉลิมชัย ตัวอาคารสีขาวประดับกระจกเงาวาวในแสงแดด ไม่มีวัดใดเทียบได้",
    descriptionEn: "Contemporary Buddhist masterpiece by Chalermchai Kositpipat — entirely white plaster and glass, unlike any other temple.",
    category: "attraction", region: "north", province: "เชียงราย", country: "TH",
    address: "ต.ป่าอ้อดอนชัย อ.เมือง จ.เชียงราย",
    lat: 19.8247, lng: 99.7630,
    priceRange: 1, entryFee: 100,
    openDays: ["Mon", "Tue", "Wed", "Thu", "Fri"], openTime: "06:30", closeTime: "18:00",
    hasWifi: true, hasAC: false, hasParking: true, parkingSpots: 300,
    isVegetarian: false, isAccessible: true, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "blue-temple-chiang-rai",
    name: "วัดร่องเสือเต้น (วัดน้ำเงิน)",
    nameEn: "Blue Temple Chiang Rai",
    description: "วัดสีน้ำเงินเข้มตัดลวดลายทองอร่าม สร้างเสร็จปี 2559 ถ่ายรูปออกมาสวยมาก โดยเฉพาะช่วง Golden Hour",
    descriptionEn: "Stunning deep-blue temple with gold ornaments completed 2016 — incredibly photogenic especially during golden hour.",
    category: "attraction", region: "north", province: "เชียงราย", country: "TH",
    address: "ต.ริมกก อ.เมือง จ.เชียงราย",
    lat: 19.9126, lng: 99.8285,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "07:00", closeTime: "20:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 100,
    isVegetarian: false, isAccessible: true, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "golden-triangle-chiang-rai",
    name: "สามเหลี่ยมทองคำ",
    nameEn: "Golden Triangle",
    description: "จุดบรรจบสามประเทศ ไทย ลาว พม่า ริมแม่น้ำโขง มีพิพิธภัณฑ์ฝิ่น ล่องเรือชมแม่น้ำโขง ประวัติศาสตร์น่าสนใจ",
    descriptionEn: "Tri-border point of Thailand, Laos and Myanmar on the Mekong River, with an Opium Museum and scenic boat tours.",
    category: "attraction", region: "north", province: "เชียงราย", country: "TH",
    address: "ต.เวียง อ.เชียงแสน จ.เชียงราย",
    lat: 20.3555, lng: 100.0850,
    priceRange: 2, entryFee: 50,
    openDays: ["Daily"], openTime: "08:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 150,
    isVegetarian: false, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "chiang-rai-night-market",
    name: "ไนท์บาซาร์เชียงราย",
    nameEn: "Chiang Rai Night Bazaar",
    description: "ตลาดกลางคืนใจกลางเมืองเชียงราย อาหารพื้นเมืองราคาถูก สินค้าหัตถกรรมชาวเขา การแสดงวัฒนธรรมทุกคืน",
    descriptionEn: "Central night market with cheap local food, hilltribe handicrafts and nightly cultural performances.",
    category: "attraction", region: "north", province: "เชียงราย", country: "TH",
    address: "ถ.พหลโยธิน ต.เวียง อ.เมือง จ.เชียงราย",
    lat: 19.9103, lng: 99.8327,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "18:00", closeTime: "23:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 100,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1598803596490-9d8e5ea5f36c?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

  // ══════════════════════════════════════════════════════════════
  // อยุธยา
  // ══════════════════════════════════════════════════════════════
  {
    slug: "ayutthaya-history-park",
    name: "อุทยานประวัติศาสตร์พระนครศรีอยุธยา",
    nameEn: "Ayutthaya Historical Park",
    description: "มรดกโลก UNESCO อดีตราชธานีของไทย วัดพระราม วัดมหาธาตุ พระพักตร์ในรากไม้ ซากปรักหักพังอลังการ",
    descriptionEn: "UNESCO World Heritage Site — ancient ruins of Thailand's former capital with temples, chedis and the iconic Buddha head in tree roots.",
    category: "attraction", region: "central", province: "พระนครศรีอยุธยา", country: "TH",
    address: "ต.ประตูชัย อ.พระนครศรีอยุธยา จ.พระนครศรีอยุธยา",
    lat: 14.3553, lng: 100.5691,
    priceRange: 1, entryFee: 50,
    openDays: ["Daily"], openTime: "08:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 300,
    isVegetarian: false, isAccessible: true, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80", order: 0 },
      { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80", order: 1 },
    ]},
  },
  {
    slug: "wat-chaiwatthanaram-ayutthaya",
    name: "วัดไชยวัฒนาราม",
    nameEn: "Wat Chaiwatthanaram",
    description: "วัดริมแม่น้ำเจ้าพระยาสวยที่สุดในอยุธยา ปรางค์สไตล์เขมร แสงทองยามพระอาทิตย์ตกสาดส่องงดงามมาก",
    descriptionEn: "Ayutthaya's most beautiful riverside temple with Khmer-style prangs — stunning when bathed in golden sunset light.",
    category: "attraction", region: "central", province: "พระนครศรีอยุธยา", country: "TH",
    address: "ต.บ้านป้อม อ.พระนครศรีอยุธยา",
    lat: 14.3397, lng: 100.5481,
    priceRange: 1, entryFee: 50,
    openDays: ["Daily"], openTime: "08:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 100,
    isVegetarian: false, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "ayutthaya-floating-market",
    name: "ตลาดน้ำอโยธยา",
    nameEn: "Ayutthaya Floating Market",
    description: "ตลาดน้ำขนาดใหญ่บรรยากาศย้อนยุค อาหารพื้นเมือง ขนมไทย สินค้าท้องถิ่น ล่องเรือชมรอบตลาด",
    descriptionEn: "Large traditional floating market with local food, Thai desserts, souvenirs and boat tours through the market.",
    category: "attraction", region: "central", province: "พระนครศรีอยุธยา", country: "TH",
    address: "ต.กะมัง อ.พระนครศรีอยุธยา",
    lat: 14.3416, lng: 100.5869,
    priceRange: 1, entryFee: 0,
    openDays: ["Sat", "Sun"], openTime: "09:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 200,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1598803596490-9d8e5ea5f36c?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

  // ══════════════════════════════════════════════════════════════
  // พัทยา
  // ══════════════════════════════════════════════════════════════
  {
    slug: "pattaya-beach-main",
    name: "หาดพัทยา",
    nameEn: "Pattaya Beach",
    description: "หาดชื่อดังระดับโลก กิจกรรมทางน้ำครบครัน เจ็ตสกี กล้วยเรือใบ พาราเซล คึกคักมีชีวิตชีวาตลอดเวลา",
    descriptionEn: "World-famous beach with comprehensive water sports — jet skis, banana boats, parasailing — lively day and night.",
    category: "attraction", region: "east", province: "ชลบุรี", country: "TH",
    address: "ต.หนองปรือ อ.บางละมุง จ.ชลบุรี",
    lat: 12.9236, lng: 100.8753,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: null, closeTime: null,
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 200,
    isVegetarian: false, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "nong-nooch-garden",
    name: "สวนนงนุช",
    nameEn: "Nong Nooch Tropical Garden",
    description: "สวนพฤกษศาสตร์ระดับโลก 600 ไร่ สวนสไตล์ต่างๆ การแสดงช้างไทย ได้รับรางวัลสวนดีที่สุดในเอเชีย",
    descriptionEn: "Award-winning world-class tropical botanical garden with 600 rai of themed gardens and acclaimed Thai elephant shows.",
    category: "attraction", region: "east", province: "ชลบุรี", country: "TH",
    address: "ต.นาจอมเทียน อ.สัตหีบ จ.ชลบุรี",
    lat: 12.8028, lng: 100.9459,
    priceRange: 2, entryFee: 800,
    openDays: ["Daily"], openTime: "08:00", closeTime: "18:00",
    hasWifi: true, hasAC: false, hasParking: true, parkingSpots: 500,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "sanctuary-truth-pattaya",
    name: "ปราสาทสัจธรรม",
    nameEn: "Sanctuary of Truth",
    description: "ปราสาทไม้สักสูง 105 เมตร สร้างด้วยมือทั้งหลัง แกะสลักศาสนาต่างๆ งดงามอลังการ ยังก่อสร้างไม่เสร็จแต่เปิดให้ชม",
    descriptionEn: "Magnificent 105m all-teak sanctuary carved entirely by hand with intricate multi-religious motifs — still under 40-year construction.",
    category: "attraction", region: "east", province: "ชลบุรี", country: "TH",
    address: "206/2 ถ.นาเกลือ อ.บางละมุง จ.ชลบุรี",
    lat: 12.9517, lng: 100.8836,
    priceRange: 3, entryFee: 500,
    openDays: ["Daily"], openTime: "08:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 200,
    isVegetarian: false, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "koh-larn-coral-island",
    name: "เกาะล้าน (Coral Island)",
    nameEn: "Koh Larn",
    description: "เกาะปะการังห่างพัทยา 7.5 กม. หาดทรายขาวน้ำทะเลใส กิจกรรมทางน้ำหลากหลาย นั่งเรือเฟอร์รี่",
    descriptionEn: "Coral island 7.5km from Pattaya with white sand beaches, clear water and varied water sports. Ferry accessible.",
    category: "attraction", region: "east", province: "ชลบุรี", country: "TH",
    address: "ต.เกาะล้าน อ.บางละมุง จ.ชลบุรี",
    lat: 12.9022, lng: 100.7862,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: "07:00", closeTime: "17:00",
    hasWifi: false, hasAC: false, hasParking: false,
    isVegetarian: false, isAccessible: false, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

  // ══════════════════════════════════════════════════════════════
  // หัวหิน
  // ══════════════════════════════════════════════════════════════
  {
    slug: "hua-hin-beach-main",
    name: "หาดหัวหิน",
    nameEn: "Hua Hin Beach",
    description: "หาดทรายขาวยาว 5 กม. น้ำทะเลสงบ ขี่ม้าริมหาด เป็นรีสอร์ทตากอากาศโปรดของราชวงศ์ บรรยากาศผ่อนคลาย",
    descriptionEn: "5km white sand beach with calm water, horse riding, and tranquil resort atmosphere — Thailand's original royal beach resort.",
    category: "attraction", region: "central", province: "ประจวบคีรีขันธ์", country: "TH",
    address: "ต.หัวหิน อ.หัวหิน จ.ประจวบคีรีขันธ์",
    lat: 12.5631, lng: 99.9586,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: null, closeTime: null,
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 150,
    isVegetarian: false, isAccessible: true, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "cicada-market-hua-hin",
    name: "ตลาดนัดศิลปะซิคาดา",
    nameEn: "Cicada Market Hua Hin",
    description: "ตลาดนัดศิลปะกลางคืนบรรยากาศโรแมนติก งานศิลปะ ดนตรีสด อาหาร สินค้า Handmade เปิดวันศุกร์-อาทิตย์",
    descriptionEn: "Romantic open-air art market Fri-Sun with art, live music, food and handmade goods from Thai artists.",
    category: "attraction", region: "central", province: "ประจวบคีรีขันธ์", country: "TH",
    address: "83/159 ถ.พูลน้ำ ต.หัวหิน อ.หัวหิน",
    lat: 12.5510, lng: 99.9566,
    priceRange: 2, entryFee: 0,
    openDays: ["Fri", "Sat", "Sun"], openTime: "17:00", closeTime: "23:00",
    hasWifi: true, hasAC: false, hasParking: true, parkingSpots: 100,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1541744573515-478c959628a0?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "khao-sam-roi-yot",
    name: "อุทยานแห่งชาติเขาสามร้อยยอด",
    nameEn: "Khao Sam Roi Yot National Park",
    description: "อุทยานชายฝั่งที่มีเอกลักษณ์ ภูเขาหินปูนรูปร่างต่างๆ ถ้ำพระยานคร ทะเลสาบน้ำจืด ป่าชายเลน เหมาะ Birdwatching",
    descriptionEn: "Unique coastal park with distinctive limestone hills, Phraya Nakhon Cave, freshwater marshes and mangroves — a birdwatcher's paradise.",
    category: "attraction", region: "central", province: "ประจวบคีรีขันธ์", country: "TH",
    address: "ต.สามร้อยยอด อ.สามร้อยยอด จ.ประจวบคีรีขันธ์",
    lat: 12.1830, lng: 100.0028,
    priceRange: 1, entryFee: 200,
    openDays: ["Daily"], openTime: "06:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 100,
    isVegetarian: false, isAccessible: false, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

  // ══════════════════════════════════════════════════════════════
  // ขอนแก่น
  // ══════════════════════════════════════════════════════════════
  {
    slug: "bueng-kaen-nakhon-kk",
    name: "บึงแก่นนคร",
    nameEn: "Kaen Nakhon Lake",
    description: "บึงน้ำจืดขนาดใหญ่ใจกลางเมืองขอนแก่น สวนสาธารณะร่มรื่น วิ่งออกกำลังกาย ร้านอาหารริมน้ำ วิวพระธาตุขามแก่น",
    descriptionEn: "Large freshwater lake in the city center with shady park, jogging track, lakeside restaurants and views of Phra That Kham Kaen.",
    category: "attraction", region: "east", province: "ขอนแก่น", country: "TH",
    address: "ถ.บูรพา ต.ในเมือง อ.เมือง จ.ขอนแก่น",
    lat: 16.4271, lng: 102.8359,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "05:00", closeTime: "21:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 200,
    isVegetarian: false, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "tontan-market-kk",
    name: "ตลาดต้องตาน ขอนแก่น",
    nameEn: "Tontan Market Khon Kaen",
    description: "ตลาดใจกลางเมือง อาหารอีสานแท้ ข้าวเหนียว ไก่ย่าง ส้มตำ ลาบ ขนมพื้นบ้านราคาถูก บรรยากาศชุมชนเป็นกันเอง",
    descriptionEn: "Busy city center market with authentic Isaan food — sticky rice, grilled chicken, papaya salad, laab and local desserts at cheap prices.",
    category: "restaurant", region: "east", province: "ขอนแก่น", country: "TH",
    address: "ถ.กลางเมือง ต.ในเมือง อ.เมือง จ.ขอนแก่น",
    lat: 16.4386, lng: 102.8356,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "06:00", closeTime: "14:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 80,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "phra-that-kham-kaen",
    name: "วัดพระธาตุขามแก่น",
    nameEn: "Wat Phra That Kham Kaen",
    description: "วัดสำคัญคู่บ้านคู่เมืองขอนแก่น บนเกาะกลางบึงแก่นนคร พระธาตุเจดีย์งามสง่า บรรยากาศสงบร่มรื่น",
    descriptionEn: "The most important temple of Khon Kaen on an island in the lake, with a stately chedi and tranquil atmosphere.",
    category: "attraction", region: "east", province: "ขอนแก่น", country: "TH",
    address: "ต.ในเมือง อ.เมือง จ.ขอนแก่น",
    lat: 16.4216, lng: 102.8348,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "06:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 50,
    isVegetarian: false, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "nimit-mai-cafe-kk",
    name: "ย่านคาเฟ่นิมิตใหม่",
    nameEn: "Nimit Mai Cafe Zone",
    description: "ย่านคาเฟ่ฮิตขอนแก่น สไตล์ Industrial และ Modern นั่งทำงาน พักผ่อน ถ่ายรูป กาแฟคุณภาพดี บรรยากาศเท่ๆ",
    descriptionEn: "Khon Kaen's hippest café zone with Industrial and Modern style spaces — great for working, relaxing and Instagram-worthy shots.",
    category: "cafe", region: "east", province: "ขอนแก่น", country: "TH",
    address: "ถ.นิมิตใหม่ ต.ในเมือง อ.เมือง จ.ขอนแก่น",
    lat: 16.4428, lng: 102.8369,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "09:00", closeTime: "21:00",
    hasWifi: true, hasAC: true, hasParking: true, parkingSpots: 30,
    isVegetarian: true, isAccessible: true, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  // ══════════════════════════════════════════════════════════════
  // กรุงเทพมหานคร — ร้านอาหาร + คาเฟ่ เพิ่มเติม
  // ══════════════════════════════════════════════════════════════
  {
    slug: "pad-thai-thip-samai",
    name: "ผัดไทยไฟฉิ่ง ทิพย์สมัย",
    nameEn: "Thip Samai Pad Thai",
    description: "ผัดไทยสูตรโบราณที่โด่งดังที่สุดในกรุงเทพ เส้นบางกรอบ ไข่หุ้มเส้น ตั้งแต่ปี 2509 คิวยาวทุกคืน",
    descriptionEn: "Bangkok's most iconic Pad Thai since 1966. Crispy thin noodles wrapped in egg, always worth the queue.",
    category: "restaurant", region: "central", province: "กรุงเทพมหานคร", country: "TH",
    address: "313 Maha Chai Rd, Samran Rat, Phra Nakhon",
    lat: 13.7538, lng: 100.4988,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "17:00", closeTime: "02:00",
    hasWifi: false, hasAC: false, hasParking: false,
    isVegetarian: false, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "gaggan-anand-bkk",
    name: "Gaggan Anand",
    nameEn: "Gaggan Anand",
    description: "ร้านอาหารอินเดียสไตล์ progressive ที่ดีที่สุดในเอเชีย ติดอันดับ World's 50 Best หลายปีซ้อน",
    descriptionEn: "Progressive Indian cuisine ranked among Asia's best. Chef Gaggan Anand's boundary-pushing tasting menu.",
    category: "restaurant", region: "central", province: "กรุงเทพมหานคร", country: "TH",
    address: "68/1 Soi Langsuan, Ploenchit, Bangkok",
    lat: 13.7420, lng: 100.5406,
    priceRange: 4, entryFee: 0,
    openDays: ["Wed","Thu","Fri","Sat","Sun"], openTime: "18:00", closeTime: "23:00",
    hasWifi: true, hasAC: true, hasParking: true, parkingSpots: 20,
    isVegetarian: false, isAccessible: true, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "factory-coffee-bkk",
    name: "Factory Coffee",
    nameEn: "Factory Coffee",
    description: "สเปเชียลตี้คอฟฟี่ย่านสีลม บรรยากาศ industrial chic เมล็ดกาแฟคัดสรรจากทั่วโลก ฮิตในหมู่ coffee enthusiast",
    descriptionEn: "Specialty coffee in Silom with industrial-chic vibes. Single-origin beans, expert baristas, serious coffee.",
    category: "cafe", region: "central", province: "กรุงเทพมหานคร", country: "TH",
    address: "35 Silom Soi 7, Bang Rak, Bangkok",
    lat: 13.7244, lng: 100.5241,
    priceRange: 2, entryFee: 0,
    openDays: ["Mon","Tue","Wed","Thu","Fri","Sat"], openTime: "08:00", closeTime: "18:00",
    hasWifi: true, hasAC: true, hasParking: false,
    isVegetarian: true, isAccessible: false, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "chatuchak-market",
    name: "ตลาดนัดจตุจักร",
    nameEn: "Chatuchak Weekend Market",
    description: "ตลาดนัดที่ใหญ่ที่สุดในไทยและใหญ่ที่สุดในโลก มีกว่า 15,000 ร้านค้า สินค้าหัตถกรรม ของวินเทจ อาหาร",
    descriptionEn: "World's largest weekend market with 15,000+ stalls. Crafts, vintage goods, clothing, food — a Bangkok must.",
    category: "attraction", region: "central", province: "กรุงเทพมหานคร", country: "TH",
    address: "Kamphaeng Phet 2 Rd, Chatuchak, Bangkok",
    lat: 13.7999, lng: 100.5503,
    priceRange: 1, entryFee: 0,
    openDays: ["Sat","Sun"], openTime: "09:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 500,
    isVegetarian: false, isAccessible: true, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

  // ══════════════════════════════════════════════════════════════
  // เชียงใหม่ — ร้านอาหาร + คาเฟ่ เพิ่มเติม
  // ══════════════════════════════════════════════════════════════
  {
    slug: "khao-soi-islam-chiangmai",
    name: "ข้าวซอยอิสลาม",
    nameEn: "Khao Soi Islam",
    description: "ข้าวซอยฮาลาลที่ดีที่สุดในเชียงใหม่ น้ำแกงเข้มข้น เส้นกรอบอร่อย เปิดมาตั้งแต่ปี 2530",
    descriptionEn: "Best halal Khao Soi in Chiang Mai — rich curry broth, crispy noodles, open since 1987.",
    category: "restaurant", region: "north", province: "เชียงใหม่", country: "TH",
    address: "Charoenrat Rd, Chang Khlan, Mueang Chiang Mai",
    lat: 18.7829, lng: 98.9956,
    priceRange: 1, entryFee: 0,
    openDays: ["Daily"], openTime: "08:00", closeTime: "17:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 10,
    isVegetarian: false, isAccessible: false, isFeatured: false,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "akha-ama-coffee-chiangmai",
    name: "Akha Ama Coffee",
    nameEn: "Akha Ama Coffee",
    description: "คาเฟ่กาแฟจากชุมชนชาวอาข่า ดอยหมอกฟ้า เชียงใหม่ กาแฟ single origin จากชุมชนบนดอย ช่วยเหลือเกษตรกร",
    descriptionEn: "Specialty coffee grown by Akha hilltribe farmers on Doi Mok Fa. Fair trade, single origin, incredible flavour.",
    category: "cafe", region: "north", province: "เชียงใหม่", country: "TH",
    address: "9/1 Hussadhisawee Rd, Si Phum, Mueang Chiang Mai",
    lat: 18.7912, lng: 98.9851,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: "08:00", closeTime: "18:00",
    hasWifi: true, hasAC: false, hasParking: false,
    isVegetarian: true, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

  // ══════════════════════════════════════════════════════════════
  // ภูเก็ต — ร้านอาหาร + กิจกรรม
  // ══════════════════════════════════════════════════════════════
  {
    slug: "raya-restaurant-phuket",
    name: "ร้านอาหาร ระยา (บ้านร่มไม้)",
    nameEn: "Raya Restaurant",
    description: "อาหารไทยสไตล์บาบ๋าในบ้านโคโลเนียลเก่าแก่ใจกลางเมืองภูเก็ต ต้มยำกุ้งและแกงพะแนงเลื่องชื่อระดับโลก",
    descriptionEn: "Peranakan Thai cuisine in a heritage colonial shophouse. World-renowned Tom Yum and Panang curry.",
    category: "restaurant", region: "south", province: "ภูเก็ต", country: "TH",
    address: "48 Dibuk Rd, Talat Yai, Mueang Phuket",
    lat: 7.8839, lng: 98.3928,
    priceRange: 2, entryFee: 0,
    openDays: ["Daily"], openTime: "10:00", closeTime: "22:00",
    hasWifi: true, hasAC: true, hasParking: false,
    isVegetarian: false, isAccessible: true, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1561339429-c6d14c9fa399?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },
  {
    slug: "phi-phi-island-tour",
    name: "ทัวร์เกาะพีพี",
    nameEn: "Phi Phi Island Tour",
    description: "เที่ยวเกาะพีพีดอนและเกาะพีพีเล อ่าวมายา หาดทรายขาว น้ำทะเลใสแจ๋ว สถานที่ถ่ายทำ The Beach",
    descriptionEn: "Day trip to Phi Phi Don & Phi Phi Leh — Maya Bay, crystal waters, white sand. Where The Beach was filmed.",
    category: "activity", region: "south", province: "ภูเก็ต", country: "TH",
    address: "Rassada Pier, Mueang Phuket",
    lat: 7.8547, lng: 98.4060,
    priceRange: 2, entryFee: 400,
    openDays: ["Daily"], openTime: "07:00", closeTime: "18:00",
    hasWifi: false, hasAC: false, hasParking: true, parkingSpots: 50,
    isVegetarian: false, isAccessible: false, isFeatured: true,
    images: { create: [
      { url: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=800&q=80", order: 0 },
    ]},
  },

];

// ─── Seed function ────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌱 Seeding ${places.length} real Thai places across 10 provinces...\n`);
  let created = 0;
  let skipped = 0;

  for (const { images, ...placeData } of places) {
    const existing = await prisma.place.findUnique({ where: { slug: placeData.slug } });
    if (existing) {
      process.stdout.write(`  ⏭  ${placeData.name} — already exists\n`);
      skipped++;
      continue;
    }
    await prisma.place.create({
      data: {
        ...placeData,
        isPublished: true,
        images,
      },
    });
    process.stdout.write(`  ✅ ${placeData.name} (${placeData.province})\n`);
    created++;
  }

  const provinces = [...new Set(places.map((p) => p.province))];
  console.log(`\n🎉 Done! Created: ${created} | Skipped: ${skipped}`);
  console.log(`Provinces (${provinces.length}): ${provinces.join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
