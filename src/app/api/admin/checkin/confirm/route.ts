import {
  NextResponse,
} from "next/server";

import {
  getAdminSession,
} from "@/lib/admin/session";
import {
  extractCheckInCredential,
} from "@/lib/checkin/payload";
import {
  resolveCheckInCredential,
} from "@/lib/checkin/service";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type ScannerRegistrationRow = {
  id: string;
  name: string;
  registration_ref:
    string | null;
  country: string;
  country_code:
    string | null;
  party_size: number;
  checked_in: boolean;
  checked_in_at:
    string | null;
};

type CheckInRpcRow = {
  outcome:
    | "check_in"
    | "partial_check_in"
    | "duplicate_scan"
    | "invalid_arrival_count"
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
  request: Request
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

  let body: {
    payload?: unknown;
    arrivalCount?: unknown;
    operationId?: unknown;
  };

  try {
    body =
      (await request.json()) as {
        payload?: unknown;
        arrivalCount?: unknown;
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

  const payload =
    typeof body.payload ===
    "string"
      ? body.payload.trim()
      : "";

  const arrivalCount =
    body.arrivalCount == null
      ? 1
      : Number(
          body.arrivalCount
        );

  const operationId =
    typeof body.operationId === "string"
      ? body.operationId.trim()
      : "";

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    !Number.isInteger(
      arrivalCount
    ) ||
    arrivalCount < 1
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid arrival count.",
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
          "Invalid check-in operation.",
      },
      {
        status: 400,
      }
    );
  }

  const credential =
    extractCheckInCredential(
      payload
    );

  if (!credential) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid check-in credential.",
      },
      {
        status: 400,
      }
    );
  }

  const resolved =
    await resolveCheckInCredential(
      credential
    );

  if (!resolved) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Check-in credential is invalid or inactive.",
      },
      {
        status: 404,
      }
    );
  }

  const admin =
    createAdminClient();

  const rpcName =
    "process_registration_checkin_scan_partial";

  const rpcArgs = {
    p_registration_id:
      resolved.registrationId,
    p_credential_version:
      resolved.credentialVersion,
    p_actor_email:
      session.email,
    p_arrival_count:
      arrivalCount,
    p_operation_id:
      operationId,
  };

  const {
    data: rpcData,
    error: rpcError,
  } = await admin.rpc(
    rpcName,
    rpcArgs
  );

  if (rpcError) {
    console.error(
      "Atomic scanner check-in failure:",
      rpcError
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to complete check-in.",
      },
      {
        status: 500,
      }
    );
  }

  const rpcRows =
    (
      rpcData ??
      []
    ) as unknown as CheckInRpcRow[];

  const state =
    rpcRows[0];

  if (
    state?.outcome ===
      "invalid_arrival_count" ||
    state?.outcome ===
      "invalid_count"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Arrival count exceeds the number still expected.",
      },
      {
        status: 409,
      }
    );
  }

  if (
    !state ||
    state.outcome ===
      "unavailable"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Registration is unavailable.",
      },
      {
        status: 404,
      }
    );
  }

  const {
    data: attendeeData,
    error: attendeeError,
  } = await admin
    .from("registrations")
    .select(
      [
        "id",
        "name",
        "registration_ref",
        "country",
        "country_code",
        "party_size",
        "checked_in",
        "checked_in_at",
      ].join(",")
    )
    .eq(
      "id",
      resolved.registrationId
    )
    .maybeSingle();

  if (
    attendeeError ||
    !attendeeData
  ) {
    console.error(
      "Post-check-in attendee lookup failure:",
      attendeeError
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Check-in completed but attendee details could not be loaded.",
      },
      {
        status: 500,
      }
    );
  }

  const attendee =
    attendeeData as unknown as ScannerRegistrationRow;

  return NextResponse.json(
    {
      ok: true,
      alreadyCheckedIn:
        state.outcome ===
        "duplicate_scan",
      auditEvent:
        state.outcome,
      attendance:
        state.checked_in_count == null
          ? null
          : {
              checkedInCount:
                state.checked_in_count,
              partySize:
                state.party_size ??
                attendee.party_size,
              remainingCount:
                state.remaining_count ??
                Math.max(
                  attendee.party_size -
                    state.checked_in_count,
                  0
                ),
              partial:
                state.outcome ===
                "partial_check_in",
              complete:
                (
                  state.remaining_count ??
                  0
                ) === 0,
            },
      attendee: {
        id:
          attendee.id,
        name:
          attendee.name,
        registrationRef:
          attendee.registration_ref,
        country:
          attendee.country,
        countryCode:
          attendee.country_code,
        partySize:
          attendee.party_size,
        checkedInAt:
          attendee.checked_in_at,
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
