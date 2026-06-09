"use client";

import { useEffect, useState } from "react";
import { CONTACT, phoneReady } from "@/lib/site";
import { trackCall, trackCta, setActiveSection, trackScroll90 } from "@/lib/analytics";

// Persistent call/callback pill (council conversion win). Appears once the user passes the
// water section (the emotional hook) and rides every section after. Also owns two cross-cutting
// analytics duties: (1) track WHICH section is on screen (so we learn which section converts),
// (2) fire scroll_90 once. On desktop it shows the phone; tapping calls (mobile) or opens the
// callback form. Hidden until past-water so it never competes with the hero.
export function CallPill() {
  const [shown, setShown] = useState(false);
  const [dim, setDim] = useState(false); // fade when a section with its own CTA is in view
  const [hiddenByScroll, setHiddenByScroll] = useState(false); // mobile: hide while scrolling down
  const ready = phoneReady();

  // Section-in-view tracking → analytics.setActiveSection. Lets lead events record their origin.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[aria-label]"));
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const label = e.target.getAttribute("aria-label") || "";
            setActiveSection(label);
            // The pill is redundant on sections that already carry their own call CTA:
            // §08 (the form) and §06 Location ("Приїхати на берег"). Hide it there so there
            // are never two competing call buttons on one screen.
            setDim(label.includes("записатися на перегляд") || label.includes("Локація"));
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }, // "active" = whatever crosses the viewport middle
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Show the pill after the water section; fire scroll_90 once; on mobile, hide while the user
  // scrolls DOWN (reading) and bring it back on scroll-up or pause — so it never nags over content.
  useEffect(() => {
    let fired90 = false;
    let lastY = window.scrollY;
    let pauseTimer: ReturnType<typeof setTimeout> | null = null;
    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

    const onScroll = () => {
      const y = window.scrollY;
      const water = document.querySelector('section[aria-label*="берег"]') as HTMLElement | null;
      const trigger = water ? water.offsetTop + water.offsetHeight * 0.5 : window.innerHeight * 2;
      setShown(y > trigger);

      // Mobile only: a sustained scroll DOWN hides it (reading), scroll UP or a pause reveals it.
      // Desktop never hides (isMobile false) so the pill stays put there.
      if (isMobile()) {
        const dy = y - lastY;
        if (dy > 8) setHiddenByScroll(true);
        else if (dy < -8) setHiddenByScroll(false);
        if (pauseTimer) clearTimeout(pauseTimer);
        pauseTimer = setTimeout(() => setHiddenByScroll(false), 600);
      }
      lastY = y;

      if (!fired90) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 0 && y / max >= 0.9) {
          fired90 = true;
          trackScroll90();
        }
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (pauseTimer) clearTimeout(pauseTimer);
    };
  }, []);

  return (
    <div
      className="fixed bottom-5 right-5 z-50 transition-all duration-500 md:bottom-7 md:right-7"
      style={{
        // Visible when past the water hook, NOT on a section with its own CTA (§06/§08), and
        // not hidden by mobile scroll-down. Hidden fully on CTA sections (no double call buttons).
        opacity: shown && !dim && !hiddenByScroll ? 1 : 0,
        transform: shown && !dim && !hiddenByScroll ? "translateY(0)" : "translateY(20px)",
        pointerEvents: shown && !dim && !hiddenByScroll ? "auto" : "none",
      }}
    >
      {ready ? (
        <a
          href={`tel:${CONTACT.phoneTel}`}
          onClick={() => trackCall("pill")}
          className="flex items-center gap-2.5 rounded-full bg-[var(--color-warm)] px-5 py-3.5 text-sm font-medium text-[var(--color-night)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-[1.04]"
        >
          <PhoneIcon />
          Зателефонувати
        </a>
      ) : (
        // No real phone yet → the pill opens the callback form instead of a dead tel: link.
        <a
          href="#cta"
          onClick={() => trackCta("pill_callback")}
          className="flex items-center gap-2.5 rounded-full bg-[var(--color-warm)] px-5 py-3.5 text-sm font-medium text-[var(--color-night)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-[1.04]"
        >
          <PhoneIcon />
          Замовити дзвінок
        </a>
      )}
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.5 3h3l1.5 4.5L9 9.5a13 13 0 0 0 5.5 5.5l2-2L21 14.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6.5 3Z"
        fill="currentColor"
      />
    </svg>
  );
}
