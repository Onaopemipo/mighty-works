"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import {
  ATTENDEE_TYPES,
  type AttendeeType,
  type RegistrationResponse,
} from "@/lib/registration/contract";
import {
  flagFromCountryCode,
  getCountries,
} from "@/lib/registration/countries";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  city: string;
  stateRegion: string;
  churchMinistry: string;
  attendeeType: AttendeeType;
  partySize: number;
  consentPrivacy: boolean;
  consentUpdates: boolean;
  website: string;
};

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  countryCode: "",
  city: "",
  stateRegion: "",
  churchMinistry: "",
  attendeeType:
    "General Attendee",
  partySize: 1,
  consentPrivacy: false,
  consentUpdates: false,
  website: "",
};

const STEPS = [
  {
    number: "01",
    kicker: "Begin here",
    title: "Who are you?",
    copy:
      "Tell us who is joining Mighty Works.",
  },
  {
    number: "02",
    kicker: "Across borders",
    title:
      "Where are you coming from?",
    copy:
      "Your nation becomes part of the live global gathering.",
  },
  {
    number: "03",
    kicker: "Your community",
    title:
      "Who are you gathering with?",
    copy:
      "Tell us a little about your church, ministry or role.",
  },
  {
    number: "04",
    kicker: "Stay connected",
    title:
      "How can we reach you?",
    copy:
      "We’ll use these details for your conference registration.",
  },
  {
    number: "05",
    kicker: "Final step",
    title:
      "Ready for Mighty Works?",
    copy:
      "Review the final details and confirm your registration.",
  },
];

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <label className="registration-field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

