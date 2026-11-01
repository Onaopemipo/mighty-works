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

type AdminCredential = {
  email: string;
  passwordHash: string;
};

function getAdditionalAdminCredentials():
  AdminCredential[] {
  const raw =
    process.env
      .ADMIN_ADDITIONAL_ACCOUNTS
      ?.trim();

  if (!raw) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap(
      (entry) => {
        if (
          typeof entry !==
            "object" ||
          entry === null
        ) {
          return [];
        }

        const candidate =
          entry as {
            email?: unknown;
            passwordHash?: unknown;
          };

        if (
          typeof candidate.email !==
            "string" ||
          typeof candidate.passwordHash !==
            "string"
        ) {
          return [];
        }

        const email =
          normalizeAdminEmail(
            candidate.email
          );

        const passwordHash =
          candidate.passwordHash.trim();

        if (
          !email ||
          !passwordHash
        ) {
          return [];
        }

        return [
          {
            email,
            passwordHash,
          },
        ];
      }
    );
  } catch {
    return [];
  }
}

function verifyPasswordHash(
  password: string,
  stored: string | undefined
) {

  if (!stored) {
    return false;
  }

  const [
    version,
    salt,
    encodedHash,
  ] = stored.split(
    stored.includes("$")
      ? "$"
      : ":"
  );

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

export function verifyAdminCredentials(
  email: string,
  password: string
) {
  const normalizedEmail =
    normalizeAdminEmail(email);

  const primaryEmail =
    getConfiguredAdminEmail();

  if (
    primaryEmail &&
    normalizedEmail ===
      primaryEmail &&
    verifyPasswordHash(
      password,
      process.env
        .ADMIN_PASSWORD_HASH
        ?.trim()
    )
  ) {
    return primaryEmail;
  }

  const credential =
    getAdditionalAdminCredentials()
      .find(
        (candidate) =>
          candidate.email ===
          normalizedEmail
      );

  if (
    !credential ||
    !verifyPasswordHash(
      password,
      credential.passwordHash
    )
  ) {
    return null;
  }

  return credential.email;
}
