"use client";

import {
  LogIn,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

export function AttendanceAction({
  registrationId,
  checkedIn,
}: {
  registrationId:
    string;
  checkedIn:
    boolean;
}) {
  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(
      null
    );

  async function update() {
    setLoading(true);
    setMessage(null);

    const action =
      checkedIn
        ? "check_out"
        : "check_in";

    try {
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
              JSON.stringify({
                action,
              }),
          }
        );

      const result =
        (await response.json()) as {
          ok?: boolean;
          error?: string;
          checkedIn?: boolean;
        };

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

      setMessage(
        result.checkedIn
          ? "Attendee checked in."
          : "Attendee checked out."
      );

      router.refresh();
    } catch {
      setMessage(
        "Unable to reach the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mw-admin-attendance-action">
      <button
        type="button"
        onClick={update}
        disabled={loading}
        className={
          checkedIn
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
        ) : checkedIn ? (
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
        <p>
          {message}
        </p>
      ) : null}
    </div>
  );
}
