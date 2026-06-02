export interface RouteSegment {
  distanceKm: number;
  durationMin: number;
}

/** ดึงระยะทาง + เวลาเดินทางโดยรถจาก OSRM public API */
export async function getDrivingRoute(
  coords: Array<{ lat: number; lng: number }>
): Promise<RouteSegment[]> {
  if (coords.length < 2) return [];

  const waypoints = coords.map((c) => `${c.lng},${c.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson&steps=false`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const json = await res.json() as {
    code: string;
    routes: Array<{
      legs: Array<{ distance: number; duration: number }>;
    }>;
  };
  if (json.code !== "Ok" || !json.routes[0]) return [];

  return json.routes[0].legs.map((leg) => ({
    distanceKm: Math.round((leg.distance / 1000) * 10) / 10,
    durationMin: Math.round(leg.duration / 60),
  }));
}

/** Haversine fallback — ระยะทางเส้นตรง */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(sin2)) * 10) / 10;
}
