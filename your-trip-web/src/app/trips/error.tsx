"use client";
import RouteError from "@/components/shared/RouteError";
export default function TripsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} message="โหลดทริปไม่สำเร็จ กรุณาลองอีกครั้ง" />;
}
