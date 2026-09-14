import {
  notFound,
} from "next/navigation";

import {
  SecureInvitationView,
} from "@/components/invite/secure-invitation-view";
import {
  resolveInvitationToken,
} from "@/lib/invitations/service";

export const dynamic =
  "force-dynamic";

export default async function SecureInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    print?: string;
  }>;
}) {
  const {
    token,
  } = await params;

  const query =
    await searchParams;

  const invitation =
    await resolveInvitationToken(
      token
    );

  if (!invitation) {
    notFound();
  }

  const registration =
    Array.isArray(
      invitation.registrations
    )
      ? invitation
          .registrations[0]
      : invitation.registrations;

  if (
    !registration ||
    registration
      .registration_status ===
      "cancelled"
  ) {
    notFound();
  }

  const attendeeName = [
    registration.first_name,
    registration.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() ||
    registration.name;

  return (
    <SecureInvitationView
      attendeeName={
        attendeeName
      }
      registrationRef={
        registration.registration_ref ??
        ""
      }
      country={
        registration.country
      }
      countryCode={
        registration.country_code ??
        ""
      }
      invitationUrl={
        `/invite/${token}`
      }
      autoPrint={
        query.print ===
        "1"
      }
    />
  );
}
