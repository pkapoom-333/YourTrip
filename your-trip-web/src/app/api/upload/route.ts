import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { createClient } from "@/lib/supabase/server";

// ── Storage detection (evaluated once at cold start) ─────────────────────────
const BLOB_CONFIGURED = !!process.env.BLOB_READ_WRITE_TOKEN;

const CLOUDINARY_PLACEHOLDER_NAMES = new Set([
  "root",
  "your-cloud-name",
  "changeme",
  "xxx",
  "example",
]);

function resolveCloudinaryCloudName(): string | undefined {
  const name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (!name || CLOUDINARY_PLACEHOLDER_NAMES.has(name.toLowerCase())) return undefined;
  // Cloudinary cloud names are short alphanumeric identifiers (e.g. dczrvpbnn)
  if (!/^[a-z0-9_-]+$/i.test(name)) return undefined;
  return name;
}

const CLOUDINARY_CLOUD_NAME = resolveCloudinaryCloudName();
const CLOUDINARY_CONFIGURED =
  !!CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY?.trim() &&
  !!process.env.CLOUDINARY_API_SECRET?.trim();

type UploadMode = "blob" | "cloudinary" | "unavailable";
const UPLOAD_MODE: UploadMode = BLOB_CONFIGURED ? "blob"
  : CLOUDINARY_CONFIGURED ? "cloudinary"
  : "unavailable";

if (CLOUDINARY_CONFIGURED) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else if (
  process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
  process.env.CLOUDINARY_API_KEY?.trim() &&
  process.env.CLOUDINARY_API_SECRET?.trim()
) {
  console.warn(
    "[upload] CLOUDINARY_* vars are set but cloud_name is invalid —",
    `got "${process.env.CLOUDINARY_CLOUD_NAME}".`,
    "Use the value from Cloudinary Dashboard → Product environment credentials.",
  );
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

  // ── Vercel Blob: FormData → server-side put (used by StoryUpload, PostCreate, etc.) ─
  if (UPLOAD_MODE === "blob" && contentType.includes("multipart/form-data")) {
    try {
      const { put } = await import("@vercel/blob");
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "uploads";

      if (!file) return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
      if (!ALLOWED_TYPES.includes(file.type))
        return NextResponse.json({ error: "รองรับ JPEG, PNG, WebP, GIF, MP4, WebM, MOV" }, { status: 400 });
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
      if (file.size > (isVideo ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES))
        return NextResponse.json({ error: `ไฟล์ต้องไม่เกิน ${isVideo ? "50" : "4"} MB` }, { status: 400 });

      const ext = file.name.split(".").pop() ?? "bin";
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const blob = await put(filename, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ url: blob.url });
    } catch (err) {
      console.error("[upload] blob formdata error:", err);
      return NextResponse.json({ error: "อัปโหลดล้มเหลว กรุณาลองใหม่" }, { status: 500 });
    }
  }

  // ── Vercel Blob: JSON handshake → client uploads directly to Vercel ─────────
  if (UPLOAD_MODE === "blob" && contentType.includes("application/json")) {
    const body = (await req.json()) as HandleUploadBody;
    try {
      const response = await handleUpload({
        token: process.env.BLOB_READ_WRITE_TOKEN,
        body,
        request: req,
        onBeforeGenerateToken: async (_pathname) => ({
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: VIDEO_MAX_BYTES,
          // No callbackUrl — skip onUploadCompleted to avoid token validation issues
        }),
        // onUploadCompleted intentionally omitted — avoids callback URL embed in token
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
      return NextResponse.json({ error: "\u0e2d\u0e31\u0e1b\u0e42\u0e2b\u0e25\u0e14\u0e25\u0e49\u0e21\u0e40\u0e2b\u0e25\u0e37\u0e2d \u0e01\u0e23\u0e38\u0e13\u0e32\u0e25\u0e2d\u0e07\u0e43\u0e2b\u0e21\u0e48" }, { status: 500 });
    }
  }

  // \u2500\u2500 No storage configured \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  return NextResponse.json(
    { error: "\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32 storage \u2014 \u0e01\u0e23\u0e38\u0e13\u0e32\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32 Vercel Blob \u0e2b\u0e23\u0e37\u0e2d Cloudinary" },
    { status: 503 }
  );
}

export const config = {
  api: { bodyParser: false },
};
