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
    | "partial_check_in"
    | "check_out"
    | "partial_check_out"
    | "already_checked_in"
    | "already_checked_out"
    | "invalid_count"
    | "duplicate_operation"
    | "unavailable";
  checked_in: boolean;
  checked_in_at:
    string | null;
  checked_in_count?:
    number;
  party_size?:
    number;
  remaining_count?:
    number;
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
    attendanceCount?: unknown;
    operationId?: unknown;
  };

  try {
    body =
      (await request.json()) as {
        action?: unknown;
        attendanceCount?: unknown;
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

  const attendanceCount =
    body.attendanceCount == null
      ? 1
      : Number(
          body.attendanceCount
        );

  const operationId =
    typeof body.operationId === "string"
      ? body.operationId.trim()
      : "";

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    !Number.isInteger(
      attendanceCount
    ) ||
    attendanceCount < 1
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid attendance count.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    !operationId ||
    !uuidPattern.test(operationId)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid attendance operation.",
      },
      {
        status: 400,
      }
    );
  }

  const admin =
    createAdminClient();

  const rpcName =
    "set_registration_attendance_admin_partial";

  const rpcArgs = {
    p_registration_id:
      id,
    p_action:
      body.action,
    p_actor_email:
      session.email,
    p_count:
      attendanceCount,
    p_operation_id:
      operationId,
  };

  const {
    data,
    error,
  } = await admin.rpc(
    rpcName,
    rpcArgs
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
    result?.outcome ===
      "invalid_count"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Attendance count exceeds the available party count.",
      },
      {
        status: 409,
      }
    );
  }

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
      attendance:
        result.checked_in_count == null
          ? null
          : {
              checkedInCount:
                result.checked_in_count,
              partySize:
                result.party_size ?? 1,
              remainingCount:
                result.remaining_count ?? 0,
              partial:
                result.checked_in_count > 0 &&
                (
                  result.remaining_count ??
                  0
                ) > 0,
              complete:
                (
                  result.remaining_count ??
                  0
                ) === 0,
            },
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}
