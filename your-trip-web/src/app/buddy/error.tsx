"use client";
import RouteError from "@/components/shared/RouteError";
export default function BuddyError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} message="โหลดหน้า Travel Buddy ไม่สำเร็จ กรุณาลองอีกครั้ง" />;
}
