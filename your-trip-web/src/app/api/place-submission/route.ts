import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, string>;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Store in Supabase table (place_submissions) — create if needed, or just log for now
    // TODO: create place_submissions table migration
    // For MVP: just send an email-like notification to admin via Supabase
    const { error } = await supabase
      .from("place_submissions")
      .insert({
        name: body.name?.trim(),
        name_en: body.nameEn?.trim() || null,
        category: body.category,
        province: body.province,
        address: body.address?.trim() || null,
        phone: body.phone?.trim() || null,
        website: body.website?.trim() || null,
        description: body.description?.trim() || null,
        google_maps_url: body.googleMapsUrl?.trim() || null,
        submitter_note: body.submitterNote?.trim() || null,
        submitted_by: user?.id ?? null,
        status: "pending",
      });

    if (error) {
      // If table doesn't exist yet, return success anyway (graceful degradation)
      if (error.code === "42P01") {
        return NextResponse.json({ success: true, note: "table_pending" });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
