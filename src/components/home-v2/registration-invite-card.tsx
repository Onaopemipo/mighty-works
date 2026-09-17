"use client";

import {
  CalendarDays,
  CheckCircle2,
  Globe2,
  MapPin,
  Printer,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  flagFromCountryCode,
} from "@/lib/registration/countries";

type RegistrationInviteCardProps = {
  attendeeName: string;
  registrationRef: string;
  country: string;
  countryCode: string;
  invitationUrl?: string;
  qrDataUrl?: string;
};

export function RegistrationInviteCard({
  attendeeName,
  registrationRef,
  country,
  countryCode,
  invitationUrl,
  qrDataUrl,
}: RegistrationInviteCardProps) {
  function printInvitation() {
    if (!invitationUrl) {
      return;
    }

    window.open(
      `${invitationUrl}?print=1`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="mw-invite-stage">
      <article
        id="registration-invite-card"
        className="mw-invite-card"
      >
        <div className="mw-invite-noise" />
        <div className="mw-invite-glow mw-invite-glow-one" />
        <div className="mw-invite-glow mw-invite-glow-two" />

        <header className="mw-invite-header">
          <div className="mw-invite-brand mw-invite-dual-brand">
            <div className="mw-invite-brand-mark mw-invite-host-brand">
              <Image
                src="/brand/Logo.png"
                alt="Everwinning Faith Ministries Australia"
                width={220}
                height={110}
                priority
              />
            </div>

            <div
              className="mw-invite-brand-divider"
              aria-hidden="true"
            />

            <div className="mw-invite-brand-mark mw-invite-conference-brand">
              <Image
                src="/images/brand/mighty-works-conference-transparent.png"
                alt="Mighty Works Conference"
                width={300}
                height={140}
                priority
              />

            </div>
          </div>
        </header>

        <div className="mw-invite-status">
          <CheckCircle2 size={18} />

          <span>
            You’re registered
          </span>
        </div>

        <section className="mw-invite-pass-intro">
          <span>
            Your conference pass
          </span>

          <h2>
            {attendeeName}
          </h2>

          <p>
            Registration confirmed for Mighty Works Conference 2026.
          </p>

          <div className="mw-invite-pass-theme">
            <span>
              Theme
            </span>

            <strong>
              Greater Things
            </strong>
          </div>
        </section>

        <section className="mw-invite-registration-strip">
          <div>
            <span>
              Registration reference
            </span>

            <strong>
              {registrationRef}
            </strong>
          </div>

          <div>
            <span>
              Attendee
            </span>

            <strong>
              {attendeeName}
            </strong>
          </div>

          <div>
            <span>
              Country
            </span>

            <strong className="mw-invite-country">
              <b>
                {flagFromCountryCode(
                  countryCode
                )}
              </b>

              {country}
            </strong>
          </div>
        </section>

        {qrDataUrl ? (
          <section className="mw-invite-checkin">
            <div className="mw-invite-checkin-copy">
              <span>
                Venue credential
              </span>

              <strong>
                Your secure
                <br />
                check-in code
              </strong>

              <p>
                Present this QR code at the entrance for fast check-in.
              </p>
            </div>

            <div className="mw-invite-qr-shell">
              <Image
                src={qrDataUrl}
                alt="Secure Mighty Works check-in QR code"
                width={220}
                height={220}
                unoptimized
              />
            </div>
          </section>
        ) : null}

        <section className="mw-invite-event-grid">
          <article>
            <div className="mw-invite-icon">
              <CalendarDays size={20} />
            </div>

            <p>
              Saturday
            </p>

            <strong>
              7 November 2026
            </strong>

            <span>
              5:00 PM
            </span>
          </article>

          <article>
            <div className="mw-invite-icon">
              <CalendarDays size={20} />
            </div>

            <p>
              Sunday
            </p>

            <strong>
              8 November 2026
            </strong>

            <span>
              9:00 AM
            </span>
          </article>

          <article className="mw-invite-venue">
            <div className="mw-invite-icon">
              <MapPin size={21} />
            </div>

            <p>
              Venue
            </p>

            <strong>
              Faith Center
            </strong>

            <span>
              62 Eastern Rd
              <br />
              Browns Plains QLD 4118
            </span>
          </article>
        </section>

        <footer className="mw-invite-footer">
          <div>
            <p>
              With expectation,
            </p>

            <strong>
              The Mighty Works
              Conference Team
            </strong>
          </div>

          <div>
            <span>
              Faith
            </span>

            <span>
              People
            </span>

            <span>
              Nations
            </span>

            <strong>
              Greater Things
            </strong>
          </div>
        </footer>
      </article>

      <div className="mw-invite-actions">
        <button
          type="button"
          onClick={printInvitation}
          disabled={!invitationUrl}
        >
          <Printer size={16} />

          Print / Save invitation
        </button>

        <Link href="/live">
          <Globe2 size={16} />

          View live gathering
        </Link>
      </div>
    </div>
  );
}
