"use client";

import "./event-countdown.css";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

/*
 * MW-HOME-V3-S9-B1 — COUNTDOWN ENGINE + SEMANTIC STRUCTURE
 *
 * Authoritative conference opening:
 * Saturday, 7 November 2026
 * 5:00 PM — Brisbane, Queensland
 *
 * Explicit UTC+10 offset prevents the visitor's local
 * timezone from changing the countdown target.
 *
 * Visual system and digit transitions are deferred.
 */

/*
 * MW-HOME-V3-S9-B2D-1 — THREE-STATE EVENT LIFECYCLE
 *
 * countdown:
 *   before Saturday 7 November 2026, 5:00 PM Brisbane.
 *
 * live:
 *   from conference opening through the advertised
 *   7–8 November conference dates.
 *
 * legacy:
 *   from Monday 9 November 2026, 12:00 AM Brisbane.
 *
 * The legacy boundary deliberately avoids inventing a
 * Sunday service ending time.
 */

const CONFERENCE_START =
  "2026-11-07T17:00:00+10:00";

const LEGACY_START =
  "2026-11-09T00:00:00+10:00";

type EventPhase =
  | "countdown"
  | "live"
  | "legacy";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type CountdownValues = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateCountdown(
  now: number,
): CountdownValues | null {
  const target =
    new Date(CONFERENCE_START).getTime();

  const remaining =
    Math.max(0, target - now);

  if (remaining <= 0) {
    return null;
  }

  return {
    days: Math.floor(
      remaining / DAY,
    ),
    hours: Math.floor(
      (remaining % DAY) / HOUR,
    ),
    minutes: Math.floor(
      (remaining % HOUR) / MINUTE,
    ),
    seconds: Math.floor(
      (remaining % MINUTE) / SECOND,
    ),
  };
}

function getEventPhase(
  now: number,
): EventPhase {
  const conferenceStart =
    new Date(CONFERENCE_START).getTime();

  const legacyStart =
    new Date(LEGACY_START).getTime();

  if (now < conferenceStart) {
    return "countdown";
  }

  if (now < legacyStart) {
    return "live";
  }

  return "legacy";
}

function pad(
  value: number,
): string {
  return String(value).padStart(
    2,
    "0",
  );
}

type CountdownUnitProps = {
  label: string;
  value: number;
};

/*
 * MW-HOME-V3-S9-B3A — ANIMATED DIGIT ARCHITECTURE
 *
 * Only a unit whose value changes receives a transition.
 * React key authority is the formatted value itself.
 *
 * Reduced-motion users receive an immediate value swap.
 */

function CountdownUnit({
  label,
  value,
}: CountdownUnitProps) {
  const reduceMotion =
    useReducedMotion();

  const formattedValue =
    pad(value);

  return (
    <div
      className="mw-countdown-v3-unit"
      data-countdown-unit={label.toLowerCase()}
    >
      <span
        className="mw-countdown-v3-value-shell"
        aria-hidden="true"
      >
        <AnimatePresence
          initial={false}
          mode="popLayout"
        >
          <motion.strong
            key={formattedValue}
            className="mw-countdown-v3-value"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 18,
                    filter: "blur(5px)",
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            exit={
              reduceMotion
                ? {
                    opacity: 0,
                  }
                : {
                    opacity: 0,
                    y: -18,
                    filter: "blur(5px)",
                  }
            }
            transition={
              reduceMotion
                ? {
                    duration: 0,
                  }
                : {
                    duration: 0.34,
                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  }
            }
          >
            {formattedValue}
          </motion.strong>
        </AnimatePresence>
      </span>

      <span className="mw-countdown-v3-label">
        {label}
      </span>
    </div>
  );
}

export function EventCountdown() {
  const [now, setNow] =
    useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      setNow(Date.now());
    };

    update();

    const interval =
      window.setInterval(
        update,
        SECOND,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, []);

  const phase = useMemo(
    () =>
      now === null
        ? undefined
        : getEventPhase(now),
    [now],
  );

  const countdown = useMemo(
    () =>
      now === null ||
      phase !== "countdown"
        ? undefined
        : calculateCountdown(now),
    [now, phase],
  );

  const accessibleCountdown =
    countdown
      ? [
          `${countdown.days} days`,
          `${countdown.hours} hours`,
          `${countdown.minutes} minutes`,
          `${countdown.seconds} seconds`,
        ].join(", ")
      : null;

  return (
    <section
      id="countdown"
      className="mw-countdown-v3"
      aria-labelledby="mw-countdown-v3-title"
    >
      <div
        className="mw-countdown-v3-atmosphere"
        aria-hidden="true"
      />

      <div className="mw-countdown-v3-inner">
        <header className="mw-countdown-v3-heading">
          <p className="mw-countdown-v3-kicker">
            07 November · Brisbane
          </p>

          {/* MW-HOME-V3-S9-B2E — COUNTDOWN EDITORIAL HOOK REPAIR */}
          <h2
            id="mw-countdown-v3-title"
            className="mw-countdown-v3-title"
          >
            The gathering
            <span>draws near.</span>
          </h2>

          <p className="mw-countdown-v3-intro">
            Two days. One gathering.
            Come expectant.
          </p>
        </header>

        {phase === undefined ? (
          <div
            className="mw-countdown-v3-clock"
            aria-hidden="true"
          >
            {[
              "Days",
              "Hours",
              "Minutes",
              "Seconds",
            ].map((label) => (
              <div
                key={label}
                className="mw-countdown-v3-unit"
              >
                <strong className="mw-countdown-v3-value">
                  --
                </strong>

                <span className="mw-countdown-v3-label">
                  {label}
                </span>
              </div>
            ))}
          </div>
        ) : phase === "countdown" && countdown ? (
          <>
            <p className="sr-only">
              Mighty Works Conference begins in{" "}
              {accessibleCountdown}.
            </p>

            <div
              className="mw-countdown-v3-clock"
              aria-hidden="true"
            >
              <CountdownUnit
                label="Days"
                value={countdown.days}
              />

              <CountdownUnit
                label="Hours"
                value={countdown.hours}
              />

              <CountdownUnit
                label="Minutes"
                value={countdown.minutes}
              />

              <CountdownUnit
                label="Seconds"
                value={countdown.seconds}
              />
            </div>
          </>
        ) : phase === "live" ? (
          <div
            className="mw-countdown-v3-live"
            role="status"
          >
            <span className="mw-countdown-v3-live-status">
              <i aria-hidden="true" />
              Live · 07 — 08 November
            </span>

            <strong>
              Mighty Works
              <em>is happening now.</em>
            </strong>

            <p>
              The gathering is underway in
              Brisbane, Australia.
            </p>
          </div>
        ) : (
          <div className="mw-countdown-v3-legacy">
            <span>
              Mighty Works · 2026
            </span>

            <strong>
              The gathering
              <em>happened.</em>
            </strong>

            <p>
              Two days of worship, the Word,
              prayer and impartation.
            </p>

            <small>
              07 — 08 November · Brisbane, Australia
            </small>
          </div>
        )}

        <footer className="mw-countdown-v3-meta">
          <span>
            Saturday · 5:00 PM
          </span>

          <i aria-hidden="true" />

          <span>
            Brisbane, Australia
          </span>
        </footer>
      </div>
    </section>
  );
}
