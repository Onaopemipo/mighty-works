import {
  NextResponse,
} from "next/server";

import {
  getAdminSession,
} from "@/lib/admin/session";
import {
  getOrCreateCheckInCredential,
} from "@/lib/checkin/service";
import {
  createCheckInQrPayload,
} from "@/lib/checkin/payload";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const runtime =
  "nodejs";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      registrationId: string;
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
    registrationId,
  } = await context.params;

  const admin =
    createAdminClient();

  const {
    data: registration,
    error,
  } = await admin
    .from("registrations")
    .select(
      "id,registration_ref,registration_status"
    )
    .eq(
      "id",
      registrationId
    )
    .maybeSingle();

  if (
    error ||
    !registration ||
    registration.registration_status !==
      "confirmed"
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

  const credential =
    await getOrCreateCheckInCredential(
      registrationId
    );

  return NextResponse.json(
    {
      ok: true,
      registrationRef:
        registration.registration_ref,
      credentialVersion:
        credential.version,
      qrPayload:
        createCheckInQrPayload(
          credential.credential
        ),
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}
