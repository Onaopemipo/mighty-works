"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  { label: "Home", href: "#top" },
  { label: "Highlights", href: "#highlights" },
  { label: "Our Story", href: "#legacy" },
  { label: "Stay Connected", href: "#stay-connected" },
];

export function PostEventNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  return (
    <header className={`mwc-recap-nav${scrolled ? " is-scrolled" : ""}`}>
      <Link href="#top" className="mwc-recap-nav-brand" aria-label="MWC 2026 highlights home">
        <Image
          src="/images/hero-2026/mighty-works-conference.png"
          alt="Mighty Works Conference 2026"
          width={150}
          height={100}
          priority
        />
      </Link>

      <nav className={menuOpen ? "is-open" : ""} aria-label="Highlights navigation">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>

      <Link href="#highlights" className="mwc-recap-nav-cta">
        <span className="mwc-recap-nav-play" aria-hidden="true"><span /></span>
        Watch highlights
      </Link>

      <button
        type="button"
        className="mwc-recap-nav-menu"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={23} /> : <Menu size={23} />}
      </button>
    </header>
  );
}
