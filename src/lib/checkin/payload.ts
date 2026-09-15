import "server-only";

export const CHECKIN_QR_SCHEME =
  "mightyworks";

export const CHECKIN_QR_HOST =
  "checkin";

export function createCheckInQrPayload(
  credential: string
) {
  return `${CHECKIN_QR_SCHEME}://${CHECKIN_QR_HOST}/${credential}`;
}

export function extractCheckInCredential(
  payload: string
) {
  const value =
    payload.trim();

  const prefix =
    `${CHECKIN_QR_SCHEME}://${CHECKIN_QR_HOST}/`;

  if (
    !value.startsWith(
      prefix
    )
  ) {
    return null;
  }

  const credential =
    value.slice(
      prefix.length
    );

  if (
    credential.includes(
      "/"
    ) ||
    credential.includes(
      "?"
    ) ||
    credential.includes(
      "#"
    )
  ) {
    return null;
  }

  return credential;
}
