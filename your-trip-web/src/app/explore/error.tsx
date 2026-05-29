"use client";
import RouteError from "@/components/shared/RouteError";
export default function ExploreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} message="โหลดหน้าค้นหาไม่สำเร็จ กรุณาลองอีกครั้ง" />;
}
