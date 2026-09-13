"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { Globe2, Radio, UsersRound } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

type LiveStatus =
  | "connecting"
  | "live"
  | "degraded";

const EMPTY_STATS: ConferenceStats = {
  total_registrations: 0,
  total_attendees: 0,
  countries_represented: 0,
  churches_represented: 0,
  updated_at: "",
};

const DORMANT_POINTS = [
  { x: 9, y: 39, size: 5 },
  { x: 16, y: 26, size: 3 },
  { x: 20, y: 61, size: 4 },
  { x: 29, y: 46, size: 3 },
  { x: 36, y: 29, size: 5 },
  { x: 43, y: 65, size: 3 },
  { x: 52, y: 35, size: 4 },
  { x: 58, y: 52, size: 3 },
  { x: 67, y: 24, size: 4 },
  { x: 72, y: 63, size: 5 },
  { x: 81, y: 40, size: 3 },
  { x: 88, y: 56, size: 4 },
  { x: 92, y: 28, size: 3 },
];

function flagFromCode(code: string | null) {
  if (!code || !/^[A-Z]{2}$/i.test(code)) {
    return "◉";
  }

  return code
    .toUpperCase()
    .split("")
    .map((character) =>
      String.fromCodePoint(
        127397 + character.charCodeAt(0)
      )
    )
    .join("");
}

function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(
    motionValue,
    (latest) =>
      Math.round(latest).toLocaleString()
  );
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      motionValue.set(value);
      return;
    }

    const controls = animate(
      motionValue,
      value,
      {
        duration: 1.1,
        ease: [0.22, 1, 0.36, 1],
      }
    );

    return () => controls.stop();
  }, [motionValue, reducedMotion, value]);

  useEffect(() => {
    const unsubscribe = rounded.on(
      "change",
      (latest) => {
        if (nodeRef.current) {
          nodeRef.current.textContent = latest;
        }
      }
    );

    return unsubscribe;
  }, [rounded]);

  return (
    <span ref={nodeRef} className={className}>
      {value.toLocaleString()}
    </span>
  );
}

