"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const links = [
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
    label: "Nations",
    href: "#nations",
  },
  {
    label: "Schedule",
    href: "#schedule",
  },
];

export function Navbar() {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      <header className="mw26-nav">
        <Link
          href="#top"
          className="mw26-nav-brand"
          onClick={() =>
            setOpen(false)
          }
        >
          <Image
            src="/brand/Logo.png"
            alt="Everwinning Faith Ministries Australia"
            width={180}
            height={90}
            priority
          />

          <div>
            <strong>
              Mighty Works
            </strong>

            <span>
              Conference 2026
            </span>
          </div>
        </Link>

        <nav className="mw26-nav-desktop">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mw26-nav-actions">
          <Link
            href="#register-interest"
            className="mw26-nav-register"
          >
            I’m coming
            <span>↗</span>
          </Link>

          <button
            type="button"
            className="mw26-menu-button"
            onClick={() =>
              setOpen(
                (current) =>
                  !current
              )
            }
            aria-label={
              open
                ? "Close menu"
                : "Open menu"
            }
          >
            {open ? (
              <X size={27} />
            ) : (
              <Menu size={29} />
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{
              opacity: 0,
              y: -16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -12,
            }}
            className="mw26-mobile-menu"
          >
            {links.map(
              (
                link,
                index
              ) => (
                <Link
                  key={
                    link.href
                  }
                  href={
                    link.href
                  }
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                >
                  <span>
                    {String(
                      index +
                        1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  {
                    link.label
                  }
                </Link>
              )
            )}

            <Link
              href="#register-interest"
              className="mw26-mobile-register"
              onClick={() =>
                setOpen(false)
              }
            >
              Register for Mighty Works
              <span>↗</span>
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
