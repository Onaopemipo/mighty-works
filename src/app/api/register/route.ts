import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import {
  ATTENDEE_TYPES,
  type RegistrationPayload,
  type RegistrationResponse,
} from "@/lib/registration/contract";
import {
  getCountryName,
  isValidCountryCode,
} from "@/lib/registration/countries";
import { createAdminClient } from "@/lib/supabase/admin";

import {
  issueInvitationForEmail,
} from "@/lib/invitations/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN =
  /^[+()\-\s0-9]{7,30}$/;

function clean(
  value: unknown,
  maxLength: number
) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function getClientFingerprint(
  request: Request
) {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for"
    );

  const ip =
    forwardedFor
      ?.split(",")[0]
      ?.trim() ||
    request.headers.get(
      "x-real-ip"
    ) ||
    request.headers.get(
      "cf-connecting-ip"
    ) ||
    "unknown";

  const userAgent =
    request.headers.get(
      "user-agent"
    ) || "unknown";

  const pepper =
    process.env
      .REGISTRATION_RATE_LIMIT_SECRET;

  if (!pepper) {
    throw new Error(
      "REGISTRATION_RATE_LIMIT_SECRET is missing"
    );
  }

  return createHash("sha256")
    .update(
      `${pepper}|${ip}|${userAgent}`
    )
    .digest("hex");
}

function failure(
  error: string,
  code:
    | "VALIDATION"
    | "DUPLICATE"
    | "RATE_LIMITED"
    | "SERVER",
  status: number
) {
  const response: RegistrationResponse = {
    ok: false,
    error,
    code,
  };

  return NextResponse.json(
    response,
    { status }
  );
}

