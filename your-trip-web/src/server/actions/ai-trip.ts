"use server";

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createTripSchema } from "@/lib/validations";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIPlanInput {
  province: string;
  groupType: "solo" | "couple" | "group" | "family";
  styles: string[];
  startDate: string;
  endDate: string;
  budget: number; // THB total
}

export interface AIItineraryItem {
  name: string;
  time: string;
  duration: number; // minutes
  notes: string;
  placeId?: string;
  placeName?: string;
}

export interface AIItineraryDay {
  day: number;
  theme: string;
  items: AIItineraryItem[];
}

export interface AIPlanResult {
  title: string;
  description: string;
  days: AIItineraryDay[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86_400_000) + 1);
}

function budgetLabel(budget: number): string {
  if (budget <= 3000) return "ประหยัด (< ฿3,000/วัน)";
  if (budget <= 6000) return "ปานกลาง (฿3,000–6,000/วัน)";
  if (budget <= 12000) return "สะดวกสบาย (฿6,000–12,000/วัน)";
  return "หรูหรา (> ฿12,000/วัน)";
}

function groupLabel(g: AIPlanInput["groupType"]): string {
  return { solo: "เดี่ยว", couple: "คู่รัก", group: "กลุ่มเพื่อน", family: "ครอบครัว" }[g];
}

// ─── generateAITrip ───────────────────────────────────────────────────────────

