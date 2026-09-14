import {
  Suspense,
} from "react";

import {
  InvitationPrintClient,
} from "@/components/invite/invitation-print-client";

function InvitationPrintFallback() {
  return (
    <main className="mw-print-page">
      <div
        style={{
          color:
            "rgba(255,255,255,.7)",
          fontSize: "12px",
          letterSpacing: ".12em",
          textTransform:
            "uppercase",
        }}
      >
        Preparing invitation…
      </div>
    </main>
  );
}

export default function InvitationPrintPage() {
  return (
    <Suspense
      fallback={
        <InvitationPrintFallback />
      }
    >
      <InvitationPrintClient />
    </Suspense>
  );
}
