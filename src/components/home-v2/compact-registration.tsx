"use client";

import {
  LoaderCircle,
  MapPin,
  Radio,
} from "lucide-react";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import {
  type AttendanceMode,
  type RegistrationResponse,
} from "@/lib/registration/contract";
import {
  getCountries,
} from "@/lib/registration/countries";
import { RegistrationInviteCard } from "@/components/home-v2/registration-invite-card";
import { InvitationRecovery } from "@/components/home-v2/invitation-recovery";

export function CompactRegistration() {
  const countries = useMemo(
    () => getCountries(),
    []
  );

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [countryCode, setCountryCode] =
    useState("");

  const [
    attendanceMode,
    setAttendanceMode,
  ] =
    useState<AttendanceMode>(
      "in_person"
    );

  const [
    consentPrivacy,
    setConsentPrivacy,
  ] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<
      Extract<
        RegistrationResponse,
        { ok: true }
      > | null
    >(null);

  /* MW-HOME-V3-S6-P1D-1C-2B — VALIDATION TARGET DERIVATION */
  type RegistrationValidationTarget =
    | "fullName"
    | "email"
    | "countryCode"
    | "consentPrivacy"
    | null;

  const validationTarget:
    RegistrationValidationTarget =
      error ===
      "Please enter your first and last name."
        ? "fullName"
        : error ===
            "Please enter your email address."
          ? "email"
          : error ===
              "Please select your country."
            ? "countryCode"
            : error ===
                "Please accept the privacy consent."
              ? "consentPrivacy"
              : null;

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError(null);

    const cleanName =
      fullName.trim();

    const parts =
      cleanName
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length < 2) {
      setError(
        "Please enter your first and last name."
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!countryCode) {
      setError(
        "Please select your country."
      );
      return;
    }

    if (!consentPrivacy) {
      setError(
        "Please accept the privacy consent."
      );
      return;
    }

    const firstName =
      parts.shift() ?? "";

    const lastName =
      parts.join(" ");

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email:
              email.trim(),
            phone:
              phone.trim(),
            countryCode,
            city: "",
            stateRegion: "",
            churchMinistry: "",
            attendeeType:
              "General Attendee",
            attendanceMode,
            partySize: 1,
            consentPrivacy: true,
            consentUpdates: false,
            website: "",
          }),
        }
      );

      const result =
        (await response.json()) as RegistrationResponse;

      if (
        !response.ok ||
        !result.ok
      ) {
        setError(
          result.ok
            ? "Unable to complete registration."
            : result.error
        );
        return;
      }

      setSuccess(result);
    } catch {
      setError(
        "Registration service could not be reached. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section
        id="register-interest"
        className="homev2-registration-success-section"
      >
        <RegistrationInviteCard
          attendeeName={
            fullName.trim() ||
            success.firstName
          }
          registrationRef={
            success.registrationRef
          }
          country={
            success.country
          }
          countryCode={
            success.countryCode
          }
          invitationUrl={
            success.invitationUrl
          }
        />
      </section>
    );
  }

  return (
    <section
      id="register-interest"
      className="homev2-compact-registration mw-registration-v3"
    >
      <div
        className="mw-registration-v3-atmosphere"
        aria-hidden="true"
      >
        <div className="mw-registration-v3-glow" />
        <div className="mw-registration-v3-grid" />
        <div className="mw-registration-v3-orbit mw-registration-v3-orbit-one" />
        <div className="mw-registration-v3-orbit mw-registration-v3-orbit-two" />
      </div>
      <header className="mw-registration-v3-opening">
        <div className="mw-registration-v3-opening-meta">
          <p>
            Your place in the gathering
          </p>

          <span>
            Mighty Works Conference 2026
          </span>
        </div>

        <h2>
          Be there.
          <span>
            Be part of it.
          </span>
        </h2>

        <div className="mw-registration-v3-opening-foot">
          <p>
            Two days. One gathering.
            Come expectant for worship,
            the Word, prayer and impartation.
          </p>

          <span>
            07 — 08 November
            <br />
            Brisbane, Australia
          </span>
        </div>
      </header>

      <section className="mw-registration-v3-stage">
                {/* MW-HOME-V3-S6-V2-B2X-1 — LEGACY MANIFESTO REMOVAL */}

<div className="mw-registration-v3-form-stage">
          {/* MW-HOME-V3-S6-V2-B2A — NEW EDITORIAL HEADER JSX */}
          <header className="mw-registration-v4-head">
            <div className="mw-registration-v4-head-meta">
              <span>
                Registration
              </span>

              <strong>
                11th Edition
              </strong>
            </div>

            <div className="mw-registration-v4-head-main">
              <h3>
                Be part of the gathering.
              </h3>

              <p>
                Mighty Works Conference 2026
              </p>
            </div>

            <div className="mw-registration-v4-head-foot">
              <p>
                Complete your details to
                reserve your place.
              </p>

              <span>
                07 — 08 November
                <br />
                Brisbane, Australia
              </span>
            </div>
          </header>

                {/* MW-HOME-V3-S6-V2-B1A — LEGACY INVITATION REMOVAL */}

<form
        onSubmit={submit}
        className="homev2-compact-form mw-registration-v3-form"
      >
                {/* MW-HOME-V3-S6-V2-B2X-4B-1 — DUPLICATE FORM HEADING REMOVAL */}

<label className="mw-registration-v3-field">
          <span>
            Full name
          </span>

          <input
            id="registration-full-name"
            type="text"
            value={fullName}
            aria-invalid={
              validationTarget === "fullName"
            }
            aria-describedby={
              validationTarget === "fullName"
                ? "registration-validation-error"
                : undefined
            }
            onChange={(event) =>
              setFullName(
                event.target.value
              )
            }
            placeholder="Your full name"
            autoComplete="name"
            required
          />
        </label>

        <label className="mw-registration-v3-field">
          <span>
            Email address
          </span>

          <input
            id="registration-email"
            type="email"
            value={email}
            aria-invalid={
              validationTarget === "email"
            }
            aria-describedby={
              validationTarget === "email"
                ? "registration-validation-error"
                : undefined
            }
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="mw-registration-v3-field">
          <span>
            Phone number
          </span>

          <input
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value
              )
            }
            placeholder="+61..."
            autoComplete="tel"
            required
          />
        </label>

        <label className="mw-registration-v3-field">
          <span>
            Country of origin
          </span>

          <select
            id="registration-country"
            value={countryCode}
            aria-invalid={
              validationTarget === "countryCode"
            }
            aria-describedby={
              validationTarget === "countryCode"
                ? "registration-validation-error"
                : undefined
            }
            onChange={(event) =>
              setCountryCode(
                event.target.value
              )
            }
            required
          >
            <option value="">
              Select your country
            </option>

            {countries.map(
              (country) => (
                <option
                  key={
                    country.code
                  }
                  value={
                    country.code
                  }
                >
                  {
                    country.flag
                  }{" "}
                  {
                    country.name
                  }
                </option>
              )
            )}
          </select>
        </label>

        <fieldset>
          <legend>
            How will you join us?
          </legend>

          <div className="homev2-attendance-options mw-registration-v3-attendance">
            <button
              type="button"
              onClick={() =>
                setAttendanceMode(
                  "in_person"
                )
              }
              className={
                attendanceMode ===
                "in_person"
                  ? "is-active"
                  : ""
              }
            >
              <MapPin size={17} />

              <span>
                In person
              </span>

              <i />
            </button>

            <button
              type="button"
              onClick={() =>
                setAttendanceMode(
                  "livestream"
                )
              }
              className={
                attendanceMode ===
                "livestream"
                  ? "is-active"
                  : ""
              }
            >
              <Radio size={17} />

              <span>
                Livestream
              </span>

              <i />
            </button>
          </div>
        </fieldset>

        <label className="homev2-compact-consent mw-registration-v3-consent">
          <input
            type="checkbox"
            id="registration-consent"


            aria-invalid={


              validationTarget === "consentPrivacy"


            }


            aria-describedby={


              validationTarget === "consentPrivacy"


                ? "registration-validation-error"


                : undefined


            }


            checked={
              consentPrivacy
            }
            onChange={(event) =>
              setConsentPrivacy(
                event.target.checked
              )
            }
          />

          <span>
            I consent to my details
            being stored for conference
            registration and attendance.
            Only registration totals and
            countries appear publicly.
          </span>
        </label>

        {error ? (
          <div
              id="registration-validation-error"
              className="homev2-compact-error mw-registration-v3-error"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="homev2-form-continue mw-registration-v3-submit"
        >
          {submitting ? (
            <>
              Registering
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            </>
          ) : (
            <>
              Register now
              <span>→</span>
            </>
          )}
        </button>
      </form>

        </div>
      </section>

            {/* MW-HOME-V3-S6-V2-B2X-4C-1 — RECOVERY BEFORE FINALE */}
      <InvitationRecovery />

      <footer className="mw-registration-v3-finale">
        <p>
          Your place is waiting.
        </p>

        <div className="mw-registration-v3-finale-line">
          <i />
        </div>
      </footer>
    </section>
  );
}
