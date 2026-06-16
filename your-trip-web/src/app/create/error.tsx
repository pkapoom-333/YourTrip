"use client";
import RouteError from "@/components/shared/RouteError";
export default function CreateError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} message="เกิดข้อผิดพลาดในหน้าสร้างโพสต์ กรุณาลองอีกครั้ง" />;
}
