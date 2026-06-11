import { NextRequest, NextResponse } from "next/server";

// Proxy Google Directions REST API to avoid browser CORS restriction.
// GET /api/directions?origin=lat,lng&destination=lat,lng&waypoints=lat,lng|...
export async function GET(req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No Maps API key" }, { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const waypoints = searchParams.get("waypoints");

  if (!origin || !destination) {
    return NextResponse.json({ error: "origin and destination required" }, { status: 400 });
  }

  const params = new URLSearchParams({ origin, destination, key: apiKey });
  if (waypoints) params.set("waypoints", waypoints);

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return NextResponse.json({ error: "upstream error" }, { status: res.status });
    const data = await res.json() as unknown;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}
