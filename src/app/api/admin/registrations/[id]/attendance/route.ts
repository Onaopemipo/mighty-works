import {
  NextResponse,
} from "next/server";

import {
  getAdminSession,
} from "@/lib/admin/session";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type AttendanceRpcRow = {
  outcome:
    | "check_in"
    | "check_out"
    | "already_checked_in"
    | "already_checked_out"
    | "unavailable";
  checked_in: boolean;
  checked_in_at:
    string | null;
};

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const session =
    await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 401,
      }
    );
  }

  const {
    id,
  } = await context.params;

  let body: {
    action?: unknown;
  };

  try {
    body =
      (await request.json()) as {
        action?: unknown;
      };
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid request.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    body.action !==
      "check_in" &&
    body.action !==
      "check_out"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid attendance action.",
      },
      {
        status: 400,
      }
    );
  }

  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin.rpc(
    "set_registration_attendance_admin",
    {
      p_registration_id:
        id,
      p_action:
        body.action,
      p_actor_email:
        session.email,
    }
  );

  if (error) {
    console.error(
      "Admin attendance transaction failure:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to update attendance.",
      },
      {
        status: 500,
      }
    );
  }

  const rows =
    (
      data ??
      []
    ) as unknown as AttendanceRpcRow[];

  const result =
    rows[0];

  if (
    !result ||
    result.outcome ===
      "unavailable"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Registration not found.",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      outcome:
        result.outcome,
      checkedIn:
        result.checked_in,
      checkedInAt:
        result.checked_in_at,
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}