export async function POST(
  request: Request
) {
  try {
    const contentLength = Number(
      request.headers.get(
        "content-length"
      ) ?? "0"
    );

    if (
      Number.isFinite(contentLength) &&
      contentLength > 20_000
    ) {
      return failure(
        "Registration request is too large.",
        "VALIDATION",
        413
      );
    }

    const raw =
      (await request.json()) as Partial<
        RegistrationPayload
      >;

    /*
     * Honeypot.
     * Humans never see or complete this field.
     */
    if (
      typeof raw.website === "string" &&
      raw.website.trim() !== ""
    ) {
      return NextResponse.json({
        ok: true,
        registrationRef:
          "MW26-CONFIRMED",
        firstName: "Guest",
        country: "",
        countryCode: "",
      } satisfies RegistrationResponse);
    }

    const firstName = clean(
      raw.firstName,
      60
    );

    const lastName = clean(
      raw.lastName,
      60
    );

    const email = clean(
      raw.email,
      160
    ).toLowerCase();

    const phone = clean(
      raw.phone,
      30
    );

    const countryCode = clean(
      raw.countryCode,
      2
    ).toUpperCase();

    const city = clean(
      raw.city,
      80
    );

    const stateRegion = clean(
      raw.stateRegion,
      80
    );

    const churchMinistry = clean(
      raw.churchMinistry,
      140
    );

    const attendeeType = clean(
      raw.attendeeType,
      60
    );

    const attendanceMode =
      raw.attendanceMode === "livestream"
        ? "livestream"
        : "in_person";

    const partySize = Number(
      raw.partySize ?? 1
    );

    if (
      firstName.length < 2 ||
      lastName.length < 2
    ) {
      return failure(
        "Please enter your first and last name.",
        "VALIDATION",
        400
      );
    }

    if (
      !EMAIL_PATTERN.test(email)
    ) {
      return failure(
        "Please enter a valid email address.",
        "VALIDATION",
        400
      );
    }

    if (
      phone &&
      !PHONE_PATTERN.test(phone)
    ) {
      return failure(
        "Please enter a valid phone number.",
        "VALIDATION",
        400
      );
    }

    if (
      !isValidCountryCode(
        countryCode
      )
    ) {
      return failure(
        "Please select a valid country.",
        "VALIDATION",
        400
      );
    }

    if (
      !ATTENDEE_TYPES.includes(
        attendeeType as
          (typeof ATTENDEE_TYPES)[number]
      )
    ) {
      return failure(
        "Please select a valid attendee type.",
        "VALIDATION",
        400
      );
    }

    if (
      !Number.isInteger(partySize) ||
      partySize < 1 ||
      partySize > 10
    ) {
      return failure(
        "Attendee count must be between 1 and 10.",
        "VALIDATION",
        400
      );
    }

    if (
      raw.consentPrivacy !== true
    ) {
      return failure(
        "Privacy consent is required to register.",
        "VALIDATION",
        400
      );
    }

    const country =
      getCountryName(countryCode);

    if (!country) {
      return failure(
        "Unable to resolve selected country.",
        "VALIDATION",
        400
      );
    }

    const supabase =
      createAdminClient();

    const fingerprint =
      getClientFingerprint(request);

    const {
      data: rateAllowed,
      error: rateError,
    } = await supabase.rpc(
      "consume_registration_rate_limit",
      {
        p_key_hash: fingerprint,
        p_limit: 5,
        p_window_seconds: 900,
      }
    );

    if (rateError) {
      console.error(
        "Registration rate limit failure:",
        rateError
      );

      return failure(
        "Registration service is temporarily unavailable.",
        "SERVER",
        503
      );
    }

    if (rateAllowed !== true) {
      return failure(
        "Too many registration attempts. Please try again later.",
        "RATE_LIMITED",
        429
      );
    }

    const fullName =
      `${firstName} ${lastName}`;

    const {
      data,
      error,
    } = await supabase
      .from("registrations")
      .insert({
        name: fullName,
        first_name: firstName,
        last_name: lastName,
        email,
        phone:
          phone || null,
        country,
        country_code: countryCode,
        city: city || null,
        state_region:
          stateRegion || null,
        church_ministry:
          churchMinistry || null,
        attendee_type:
          attendeeType,
        ticket_type:
          attendanceMode,
        party_size: partySize,
        consent_privacy: true,
        consent_updates:
          raw.consentUpdates === true,
        registration_status:
          "confirmed",
        checked_in: false,
        checked_in_at: null,
      })
      .select(
        "registration_ref,first_name,country,country_code"
      )
      .single();

    if (error) {
      if (
        error.code === "23505"
      ) {
        return failure(
          "That email address is already registered for Mighty Works Conference 2026.",
          "DUPLICATE",
          409
        );
      }

      console.error(
        "Registration insert failure:",
        error
      );

      return failure(
        "We could not complete your registration. Please try again.",
        "SERVER",
        500
      );
    }

    if (
      !data?.registration_ref
    ) {
      return failure(
        "Registration was created but no reference was returned.",
        "SERVER",
        500
      );
    }

    let invitationUrl:
      | string
      | undefined;

    let emailStatus:
      | "pending"
      | "sent"
      | "failed"
      | "skipped"
      | undefined;

    try {
      const origin =
        process.env
          .NEXT_PUBLIC_SITE_URL?.trim() ||
        new URL(
          request.url
        ).origin;

      const delivery =
        await issueInvitationForEmail({
          email,
          origin,
        });

      invitationUrl =
        delivery?.invitationUrl;

      emailStatus =
        delivery?.emailStatus;
    } catch (invitationError) {
      /*
       * Registration is already
       * confirmed at this point.
       * Invitation/email failure must
       * never roll back registration.
       */
      console.error(
        "Registration invitation delivery failed",
        invitationError
      );
    }

    const response: RegistrationResponse = {
      ok: true,
      registrationRef:
        data.registration_ref,
      firstName:
        data.first_name ??
        firstName,
      country:
        data.country ??
        country,
      countryCode:
        data.country_code ??
        countryCode,
      invitationUrl,
      emailStatus,
    };

    return NextResponse.json(
      response,
      {
        status: 201,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected registration error:",
      error
    );

    return failure(
      "Registration service is temporarily unavailable.",
      "SERVER",
      500
    );
  }
}
