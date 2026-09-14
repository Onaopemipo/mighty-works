"use client";

import {
  Mail,
  LoaderCircle,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";

export function InvitationRecovery() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(
      null
    );

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage(null);

    try {
      const response =
        await fetch(
          "/api/invite/recover",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
            }),
          }
        );

      const result =
        (await response.json()) as {
          message?: string;
        };

      setMessage(
        result.message ??
        "If that email is registered, a fresh invitation link has been sent."
      );
    } catch {
      setMessage(
        "If that email is registered, a fresh invitation link will be sent."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mw-invite-recovery"
    >
      <div>
        <Mail size={18} />

        <div>
          <strong>
            Already registered?
          </strong>

          <span>
            Resend your secure invitation.
          </span>
        </div>
      </div>

      <input
        type="email"
        value={email}
        onChange={(event) =>
          setEmail(
            event.target.value
          )
        }
        placeholder="Your registration email"
        required
      />

      <button
        type="submit"
        disabled={loading}
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
          "Resend invitation"
        )}
      </button>

      {message ? (
        <p>
          {message}
        </p>
      ) : null}
    </form>
  );
}
