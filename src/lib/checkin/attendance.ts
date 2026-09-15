export type PartyAttendanceState = {
  partySize: number;
  checkedInCount: number;
  remainingCount: number;
  checkedIn: boolean;
  complete: boolean;
  partial: boolean;
};

function normalizePositiveInteger(
  value: number,
  fallback: number
) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(
    Math.floor(value),
    1
  );
}

export function normalizePartyAttendance({
  partySize,
  checkedInCount,
}: {
  partySize: number;
  checkedInCount:
    | number
    | null
    | undefined;
}): PartyAttendanceState {
  const normalizedPartySize =
    normalizePositiveInteger(
      partySize,
      1
    );

  const rawCount =
    typeof checkedInCount ===
      "number" &&
    Number.isFinite(
      checkedInCount
    )
      ? Math.floor(
          checkedInCount
        )
      : 0;

  const normalizedCount =
    Math.min(
      Math.max(
        rawCount,
        0
      ),
      normalizedPartySize
    );

  return {
    partySize:
      normalizedPartySize,

    checkedInCount:
      normalizedCount,

    remainingCount:
      normalizedPartySize -
      normalizedCount,

    checkedIn:
      normalizedCount > 0,

    complete:
      normalizedCount ===
      normalizedPartySize,

    partial:
      normalizedCount > 0 &&
      normalizedCount <
        normalizedPartySize,
  };
}

export function deriveLegacyCheckedInCount({
  partySize,
  checkedIn,
}: {
  partySize: number;
  checkedIn: boolean;
}) {
  const normalizedPartySize =
    normalizePositiveInteger(
      partySize,
      1
    );

  return checkedIn
    ? normalizedPartySize
    : 0;
}

export function resolvePartyAttendance({
  partySize,
  checkedInCount,
  legacyCheckedIn,
}: {
  partySize: number;
  checkedInCount:
    | number
    | null
    | undefined;
  legacyCheckedIn: boolean;
}) {
  const resolvedCount =
    checkedInCount == null
      ? deriveLegacyCheckedInCount({
          partySize,
          checkedIn:
            legacyCheckedIn,
        })
      : checkedInCount;

  return normalizePartyAttendance({
    partySize,
    checkedInCount:
      resolvedCount,
  });
}
