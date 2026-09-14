export function countryFlag(
  countryCode:
    | string
    | null
    | undefined
) {
  if (
    !countryCode ||
    !/^[A-Z]{2}$/.test(
      countryCode
    )
  ) {
    return "🌐";
  }

  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split("")
      .map(
        (character) =>
          127397 +
          character.charCodeAt(
            0
          )
      )
  );
}

export function formatAdminDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-AU",
    {
      timeZone:
        "Australia/Brisbane",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}
