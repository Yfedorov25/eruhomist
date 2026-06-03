"use client";

// Lightweight analytics layer over GA4 (gtag) + Microsoft Clarity. Both are loaded in
// layout.tsx only when their IDs are set, so in dev (no IDs) every call here no-ops safely.
//
// Council mandate: the #1 goal is phone calls, and this team lives on funnel data — so we
// don't just fire "tel_click", we record WHICH section was on screen when intent happened.
// That answers "does the tour, the price, or the map drive calls?" — otherwise we're blind.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type Params = Record<string, string | number | boolean | undefined>;

function event(name: string, params: Params = {}): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
  // Clarity custom tags surface in session replays / filters.
  window.clarity?.("event", name);
  if (params.section) window.clarity?.("set", "lead_section", String(params.section));
}

// --- The section currently filling the viewport (set by useActiveSection) -----------------
let activeSection = "hero";
export function setActiveSection(id: string): void {
  activeSection = id;
}
export function getActiveSection(): string {
  return activeSection;
}

// --- Mandated events ----------------------------------------------------------------------

// Primary microconversion: a tel: link/button was tapped. Records the originating section.
export function trackCall(source: string): void {
  event("tel_click", { source, section: activeSection });
  event("lead_intent", { channel: "call", source, section: activeSection });
}

// Callback form submitted.
export function trackFormSubmit(ok: boolean): void {
  event("form_submit", { ok, section: activeSection });
  if (ok) event("lead_intent", { channel: "callback", section: activeSection });
}

// Deep-scroll signal — fired once when the user passes 90% of the page.
export function trackScroll90(): void {
  event("scroll_90");
}

// CTA / "book a viewing" clicks that aren't tel: (e.g. the end-of-tour button).
export function trackCta(label: string): void {
  event("cta_click", { label, section: activeSection });
}
