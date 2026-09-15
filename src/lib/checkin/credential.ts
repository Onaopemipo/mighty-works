import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const CREDENTIAL_PREFIX =
  "mw26_ci_";

function encryptionKey() {
  const encoded =
    process.env
      .CHECKIN_CREDENTIAL_ENCRYPTION_KEY
      ?.trim();

  if (!encoded) {
    throw new Error(
      "CHECKIN_CREDENTIAL_ENCRYPTION_KEY is not configured."
    );
  }

  const key =
    Buffer.from(
      encoded,
      "base64"
    );

  if (key.length !== 32) {
    throw new Error(
      "CHECKIN_CREDENTIAL_ENCRYPTION_KEY must decode to exactly 32 bytes."
    );
  }

  return key;
}

export function generateCheckInCredential() {
  return (
    CREDENTIAL_PREFIX +
    randomBytes(32).toString(
      "base64url"
    )
  );
}

export function hashCheckInCredential(
  credential: string
) {
  return createHash("sha256")
    .update(
      credential,
      "utf8"
    )
    .digest("hex");
}

export function encryptCheckInCredential(
  credential: string
) {
  const iv =
    randomBytes(12);

  const cipher =
    createCipheriv(
      "aes-256-gcm",
      encryptionKey(),
      iv
    );

  const ciphertext =
    Buffer.concat([
      cipher.update(
        credential,
        "utf8"
      ),
      cipher.final(),
    ]);

  const tag =
    cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString(
      "base64url"
    ),
  ].join(".");
}

export function decryptCheckInCredential(
  encrypted: string
) {
  const [
    version,
    encodedIv,
    encodedTag,
    encodedCiphertext,
  ] = encrypted.split(".");

  if (
    version !== "v1" ||
    !encodedIv ||
    !encodedTag ||
    !encodedCiphertext
  ) {
    throw new Error(
      "Invalid encrypted check-in credential."
    );
  }

  const decipher =
    createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(
        encodedIv,
        "base64url"
      )
    );

  decipher.setAuthTag(
    Buffer.from(
      encodedTag,
      "base64url"
    )
  );

  return Buffer.concat([
    decipher.update(
      Buffer.from(
        encodedCiphertext,
        "base64url"
      )
    ),
    decipher.final(),
  ]).toString("utf8");
}

export function isCheckInCredential(
  value: string
) {
  return /^mw26_ci_[A-Za-z0-9_-]{43}$/.test(
    value
  );
}
