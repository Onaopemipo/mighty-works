import Image from "next/image";
import Link from "next/link";

import "./site-footer.css";

const footerNavigation = [
  {
    label: "Home",
    href: "#top",
  },
  {
    label: "About",
    href: "#about",
  },
  {
    label: "Experience",
    href: "#experience",
  },
  {
    label: "Around the World",
    href: "#nations",
  },
  {
    label: "Schedule",
    href: "#schedule",
  },
  {
    label: "Photo Frame",
    href: "/attending",
  },
];

export function SiteFooter() {
  return (
    <footer
      className="mw-site-footer"
      aria-label="Mighty Works Conference footer"
    >
      {/* MW-HOME-V3-S7-B1A — SITE FOOTER SEMANTIC STRUCTURE */}

      <div
        className="mw-site-footer-atmosphere"
        aria-hidden="true"
      />

      <div className="mw-site-footer-inner">
        <header className="mw-site-footer-intro">
          <p className="mw-site-footer-kicker">
            8th Edition
          </p>

          <h2>
            Mighty Works
            <span>
              Conference 2026
            </span>
          </h2>

          <p className="mw-site-footer-statement">
            Two days. One gathering.
            <br />
            Come expectant.
          </p>
        </header>

        <div className="mw-site-footer-body">
          <div className="mw-site-footer-brand">
            <div className="mw-site-footer-brand-lockup">
              <Image
                src="/images/hero-2026/mighty-works-conference.png"
                alt="Mighty Works Conference 2026"
                width={230}
                height={154}
              />

              <span
                className="mw-site-footer-brand-divider"
                aria-hidden="true"
              />

              <Image
                src="/images/hero-2026/everwinning-white.png"
                alt="Everwinning Faith Ministries Australia"
                width={230}
                height={154}
              />
            </div>

            <p>
              Hosted by Everwinning Faith
              Ministries Australia
            </p>
          </div>

          <nav
            className="mw-site-footer-navigation"
            aria-label="Footer navigation"
          >
            {footerNavigation.map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="mw-site-footer-action">
            <div className="mw-site-footer-event">
              <span>
                07 — 08 November
              </span>

              <span>
                Brisbane, Australia
              </span>
            </div>

            <Link
              href="#register-interest"
              className="mw-site-footer-register"
            >
              Register now

              <span aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>

        <div className="mw-site-footer-bottom">
          <p className="mw-site-footer-copyright">
            © 2026 Everwinning Faith
            Ministries Australia
          </p>

          <p className="mw-site-footer-credit">
            Designed &amp; developed by{" "}
            <a
              href="https://bytesngigs.com.au"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bytes n Gigs
              <span aria-hidden="true">
                ↗
              </span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
