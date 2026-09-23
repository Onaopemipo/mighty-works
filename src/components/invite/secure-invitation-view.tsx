"use client";

import Link from "next/link";

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

      <aside
        className="mw-secure-photo-frame"
        aria-labelledby="mw-secure-photo-frame-title"
      >
        <div className="mw-secure-photo-frame-copy">
          <span>
            Photo Frame
          </span>

          <h2 id="mw-secure-photo-frame-title">
            Make it shareable.
          </h2>

          <p>
            Create your Mighty Works Photo Frame
            and let your friends know you’re
            attending.
          </p>
        </div>

        <Link
          href="/attending"
          className="mw-secure-photo-frame-action"
        >
          Create Your Photo Frame

          <span aria-hidden="true">
            →
          </span>
        </Link>
      </aside>
    </main>
  );
}
