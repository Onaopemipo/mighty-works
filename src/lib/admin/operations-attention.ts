import type {
  AdminDashboardData,
} from "@/lib/admin/dashboard";

export type OperationsAttentionLevel =
  | "critical"
  | "warning"
  | "info"
  | "clear";

export type OperationsAttentionItem = {
  id: string;
  level: Exclude<
    OperationsAttentionLevel,
    "clear"
  >;
  title: string;
  detail: string;
  actionLabel?: string;
  href?: string;
};

export type OperationsAttentionSummary = {
  level: OperationsAttentionLevel;
  headline: string;
  items: OperationsAttentionItem[];
};

const LEVEL_WEIGHT: Record<
  OperationsAttentionLevel,
  number
> = {
  clear: 0,
  info: 1,
  warning: 2,
  critical: 3,
};

function highestLevel(
  items: OperationsAttentionItem[]
): OperationsAttentionLevel {
  if (!items.length) {
    return "clear";
  }

  return items.reduce<
    OperationsAttentionLevel
  >(
    (current, item) =>
      LEVEL_WEIGHT[item.level] >
      LEVEL_WEIGHT[current]
        ? item.level
        : current,
    "clear"
  );
}

export function buildOperationsAttention(
  data: AdminDashboardData
): OperationsAttentionSummary {
  const items: OperationsAttentionItem[] =
    [];

  if (data.metrics.emailsFailed > 0) {
    items.push({
      id: "failed-invitations",
      level: "critical",
      title: "Invitation delivery failures",
      detail:
        `${data.metrics.emailsFailed.toLocaleString()} invitation ` +
        `${data.metrics.emailsFailed === 1 ? "email requires" : "emails require"} attention.`,
      actionLabel: "Review registrations",
      href: "/admin?emailStatus=failed#attendee-directory",
    });
  }

  const incompleteParties =
    data.recentCheckIns.filter(
      (arrival) =>
        arrival.remainingCount > 0
    );

  if (incompleteParties.length > 0) {
    const peopleStillExpected =
      incompleteParties.reduce(
        (total, arrival) =>
          total +
          arrival.remainingCount,
        0
      );

    items.push({
      id: "incomplete-parties",
      level: "warning",
      title: "Partial party arrivals",
      detail:
        `${incompleteParties.length.toLocaleString()} recent ` +
        `${incompleteParties.length === 1 ? "party has" : "parties have"} ` +
        `${peopleStillExpected.toLocaleString()} ` +
        `${peopleStillExpected === 1 ? "person" : "people"} still expected.`,
      actionLabel: "Review arrivals",
      href: "#live-arrivals",
    });
  }

  if (
    data.scanOperations
      .duplicateScans > 0
  ) {
    items.push({
      id: "duplicate-scans",
      level: "warning",
      title: "Duplicate scanner activity",
      detail:
        `${data.scanOperations.duplicateScans.toLocaleString()} ` +
        `${data.scanOperations.duplicateScans === 1 ? "duplicate scan has" : "duplicate scans have"} ` +
        "been recorded.",
      actionLabel: "Review scanner activity",
      href: "#scanner-operations",
    });
  }

  const attendeesRemaining =
    Math.max(
      data.metrics
        .expectedInPersonAttendees -
        data.metrics
          .checkedInAttendees,
      0
    );

  if (attendeesRemaining > 0) {
    items.push({
      id: "attendees-remaining",
      level: "info",
      title: "Attendees still expected",
      detail:
        `${attendeesRemaining.toLocaleString()} ` +
        `${attendeesRemaining === 1 ? "attendee remains" : "attendees remain"} ` +
        "expected at the venue.",
      actionLabel: "Open scanner",
      href: "/admin/checkin",
    });
  }

  const level =
    highestLevel(items);

  return {
    level,
    headline:
      level === "clear"
        ? "Operations clear"
        : level === "critical"
          ? "Immediate attention required"
          : level === "warning"
            ? "Operational attention required"
            : "Event-day watch",
    items,
  };
}
