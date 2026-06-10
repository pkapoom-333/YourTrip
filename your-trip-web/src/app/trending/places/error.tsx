"use client";
import RouteError from "@/components/shared/RouteError";
export default function TrendingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} message="โหลดสถานที่ยอดนิยมไม่สำเร็จ กรุณาลองอีกครั้ง" />;
}