export async function generateAITrip(
  input: AIPlanInput
): Promise<{ data?: AIPlanResult; error?: string }> {
  try {
    const numDays = daysBetween(input.startDate, input.endDate);

    // Fetch relevant places from DB for context
    const places = await prisma.place.findMany({
      where: {
        isPublished: true,
        OR: [
          { province: { contains: input.province, mode: "insensitive" } },
          { name: { contains: input.province, mode: "insensitive" } },
          { region: { contains: input.province, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        category: true,
        province: true,
        description: true,
        priceRange: true,
        openTime: true,
        closeTime: true,
        hasWifi: true,
        isVegetarian: true,
      },
      take: 40,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    const placesContext =
      places.length > 0
        ? places
            .map(
              (p) =>
                `- ID:${p.id} | ${p.name}${p.nameEn ? ` (${p.nameEn})` : ""} | ประเภท:${p.category} | ราคา:${"฿".repeat(p.priceRange)} | เวลา:${p.openTime ?? "?"}-${p.closeTime ?? "?"}${p.description ? ` | ${p.description.slice(0, 80)}` : ""}`
            )
            .join("\n")
        : "ไม่มีข้อมูลสถานที่ในระบบ — ให้แนะนำสถานที่ท่องเที่ยวยอดนิยมในจังหวัดนั้นแทน";

    const prompt = `คุณเป็น AI วางแผนทริปท่องเที่ยวในประเทศไทยที่เชี่ยวชาญ

**ข้อมูลทริป:**
- ปลายทาง: ${input.province}
- ประเภทผู้เดินทาง: ${groupLabel(input.groupType)}
- สไตล์การท่องเที่ยว: ${input.styles.join(", ")}
- วันที่: ${input.startDate} ถึง ${input.endDate} (${numDays} วัน)
- งบประมาณ: ${budgetLabel(input.budget)}

**สถานที่ในระบบ (ใช้ ID จากรายการนี้เมื่อเป็นไปได้):**
${placesContext}

**สร้างแผนทริป ${numDays} วันที่เหมาะกับผู้เดินทาง** โดยจัดสถานที่ตามเวลา (เช้า/บ่าย/เย็น/ค่ำ) ให้สมเหตุสมผล

ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่น:
{
  "title": "ชื่อทริป (ภาษาไทย น่าสนใจ)",
  "description": "คำอธิบายสั้น 1-2 ประโยค",
  "days": [
    {
      "day": 1,
      "theme": "ธีมของวัน เช่น 'วันแรก — สำรวจเมืองเก่า'",
      "items": [
        {
          "name": "ชื่อสถานที่หรือกิจกรรม",
          "time": "09:00",
          "duration": 90,
          "notes": "เคล็ดลับหรือรายละเอียดสั้น",
          "placeId": "ID จากรายการข้างต้น หรือ null ถ้าไม่มี"
        }
      ]
    }
  ]
}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return mock data when no API key — good for dev/preview
      return { data: mockPlan(input.province, numDays) };
    }

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    // Extract JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { error: "AI ไม่สามารถสร้างแผนทริปได้ กรุณาลองใหม่" };

    const parsed = JSON.parse(jsonMatch[0]) as AIPlanResult;

    // Enrich with placeName from DB
    const placeMap = new Map(places.map((p) => [p.id, p.name]));
    for (const day of parsed.days) {
      for (const item of day.items) {
        if (item.placeId && placeMap.has(item.placeId)) {
          item.placeName = placeMap.get(item.placeId);
        } else {
          item.placeId = undefined;
        }
      }
    }

    return { data: parsed };
  } catch (err) {
    console.error("[generateAITrip]", err);
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
  }
}

// ─── saveAITrip ───────────────────────────────────────────────────────────────

export async function saveAITrip(
  plan: AIPlanResult,
  meta: { title: string; startDate: string; endDate: string; budget: number; isPublic: boolean }
): Promise<{ data?: { id: string }; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

    const parsed = createTripSchema.safeParse({
      title: meta.title,
      destination: meta.title.replace("ทริป", "").trim(),
      startDate: meta.startDate,
      endDate: meta.endDate,
      budget: meta.budget,
      description: plan.description,
      visibility: meta.isPublic ? "PUBLIC" : "PRIVATE",
    });

    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { title, destination, startDate, endDate, budget, description, visibility } = parsed.data;
    const numDays = daysBetween(startDate, endDate);

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        title,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget,
        description,
        isPublic: visibility === "PUBLIC",
        days: {
          create: Array.from({ length: numDays }, (_, i) => {
            const dayPlan = plan.days.find((d) => d.day === i + 1);
            return {
              day: i + 1,
              date: new Date(new Date(startDate).getTime() + i * 86_400_000),
              note: dayPlan?.theme ?? undefined,
              items: dayPlan
                ? {
                    create: dayPlan.items.map((item, order) => ({
                      name: item.name,
                      time: item.time,
                      note: item.notes,
                      placeId: item.placeId ?? undefined,
                      duration: item.duration,
                      order,
                    })),
                  }
                : undefined,
            };
          }),
        },
      },
    });

    return { data: { id: trip.id } };
  } catch (err) {
    console.error("[saveAITrip]", err);
    return { error: "ไม่สามารถบันทึกทริปได้" };
  }
}

// ─── Mock fallback (no API key) ───────────────────────────────────────────────

function mockPlan(province: string, numDays: number): AIPlanResult {
  const days: AIItineraryDay[] = Array.from({ length: Math.min(numDays, 3) }, (_, i) => ({
    day: i + 1,
    theme: [`วันแรก — เดินทางและสำรวจเมือง`, `วันที่สอง — ธรรมชาติและวัฒนธรรม`, `วันสุดท้าย — ช็อปปิ้งและของฝาก`][i] ?? `วันที่ ${i + 1}`,
    items: [
      { name: `เช็คอินที่พักใน${province}`, time: "12:00", duration: 30, notes: "พักผ่อนหลังเดินทาง" },
      { name: `สำรวจตลาดเช้า${province}`, time: "08:00", duration: 90, notes: "ลองอาหารท้องถิ่น" },
      { name: `วัดหรือสถานที่ทางประวัติศาสตร์`, time: "10:00", duration: 120, notes: "แต่งกายสุภาพ" },
      { name: `ร้านอาหารท้องถิ่นชื่อดัง`, time: "12:00", duration: 60, notes: "ลองเมนูพิเศษประจำจังหวัด" },
      { name: `จุดชมวิวยามเย็น`, time: "17:00", duration: 90, notes: "เหมาะถ่ายรูปช่วง Golden Hour" },
    ].slice(0, 4),
  }));

  return {
    title: `ทริป${province} ${numDays} วัน`,
    description: `แผนท่องเที่ยว${province}ที่ครบครันทั้งอาหาร วัฒนธรรม และธรรมชาติ เหมาะสำหรับทุกกลุ่ม`,
    days,
  };
}
