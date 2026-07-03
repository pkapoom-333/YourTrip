"use client";
import RouteError from "@/components/shared/RouteError";
export default function TripDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} message="โหลดรายละเอียดทริปไม่สำเร็จ กรุณาลองอีกครั้ง" />;
}
