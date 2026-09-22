import type {
  NextConfig,
} from "next";

/*
 * MW-HOME-V3-S10-B2B-B1 — BASELINE HTTP SECURITY HEADERS
 *
 * Deterministic browser-security headers are applied globally.
 *
 * Content-Security-Policy is intentionally deferred to B2C
 * because it requires dedicated Next.js + Supabase Realtime
 * runtime/browser certification.
 *
 * Camera access remains available to same-origin pages for the
 * certified admin check-in scanner.
 */

const securityHeaders = [
  {
    key:
      "X-Content-Type-Options",
    value:
      "nosniff",
  },
  {
    key:
      "X-Frame-Options",
    value:
      "DENY",
  },
  {
    key:
      "Referrer-Policy",
    value:
      "strict-origin-when-cross-origin",
  },
  {
    key:
      "Permissions-Policy",
    value:
      "camera=(self), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key:
      "Cross-Origin-Opener-Policy",
    value:
      "same-origin",
  },
  {
    key:
      "Cross-Origin-Resource-Policy",
    value:
      "same-origin",
  },
] as const;

const nextConfig: NextConfig = {
  poweredByHeader:
    false,

  async headers() {
    return [
      {
        source:
          "/:path*",
        headers: [
          ...securityHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
