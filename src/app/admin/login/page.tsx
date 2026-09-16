import {
  redirect,
} from "next/navigation";
import Image from "next/image";

import {
  AdminLoginForm,
} from "@/components/admin/admin-login-form";
import {
  getAdminSession,
} from "@/lib/admin/session";

import "../admin.css";

export default async function AdminLoginPage() {
  const session =
    await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="mw-admin-login-page">
      <div className="mw-admin-login-glow" />

      <section className="mw-admin-login-card">
        <div className="mw-admin-login-brand">
          <Image
            src="/images/brand/mighty-works-conference-transparent.png"
            alt="Mighty Works Conference"
            width={180}
            height={90}
            priority
          />
        </div>

        <div className="mw-admin-login-heading">
          <p>
            Administrator access
          </p>

          <h1>
            Command
            <em>
              Centre.
            </em>
          </h1>

          <span>
            Secure access to conference
            registrations and live
            operations.
          </span>
        </div>

        <AdminLoginForm />

        <footer>
          Protected administrator
          environment
        </footer>
      </section>
    </main>
  );
}
