import {
  NextResponse,
} from "next/server";

import {
  runConferenceReminders,
} from "@/lib/reminders/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const RESPONSE_HEADERS = {
  "Cache-Control":
    "no-store, max-age=0",
} as const;

export async function GET(
  request: Request
) {
  const secret =
    process.env.CRON_SECRET;

  if (
    !secret ||
    request.headers.get(
      "authorization"
    ) !== `Bearer ${secret}`
  ) {
    return NextResponse.json(
      { ok: false },
      {
        status: 401,
        headers: RESPONSE_HEADERS,
      }
    );
  }

  try {
    const result =
      await runConferenceReminders();

    return NextResponse.json(
      {
        ok: result.failed === 0,
        ...result,
      },
      {
        status:
          result.failed === 0
            ? 200
            : 500,
        headers: RESPONSE_HEADERS,
      }
    );
  } catch (error) {
    console.error(
      "Conference reminder run failed",
      error
    );

    return NextResponse.json(
      { ok: false },
      {
        status: 500,
        headers: RESPONSE_HEADERS,
      }
    );
  }
}
