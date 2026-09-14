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
    action?:
      | "check_in"
      | "check_out";
  };

  try {
    body =
      (await request.json()) as {
        action?:
          | "check_in"
          | "check_out";
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

  const checkedIn =
    body.action ===
    "check_in";

  const {
    data,
    error,
  } = await admin
    .from("registrations")
    .update({
      checked_in:
        checkedIn,
      checked_in_at:
        checkedIn
          ? new Date()
              .toISOString()
          : null,
    })
    .eq(
      "id",
      id
    )
    .eq(
      "registration_status",
      "confirmed"
    )
    .select(
      "id,checked_in,checked_in_at"
    )
    .maybeSingle();

  if (
    error ||
    !data
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to update attendance.",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json({
    ok: true,
    checkedIn:
      data.checked_in,
    checkedInAt:
      data.checked_in_at,
  });
}
