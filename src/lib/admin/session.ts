import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import {
  cookies,
} from "next/headers";

export const ADMIN_COOKIE_NAME =
  "mw_admin_session";

const SESSION_DURATION_SECONDS =
  60 * 60 * 8;

type AdminSessionPayload = {
  email: string;
  role: "admin";
  exp: number;
};

function getSessionSecret() {
  const secret =
    process.env
      .ADMIN_SESSION_SECRET
      ?.trim();

  if (
    !secret ||
    secret.length < 32
  ) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not configured securely."
    );
  }

  return secret;
}

function encode(
  value: string
) {
  return Buffer.from(
    value,
    "utf8"
  ).toString("base64url");
}

function decode(
  value: string
) {
  return Buffer.from(
    value,
    "base64url"
  ).toString("utf8");
}

function sign(
  payload: string
) {
  return createHmac(
    "sha256",
    getSessionSecret()
  )
    .update(payload)
    .digest("base64url");
}

export function createAdminSessionToken(
  email: string
) {
  const payload:
    AdminSessionPayload = {
      email,
      role: "admin",
      exp:
        Math.floor(
          Date.now() / 1000
        ) +
        SESSION_DURATION_SECONDS,
    };

  const encoded =
    encode(
      JSON.stringify(
        payload
      )
    );

  const signature =
    sign(encoded);

  return `${encoded}.${signature}`;
}

export function verifyAdminSessionToken(
  token:
    | string
    | undefined
    | null
): AdminSessionPayload | null {
  if (!token) {
    return null;
  }

  const [
    encoded,
    suppliedSignature,
  ] = token.split(".");

  if (
    !encoded ||
    !suppliedSignature
  ) {
    return null;
  }

  let expectedSignature:
    string;

  try {
    expectedSignature =
      sign(encoded);
  } catch {
    return null;
  }

  const supplied =
    Buffer.from(
      suppliedSignature
    );

  const expected =
    Buffer.from(
      expectedSignature
    );

  if (
    supplied.length !==
    expected.length
  ) {
    return null;
  }

  if (
    !timingSafeEqual(
      supplied,
      expected
    )
  ) {
    return null;
  }

  try {
    const payload =
      JSON.parse(
        decode(encoded)
      ) as AdminSessionPayload;

    if (
      payload.role !==
      "admin"
    ) {
      return null;
    }

    if (
      typeof payload.email !==
      "string"
    ) {
      return null;
    }

    if (
      payload.exp <=
      Math.floor(
        Date.now() / 1000
      )
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const store =
    await cookies();

  return verifyAdminSessionToken(
    store.get(
      ADMIN_COOKIE_NAME
    )?.value
  );
}

export async function requireAdminSession() {
  const session =
    await getAdminSession();

  if (!session) {
    return null;
  }

  return session;
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite:
    "strict" as const,
  secure:
    process.env.NODE_ENV ===
    "production",
  path: "/",
  maxAge:
    SESSION_DURATION_SECONDS,
};
