"use client";

import {
  Expand,
  Globe2,
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
      className="mw-nations-v3-shell"
    >
      <div
        className="mw-nations-v3-atmosphere"
        aria-hidden="true"
      >
        <div className="mw-nations-v3-glow" />
        <div className="mw-nations-v3-grid" />
        <div className="mw-nations-v3-orbit mw-nations-v3-orbit-one" />
        <div className="mw-nations-v3-orbit mw-nations-v3-orbit-two" />
      </div>

      <div className="mw-nations-v3-frame">
        {showHeader ? (
          <header className="mw-nations-v3-brand-header">
            <div className="mw-nations-v3-brand">
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

            <button
              type="button"
              className="mw-nations-v3-fullscreen"
              onClick={() => {
                void toggleFullscreen();
              }}
            >
              {fullscreen ? (
                <Shrink
                  size={17}
                />
              ) : (
                <Expand
                  size={17}
                />
              )}

              <span>
                {fullscreen
                  ? "Exit"
                  : "Fullscreen"}
              </span>
            </button>
          </header>
        ) : null}

        <header className="mw-nations-v3-opening">
          <div className="mw-nations-v3-opening-meta">
            <p>
              Live global pulse
            </p>

            <div
              className={[
                "mw-nations-v3-status",
                status === "live"
                  ? "is-live"
                  : "",
              ].join(" ")}
            >
              <i />

              <span>
                {status === "live"
                  ? "Live"
                  : status ===
                      "degraded"
                    ? "Reconnecting"
                    : "Connecting"}
              </span>
            </div>
          </div>

          <h2>
            The nations
            <span>
              are gathering.
            </span>
          </h2>

          <div className="mw-nations-v3-opening-foot">
            <p>
              Every registration adds
              another person, church and
              nation to the story unfolding
              in real time.
            </p>

            <span>
              Mighty Works
              <br />
              Conference 2026
            </span>
          </div>
        </header>

        <section className="mw-nations-v3-monument">
          <div className="mw-nations-v3-total">
            <p>
              Live registrations
            </p>

            <strong>
              {stats.total_registrations}
            </strong>

            <span>
              people have registered
              for the gathering
            </span>
          </div>

          <div className="mw-nations-v3-metrics">
            <article>
              <strong>
                {
                  stats.countries_represented
                }
              </strong>

              <span>
                Nations
              </span>
            </article>

            <article>
              <strong>
                {
                  stats.churches_represented
                }
              </strong>

              <span>
                Churches
              </span>
            </article>

            <article>
              <strong>
                {
                  stats.total_attendees
                }
              </strong>

              <span>
                People
              </span>
            </article>
          </div>
        </section>

        <section className="mw-nations-v3-world">
          <div className="mw-nations-v3-world-copy">
            <p>
              Around the world
            </p>

            <h3>
              Every flag.
              <span>
                Part of the story.
              </span>
            </h3>
          </div>

          <div className="mw-nations-v3-world-stage">
            <div
              className="mw-nations-v3-globe-stage"
              aria-label="Countries represented at Mighty Works Conference 2026"
            >
              <div className="mw-nations-v3-globe-rings">
                <i />
                <i />
                <i />
              </div>

              <div className="mw-nations-v3-globe-core">
                <Globe2
                  size={56}
                  strokeWidth={1.1}
                />

                <span>
                  {
                    stats.countries_represented
                  }
                </span>

                <small>
                  nations
                </small>
              </div>

              {ranked
                .slice(0, 6)
                .map(
                  (
                    country,
                    index
                  ) => (
                    <div
                      key={
                        country.country
                      }
                      className={`mw-nations-v3-flag mw-nations-v3-flag-${index + 1}`}
                      title={
                        country.country
                      }
                    >
                      <b>
                        {country.country_code
                          ? flagFromCountryCode(
                              country.country_code
                            )
                          : "◉"}
                      </b>

                      <span>
                        {
                          country.country
                        }
                      </span>
                    </div>
                  )
                )}
            </div>

            <div className="mw-nations-v3-ranking">
              <div className="mw-nations-v3-ranking-head">
                <p>
                  Nations represented
                </p>

                <span>
                  Live
                </span>
              </div>

              {ranked.length > 0 ? (
                <div className="mw-nations-v3-ranking-list">
                  {ranked.map(
                    (
                      country,
                      index
                    ) => (
                      <article
                        key={
                          country.country
                        }
                        className="mw-nations-v3-ranking-row"
                      >
                        <span className="mw-nations-v3-rank">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <b className="mw-nations-v3-ranking-flag">
                          {country.country_code
                            ? flagFromCountryCode(
                                country.country_code
                              )
                            : "◉"}
                        </b>

                        <div>
                          <strong>
                            {
                              country.country
                            }
                          </strong>

                          <span>
                            {
                              country.registration_count
                            }{" "}
                            registration
                            {country.registration_count ===
                            1
                              ? ""
                              : "s"}
                          </span>
                        </div>

                        <em>
                          {
                            country.attendee_count
                          }
                        </em>
                      </article>
                    )
                  )}
                </div>
              ) : (
                <div className="mw-nations-v3-empty">
                  <Globe2
                    size={34}
                  />

                  <strong>
                    The world is invited.
                  </strong>

                  <p>
                    The first nation will
                    illuminate the gathering.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mw-nations-v3-ticker">
          <div className="mw-nations-v3-ticker-label">
            <span>
              ✦
            </span>

            <strong>
              Nations in the gathering
            </strong>
          </div>

          <div className="mw-nations-v3-ticker-window">
            <div className="mw-nations-v3-ticker-track">
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
                      }

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
                  The first nation will
                  illuminate the gathering.
                </p>
              )}
            </div>
          </div>
        </section>

        <footer className="mw-nations-v3-finale">
          <p>
            The gathering grows
          </p>

          <h3>
            One conference.
            <span>
              Many nations.
            </span>
          </h3>

          <div className="mw-nations-v3-finale-line">
            <i />
          </div>
        </footer>
      </div>
    </section>
  );
}
