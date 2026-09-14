"use client";

import {
  LoaderCircle,
  MailPlus,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

export function ResendInvitationButton({
  registrationId,
}: {
  registrationId:
    string;
}) {
  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(
      null
    );

  async function resend() {
    setLoading(true);
    setMessage(null);

    try {
      const response =
        await fetch(
          `/api/admin/registrations/${registrationId}/resend`,
          {
            method:
              "POST",
          }
        );

      const result =
        (await response.json()) as {
          ok?: boolean;
          emailStatus?: string;
          error?: string;
        };

      if (
        !response.ok ||
        !result.ok
      ) {
        setMessage(
          result.error ??
          "Unable to resend invitation."
        );

        return;
      }

      setMessage(
        result.emailStatus ===
          "sent"
          ? "Invitation email sent."
          : `Invitation processed: ${
              result.emailStatus ??
              "unknown"
            }.`
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
    <div className="mw-admin-resend-action">
      <button
        type="button"
        onClick={
          resend
        }
        disabled={
          loading
        }
      >
        {loading ? (
          <>
            Sending
            <LoaderCircle
              size={15}
              className="animate-spin"
            />
          </>
        ) : (
          <>
            <MailPlus
              size={15}
            />
            Resend invitation
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
