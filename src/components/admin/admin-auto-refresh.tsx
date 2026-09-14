"use client";

import {
  RefreshCw,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

const REFRESH_INTERVAL_MS =
  30_000;

export function AdminAutoRefresh() {
  const router =
    useRouter();

  const [
    secondsRemaining,
    setSecondsRemaining,
  ] = useState(
    REFRESH_INTERVAL_MS /
      1000
  );

  useEffect(() => {
    const refreshTimer =
      window.setInterval(
        () => {
          router.refresh();

          setSecondsRemaining(
            REFRESH_INTERVAL_MS /
              1000
          );
        },
        REFRESH_INTERVAL_MS
      );

    const countdownTimer =
      window.setInterval(
        () => {
          setSecondsRemaining(
            (current) =>
              current <= 1
                ? REFRESH_INTERVAL_MS /
                  1000
                : current - 1
          );
        },
        1000
      );

    return () => {
      window.clearInterval(
        refreshTimer
      );

      window.clearInterval(
        countdownTimer
      );
    };
  }, [router]);

  return (
    <div className="mw-admin-auto-refresh">
      <RefreshCw
        size={13}
      />

      <span>
        Auto refresh
      </span>

      <strong>
        {secondsRemaining}s
      </strong>
    </div>
  );
}
