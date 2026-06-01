"use client";

import { useEffect, useState } from "react";
import data from "@/content/eruhomist-data.json";
import Logo from "@/components/Logo";

/*
  Header — sticky. Прозорий на hero, фон #0a0c0f при скролі.
  Лого "Єрухомість" + якорі. Дані телефону — з JSON.
*/

const NAV = [
  { href: "#catalog", label: "Об'єкти" },
  { href: "#investment", label: "Інвестиції" },
  { href: "#cases", label: "Кейси" },
  { href: "#about", label: "Про нас" },
  { href: "#contact", label: "Контакт" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        ...S.header,
        background: scrolled ? "rgba(10,12,15,0.92)" : "transparent",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}
    >
      <Logo size={22} />

      <nav className="hdr-nav" style={S.nav}>
        {NAV.map((n) => (
          <a key={n.href} href={n.href} style={S.link}>
            {n.label}
          </a>
        ))}
      </nav>

      <a
        href={`tel:${data.contact.phone.replace(/\s/g, "")}`}
        className="hdr-phone"
        style={S.phone}
      >
        {data.contact.phone}
      </a>

      {/* мобільний бургер */}
      <button
        className="hdr-burger"
        style={S.burger}
        aria-label="Меню"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div style={S.mobileMenu} onClick={() => setOpen(false)}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} style={S.mobileLink}>
              {n.label}
            </a>
          ))}
          <a
            href={`tel:${data.contact.phone.replace(/\s/g, "")}`}
            style={{ ...S.mobileLink, color: "var(--accent)" }}
          >
            {data.contact.phone}
          </a>
        </div>
      )}
    </header>
  );
}

const S = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px clamp(24px, 8vw, 140px)",
    transition: "background 0.4s ease, border-color 0.4s ease",
  },
  nav: { display: "flex", gap: "clamp(18px, 2.4vw, 40px)" },
  link: {
    fontSize: 13,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.8)",
    textDecoration: "none",
  },
  phone: {
    fontSize: 14,
    color: "#fff",
    textDecoration: "none",
    letterSpacing: "0.04em",
  },
  burger: {
    display: "none",
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: 22,
    cursor: "pointer",
  },
  mobileMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "rgba(10,12,15,0.98)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    padding: "12px 0",
  },
  mobileLink: {
    padding: "16px clamp(24px, 8vw, 140px)",
    fontSize: 15,
    letterSpacing: "0.06em",
    color: "rgba(255,255,255,0.85)",
    textDecoration: "none",
  },
};
