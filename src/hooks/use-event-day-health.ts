"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type EventDayBackendState =
  | "checking"
  | "healthy"
  | "degraded"
  | "unavailable";

export type EventDayHealth = {
  online: boolean;
  backend:
    EventDayBackendState;
  checking: boolean;
  lastCheckedAt:
    Date | null;
  lastHealthyAt:
    Date | null;
  latencyMs:
    number | null;
  checkNow:
    () => Promise<void>;
};

const HEALTH_INTERVAL_MS =
  20_000;

const HEALTH_TIMEOUT_MS =
  6_000;

export function useEventDayHealth():
  EventDayHealth {
  const [
    online,
    setOnline,
  ] = useState(
    () =>
      typeof navigator ===
        "undefined"
        ? true
        : navigator.onLine
  );

  const [
    backend,
    setBackend,
  ] =
    useState<EventDayBackendState>(
      "checking"
    );

  const [
    checking,
    setChecking,
  ] = useState(false);

  const [
    lastCheckedAt,
    setLastCheckedAt,
  ] =
    useState<Date | null>(
      null
    );

  const [
    lastHealthyAt,
    setLastHealthyAt,
  ] =
    useState<Date | null>(
      null
    );

  const [
    latencyMs,
    setLatencyMs,
  ] =
    useState<number | null>(
      null
    );

  const mountedRef =
    useRef(true);

  const requestRef =
    useRef<AbortController | null>(
      null
    );

  const checkNow =
    useCallback(
      async () => {
        const browserOnline =
          navigator.onLine;

        setOnline(
          browserOnline
        );

        if (!browserOnline) {
          requestRef.current
            ?.abort();

          if (
            mountedRef.current
          ) {
            setBackend(
              "unavailable"
            );
            setChecking(
              false
            );
            setLatencyMs(
              null
            );
            setLastCheckedAt(
              new Date()
            );
          }

          return;
        }

        requestRef.current
          ?.abort();

        const controller =
          new AbortController();

        requestRef.current =
          controller;

        const timeout =
          window.setTimeout(
            () => {
              controller.abort();
            },
            HEALTH_TIMEOUT_MS
          );

        const startedAt =
          performance.now();

        setChecking(true);

        try {
          const response =
            await fetch(
              "/api/health/supabase",
              {
                method:
                  "GET",
                cache:
                  "no-store",
                signal:
                  controller.signal,
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const elapsed =
            Math.round(
              performance.now() -
                startedAt
            );

          if (
            !mountedRef.current
          ) {
            return;
          }

          setLatencyMs(
            elapsed
          );
          setLastCheckedAt(
            new Date()
          );

          if (response.ok) {
            setBackend(
              elapsed > 2500
                ? "degraded"
                : "healthy"
            );

            setLastHealthyAt(
              new Date()
            );
          } else {
            setBackend(
              "unavailable"
            );
          }
        } catch {
          if (
            !mountedRef.current
          ) {
            return;
          }

          setLatencyMs(
            null
          );
          setLastCheckedAt(
            new Date()
          );
          setBackend(
            "unavailable"
          );
        } finally {
          window.clearTimeout(
            timeout
          );

          if (
            mountedRef.current
          ) {
            setChecking(
              false
            );
          }

          if (
            requestRef.current ===
            controller
          ) {
            requestRef.current =
              null;
          }
        }
      },
      []
    );

  useEffect(() => {
    mountedRef.current =
      true;

    const handleOnline =
      () => {
        setOnline(true);

        void checkNow();
      };

    const handleOffline =
      () => {
        setOnline(false);

        requestRef.current
          ?.abort();

        setBackend(
          "unavailable"
        );
        setChecking(
          false
        );
        setLatencyMs(
          null
        );
        setLastCheckedAt(
          new Date()
        );
      };

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    const initialCheck =
      window.setTimeout(
        () => {
          void checkNow();
        },
        0
      );

    const interval =
      window.setInterval(
        () => {
          void checkNow();
        },
        HEALTH_INTERVAL_MS
      );

    return () => {
      mountedRef.current =
        false;

      requestRef.current
        ?.abort();

      window.clearTimeout(
        initialCheck
      );

      window.clearInterval(
        interval
      );

      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, [
    checkNow,
  ]);

  return {
    online,
    backend,
    checking,
    lastCheckedAt,
    lastHealthyAt,
    latencyMs,
    checkNow,
  };
}
