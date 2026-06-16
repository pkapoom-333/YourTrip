"use client";
import RouteError from "@/components/shared/RouteError";
export default function TripNewError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} message="เกิดข้อผิดพลาดในการสร้างทริป กรุณาลองอีกครั้ง" />;
}
