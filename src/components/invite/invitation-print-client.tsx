"use client";

import {
  CalendarDays,
  Globe2,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
} from "react";

import {
  flagFromCountryCode,
} from "@/lib/registration/countries";

export function InvitationPrintClient() {
  const searchParams =
    useSearchParams();

  const attendeeName =
    searchParams.get("name") ??
    "Attendee";

  const registrationRef =
    searchParams.get("ref") ??
    "";

  const country =
    searchParams.get("country") ??
    "";

  const countryCode =
    searchParams.get(
      "countryCode"
    ) ?? "";

  const flag = useMemo(
    () =>
      countryCode
        ? flagFromCountryCode(
            countryCode
          )
        : "",
    [countryCode]
  );

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          window.print();
        },
        450
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, []);

  return (
    <main className="mw-print-page">
      <article className="mw-print-invite">
        <header className="mw-print-header">
          <div className="mw-print-brand">
            <Image
              src="/brand/Logo.png"
              alt="Everwinning Faith Ministries Australia"
              width={230}
              height={115}
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

        <section className="mw-print-hero">
          <div>
            <p className="mw-print-eyebrow">
              You’re registered
            </p>

            <h1>
              You’re
              <em>
                Invited!
              </em>
            </h1>

            <p>
              <strong>
                {attendeeName}
              </strong>
              , your place at Mighty Works
              Conference 2026 is confirmed.
            </p>
          </div>

          <div className="mw-print-theme">
            <span>
              2026 Theme
            </span>

            <strong>
              Greater
              <br />
              Things
            </strong>

            <small>
              Psalm 112:1–2
            </small>
          </div>
        </section>

        <section className="mw-print-details">
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

            <strong>
              {flag} {country}
            </strong>
          </div>
        </section>

        <section className="mw-print-event-grid">
          <article>
            <CalendarDays
              size={22}
            />

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
            <CalendarDays
              size={22}
            />

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

          <article>
            <MapPin size={22} />

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

        <section className="mw-print-expectation">
          <p>
            Come ready for
          </p>

          <div>
            <span>Encounter</span>
            <span>Worship</span>
            <span>The Word</span>
            <span>Prayer</span>
            <span>Impartation</span>
          </div>
        </section>

        <section className="mw-print-scripture">
          <Globe2 size={24} />

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

        <footer className="mw-print-footer">
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
    </main>
  );
}
