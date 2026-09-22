import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

/*
 * MW-HOME-V3-S10-B2A-B1 — PUBLIC HEALTH CONTRACT HARDENING
 *
 * Public callers receive service availability only.
 *
 * Database errors, conference statistics and project
 * internals are intentionally excluded from the response.
 *
 * The underlying database read remains authoritative so
 * HTTP success still represents an operational Supabase
 * dependency rather than route availability alone.
 */

const HEALTH_HEADERS = {
  "Cache-Control":
    "no-store, max-age=0",
} as const;

function healthResponse(
  ok: boolean
) {
  return NextResponse.json(
    {
      ok,
      service: "supabase",
    },
    {
      status:
        ok
          ? 200
          : 503,
      headers:
        HEALTH_HEADERS,
    }
  );
}

export async function GET() {
  try {
    const supabase =
      await createClient();

    const {
      error,
    } = await supabase
      .from("conference_stats")
      .select("id")
      .eq("id", 1)
      .single();

    if (error) {
      return healthResponse(
        false
      );
    }

    return healthResponse(
      true
    );
  } catch {
    return healthResponse(
      false
    );
  }
}