export function RegistrationExperience() {
  const reducedMotion =
    useReducedMotion();

  const countries = useMemo(
    () => getCountries(),
    []
  );

  const [step, setStep] =
    useState(0);

  const [form, setForm] =
    useState<FormState>(
      INITIAL_FORM
    );

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState<
      Extract<
        RegistrationResponse,
        { ok: true }
      > | null
    >(null);

  function patch(
    update: Partial<FormState>
  ) {
    setError(null);

    setForm((current) => ({
      ...current,
      ...update,
    }));
  }

  function validateStep() {
    if (step === 0) {
      if (
        form.firstName
          .trim().length < 2 ||
        form.lastName
          .trim().length < 2
      ) {
        return "Enter your first and last name.";
      }
    }

    if (step === 1) {
      if (!form.countryCode) {
        return "Select the country you are coming from.";
      }
    }

    if (step === 3) {
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email.trim()
        )
      ) {
        return "Enter a valid email address.";
      }

      if (
        form.phone
          .replace(/\D/g, "")
          .length < 7
      ) {
        return "Enter a valid phone number.";
      }
    }

    if (
      step === 4 &&
      !form.consentPrivacy
    ) {
      return "You must accept the privacy consent to register.";
    }

    return null;
  }

  function next() {
    const validation =
      validateStep();

    if (validation) {
      setError(validation);
      return;
    }

    setError(null);

    setStep((current) =>
      Math.min(
        current + 1,
        STEPS.length - 1
      )
    );
  }

  function previous() {
    setError(null);

    setStep((current) =>
      Math.max(current - 1, 0)
    );
  }

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    const validation =
      validateStep();

    if (validation) {
      setError(validation);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            form
          ),
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
      <main className="registration-shell min-h-screen">
        <div className="registration-success-glow absolute inset-0" />

        <motion.section
          initial={
            reducedMotion
              ? undefined
              : {
                  opacity: 0,
                  scale: 0.94,
                  y: 30,
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center"
        >
          <div className="registration-success-icon">
            <CheckCircle2
              size={42}
              strokeWidth={1.5}
            />
          </div>

          <p className="section-kicker mt-8">
            Registration confirmed
          </p>

          <h1 className="mt-6 text-[clamp(4rem,10vw,8rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] text-white">
            You’re
            <span className="registration-red-text block">
              in.
            </span>
          </h1>

          <p className="mt-8 text-xl text-white/65">
            {success.firstName},
            your place at Mighty Works
            Conference 2026 is confirmed.
          </p>

          <div className="registration-ticket mt-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
              Registration reference
            </p>

            <p className="mt-3 text-2xl font-bold tracking-[0.13em] text-white sm:text-3xl">
              {
                success.registrationRef
              }
            </p>

            <div className="my-7 h-px bg-white/[0.07]" />

            <div className="grid gap-6 text-left sm:grid-cols-2">
              <div>
                <p className="text-[9px] uppercase tracking-[0.34em] text-white/28">
                  Conference
                </p>

                <p className="mt-2 font-semibold text-white">
                  Mighty Works 2026
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.34em] text-white/28">
                  Date
                </p>

                <p className="mt-2 font-semibold text-white">
                  7–8 November 2026
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.34em] text-white/28">
                  Location
                </p>

                <p className="mt-2 font-semibold text-white">
                  Brisbane, Australia
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.34em] text-white/28">
                  Nation
                </p>

                <p className="mt-2 flex items-center gap-2 font-semibold text-white">
                  <span className="text-xl">
                    {flagFromCountryCode(
                      success.countryCode
                    )}
                  </span>

                  {success.country}
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.55,
            }}
            className="mt-10 flex items-center gap-3 text-sm text-white/45"
          >
            <Sparkles
              size={18}
              className="text-[var(--brand-red)]"
            />

            <span>
              Your nation just joined
              the gathering.
            </span>
          </motion.div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#nations"
              className="primary-cta"
            >
              See the live gathering
            </Link>

            <Link
              href="/"
              className="secondary-cta"
            >
              Return home
            </Link>
          </div>
        </motion.section>
      </main>
    );
  }

  const activeStep =
    STEPS[step];

  return (
    <main className="registration-shell min-h-screen">
      <div className="registration-background-grid absolute inset-0" />
      <div className="registration-background-glow absolute inset-0" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1450px] lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="registration-aside flex flex-col justify-between px-6 py-8 lg:px-12 lg:py-12">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.26em] text-white/45 transition hover:text-white"
            >
              <ArrowLeft
                size={16}
              />
              Mighty Works
            </Link>
          </div>

          <div className="py-14">
            <p className="section-kicker">
              Registration
            </p>

            <h1 className="mt-5 text-[clamp(3.5rem,6vw,7rem)] font-black uppercase leading-[0.82] tracking-[-0.065em] text-white">
              Be in
              <span className="registration-red-text block">
                the room.
              </span>
            </h1>

            <p className="mt-8 max-w-md text-lg leading-8 text-white/48">
              Two days. One gathering.
              Eleven years of Mighty
              Works.
            </p>
          </div>

          <div className="hidden items-center gap-7 text-xs text-white/32 lg:flex">
            <span className="flex items-center gap-2">
              <MapPin size={15} />
              Brisbane
            </span>

            <span>
              7–8 Nov 2026
            </span>
          </div>
        </aside>

        <section className="registration-panel flex items-center px-6 py-14 lg:px-14 xl:px-20">
          <form
            onSubmit={submit}
            className="mx-auto w-full max-w-3xl"
          >
            <div className="mb-12 flex items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.36em] text-[var(--brand-red)]">
                  {
                    activeStep.number
                  }{" "}
                  / 05
                </p>

                <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/27">
                  {
                    activeStep.kicker
                  }
                </p>
              </div>

              <div className="registration-progress">
                {STEPS.map(
                  (_, index) => (
                    <span
                      key={index}
                      className={
                        index <= step
                          ? "is-active"
                          : ""
                      }
                    />
                  )
                )}
              </div>
            </div>

            <AnimatePresence
              mode="wait"
            >
              <motion.div
                key={step}
                initial={
                  reducedMotion
                    ? undefined
                    : {
                        opacity: 0,
                        x: 38,
                      }
                }
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={
                  reducedMotion
                    ? undefined
                    : {
                        opacity: 0,
                        x: -28,
                      }
                }
                transition={{
                  duration: 0.38,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
              >
                <h2 className="registration-step-title">
                  {
                    activeStep.title
                  }
                </h2>

                <p className="mt-4 max-w-xl text-base leading-7 text-white/42">
                  {
                    activeStep.copy
                  }
                </p>

                <div className="mt-10">
                  {step === 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input
                        label="First name"
                        autoComplete="given-name"
                        value={
                          form.firstName
                        }
                        onChange={(event) =>
                          patch({
                            firstName:
                              event
                                .target
                                .value,
                          })
                        }
                        placeholder="First name"
                        required
                      />

                      <Input
                        label="Last name"
                        autoComplete="family-name"
                        value={
                          form.lastName
                        }
                        onChange={(event) =>
                          patch({
                            lastName:
                              event
                                .target
                                .value,
                          })
                        }
                        placeholder="Last name"
                        required
                      />
                    </div>
                  ) : null}

                  {step === 1 ? (
                    <div className="space-y-5">
                      <label className="registration-field">
                        <span>
                          Country
                        </span>

                        <select
                          value={
                            form.countryCode
                          }
                          onChange={(
                            event
                          ) =>
                            patch({
                              countryCode:
                                event
                                  .target
                                  .value,
                            })
                          }
                          required
                        >
                          <option value="">
                            Select your country
                          </option>

                          {countries.map(
                            (
                              country
                            ) => (
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

                      {form.countryCode ? (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          className="registration-country-preview"
                        >
                          <span className="text-4xl">
                            {flagFromCountryCode(
                              form.countryCode
                            )}
                          </span>

                          <div>
                            <p className="text-[9px] uppercase tracking-[0.32em] text-white/30">
                              Joining from
                            </p>

                            <p className="mt-1 text-sm font-semibold text-white">
                              {
                                countries.find(
                                  (
                                    country
                                  ) =>
                                    country.code ===
                                    form.countryCode
                                )?.name
                              }
                            </p>
                          </div>
                        </motion.div>
                      ) : null}

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                          label="City"
                          autoComplete="address-level2"
                          value={
                            form.city
                          }
                          onChange={(
                            event
                          ) =>
                            patch({
                              city: event
                                .target
                                .value,
                            })
                          }
                          placeholder="City"
                        />

                        <Input
                          label="State / Region"
                          autoComplete="address-level1"
                          value={
                            form.stateRegion
                          }
                          onChange={(
                            event
                          ) =>
                            patch({
                              stateRegion:
                                event
                                  .target
                                  .value,
                            })
                          }
                          placeholder="State or region"
                        />
                      </div>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div className="space-y-5">
                      <Input
                        label="Church / Ministry (optional)"
                        value={
                          form.churchMinistry
                        }
                        onChange={(event) =>
                          patch({
                            churchMinistry:
                              event
                                .target
                                .value,
                          })
                        }
                        placeholder="Your church or ministry"
                      />

                      <label className="registration-field">
                        <span>
                          Attendee type
                        </span>

                        <select
                          value={
                            form.attendeeType
                          }
                          onChange={(
                            event
                          ) =>
                            patch({
                              attendeeType:
                                event
                                  .target
                                  .value as AttendeeType,
                            })
                          }
                        >
                          {ATTENDEE_TYPES.map(
                            (type) => (
                              <option
                                key={
                                  type
                                }
                                value={
                                  type
                                }
                              >
                                {
                                  type
                                }
                              </option>
                            )
                          )}
                        </select>
                      </label>

                      <label className="registration-field">
                        <span>
                          Number attending
                        </span>

                        <select
                          value={
                            form.partySize
                          }
                          onChange={(
                            event
                          ) =>
                            patch({
                              partySize:
                                Number(
                                  event
                                    .target
                                    .value
                                ),
                            })
                          }
                        >
                          {Array.from(
                            {
                              length: 10,
                            },
                            (_, index) =>
                              index + 1
                          ).map(
                            (count) => (
                              <option
                                key={
                                  count
                                }
                                value={
                                  count
                                }
                              >
                                {
                                  count
                                }{" "}
                                {count === 1
                                  ? "person"
                                  : "people"}
                              </option>
                            )
                          )}
                        </select>
                      </label>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <div className="space-y-5">
                      <Input
                        label="Email"
                        type="email"
                        autoComplete="email"
                        value={
                          form.email
                        }
                        onChange={(event) =>
                          patch({
                            email:
                              event
                                .target
                                .value,
                          })
                        }
                        placeholder="you@example.com"
                        required
                      />

                      <Input
                        label="Phone"
                        type="tel"
                        autoComplete="tel"
                        value={
                          form.phone
                        }
                        onChange={(event) =>
                          patch({
                            phone:
                              event
                                .target
                                .value,
                          })
                        }
                        placeholder="+61..."
                        required
                      />
                    </div>
                  ) : null}

                  {step === 4 ? (
                    <div className="space-y-5">
                      <div className="registration-review-card">
                        <div>
                          <span>
                            Name
                          </span>
                          <strong>
                            {
                              form.firstName
                            }{" "}
                            {
                              form.lastName
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Country
                          </span>
                          <strong>
                            {form.countryCode
                              ? `${flagFromCountryCode(
                                  form.countryCode
                                )} ${
                                  countries.find(
                                    (
                                      country
                                    ) =>
                                      country.code ===
                                      form.countryCode
                                  )?.name ??
                                  ""
                                }`
                              : "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Attending
                          </span>
                          <strong>
                            {
                              form.partySize
                            }{" "}
                            {form.partySize ===
                            1
                              ? "person"
                              : "people"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Email
                          </span>
                          <strong>
                            {
                              form.email
                            }
                          </strong>
                        </div>
                      </div>

                      <label className="registration-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            form.consentPrivacy
                          }
                          onChange={(
                            event
                          ) =>
                            patch({
                              consentPrivacy:
                                event
                                  .target
                                  .checked,
                            })
                          }
                        />

                        <span>
                          I consent to
                          Everwinning Faith
                          Ministries Australia
                          storing these details
                          for conference
                          registration and
                          attendance purposes.
                        </span>
                      </label>

                      <label className="registration-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            form.consentUpdates
                          }
                          onChange={(
                            event
                          ) =>
                            patch({
                              consentUpdates:
                                event
                                  .target
                                  .checked,
                            })
                          }
                        />

                        <span>
                          Keep me informed
                          about Mighty Works
                          Conference updates.
                        </span>
                      </label>

                      <div
                        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
                        aria-hidden="true"
                      >
                        <label>
                          Website
                          <input
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={
                              form.website
                            }
                            onChange={(
                              event
                            ) =>
                              patch({
                                website:
                                  event
                                    .target
                                    .value,
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            </AnimatePresence>

            {error ? (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="registration-error mt-7"
              >
                {error}
              </motion.div>
            ) : null}

            <div className="mt-10 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={previous}
                disabled={
                  step === 0 ||
                  submitting
                }
                className="registration-back"
              >
                <ArrowLeft
                  size={17}
                />
                Back
              </button>

              {step <
              STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="registration-next"
                >
                  Continue
                  <ArrowRight
                    size={17}
                  />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="registration-next"
                >
                  {submitting ? (
                    <>
                      Registering
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    </>
                  ) : (
                    <>
                      Confirm registration
                      <Check
                        size={17}
                      />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
