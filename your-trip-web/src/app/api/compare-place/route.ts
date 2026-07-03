import { NextRequest, NextResponse } from "next/server";
import { getPlacesForComparison } from "@/server/actions/places";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json(null, { status: 400 });
  const { data } = await getPlacesForComparison([slug]);
  if (!data[0]) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(data[0]);
}
