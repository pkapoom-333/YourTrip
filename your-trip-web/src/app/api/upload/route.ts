import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";

// Cloudinary config (requires env vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CLOUDINARY_CONFIGURED =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

const IMAGE_MAX_BYTES = 10 * 1024 * 1024;  // 10 MB
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;  // 50 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "your-trip/posts";

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "รองรับ JPEG, PNG, WebP, GIF, MP4, WebM, MOV" }, { status: 400 });
    }

    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const maxBytes = isVideo ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: `ไฟล์ต้องไม่เกิน ${isVideo ? "50" : "10"} MB` }, { status: 400 });
    }

    // TODO: Cloudinary Phase 2 — mock upload returns a picsum placeholder
    if (!CLOUDINARY_CONFIGURED) {
      const seed = encodeURIComponent(file.name.replace(/\.[^.]+$/, ""));
      const mockUrl = `https://picsum.photos/seed/${seed}/800/600`;
      return NextResponse.json({
        url: mockUrl,
        publicId: `mock/${seed}`,
        width: 800,
        height: 600,
      });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
    }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          ...(isVideo ? {} : {
            transformation: [
              { quality: "auto", fetch_format: "auto" },
              { width: 1200, height: 1200, crop: "limit" },
            ],
          }),
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Upload failed"));
          else resolve(result as typeof result & { secure_url: string; public_id: string; width: number; height: number });
        }
      ).end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error("[upload] error:", err);
    return NextResponse.json({ error: "อัปโหลดล้มเหลว กรุณาลองใหม่" }, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false },
};
