"use client";

import {
  useEffect,
} from "react";

import {
  RegistrationInviteCard,
} from "@/components/home-v2/registration-invite-card";

export function SecureInvitationView({
  attendeeName,
  registrationRef,
  country,
  countryCode,
  invitationUrl,
  qrDataUrl,
  autoPrint,
}: {
  attendeeName: string;
  registrationRef: string;
  country: string;
  countryCode: string;
  invitationUrl: string;
  qrDataUrl: string;
  autoPrint: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          window.print();
        },
        500
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [autoPrint]);

  return (
    <main className="homev2-registration-success-section">
      <RegistrationInviteCard
        attendeeName={
          attendeeName
        }
        registrationRef={
          registrationRef
        }
        country={country}
        countryCode={
          countryCode
        }
        invitationUrl={
          invitationUrl
        }
        qrDataUrl={
          qrDataUrl
        }
      />
    </main>
  );
}
