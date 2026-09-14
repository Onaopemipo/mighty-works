import {
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export function normalizeAdminEmail(
  value: string
) {
  return value
    .trim()
    .toLowerCase();
}

export function getConfiguredAdminEmail() {
  return normalizeAdminEmail(
    process.env.ADMIN_EMAIL ??
      ""
  );
}

export function verifyAdminPassword(
  password: string
) {
  const stored =
    process.env
      .ADMIN_PASSWORD_HASH
      ?.trim();

  if (!stored) {
    return false;
  }

  const [
    version,
    salt,
    encodedHash,
  ] = stored.split("$");

  if (
    version !== "scrypt-v1" ||
    !salt ||
    !encodedHash
  ) {
    return false;
  }

  try {
    const expected =
      Buffer.from(
        encodedHash,
        "base64"
      );

    const actual =
      scryptSync(
        password,
        salt,
        expected.length
      );

    if (
      actual.length !==
      expected.length
    ) {
      return false;
    }

    return timingSafeEqual(
      actual,
      expected
    );
  } catch {
    return false;
  }
}
