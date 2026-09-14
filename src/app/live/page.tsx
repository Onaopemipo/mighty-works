import type { Metadata } from "next";

import { LiveBillboard } from "@/components/live/live-billboard";

export const metadata: Metadata = {
  title: "Live Registrations | Mighty Works Conference 2026",
  description:
    "Live international registration pulse for Mighty Works Conference 2026.",
};

export default function LivePage() {
  return <LiveBillboard />;
}
