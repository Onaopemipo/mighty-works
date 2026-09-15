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
          <div className="mw-invite-brand">
            <Image
              src="/brand/Logo.png"
              alt="Everwinning Faith Ministries Australia"
              width={220}
              height={110}
              priority
            />

            <div>
              <strong>
                Mighty Works
              </strong>

              <span>
                Conference 2026
              </span>
            </div>
          </div>

          <p>
            Different nations.
            <br />
            One purpose.
          </p>
        </header>

        <div className="mw-invite-status">
          <CheckCircle2 size={18} />

          <span>
            You’re registered
          </span>
        </div>

        <section className="mw-invite-hero">
          <div>
            <p className="mw-invite-eyebrow">
              Your invitation
            </p>

            <h2>
              You’re
              <em>
                Invited!
              </em>
            </h2>

            <p className="mw-invite-welcome">
              <strong>
                {attendeeName}
              </strong>
              , your place at Mighty Works
              Conference 2026 is confirmed.
              Come expectant for a time of
              encounter, equipping and mighty
              works.
            </p>
          </div>

          <div className="mw-invite-theme">
            <span>
              2026 Theme
            </span>

            <strong>
              Greater
              <br />
              Things
            </strong>

            <small>
              Mighty upon the earth
            </small>
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
              Nation
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

        <section className="mw-invite-expectation">
          <p>
            Come ready for
          </p>

          <div>
            <span>
              Encounter
            </span>

            <span>
              Worship
            </span>

            <span>
              The Word
            </span>

            <span>
              Prayer
            </span>

            <span>
              Impartation
            </span>
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

        <section className="mw-invite-scripture">
          <div className="mw-invite-scripture-mark">
            <Globe2 size={24} />
          </div>

          <blockquote>
            “His seed shall be mighty
            upon earth: the generation
            of the upright shall be
            blessed.”
          </blockquote>

          <span>
            Psalm 112:2 · KJV
          </span>
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
