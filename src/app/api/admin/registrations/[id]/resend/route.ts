import {
  NextResponse,
} from "next/server";

import {
  getAdminSession,
} from "@/lib/admin/session";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  issueInvitationForEmail,
} from "@/lib/invitations/service";

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

  const admin =
    createAdminClient();

  const {
    data:
      registration,
    error,
  } = await admin
    .from("registrations")
    .select(
      "email"
    )
    .eq(
      "id",
      id
    )
    .maybeSingle();

  if (
    error ||
    !registration
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

  const origin =
    process.env
      .NEXT_PUBLIC_SITE_URL
      ?.trim() ||
    new URL(
      request.url
    ).origin;

  try {
    const result =
      await issueInvitationForEmail({
        email:
          registration.email,
        origin,
        rotate: true,
      });

    return NextResponse.json({
      ok: true,
      emailStatus:
        result?.emailStatus ??
        "failed",
    });
  } catch (resendError) {
    console.error(
      "Admin invitation resend failed",
      resendError
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to resend invitation.",
      },
      {
        status: 500,
      }
    );
  }
}
