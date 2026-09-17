"use client";

import {
  Activity,
  CircleAlert,
  CloudOff,
  RefreshCw,
  Wifi,
} from "lucide-react";

import {
  useEventDayHealth,
} from "@/hooks/use-event-day-health";

type OperatorHealthState =
  | "ready"
  | "degraded"
  | "checking"
  | "offline"
  | "unavailable";

function formatCheckTime(
  value: Date | null
) {
  if (!value) {
    return "Not checked";
  }

  return value.toLocaleTimeString(
    [],
    {
      hour:
        "2-digit",
      minute:
        "2-digit",
      second:
        "2-digit",
    }
  );
}

export function EventDayHealthStrip() {
  const health =
    useEventDayHealth();

  const state:
    OperatorHealthState =
    !health.online
      ? "offline"
      : health.backend ===
          "healthy"
        ? "ready"
        : health.backend ===
            "degraded"
          ? "degraded"
          : health.backend ===
              "checking"
            ? "checking"
            : "unavailable";

  const headline =
    state === "ready"
      ? "System ready"
      : state ===
          "degraded"
        ? "Connection slower than normal"
        : state ===
            "checking"
          ? "Checking system"
          : state ===
              "offline"
            ? "Device offline"
            : "Backend unavailable";

  const detail =
    state === "ready"
      ? `Online · Backend healthy${
          health.latencyMs != null
            ? ` · ${health.latencyMs} ms`
            : ""
        }`
      : state ===
          "degraded"
        ? `Conference services are reachable${
            health.latencyMs != null
              ? ` · ${health.latencyMs} ms`
              : ""
          }.`
        : state ===
            "checking"
          ? "Confirming conference services are reachable."
          : state ===
              "offline"
            ? "Reconnect this device before processing attendance."
            : "Internet is available, but conference services cannot currently be reached.";

  const Icon =
    state === "ready"
      ? Wifi
      : state ===
          "offline"
        ? CloudOff
        : state ===
            "degraded" ||
            state ===
              "unavailable"
          ? CircleAlert
          : Activity;

  return (
    <section
      className={[
        "mw-event-health",
        `is-${state}`,
      ].join(" ")}
      data-health-state={
        state
      }
      aria-live="polite"
      aria-label="Event-day system status"
    >
      <div className="mw-event-health-main">
        <span
          className="mw-event-health-icon"
          aria-hidden="true"
        >
          <Icon
            size={18}
          />
        </span>

        <div className="mw-event-health-copy">
          <strong>
            {headline}
          </strong>

          <span>
            {detail}
          </span>
        </div>
      </div>

      <div className="mw-event-health-meta">
        <span>
          Last check:{" "}
          {formatCheckTime(
            health.lastCheckedAt
          )}
        </span>

        {health.lastHealthyAt ? (
          <span>
            Last healthy:{" "}
            {formatCheckTime(
              health.lastHealthyAt
            )}
          </span>
        ) : null}

        <button
          type="button"
          onClick={() =>
            void health.checkNow()
          }
          disabled={
            health.checking ||
            !health.online
          }
        >
          <RefreshCw
            size={14}
            aria-hidden="true"
            className={
              health.checking
                ? "animate-spin"
                : undefined
            }
          />

          {health.checking
            ? "Checking"
            : "Check now"}
        </button>
      </div>
    </section>
  );
}
