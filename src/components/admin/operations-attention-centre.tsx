import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

import type {
  OperationsAttentionSummary,
} from "@/lib/admin/operations-attention";

const ICONS = {
  critical: CircleAlert,
  warning: TriangleAlert,
  info: Info,
} as const;

export function OperationsAttentionCentre({
  attention,
}: {
  attention: OperationsAttentionSummary;
}) {
  if (attention.level === "clear") {
    return (
      <section
        className="mw-admin-attention is-clear"
        aria-labelledby="operations-attention-title"
      >
        <div className="mw-admin-attention-clear-icon">
          <CircleCheck size={22} />
        </div>

        <div>
          <p>
            Operations attention
          </p>

          <h2 id="operations-attention-title">
            {attention.headline}
          </h2>

          <span>
            No current operational conditions require action.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={[
        "mw-admin-attention",
        `is-${attention.level}`,
      ].join(" ")}
      aria-labelledby="operations-attention-title"
    >
      <header className="mw-admin-attention-header">
        <div>
          <p>
            Operations attention
          </p>

          <h2 id="operations-attention-title">
            {attention.headline}
          </h2>
        </div>

        <span>
          {attention.items.length}
          {" "}
          {attention.items.length === 1
            ? "signal"
            : "signals"}
        </span>
      </header>

      <div className="mw-admin-attention-list">
        {attention.items.map(
          (item) => {
            const Icon =
              ICONS[item.level];

            return (
              <article
                key={item.id}
                className={[
                  "mw-admin-attention-item",
                  `is-${item.level}`,
                ].join(" ")}
              >
                <div className="mw-admin-attention-icon">
                  <Icon size={18} />
                </div>

                <div className="mw-admin-attention-copy">
                  <strong>
                    {item.title}
                  </strong>

                  <span>
                    {item.detail}
                  </span>
                </div>

                {item.href &&
                item.actionLabel ? (
                  <Link
                    href={item.href}
                    className="mw-admin-attention-action"
                  >
                    {item.actionLabel}
                  </Link>
                ) : null}
              </article>
            );
          }
        )}
      </div>
    </section>
  );
}
