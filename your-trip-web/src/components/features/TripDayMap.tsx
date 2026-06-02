"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

export interface MapPoint {
  name: string;
  lat: number;
  lng: number;
  order: number;
}

/* ── SSR-safe wrapper ── */
const LeafletMap = dynamic(() => import("./TripDayMapInner"), { ssr: false });

export default function TripDayMap({ points }: { points: MapPoint[] }) {
  const valid = useMemo(() => points.filter((p) => p.lat && p.lng), [points]);
  if (valid.length === 0) {
    return (
      <div className="h-48 bg-gray-50 rounded-2xl flex items-center justify-center text-sm text-gray-400 border border-gray-100">
        ไม่มีพิกัดสำหรับสถานที่ในวันนี้
      </div>
    );
  }
  return <LeafletMap points={valid} />;
}
