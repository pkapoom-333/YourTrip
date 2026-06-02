"use client";

import { useEffect, useRef } from "react";
import type { MapPoint } from "./TripDayMap";

export default function TripDayMapInner({ points }: { points: MapPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    let map: import("leaflet").Map | undefined;

    async function init() {
      const L = (await import("leaflet")).default;

      // Fix default marker icons (webpack asset issue)
      // @ts-expect-error leaflet internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Leaflet CSS (inject once)
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      map = L.map(containerRef.current!);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      const latLngs: [number, number][] = points.map((p) => [p.lat, p.lng]);

      // Numbered markers
      points.forEach((p, i) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:28px;height:28px;border-radius:50%;
            background:#398AB9;color:white;font-weight:bold;font-size:12px;
            display:flex;align-items:center;justify-content:center;
            border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);
          ">${i + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([p.lat, p.lng], { icon })
          .bindPopup(`<b>${i + 1}. ${p.name}</b>`)
          .addTo(map!);
      });

      // Route polyline (dashed)
      if (latLngs.length > 1) {
        L.polyline(latLngs, {
          color: "#398AB9",
          weight: 3,
          dashArray: "8 6",
          opacity: 0.7,
        }).addTo(map);
      }

      // Fit bounds with padding
      map.fitBounds(L.latLngBounds(latLngs), { padding: [32, 32] });
    }

    init();

    return () => {
      map?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.map((p) => `${p.lat},${p.lng}`).join("|")]);

  return (
    <div
      ref={containerRef}
      className="h-56 rounded-2xl overflow-hidden border border-gray-100 z-0"
      style={{ position: "relative" }}
    />
  );
}
