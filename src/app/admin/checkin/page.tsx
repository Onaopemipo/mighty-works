import {
  ArrowLeft,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  redirect,
} from "next/navigation";

import {
  getAdminSession,
} from "@/lib/admin/session";
import {
  AdminCheckInScanner,
} from "@/components/checkin/admin-checkin-scanner";

import {
  EventDayHealthStrip,
} from "@/components/admin/event-day-health-strip";

export const dynamic =
  "force-dynamic";

export default async function AdminCheckInPage() {
  const session =
    await getAdminSession();

  if (!session) {
    redirect(
      "/admin/login"
    );
  }

  return (
    <main className="mw-admin-shell mw-scanner-page">
      <header className="mw-scanner-page-header">
        <Link
          href="/admin"
        >
          <ArrowLeft
            size={16}
          />

          Command centre
        </Link>

        <div>
          <span>
            Mighty Works · 2026
          </span>

          <h1>
            Venue
            <em>
              Scanner.
            </em>
          </h1>

          <p>
            Secure mobile QR check-in
          </p>
        </div>

        <aside>
          <ShieldCheck
            size={16}
          />

          Administrator verified
        </aside>
      </header>

      <div className="mw-scanner-live-strip">
        <ScanLine
          size={16}
        />

        Camera-based credential verification
      </div>

      <EventDayHealthStrip />

      <AdminCheckInScanner />
    </main>
  );
}
