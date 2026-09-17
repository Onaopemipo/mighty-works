"use client";

import {
  LogIn,
  LogOut,
  LoaderCircle,
  UsersRound,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import {
  useRef,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";
import {
  useBrowserConnectivity,
} from "@/hooks/use-browser-connectivity";

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

  const {
    online,
  } =
    useBrowserConnectivity();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(
      null
    );

  
  const [
    uncertainOperation,
    setUncertainOperation,
  ] = useState<{
    action:
      | "check_in"
      | "check_out";
    count: number;
  } | null>(null);

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

  const pendingOperationRef =
    useRef<{
      id: string;
      action:
        | "check_in"
        | "check_out";
      count: number;
    } | null>(null);

  async function update(
    action:
      | "check_in"
      | "check_out",
    attendanceCount?: number
  ) {
    const normalizedCount =
      attendanceCount ?? 1;

    const pending =
      pendingOperationRef.current;

    const retryingPendingOperation =
      Boolean(
        uncertainOperation &&
        pending &&
        pending.action === action &&
        pending.count ===
          normalizedCount
      );

    if (
      !online &&
      !retryingPendingOperation
    ) {
      setMessage(
        "Device offline. Reconnect before changing attendance."
      );

      return;
    }

    const operation =
      pending &&
      pending.action === action &&
      pending.count === normalizedCount
        ? pending
        : {
            id:
              crypto.randomUUID(),
            action,
            count:
              normalizedCount,
          };

    pendingOperationRef.current =
      operation;
    setLoading(true);
    setMessage(null);

    try {
      const body: {
        action:
          | "check_in"
          | "check_out";
        attendanceCount:
          number;
        operationId:
          string;
      } = {
        action,
        attendanceCount:
          normalizedCount,
        operationId:
          operation.id,
      };

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

      // Any HTTP response is definitive. The same
      // logical operation no longer needs to be retained.
      pendingOperationRef.current =
        null;

      setUncertainOperation(
        null
      );

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
      // A transport failure is ambiguous: the server may
      // already have committed this operation. Preserve
      // the exact action/count and the pending operation
      // UUID so the same logical operation can be retried.
      setUncertainOperation({
        action,
        count:
          normalizedCount,
      });

      setMessage(
        "Connection interrupted. Attendance status is uncertain."
      );
    } finally {
      setLoading(false);
    }
  }

  if (uncertainOperation) {
    const retryLabel =
      uncertainOperation.action ===
        "check_in"
        ? "check-in"
        : "check-out";

    return (
      <div
        className="mw-admin-attendance-action mw-admin-attendance-uncertain"
        role="alert"
      >
        <div className="mw-admin-attendance-uncertain-copy">
          <TriangleAlert
            size={18}
          />

          <div>
            <strong>
              Attendance status uncertain
            </strong>

            <span>
              Do not start another attendance
              action. Retry this same{" "}
              {retryLabel} operation safely.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="is-retry"
          disabled={
            loading ||
            !online
          }
          onClick={() =>
            void update(
              uncertainOperation
                .action,
              uncertainOperation
                .count
            )
          }
        >
          {loading ? (
            <>
              Retrying
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            </>
          ) : (
            <>
              <RefreshCw
                size={15}
              />
              Retry{" "}
              {retryLabel}
            </>
          )}
        </button>

        {message ? (
          <p>{message}</p>
        ) : null}
      </div>
    );
  }

  const offlineNotice =
    !online ? (
      <div
        className="mw-admin-attendance-offline"
        role="status"
      >
        <TriangleAlert
          size={15}
        />

        <span>
          Device offline. Attendance changes
          are paused until connectivity returns.
        </span>
      </div>
    ) : null;

  if (singlePerson) {
    const present =
      normalizedCheckedIn > 0;

    return (
      <div className="mw-admin-attendance-action">
        {offlineNotice}

        <button
          type="button"
          onClick={() =>
            update(
              present
                ? "check_out"
                : "check_in"
            )
          }
          disabled={
                    loading ||
                    !online
                  }
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
      {offlineNotice}

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
                    loading ||
                    !online
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
                    loading ||
                    !online
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
