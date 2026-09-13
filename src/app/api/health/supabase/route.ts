import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("conference_stats")
      .select(
        "total_registrations,total_attendees,countries_represented,churches_represented,updated_at"
      )
      .eq("id", 1)
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          service: "supabase",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      service: "supabase",
      project: "Mighty Works Conference 2026",
      stats: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "supabase",
        error:
          error instanceof Error ? error.message : "Unknown Supabase error",
      },
      { status: 500 }
    );
  }
}
