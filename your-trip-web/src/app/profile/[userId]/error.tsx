"use client";
import RouteError from "@/components/shared/RouteError";
export default function PublicProfileError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} message="โหลดโปรไฟล์ผู้ใช้ไม่สำเร็จ กรุณาลองอีกครั้ง" />;
}
