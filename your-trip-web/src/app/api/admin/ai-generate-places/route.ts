import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "pakpoomtee24@gmail.com")
  .split(",")
  .map((e) => e.trim());

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    throw new Error("Unauthorized");
  }
}

// POST /api/admin/ai-generate-places — generate place suggestions via AI
export async function POST(req: NextRequest) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY ไม่ได้ตั้งค่า" }, { status: 503 });
  }

  const { province, category, count = 3 } = await req.json() as {
    province: string;
    category: string;
    count: number;
  };

  const categoryLabel: Record<string, string> = {
    attraction: "สถานที่ท่องเที่ยว",
    restaurant: "ร้านอาหาร",
    cafe: "คาเฟ่",
    hotel: "ที่พัก",
    activity: "กิจกรรมท่องเที่ยว",
  };

  const prompt = `สร้างข้อมูลสถานที่ท่องเที่ยวจริงใน${province} ประเภท${categoryLabel[category] ?? category} จำนวน ${count} สถานที่

ตอบในรูปแบบ JSON array เท่านั้น ไม่มี markdown code block:
[
  {
    "name": "ชื่อภาษาไทย",
    "nameEn": "English Name",
    "slug": "url-slug-lowercase-english-no-spaces",
    "description": "คำอธิบายภาษาไทย 2-3 ประโยค น่าสนใจ บอกจุดเด่น",
    "descriptionEn": "English description 2-3 sentences",
    "category": "${category}",
    "province": "${province}",
    "address": "ที่อยู่โดยย่อ",
    "priceRange": 1,
    "lat": 18.7904,
    "lng": 98.9847
  }
]

กฎ:
- ใช้สถานที่จริงที่มีอยู่จริงใน${province} ไม่แต่งขึ้น
- lat/lng ต้องเป็นพิกัดจริงโดยประมาณ
- priceRange: 1=฿ ฟรี/ถูก, 2=฿฿ ปานกลาง, 3=฿฿฿ แพง, 4=฿฿฿฿ หรูหรา
- slug: ตัวเล็ก อักษรอังกฤษ เชื่อมด้วย - เท่านั้น
- ห้ามซ้ำกัน`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json() as {
      content?: Array<{ type: string; text: string }>;
      error?: { message: string };
    };

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const text = data.content?.[0]?.text ?? "[]";
    // Parse JSON — strip any accidental markdown
    const jsonText = text.replace(/^```[\s\S]*?\n/, "").replace(/\n```$/, "").trim();
    const places = JSON.parse(jsonText) as unknown[];

    return NextResponse.json({ places });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PUT /api/admin/ai-generate-places — save a generated place to DB
export async function PUT(req: NextRequest) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const place = await req.json() as {
    name: string;
    nameEn: string;
    slug: string;
    description: string;
    descriptionEn: string;
    category: string;
    province: string;
    address: string;
    priceRange: number;
    lat: number;
    lng: number;
  };

  try {
    // Ensure unique slug
    let slug = place.slug;
    const existing = await prisma.place.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    await prisma.place.create({
      data: {
        slug,
        name: place.name,
        nameEn: place.nameEn,
        description: place.description,
        descriptionEn: place.descriptionEn,
        category: place.category,
        province: place.province,
        country: "TH",
        region: "central",
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        priceRange: place.priceRange,
        isPublished: true,
        isFeatured: false,
      },
    });

    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
