"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  CalendarDays,
  Expand,
  Globe2,
  Radio,
  Shrink,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { flagFromCountryCode } from "@/lib/registration/countries";
import { createClient } from "@/lib/supabase/client";

type ConferenceStats = {
  total_registrations: number;
  total_attendees: number;
  countries_represented: number;
  churches_represented: number;
  updated_at: string;
};

type CountryStat = {
  country: string;
  country_code: string | null;
  registration_count: number;
  attendee_count: number;
  updated_at: string;
};

const EMPTY_STATS: ConferenceStats = {
  total_registrations: 0,
  total_attendees: 0,
  countries_represented: 0,
  churches_represented: 0,
  updated_at: "",
};

export function LiveBillboard({
  id,
  showHeader = true,
}: {
  id?: string;
  showHeader?: boolean;
} = {}) {
  const reducedMotion = useReducedMotion();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [stats, setStats] =
    useState<ConferenceStats>(EMPTY_STATS);

  const [countries, setCountries] =
    useState<CountryStat[]>([]);

  const [status, setStatus] =
    useState<"connecting" | "live" | "degraded">(
      "connecting"
    );

  const [fullscreen, setFullscreen] =
    useState(false);

  const loadState =
    useCallback(async () => {
      const [
        statsResult,
        countriesResult,
      ] = await Promise.all([
        supabase
          .from("conference_stats")
          .select(
            "total_registrations,total_attendees,countries_represented,churches_represented,updated_at"
          )
          .eq("id", 1)
          .single(),

        supabase
          .from(
            "country_registration_stats"
          )
          .select(
            "country,country_code,registration_count,attendee_count,updated_at"
          )
          .order(
            "attendee_count",
            { ascending: false }
          ),
      ]);

      if (statsResult.error) {
        throw statsResult.error;
      }

      if (countriesResult.error) {
        throw countriesResult.error;
      }

      setStats(
        statsResult.data ?? EMPTY_STATS
      );

      setCountries(
        countriesResult.data ?? []
      );
    }, [supabase]);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) return;

      loadState().catch((error) => {
        console.error(
          "Live billboard initial load failed",
          error
        );

        if (active) {
          setStatus("degraded");
        }
      });
    });

    const channel = supabase
      .channel(
        "mighty-works-live-billboard"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conference_stats",
        },
        () => {
          void loadState();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "country_registration_stats",
        },
        () => {
          void loadState();
        }
      )
      .subscribe((subscriptionStatus) => {
        if (!active) return;

        if (
          subscriptionStatus ===
          "SUBSCRIBED"
        ) {
          setStatus("live");
        }

        if (
          subscriptionStatus ===
            "CHANNEL_ERROR" ||
          subscriptionStatus ===
            "TIMED_OUT"
        ) {
          setStatus("degraded");
        }
      });

    function handleFullscreen() {
      setFullscreen(
        Boolean(
          document.fullscreenElement
        )
      );
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () => {
      active = false;

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );

      void supabase.removeChannel(
        channel
      );
    };
  }, [loadState, supabase]);

  async function toggleFullscreen() {
    if (
      document.fullscreenElement
    ) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  }

  const ranked =
    countries.slice(0, 8);

  return (
    <section
      id={id}
      className="mw-live-shell"
    >
      <div className="mw-live-grid" />
      <div className="mw-live-glow" />

      <div className="mw-live-frame">
        {showHeader ? (
        <header className="mw-live-header">
          <div className="mw-live-brand">
            <Image
              src="/brand/Logo.png"
              alt="Everwinning Faith Ministries Australia"
              width={260}
              height={120}
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

          <div className="mw-live-title">
            <p>
              Different nations.
              One purpose.
            </p>

            <h1>
              A world{" "}
              <em>
                gathering.
              </em>
            </h1>
          </div>

          <div className="mw-live-controls">
            <div
              className={[
                "mw-live-status",
                status === "live"
                  ? "is-live"
                  : "",
              ].join(" ")}
            >
              <span />

              {status === "live"
                ? "Live registrations"
                : status ===
                    "degraded"
                  ? "Reconnecting"
                  : "Connecting"}
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
            >
              {fullscreen ? (
                <Shrink size={18} />
              ) : (
                <Expand size={18} />
              )}
            </button>

            <div className="mw-live-date">
              <strong>
                7–8 November 2026
              </strong>

              <span>
                Brisbane, Australia
              </span>
            </div>
          </div>
        </header>
        ) : null}

        <section className="mw-live-main">
          <article className="mw-live-stats">
            <div className="mw-live-stats-top">
              <div>
                <Radio size={22} />

                <span>
                  Live registrations
                </span>
              </div>

              <strong>
                11
                <small>
                  th edition
                </small>
              </strong>
            </div>

            <div className="mw-live-total">
              <span>
                {
                  stats.total_registrations
                }
              </span>

              <p>
                Registered so far
              </p>
            </div>

            <div className="mw-live-stat-row">
              <div>
                <strong>
                  {
                    stats.countries_represented
                  }
                </strong>

                <span>
                  Nations
                </span>
              </div>

              <div>
                <strong>
                  {
                    stats.churches_represented
                  }
                </strong>

                <span>
                  Churches
                </span>
              </div>

              <div>
                <strong>
                  {
                    stats.total_attendees
                  }
                </strong>

                <span>
                  Attendees
                </span>
              </div>
            </div>

            <div className="mw-live-stats-footer">
              <span>
                <CalendarDays
                  size={16}
                />
                7–8 November 2026
              </span>

              <span>
                5:00 PM AEST
              </span>
            </div>
          </article>

          <section className="mw-live-world">
            <div className="mw-live-world-copy">
              <p>
                Faith without borders
              </p>

              <h2>
                Every flag.{" "}
                <em>
                  A part of the story.
                </em>
              </h2>
            </div>

            <div className="mw-live-world-body">
              <div className="mw-live-globe-stage">
                <motion.div
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          rotate: 360,
                        }
                  }
                  transition={{
                    duration: 45,
                    repeat:
                      Infinity,
                    ease: "linear",
                  }}
                  className="mw-live-orbit mw-live-orbit-a"
                />

                <motion.div
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          rotate:
                            -360,
                        }
                  }
                  transition={{
                    duration: 32,
                    repeat:
                      Infinity,
                    ease: "linear",
                  }}
                  className="mw-live-orbit mw-live-orbit-b"
                />

                <div className="mw-live-globe">
                  <div className="mw-live-globe-lines" />

                  <div className="mw-live-globe-core">
                    <Globe2
                      size={44}
                      strokeWidth={1}
                    />

                    <span>
                      Mighty Works
                    </span>
                  </div>
                </div>

                {ranked.map(
                  (
                    country,
                    index
                  ) => {
                    const positions = [
                      [20, 28],
                      [75, 23],
                      [20, 72],
                      [76, 68],
                      [47, 16],
                      [87, 48],
                      [10, 51],
                      [49, 84],
                    ];

                    const [
                      x,
                      y,
                    ] =
                      positions[
                        index
                      ];

                    return (
                      <motion.div
                        key={
                          country.country
                        }
                        initial={{
                          opacity: 0,
                          scale: 0.5,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        className="mw-live-globe-flag"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                        }}
                      >
                        {country.country_code
                          ? flagFromCountryCode(
                              country.country_code
                            )
                          : "◉"}
                      </motion.div>
                    );
                  }
                )}
              </div>

              <div className="mw-live-ranking">
                <div className="mw-live-ranking-title">
                  <Globe2
                    size={20}
                  />

                  <span>
                    Nations represented
                  </span>
                </div>

                {ranked.length >
                0 ? (
                  ranked.map(
                    (
                      country,
                      index
                    ) => (
                      <div
                        key={
                          country.country
                        }
                        className="mw-live-ranking-row"
                      >
                        <span>
                          {String(
                            index +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <b>
                          {country.country_code
                            ? flagFromCountryCode(
                                country.country_code
                              )
                            : "◉"}
                        </b>

                        <strong>
                          {
                            country.country
                          }
                        </strong>

                        <em>
                          {
                            country.attendee_count
                          }
                        </em>
                      </div>
                    )
                  )
                ) : (
                  <div className="mw-live-empty">
                    <Globe2
                      size={36}
                    />

                    <strong>
                      The world is invited.
                    </strong>

                    <p>
                      The first nation
                      will illuminate
                      the gathering.
                    </p>
                  </div>
                )}

                <p className="mw-live-ranking-footer">
                  Every flag.{" "}
                  <em>
                    A part of the story.
                  </em>
                </p>
              </div>
            </div>
          </section>
        </section>

        <section className="mw-live-ticker">
          <div>
            <span>✦</span>

            <strong>
              Nations in the gathering
            </strong>
          </div>

          <div className="mw-live-ticker-track">
            {countries.length >
            0 ? (
              [
                ...countries,
                ...countries,
              ].map(
                (
                  country,
                  index
                ) => (
                  <span
                    key={`${country.country}-${index}`}
                  >
                    <b>
                      {country.country_code
                        ? flagFromCountryCode(
                            country.country_code
                          )
                        : "◉"}
                    </b>

                    {
                      country.country
                    }{" "}
                    joined the gathering

                    <small>
                      {
                        country.attendee_count
                      }{" "}
                      attendee
                      {country.attendee_count ===
                      1
                        ? ""
                        : "s"}
                    </small>
                  </span>
                )
              )
            ) : (
              <p>
                The first nation
                will illuminate
                the gathering.
              </p>
            )}
          </div>
        </section>

        <footer className="mw-live-footer">
          <p>
            One conference.{" "}
            <span>
              A greater tomorrow.
            </span>
          </p>

          <span>
            Mighty Works Conference 2026
          </span>
        </footer>
      </div>
    </section>
  );
}
