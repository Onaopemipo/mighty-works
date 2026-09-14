import {
  createHmac,
} from "node:crypto";
import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  issueInvitationForEmail,
} from "@/lib/invitations/service";

export const runtime =
  "nodejs";

const GENERIC_MESSAGE =
  "If that email is registered, a fresh invitation link has been sent.";

function normalizeEmail(
  value: unknown
) {
  return typeof value === "string"
    ? value
        .trim()
        .toLowerCase()
        .slice(0, 254)
    : "";
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as {
        email?: unknown;
      };

    const email =
      normalizeEmail(
        body.email
      );

    if (
      !email ||
      !email.includes("@")
    ) {
      return NextResponse.json(
        {
          ok: true,
          message:
            GENERIC_MESSAGE,
        }
      );
    }

    const secret =
      process.env
        .REGISTRATION_RATE_LIMIT_SECRET;

    if (!secret) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Recovery service unavailable.",
        },
        {
          status: 503,
        }
      );
    }

    const keyHash =
      createHmac(
        "sha256",
        secret
      )
        .update(
          `invite-recovery:${email}`
        )
        .digest("hex");

    const admin =
      createAdminClient();

    const {
      data: allowed,
      error: rateError,
    } = await admin.rpc(
      "consume_registration_rate_limit",
      {
        p_key_hash:
          keyHash,
        p_limit: 3,
        p_window_seconds:
          900,
      }
    );

    if (
      rateError ||
      allowed !== true
    ) {
      return NextResponse.json(
        {
          ok: true,
          message:
            GENERIC_MESSAGE,
        }
      );
    }

    const origin =
      process.env
        .NEXT_PUBLIC_SITE_URL?.trim() ||
      new URL(
        request.url
      ).origin;

    try {
      await issueInvitationForEmail({
        email,
        origin,
        rotate: true,
      });
    } catch (error) {
      console.error(
        "Invitation recovery delivery failed",
        error
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        GENERIC_MESSAGE,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      message:
        GENERIC_MESSAGE,
    });
  }
}
