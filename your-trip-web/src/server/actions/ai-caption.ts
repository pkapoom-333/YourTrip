"use server";

import Anthropic from "@anthropic-ai/sdk";

export async function generateCaption(input: {
  location?: string;
  tags?: string[];
  imageCount?: number;
}): Promise<{ data?: string; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: "ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY" };

  const { location, tags = [], imageCount = 0 } = input;

  const context: string[] = [];
  if (location) context.push(`สถานที่: ${location}`);
  if (tags.length > 0) context.push(`แท็ก: ${tags.map((t) => `#${t}`).join(" ")}`);
  if (imageCount > 0) context.push(`รูปภาพ: ${imageCount} รูป`);

  const prompt = `คุณเป็น content writer สำหรับแอพท่องเที่ยว YourTrip
เขียน caption ภาษาไทยสำหรับโพสต์ท่องเที่ยว ความยาว 2-3 ประโยค สั้นกระชับ น่าอ่าน มีอารมณ์
${context.length > 0 ? `ข้อมูล: ${context.join(", ")}` : ""}
ตอบเฉพาะ caption เท่านั้น ไม่ต้องมีคำอธิบายเพิ่มเติม`;

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : null;
    if (!text) return { error: "ไม่ได้รับ caption จาก AI" };
    return { data: text };
  } catch {
    return { error: "ไม่สามารถสร้าง caption ได้ กรุณาลองใหม่" };
  }
}
