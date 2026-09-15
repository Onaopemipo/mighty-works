"use client";

import {
  LogIn,
  LogOut,
  LoaderCircle,
  UsersRound,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

type AttendanceResult = {
  ok?: boolean;
  error?: string;
  checkedIn?: boolean;
  attendance?: {
    checkedInCount: number;
    partySize: number;
    remainingCount: number;
    partial: boolean;
    complete: boolean;
  } | null;
};

export function AttendanceAction({
  registrationId,
  partySize,
  checkedInCount,
  remainingCount,
}: {
  registrationId: string;
  partySize: number;
  checkedInCount: number;
  remainingCount: number;
}) {
  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(
      null
    );

  const normalizedPartySize =
    Math.max(
      partySize,
      1
    );

  const normalizedCheckedIn =
    Math.min(
      Math.max(
        checkedInCount,
        0
      ),
      normalizedPartySize
    );

  const normalizedRemaining =
    Math.min(
      Math.max(
        remainingCount,
        0
      ),
      normalizedPartySize
    );

  const singlePerson =
    normalizedPartySize === 1;

  async function update(
    action:
      | "check_in"
      | "check_out",
    attendanceCount?: number
  ) {
    setLoading(true);
    setMessage(null);

    try {
      const body:
        {
          action:
            | "check_in"
            | "check_out";
          attendanceCount?:
            number;
        } = {
          action,
        };

      if (
        attendanceCount != null
      ) {
        body.attendanceCount =
          attendanceCount;
      }

      const response =
        await fetch(
          `/api/admin/registrations/${registrationId}/attendance`,
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                body
              ),
          }
        );

      const result =
        (await response.json()) as AttendanceResult;

      if (
        !response.ok ||
        !result.ok
      ) {
        setMessage(
          result.error ??
          "Unable to update attendance."
        );

        return;
      }

      if (result.attendance) {
        const present =
          result.attendance
            .checkedInCount;

        const total =
          result.attendance
            .partySize;

        setMessage(
          `${present} of ${total} now present.`
        );
      } else {
        setMessage(
          result.checkedIn
            ? "Attendee checked in."
            : "Attendee checked out."
        );
      }

      router.refresh();
    } catch {
      setMessage(
        "Unable to reach the server."
      );
    } finally {
      setLoading(false);
    }
  }

  if (singlePerson) {
    const present =
      normalizedCheckedIn > 0;

    return (
      <div className="mw-admin-attendance-action">
        <button
          type="button"
          onClick={() =>
            update(
              present
                ? "check_out"
                : "check_in"
            )
          }
          disabled={loading}
          className={
            present
              ? "is-checkout"
              : "is-checkin"
          }
        >
          {loading ? (
            <>
              Updating
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            </>
          ) : present ? (
            <>
              <LogOut
                size={15}
              />
              Check out
            </>
          ) : (
            <>
              <LogIn
                size={15}
              />
              Check in
            </>
          )}
        </button>

        {message ? (
          <p>{message}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mw-admin-attendance-action mw-admin-party-attendance">
      <div className="mw-admin-party-attendance-status">
        <UsersRound
          size={18}
        />

        <div>
          <strong>
            {normalizedCheckedIn}
            {" of "}
            {normalizedPartySize}
            {" present"}
          </strong>

          <span>
            {normalizedRemaining > 0
              ? `${normalizedRemaining} still expected`
              : "Full party is on site"}
          </span>
        </div>
      </div>

      {normalizedRemaining > 0 ? (
        <div className="mw-admin-party-attendance-group">
          <span>
            Arriving now
          </span>

          <div>
            {Array.from(
              {
                length:
                  normalizedRemaining,
              },
              (_, index) =>
                index + 1
            ).map(
              (count) => (
                <button
                  key={
                    `in-${count}`
                  }
                  type="button"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    update(
                      "check_in",
                      count
                    )
                  }
                  className="is-checkin"
                >
                  {loading ? (
                    <LoaderCircle
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <>
                      <LogIn
                        size={14}
                      />
                      {count ===
                      normalizedRemaining
                        ? `All ${count}`
                        : count}
                    </>
                  )}
                </button>
              )
            )}
          </div>
        </div>
      ) : null}

      {normalizedCheckedIn > 0 ? (
        <div className="mw-admin-party-attendance-group">
          <span>
            Leaving now
          </span>

          <div>
            {Array.from(
              {
                length:
                  normalizedCheckedIn,
              },
              (_, index) =>
                index + 1
            ).map(
              (count) => (
                <button
                  key={
                    `out-${count}`
                  }
                  type="button"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    update(
                      "check_out",
                      count
                    )
                  }
                  className="is-checkout"
                >
                  {loading ? (
                    <LoaderCircle
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <>
                      <LogOut
                        size={14}
                      />
                      {count ===
                      normalizedCheckedIn
                        ? `All ${count}`
                        : count}
                    </>
                  )}
                </button>
              )
            )}
          </div>
        </div>
      ) : null}

      {message ? (
        <p>{message}</p>
      ) : null}
    </div>
  );
}
