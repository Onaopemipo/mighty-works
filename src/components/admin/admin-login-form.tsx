"use client";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

export function AdminLoginForm() {
  const router =
    useRouter();

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/admin/login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

      const result =
        (await response.json()) as {
          ok?: boolean;
          error?: string;
        };

      if (
        !response.ok ||
        !result.ok
      ) {
        setError(
          result.error ??
          "Unable to sign in."
        );

        return;
      }

      router.replace(
        "/admin"
      );

      router.refresh();
    } catch {
      setError(
        "Unable to reach the administrator service."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mw-admin-login-form"
    >
      <label>
        <span>
          Administrator email
        </span>

        <div>
          <Mail size={17} />

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            autoComplete="username"
            placeholder="admin@example.com"
            required
          />
        </div>
      </label>

      <label>
        <span>
          Password
        </span>

        <div>
          <LockKeyhole
            size={17}
          />

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            autoComplete="current-password"
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) =>
                  !current
              )
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff
                size={17}
              />
            ) : (
              <Eye
                size={17}
              />
            )}
          </button>
        </div>
      </label>

      {error ? (
        <p className="mw-admin-login-error">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mw-admin-login-submit"
      >
        {loading ? (
          <>
            Signing in
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          </>
        ) : (
          <>
            Enter command centre
            <span>→</span>
          </>
        )}
      </button>
    </form>
  );
}
