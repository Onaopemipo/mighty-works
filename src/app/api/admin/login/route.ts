import {
  createHmac,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  createAdminSessionToken,
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
} from "@/lib/admin/session";
import {
  getConfiguredAdminEmail,
  normalizeAdminEmail,
  verifyAdminPassword,
} from "@/lib/admin/credentials";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function genericFailure() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Invalid administrator credentials.",
    },
    {
      status: 401,
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}

function clientFingerprint(
  request: Request
) {
  const secret =
    process.env
      .REGISTRATION_RATE_LIMIT_SECRET;

  if (!secret) {
    return null;
  }

  const forwarded =
    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() ??
    "unknown";

  const userAgent =
    request.headers.get(
      "user-agent"
    ) ?? "unknown";

  return createHmac(
    "sha256",
    secret
  )
    .update(
      `admin-login:${forwarded}:${userAgent}`
    )
    .digest("hex");
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as {
        email?: unknown;
        password?: unknown;
      };

    const email =
      normalizeAdminEmail(
        typeof body.email ===
        "string"
          ? body.email
          : ""
      );

    const password =
      typeof body.password ===
      "string"
        ? body.password
        : "";

    const configuredEmail =
      getConfiguredAdminEmail();

    if (
      !configuredEmail ||
      !password
    ) {
      return genericFailure();
    }

    const fingerprint =
      clientFingerprint(
        request
      );

    if (!fingerprint) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Administrator login is temporarily unavailable.",
        },
        {
          status: 503,
        }
      );
    }

    const admin =
      createAdminClient();

    const {
      data: allowed,
      error: limitError,
    } = await admin.rpc(
      "consume_registration_rate_limit",
      {
        p_key_hash:
          fingerprint,
        p_limit: 5,
        p_window_seconds:
          900,
      }
    );

    if (
      limitError ||
      allowed !== true
    ) {
      /*
       * Deliberately generic:
       * do not reveal whether
       * rate limiting or credentials
       * caused the rejection.
       */
      return genericFailure();
    }

    if (
      email !==
      configuredEmail
    ) {
      return genericFailure();
    }

    if (
      !verifyAdminPassword(
        password
      )
    ) {
      return genericFailure();
    }

    const token =
      createAdminSessionToken(
        configuredEmail
      );

    const response =
      NextResponse.json({
        ok: true,
      });

    response.cookies.set(
      ADMIN_COOKIE_NAME,
      token,
      adminCookieOptions
    );

    response.headers.set(
      "Cache-Control",
      "no-store"
    );

    return response;
  } catch (error) {
    console.error(
      "Admin login failure",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Administrator login is temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}
