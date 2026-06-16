import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { createClient } from "@/lib/supabase/server";

// ── Storage detection (evaluated once at cold start) ─────────────────────────
// Priority: Blob > Cloudinary > unavailable
// Blob wins because it's client-side upload (no 4.5 MB server body limit).
const BLOB_CONFIGURED = !!process.env.BLOB_READ_WRITE_TOKEN;
const CLOUDINARY_CONFIGURED =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

type UploadMode = "blob" | "cloudinary" | "unavailable";
const UPLOAD_MODE: UploadMode = BLOB_CONFIGURED ? "blob"
  : CLOUDINARY_CONFIGURED ? "cloudinary"
  : "unavailable";

if (CLOUDINARY_CONFIGURED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// ── GET — mode probe ──────────────────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({ mode: UPLOAD_MODE });
}

// ── POST — upload handler ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";

  // ── Vercel Blob: JSON handshake → client uploads directly to Vercel ─────────
  if (UPLOAD_MODE === "blob" && contentType.includes("application/json")) {
    const body = (await req.json()) as HandleUploadBody;
    try {
      const response = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async () => ({
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: VIDEO_MAX_BYTES,
        }),
        onUploadCompleted: async () => {},
      });
      return NextResponse.json(response);
    } catch (err) {
      console.error("[upload] blob token error:", err);
      return NextResponse.json({ error: "อัปโหลดล้มเหลว กรุณาลองใหม่" }, { status: 500 });
    }
  }

  // ── Cloudinary: receive file, forward to Cloudinary ──────────────────────────
  if (UPLOAD_MODE === "cloudinary") {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "your-trip/posts";

      if (!file) return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
      if (!ALLOWED_TYPES.includes(file.type))
        return NextResponse.json({ error: "รองรับ JPEG, PNG, WebP, GIF, MP4, WebM, MOV" }, { status: 400 });

      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
      if (file.size > (isVideo ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES))
        return NextResponse.json({ error: `ไฟล์ต้องไม่เกิน ${isVideo ? "50" : "4"} MB` }, { status: 400 });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise<{
        secure_url: string; public_id: string; width: number; height: number;
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
      console.error("[upload] cloudinary error:", err);
      return NextResponse.json({ error: "อัปโหลดล้มเหลว กรุณาลองใหม่" }, { status: 500 });
    }
  }

  // ── No storage configured ─────────────────────────────────────────────────
  return NextResponse.json(
    { error: "ยังไม่ได้ตั้งค่า storage — กรุณาตั้งค่า Vercel Blob หรือ Cloudinary" },
    { status: 503 }
  );
}

export const config = {
  api: { bodyParser: false },
};
