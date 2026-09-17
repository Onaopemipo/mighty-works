import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "@/lib/invitations/token";
import {
  sendInvitationEmail,
  type InvitationEmailResult,
} from "@/lib/invitations/email";
import {
  getOrCreateCheckInCredential,
} from "@/lib/checkin/service";
import {
  createCheckInQrPayload,
} from "@/lib/checkin/payload";
import {
  createCheckInQrDataUrl,
  createCheckInQrPng,
} from "@/lib/checkin/qr";

type InvitationRegistration = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
  email: string;
  country: string;
  country_code: string | null;
  registration_ref: string | null;
};

export type InvitationIssueResult = {
  invitationUrl: string;
  qrPayload: string;
  qrDataUrl: string;
  emailStatus:
    | "pending"
    | "sent"
    | "failed"
    | "skipped";
  registration: InvitationRegistration;
};

function attendeeName(
  registration: InvitationRegistration
) {
  const structured = [
    registration.first_name,
    registration.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return structured ||
    registration.name;
}

export async function issueInvitationForEmail({
  email,
  origin,
  rotate = false,
}: {
  email: string;
  origin: string;
  rotate?: boolean;
}): Promise<InvitationIssueResult | null> {
  const admin =
    createAdminClient();

  const normalizedEmail =
    email.trim().toLowerCase();

  const {
    data: registration,
    error: registrationError,
  } = await admin
    .from("registrations")
    .select(
      "id,first_name,last_name,name,email,country,country_code,registration_ref"
    )
    .eq(
      "email",
      normalizedEmail
    )
    .maybeSingle();

  if (registrationError) {
    throw registrationError;
  }

  if (!registration) {
    return null;
  }

  const {
    data: existing,
    error: existingError,
  } = await admin
    .from(
      "registration_invitations"
    )
    .select(
      "id,token_hash,token_version,email_status"
    )
    .eq(
      "registration_id",
      registration.id
    )
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  /*
   * We never store the raw token.
   * Therefore a fresh raw token is
   * generated whenever we need to
   * surface or resend an invitation.
   */
  const rawToken =
    generateInvitationToken();

  const tokenHash =
    hashInvitationToken(
      rawToken
    );

  const invitationUrl =
    `${origin.replace(/\/$/, "")}/invite/${rawToken}`;

  const now =
    new Date().toISOString();

  const {
    error: invitationError,
  } = await admin
    .from(
      "registration_invitations"
    )
    .upsert(
      {
        registration_id:
          registration.id,
        token_hash:
          tokenHash,
        token_version:
          rotate && existing
            ? (
                existing.token_version ??
                1
              ) + 1
            : (
                existing?.token_version ??
                1
              ),
        email_status:
          "pending",
        last_email_attempt_at:
          now,
        last_email_error:
          null,
      },
      {
        onConflict:
          "registration_id",
      }
    );

  if (invitationError) {
    throw invitationError;
  }

  const checkInCredential =
    await getOrCreateCheckInCredential(
      registration.id
    );

  const qrPayload =
    createCheckInQrPayload(
      checkInCredential.credential
    );

  const [
    qrDataUrl,
    qrPng,
  ] =
    await Promise.all([
      createCheckInQrDataUrl(
        qrPayload
      ),
      createCheckInQrPng(
        qrPayload
      ),
    ]);

  const emailResult:
    InvitationEmailResult =
    await sendInvitationEmail({
      to:
        registration.email,
      attendeeName:
        attendeeName(
          registration
        ),
      registrationRef:
        registration.registration_ref ??
        "",
      country:
        registration.country,
      invitationUrl,
      qrPngBase64:
        qrPng.toString(
          "base64"
        ),
    });

  const {
    data: invitationRow,
  } = await admin
    .from(
      "registration_invitations"
    )
    .select(
      "email_attempts"
    )
    .eq(
      "registration_id",
      registration.id
    )
    .single();

  const nextAttempts =
    (invitationRow
      ?.email_attempts ??
      0) + 1;

  await admin
    .from(
      "registration_invitations"
    )
    .update({
      email_status:
        emailResult.status,
      email_attempts:
        nextAttempts,
      last_email_attempt_at:
        now,
      email_sent_at:
        emailResult.status ===
        "sent"
          ? now
          : null,
      email_provider_id:
        emailResult.providerId,
      last_email_error:
        emailResult.error,
    })
    .eq(
      "registration_id",
      registration.id
    );

  return {
    invitationUrl,
    qrPayload,
    qrDataUrl,
    emailStatus:
      emailResult.status,
    registration,
  };
}

export async function resolveInvitationToken(
  token: string
) {
  const admin =
    createAdminClient();

  const tokenHash =
    hashInvitationToken(
      token
    );

  const {
    data: invitation,
    error,
  } = await admin
    .from(
      "registration_invitations"
    )
    .select(
      `
        id,
        expires_at,
        email_status,
        registrations (
          id,
          first_name,
          last_name,
          name,
          email,
          country,
          country_code,
          registration_ref,
          ticket_type,
          registration_status
        )
      `
    )
    .eq(
      "token_hash",
      tokenHash
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!invitation) {
    return null;
  }

  if (
    new Date(
      invitation.expires_at
    ).getTime() <
    Date.now()
  ) {
    return null;
  }

  return invitation;
}
