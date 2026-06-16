"use client";
import RouteError from "@/components/shared/RouteError";
export default function ProfileEditError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} message="โหลดหน้าแก้ไขโปรไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง" />;
}
