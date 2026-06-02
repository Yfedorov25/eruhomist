"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Phase 6 — cinematic splash. A warm-dark veil over the hero: the QUADRO wordmark
// reveals slowly while a 0→100 counter runs, then it fades elegantly the moment the
// hero's first frames are painted (the `quadro:hero-ready` event = the LCP moment).
//
// LCP safety: the hero canvas paints UNDER this veil and the veil lifts as soon as the
// hero signals ready, so it tracks LCP rather than delaying it. A safety timeout lifts
// the veil even if the event never fires (slow network / decode failure) — never traps.
// Shows once per session (sessionStorage); reduced-motion skips it entirely.
const SESSION_KEY = "quadro:splash-seen";
const MIN_MS = 650; // elegance floor so the splash never just blinks
const SAFETY_MS = 5000; // hard cap — lift no matter what

export function Preloader() {
  const root = useRef<HTMLDivElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);

  // The veil ALWAYS renders on the server and on the first client paint (identical markup,
  // so no hydration mismatch) — this prevents a hero flash before hydration. The effect then
  // decides: skip instantly (reduced-motion / already seen this session) or play the splash.
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (reduced || seen) {
      el.style.display = "none"; // remove on frame 1, before paint settles
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");

    const mountedAt = performance.now();
    let lifted = false;
    let liftCall: gsap.core.Tween | null = null; // delayedCall returns a Tween; track to kill

    // counter 0→100 over ~1.4s (decorative; capped well under SAFETY)
    const counter = { v: 0 };
    const countTween = gsap.to(counter, {
      v: 100,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.round(counter.v));
      },
    });

    const lift = () => {
      if (lifted) return;
      lifted = true;
      const wait = Math.max(0, MIN_MS - (performance.now() - mountedAt));
      liftCall = gsap.delayedCall(wait / 1000, () => {
        if (countRef.current) countRef.current.textContent = "100";
        gsap.to(el, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            el.style.display = "none";
            document.documentElement.classList.remove("splash-lock");
          },
        });
      });
    };

    document.documentElement.classList.add("splash-lock");
    window.addEventListener("quadro:hero-ready", lift, { once: true });
    const safety = window.setTimeout(lift, SAFETY_MS);

    return () => {
      countTween.kill();
      liftCall?.kill();
      window.removeEventListener("quadro:hero-ready", lift);
      window.clearTimeout(safety);
      document.documentElement.classList.remove("splash-lock");
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0c11]"
    >
      {/* faint warm vignette so the dark veil isn't a flat fill */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 45%, rgba(224,169,109,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="splash-word font-display text-4xl tracking-[0.5em] text-[#f1efea] md:text-6xl">
        QUADRO
      </div>
      {/* a quiet film-leader frame-count in the corner — NOT a centerstage progress bar
          (council/design: a 0→100 counter under the wordmark is the generic-loader slop tell) */}
      <span
        ref={countRef}
        className="absolute bottom-8 left-8 font-display text-[11px] tracking-[0.35em] text-[var(--accent)] opacity-60"
      >
        0
      </span>
    </div>
  );
}