export function LiveNations() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(
    sectionRef,
    {
      once: true,
      amount: 0.18,
    }
  );

  const reducedMotion = useReducedMotion();

  const [stats, setStats] =
    useState<ConferenceStats>(EMPTY_STATS);

  const [countries, setCountries] =
    useState<CountryStat[]>([]);

  const [status, setStatus] =
    useState<LiveStatus>("connecting");

  const [error, setError] =
    useState<string | null>(null);

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const loadLiveState = useCallback(async () => {
    const [
      statsResponse,
      countriesResponse,
    ] = await Promise.all([
      supabase
        .from("conference_stats")
        .select(
          "total_registrations,total_attendees,countries_represented,churches_represented,updated_at"
        )
        .eq("id", 1)
        .single(),

      supabase
        .from("country_registration_stats")
        .select(
          "country,country_code,registration_count,attendee_count,updated_at"
        )
        .order("attendee_count", {
          ascending: false,
        })
        .order("country", {
          ascending: true,
        }),
    ]);

    if (statsResponse.error) {
      throw statsResponse.error;
    }

    if (countriesResponse.error) {
      throw countriesResponse.error;
    }

    setStats(
      statsResponse.data ?? EMPTY_STATS
    );

    setCountries(
      countriesResponse.data ?? []
    );

    setError(null);
  }, [supabase]);

  useEffect(() => {
    let active = true;
    let refetchTimer:
      | ReturnType<typeof setTimeout>
      | undefined;

    function queueRefetch() {
      if (!active) {
        return;
      }

      if (refetchTimer) {
        clearTimeout(refetchTimer);
      }

      refetchTimer = setTimeout(() => {
        loadLiveState().catch((loadError) => {
          console.error(
            "Failed to refresh conference statistics",
            loadError
          );

          if (active) {
            setStatus("degraded");
          }
        });
      }, 120);
    }

    queueMicrotask(() => {
      if (!active) {
        return;
      }

      loadLiveState().catch((loadError) => {
        console.error(
          "Failed to load conference statistics",
          loadError
        );

        if (active) {
          setError(
            "Live registration activity is temporarily unavailable."
          );
          setStatus("degraded");
        }
      });
    });

    const channel = supabase
      .channel("mighty-works-public-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conference_stats",
        },
        queueRefetch
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "country_registration_stats",
        },
        queueRefetch
      )
      .subscribe((subscriptionStatus) => {
        if (!active) {
          return;
        }

        if (
          subscriptionStatus ===
          "SUBSCRIBED"
        ) {
          setStatus("live");
          queueRefetch();
          return;
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

    return () => {
      active = false;

      if (refetchTimer) {
        clearTimeout(refetchTimer);
      }

      void supabase.removeChannel(channel);
    };
  }, [loadLiveState, supabase]);

  const visibleCountries =
    countries.slice(0, 12);

  return (
    <section
      ref={sectionRef}
      id="nations"
      className="nations-section relative overflow-hidden px-6 py-32 lg:px-12 lg:py-44"
    >
      <div className="nations-glow nations-glow-one absolute" />
      <div className="nations-glow nations-glow-two absolute" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-start gap-16 xl:grid-cols-[0.78fr_1.22fr] xl:gap-20">
          <div className="xl:sticky xl:top-28">
            <motion.div
              initial={{
                opacity: 0,
                y: 28,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : undefined
              }
              transition={{
                duration: 0.75,
              }}
            >
              <div className="mb-7 flex items-center gap-3">
                <span
                  className={[
                    "live-pulse-dot",
                    status === "live"
                      ? "is-live"
                      : "",
                  ].join(" ")}
                />

                <span className="text-[10px] font-bold uppercase tracking-[0.38em] text-white/38">
                  {status === "live"
                    ? "Live registration pulse"
                    : status ===
                        "connecting"
                      ? "Connecting live pulse"
                      : "Live pulse reconnecting"}
                </span>
              </div>

              <p className="section-kicker">
                Across borders. One gathering.
              </p>

              <h2 className="nations-heading mt-6">
                <span className="block text-white">
                  The nations
                </span>
                <span className="nations-red-text block">
                  are gathering.
                </span>
              </h2>

              <p className="mt-8 max-w-xl text-lg leading-8 text-white/52">
                Every registration adds another
                point of light to Mighty Works
                Conference 2026.
              </p>

              <div className="mt-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-white/30">
                  Registered
                </p>

                <div className="mt-1 flex items-end gap-4">
                  <AnimatedNumber
                    value={
                      stats.total_registrations
                    }
                    className="nations-main-number"
                  />

                  <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/28 sm:text-xs">
                    registrations
                  </span>
                </div>
              </div>

              <div className="mt-7 grid max-w-lg grid-cols-2 gap-x-8 gap-y-7">
                <div>
                  <AnimatedNumber
                    value={
                      stats.countries_represented
                    }
                    className="nations-small-number"
                  />

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.32em] text-white/35">
                    Nations
                  </p>
                </div>

                <div>
                  <AnimatedNumber
                    value={
                      stats.churches_represented
                    }
                    className="nations-small-number"
                  />

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.32em] text-white/35">
                    Churches
                  </p>
                </div>

                <div>
                  <AnimatedNumber
                    value={
                      stats.total_attendees
                    }
                    className="nations-small-number"
                  />

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.32em] text-white/35">
                    Expected attendees
                  </p>
                </div>

                <div>
                  <div className="flex h-[2.2rem] items-center gap-2 text-white">
                    <Radio
                      size={19}
                      className={
                        status === "live"
                          ? "text-[var(--brand-red)]"
                          : "text-white/30"
                      }
                    />

                    <span className="text-sm font-semibold">
                      Realtime
                    </span>
                  </div>

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.32em] text-white/35">
                    Live global pulse
                  </p>
                </div>
              </div>

              {error ? (
                <p className="mt-8 max-w-md text-sm leading-6 text-[var(--brand-red-soft)]/75">
                  {error}
                </p>
              ) : null}
            </motion.div>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 45,
            }}
            animate={
              isInView
                ? {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }
                : undefined
            }
            transition={{
              delay: 0.12,
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="nations-field relative self-center"
          >
            <div className="nations-field-grid absolute inset-0" />

            <motion.div
              animate={
                reducedMotion
                  ? undefined
                  : {
                      rotate: 360,
                    }
              }
              transition={{
                duration: 52,
                repeat: Infinity,
                ease: "linear",
              }}
              className="nations-orbit nations-orbit-outer absolute"
            />

            <motion.div
              animate={
                reducedMotion
                  ? undefined
                  : {
                      rotate: -360,
                    }
              }
              transition={{
                duration: 38,
                repeat: Infinity,
                ease: "linear",
              }}
              className="nations-orbit nations-orbit-inner absolute"
            />

            <div className="nations-world-core absolute left-1/2 top-1/2">
              <Globe2
                size={40}
                strokeWidth={1.2}
              />

              <span className="mt-3 text-[9px] font-bold uppercase tracking-[0.36em] text-white/34">
                Mighty Works
              </span>
            </div>

            {DORMANT_POINTS.map(
              (point, index) => (
                <motion.span
                  key={index}
                  className="nations-dormant-point"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    width: point.size,
                    height: point.size,
                  }}
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          opacity: [
                            0.18,
                            0.58,
                            0.18,
                          ],
                          scale: [
                            1,
                            1.8,
                            1,
                          ],
                        }
                  }
                  transition={{
                    duration:
                      3.2 +
                      (index % 4) * 0.8,
                    delay:
                      (index % 5) * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )
            )}

            {visibleCountries.map(
              (country, index) => {
                const positions = [
                  [15, 21],
                  [74, 19],
                  [19, 72],
                  [78, 68],
                  [29, 38],
                  [64, 38],
                  [36, 77],
                  [57, 74],
                  [9, 49],
                  [86, 47],
                  [43, 18],
                  [49, 83],
                ];

                const [x, y] =
                  positions[
                    index %
                      positions.length
                  ];

                return (
                  <motion.div
                    key={`${country.country}-${country.country_code ?? "na"}`}
                    initial={{
                      opacity: 0,
                      scale: 0.6,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay:
                        0.3 +
                        index * 0.06,
                    }}
                    className="nation-live-point absolute"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                    }}
                    title={`${country.country}: ${country.attendee_count} attendee${country.attendee_count === 1 ? "" : "s"}`}
                  >
                    <span className="nation-live-halo absolute inset-0" />

                    <span className="relative z-10 text-xl">
                      {flagFromCode(
                        country.country_code
                      )}
                    </span>
                  </motion.div>
                );
              }
            )}

            <div className="nations-field-caption absolute bottom-6 left-6 right-6 flex items-center justify-between gap-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.34em] text-white/25">
                  Live from around the world
                </p>

                <p className="mt-2 text-sm text-white/60">
                  {countries.length > 0
                    ? `${countries.length} nation${countries.length === 1 ? "" : "s"} represented so far`
                    : "The first nation will illuminate the field"}
                </p>
              </div>

              <UsersRound
                size={22}
                className="shrink-0 text-[var(--brand-red)]/70"
              />
            </div>
          </motion.div>
        </div>

        <div className="mt-16 border-t border-white/[0.07] pt-8">
          {countries.length === 0 ? (
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/35">
              <span className="inline-flex h-2 w-2 rounded-full bg-[var(--brand-red)] shadow-[0_0_18px_rgba(252,74,83,0.8)]" />

              <span>
                Waiting for the first
                registration.
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {countries.map(
                (country, index) => (
                  <motion.div
                    key={`${country.country}-chip`}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay:
                        Math.min(
                          index * 0.04,
                          0.4
                        ),
                    }}
                    className="nation-chip"
                  >
                    <span className="text-lg">
                      {flagFromCode(
                        country.country_code
                      )}
                    </span>

                    <span className="font-medium text-white/74">
                      {country.country}
                    </span>

                    <span className="text-white/28">
                      {country.attendee_count}
                    </span>
                  </motion.div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
