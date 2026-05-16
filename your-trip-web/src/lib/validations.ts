import { z } from "zod";

/* ── Auth ─────────────────────────────────────────────── */
export const registerSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(50),
  username: z
    .string()
    .min(3, "Username ต้องมีอย่างน้อย 3 ตัวอักษร")
    .max(20)
    .regex(/^[a-z0-9_]+$/, "ใช้ได้เฉพาะตัวเล็ก, ตัวเลข และ _"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
    .regex(/[0-9]/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว"),
  confirmPassword: z.string(),
  birthDate: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not"]).optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
  rememberMe: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/* ── Post ─────────────────────────────────────────────── */
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "กรุณากรอกเนื้อหา")
    .max(500, "เนื้อหาต้องไม่เกิน 500 ตัวอักษร"),
  images: z.array(z.string().url()).max(4, "อัปโหลดได้ไม่เกิน 4 รูป").optional(),
  location: z.string().max(100).optional(),
  placeId: z.string().optional(),
  tags: z.array(z.string().max(20)).max(10).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

/* ── Trip ─────────────────────────────────────────────── */
export const createTripSchema = z.object({
  title: z.string().min(2, "ชื่อทริปต้องมีอย่างน้อย 2 ตัวอักษร").max(100),
  destination: z.string().min(2, "กรุณากรอกจุดหมาย").max(100),
  startDate: z.string().min(1, "กรุณาเลือกวันเริ่มต้น"),
  endDate: z.string().min(1, "กรุณาเลือกวันสิ้นสุด"),
  budget: z.number().positive().optional(),
  description: z.string().max(500).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE"),
}).refine((d) => new Date(d.startDate) <= new Date(d.endDate), {
  message: "วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น",
  path: ["endDate"],
});

export const itineraryItemSchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1, "กรุณากรอกชื่อกิจกรรม").max(100),
  time: z.string().optional(),
  location: z.string().max(100).optional(),
  notes: z.string().max(300).optional(),
  placeId: z.string().optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type ItineraryItemInput = z.infer<typeof itineraryItemSchema>;

/* ── Travel Buddy ─────────────────────────────────────── */
export const createBuddyRequestSchema = z.object({
  destination: z.string().min(2, "กรุณากรอกจุดหมาย").max(100),
  startDate: z.string().min(1, "กรุณาเลือกวันเริ่มต้น"),
  endDate: z.string().min(1, "กรุณาเลือกวันสิ้นสุด"),
  description: z
    .string()
    .min(10, "กรุณาแนะนำตัวเองอย่างน้อย 10 ตัวอักษร")
    .max(300),
  budget: z.number().positive().optional(),
});

export type CreateBuddyRequestInput = z.infer<typeof createBuddyRequestSchema>;

/* ── Profile ──────────────────────────────────────────── */
export const updateProfileSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(50).optional(),
  username: z
    .string()
    .min(3, "Username ต้องมีอย่างน้อย 3 ตัวอักษร")
    .max(20)
    .regex(/^[a-z0-9_]+$/, "ใช้ได้เฉพาะตัวเล็ก, ตัวเลข และ _")
    .optional(),
  bio: z.string().max(200, "Bio ต้องไม่เกิน 200 ตัวอักษร").optional(),
  location: z.string().max(100).optional(),
  website: z.string().url("URL ไม่ถูกต้อง").optional().or(z.literal("")),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dateOfBirth: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
