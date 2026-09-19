"use client";

import {
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

const navigation = [
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
];

export function Navbar() {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      setScrolled(
        window.scrollY > 24
      );
    };

    updateScrollState();

    window.addEventListener(
      "scroll",
      updateScrollState,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateScrollState
      );
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const closeOnEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      closeOnEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        closeOnEscape
      );
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header
      className={[
        "mw-nav-v3",
        scrolled
          ? "is-scrolled"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mw-nav-v3-inner">
        <Link
          href="#top"
          className="mw-nav-v3-brand"
          aria-label="Mighty Works Conference 2026 home"
          onClick={closeMenu}
        >
          <span className="mw-nav-v3-brand-mwc">
            <Image
              src="/images/hero-2026/mighty-works-conference.png"
              alt="Mighty Works Conference 2026"
              width={230}
              height={154}
              priority
            />
          </span>

          <span
            className="mw-nav-v3-brand-divider"
            aria-hidden="true"
          />

          <span className="mw-nav-v3-brand-host">
            <Image
              src="/images/hero-2026/everwinning-white.png"
              alt="Everwinning Faith Ministries Australia"
              width={230}
              height={154}
              priority
            />
          </span>
        </Link>

        <nav
          className={[
            "mw-nav-v3-links",
            menuOpen
              ? "is-open"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="Conference navigation"
        >
          {navigation.map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <Link
          href="#register-interest"
          className="mw-nav-v3-register"
          onClick={closeMenu}
        >
          Register now

          <ArrowRight
            size={17}
          />
        </Link>

        <button
          type="button"
          className="mw-nav-v3-menu"
          aria-label={
            menuOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={
            menuOpen
          }
          onClick={() =>
            setMenuOpen(
              (current) =>
                !current
            )
          }
        >
          {menuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </div>
    </header>
  );
}
