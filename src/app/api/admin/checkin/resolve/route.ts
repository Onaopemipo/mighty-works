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
  ticket_type: string;
  party_size: number;
  registration_status:
    string;
  checked_in: boolean;
  checked_in_at:
    string | null;
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
  };

  try {
    body =
      (await request.json()) as {
        payload?: unknown;
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

  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "QR payload is required.",
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
          "This is not a valid Mighty Works check-in credential.",
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
          "Check-in credential is invalid or no longer active.",
      },
      {
        status: 404,
      }
    );
  }

  const admin =
    createAdminClient();

  const {
    data: registration,
    error,
  } = await admin
    .from("registrations")
    .select(
      [
        "id",
        "name",
        "registration_ref",
        "country",
        "country_code",
        "ticket_type",
        "party_size",
        "registration_status",
        "checked_in",
        "checked_in_at",
      ].join(",")
    )
    .eq(
      "id",
      resolved.registrationId
    )
    .maybeSingle();

  const typedRegistration =
    registration
      ? (
          registration as unknown as ScannerRegistrationRow
        )
      : null;

  if (
    error ||
    !typedRegistration ||
    typedRegistration.registration_status !==
      "confirmed"
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

  return NextResponse.json(
    {
      ok: true,
      attendee: {
        id:
          typedRegistration.id,
        name:
          typedRegistration.name,
        registrationRef:
          typedRegistration.registration_ref,
        country:
          typedRegistration.country,
        countryCode:
          typedRegistration.country_code,
        ticketType:
          typedRegistration.ticket_type,
        partySize:
          typedRegistration.party_size,
        checkedIn:
          typedRegistration.checked_in,
        checkedInAt:
          typedRegistration.checked_in_at,
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
