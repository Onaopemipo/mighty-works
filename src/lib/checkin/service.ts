import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  decryptCheckInCredential,
  encryptCheckInCredential,
  generateCheckInCredential,
  hashCheckInCredential,
  isCheckInCredential,
} from "@/lib/checkin/credential";

type CredentialRow = {
  registration_id: string;
  credential_hash: string;
  credential_ciphertext: string;
  credential_version: number;
  revoked_at: string | null;
};

export type ResolvedCheckInCredential = {
  registrationId: string;
  credentialVersion: number;
};

export async function getOrCreateCheckInCredential(
  registrationId: string
) {
  const admin =
    createAdminClient();

  const {
    data: existingData,
    error: existingError,
  } = await admin
    .from(
      "registration_checkin_credentials"
    )
    .select(
      [
        "registration_id",
        "credential_hash",
        "credential_ciphertext",
        "credential_version",
        "revoked_at",
      ].join(",")
    )
    .eq(
      "registration_id",
      registrationId
    )
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `Unable to load check-in credential: ${existingError.message}`
    );
  }

  if (existingData) {
    const existing =
      existingData as unknown as CredentialRow;

    if (!existing.revoked_at) {
      const credential =
        decryptCheckInCredential(
          existing.credential_ciphertext
        );

      if (
        hashCheckInCredential(
          credential
        ) !==
        existing.credential_hash
      ) {
        throw new Error(
          "Stored check-in credential integrity check failed."
        );
      }

      return {
        credential,
        version:
          existing.credential_version,
      };
    }
  }

  const credential =
    generateCheckInCredential();

  const credentialHash =
    hashCheckInCredential(
      credential
    );

  const ciphertext =
    encryptCheckInCredential(
      credential
    );

  const nextVersion =
    existingData
      ? (
          (
            existingData as unknown as CredentialRow
          ).credential_version ??
          1
        ) + 1
      : 1;

  const {
    error: upsertError,
  } = await admin
    .from(
      "registration_checkin_credentials"
    )
    .upsert(
      {
        registration_id:
          registrationId,
        credential_hash:
          credentialHash,
        credential_ciphertext:
          ciphertext,
        credential_version:
          nextVersion,
        revoked_at: null,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "registration_id",
      }
    );

  if (upsertError) {
    throw new Error(
      `Unable to save check-in credential: ${upsertError.message}`
    );
  }

  return {
    credential,
    version:
      nextVersion,
  };
}

export async function resolveCheckInCredential(
  credential: string
): Promise<ResolvedCheckInCredential | null> {
  if (
    !isCheckInCredential(
      credential
    )
  ) {
    return null;
  }

  const admin =
    createAdminClient();

  const hash =
    hashCheckInCredential(
      credential
    );

  const {
    data,
    error,
  } = await admin
    .from(
      "registration_checkin_credentials"
    )
    .select(
      [
        "registration_id",
        "credential_hash",
        "credential_ciphertext",
        "credential_version",
        "revoked_at",
      ].join(",")
    )
    .eq(
      "credential_hash",
      hash
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to resolve check-in credential: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  const row =
    data as unknown as CredentialRow;

  if (row.revoked_at) {
    return null;
  }

  let decrypted:
    string;

  try {
    decrypted =
      decryptCheckInCredential(
        row.credential_ciphertext
      );
  } catch {
    return null;
  }

  if (
    decrypted !==
    credential
  ) {
    return null;
  }

  return {
    registrationId:
      row.registration_id,
    credentialVersion:
      row.credential_version,
  };
}

export async function rotateCheckInCredential(
  registrationId: string
) {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from(
      "registration_checkin_credentials"
    )
    .select(
      "credential_version"
    )
    .eq(
      "registration_id",
      registrationId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to rotate check-in credential: ${error.message}`
    );
  }

  const credential =
    generateCheckInCredential();

  const credentialHash =
    hashCheckInCredential(
      credential
    );

  const ciphertext =
    encryptCheckInCredential(
      credential
    );

  const currentVersion =
    data
      ? Number(
          data.credential_version ??
          1
        )
      : 0;

  const version =
    currentVersion + 1;

  const {
    error: saveError,
  } = await admin
    .from(
      "registration_checkin_credentials"
    )
    .upsert(
      {
        registration_id:
          registrationId,
        credential_hash:
          credentialHash,
        credential_ciphertext:
          ciphertext,
        credential_version:
          version,
        revoked_at: null,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "registration_id",
      }
    );

  if (saveError) {
    throw new Error(
      `Unable to persist rotated check-in credential: ${saveError.message}`
    );
  }

  return {
    credential,
    version,
  };
}
