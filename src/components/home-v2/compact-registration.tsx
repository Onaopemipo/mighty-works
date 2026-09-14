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
      className="homev2-compact-registration"
    >
      <div className="homev2-compact-invitation">
        <p className="homev2-kicker">
          11th Edition · Your invitation
        </p>

        <h2>
          Come expectant.
          <br />
          Leave{" "}
          <em>inspired.</em>
        </h2>

        <p>
          There is a place for you at
          Mighty Works Conference 2026.
        </p>

        <strong>
          Greater Things
        </strong>

        <blockquote>
          “He that believeth on me,
          the works that I do shall he
          do also; and greater works
          than these shall he do...”
        </blockquote>

        <span>
          John 14:12 · KJV
        </span>
      </div>

      <form
        onSubmit={submit}
        className="homev2-compact-form"
      >
        <div className="homev2-compact-form-heading">
          <div>
            <span>
              Mighty Works Conference ·
              2026
            </span>

            <strong>
              No. 11
            </strong>
          </div>

          <h3>
            Be part of the gathering.
          </h3>

          <p>
            Let us know you’re coming.
          </p>
        </div>

        <label>
          <span>
            Full name
          </span>

          <input
            type="text"
            value={fullName}
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

        <label>
          <span>
            Email address
          </span>

          <input
            type="email"
            value={email}
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

        <label>
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

        <label>
          <span>
            Country of origin
          </span>

          <select
            value={countryCode}
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

          <div className="homev2-attendance-options">
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

        <label className="homev2-compact-consent">
          <input
            type="checkbox"
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
          <div className="homev2-compact-error">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="homev2-form-continue"
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

      <InvitationRecovery />
    </section>
  );
}
