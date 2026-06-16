"use client";
import RouteError from "@/components/shared/RouteError";
export default function FeedError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} message="โหลด Feed ไม่สำเร็จ กรุณาลองอีกครั้ง" />;
}
