"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale, Messages } from "@/lib/i18n";
import { LangSwitch } from "./LangSwitch";

// Sticky header over a day->night page. Text color is var(--fg) (cross-fades with
// the theme) and a scrim strengthens on scroll so nav stays legible at every point.
// Mobile collapses to a full-screen overlay menu (a11y menuOpen/menuClose).
export function Header({ locale, m }: { locale: Locale; m: Messages }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems: Array<[string, string]> = [
    ["concept", m.nav.concept],
    ["architecture", m.nav.architecture],
    ["courtyard", m.nav.courtyard],
    ["roof", m.nav.roof],
    ["specs", m.nav.specs],
    ["contact", m.nav.contact],
  ];

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
      style={{
        // At top: warm-white text over the bright daytime hero, lifted by a soft top
        // scrim. After scroll: theme-tracked --scrim veil + blur as the page darkens.
        color: scrolled ? "var(--fg)" : "rgba(245,243,238,0.92)",
        backgroundColor: scrolled ? "var(--scrim)" : "transparent",
        backgroundImage: scrolled
          ? "none"
          : "linear-gradient(to bottom, rgba(6,8,14,0.45), rgba(6,8,14,0))",
        backdropFilter: scrolled ? "blur(8px)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-12">
        <Link href={`/${locale}`} className="font-display text-lg tracking-[0.35em]">
          QUADRO
        </Link>

        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.18em] md:flex">
          {navItems.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="opacity-75 transition-opacity hover:opacity-100">
              {label}
            </a>
          ))}
          <a href="#contact" className="text-[var(--accent)] opacity-90 hover:opacity-100">
            {m.nav.cta}
          </a>
          <LangSwitch current={locale} />
        </nav>

        <button
          type="button"
          className="md:hidden"
          aria-label={open ? m.a11y.menuClose : m.a11y.menuOpen}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-px w-7 bg-current" />
          <span className="mt-2 block h-px w-7 bg-current" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-[var(--deep)] px-6 py-20 text-[var(--fg-night,#f0eeea)] md:hidden">
          <nav className="flex flex-col gap-6 text-lg uppercase tracking-[0.18em]">
            {navItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            <a href="#contact" className="text-[var(--accent)]" onClick={() => setOpen(false)}>
              {m.nav.cta}
            </a>
          </nav>
          <div className="mt-10">
            <LangSwitch current={locale} />
          </div>
        </div>
      )}
    </header>
  );
}
