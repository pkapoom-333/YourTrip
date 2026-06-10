"use client";
import RouteError from "@/components/shared/RouteError";
export default function CollectionDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} message="โหลดคอลเลกชันไม่สำเร็จ กรุณาลองอีกครั้ง" />;
}
