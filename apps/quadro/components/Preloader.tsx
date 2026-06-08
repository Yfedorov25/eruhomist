"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import "@/lib/gsapEase"; // "air" signature ease for the curtain lift

// Phase 6 — cinematic splash. A warm-dark veil over the hero: the QUADRO wordmark
// reveals slowly while a 0→100 counter runs, then it fades elegantly the moment the
// hero's first frames are painted (the `quadro:hero-ready` event = the LCP moment).
//
// LCP safety: the hero canvas paints UNDER this veil and the veil lifts as soon as the
// hero signals ready, so it tracks LCP rather than delaying it. A safety timeout lifts
// the veil even if the event never fires (slow network / decode failure) — never traps.
// Shows once per session (sessionStorage); reduced-motion skips it entirely.
const SESSION_KEY = "quadro:splash-seen";
// Elegance floor, capped at 900ms (council): hero LCP is ~180ms, so a longer floor would just
// trap an affluent return-visitor behind the veil for a counter that counts nothing. ≤900 reads
// considered without being a waiting-tax.
const MIN_MS = 900;
const SAFETY_MS = 5000; // hard cap — lift no matter what

export function Preloader() {
  const root = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const ruleRef = useRef<HTMLSpanElement | null>(null);

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

    // counter 0→100 + a hairline rule that fills 0→1 in lockstep (the visible "loading" signal).
    const counter = { v: 0 };
    const countTween = gsap.to(counter, {
      v: 100,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        const v = Math.round(counter.v);
        if (countRef.current) countRef.current.textContent = String(v);
        if (ruleRef.current) ruleRef.current.style.transform = `scaleX(${counter.v / 100})`;
      },
    });

    // Snap to a finished, terracotta "100" — coinciding with the REAL ready signal, not an
    // arbitrary tween end (honest: the number lands when the page is actually ready).
    const finish = () => {
      countTween.kill();
      if (countRef.current) {
        countRef.current.textContent = "100";
        countRef.current.style.color = "var(--accent)";
      }
      if (ruleRef.current) ruleRef.current.style.transform = "scaleX(1)";
    };

    const lift = () => {
      if (lifted) return;
      lifted = true;
      finish();
      const wait = Math.max(0, MIN_MS - (performance.now() - mountedAt));
      liftCall = gsap.delayedCall(wait / 1000, () => {
        // Choreographed exit: the wordmark lifts away, then the veil slides up like a curtain,
        // revealing the hero beneath (Vide Infra-style staged entrance) — not a flat opacity fade.
        const tl = gsap.timeline({
          onComplete: () => {
            el.style.display = "none";
            document.documentElement.classList.remove("splash-lock");
          },
        });
        tl.to(contentRef.current, { opacity: 0, yPercent: -30, duration: 0.5, ease: "power2.in" }, 0);
        tl.to(el, { yPercent: -100, duration: 1.0, ease: "air" }, 0.2);
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
      <div ref={contentRef} className="relative flex flex-col items-center">
      {/* The wordmark IS the entry beat — promoted big (the real fix for "barely visible"). */}
      <div className="splash-word font-display text-6xl tracking-[0.5em] text-[#f1efea] md:text-8xl">
        QUADRO
      </div>
      {/* Restrained, legible loading signal centered beneath the wordmark: a hairline rule that
          fills left→right + a small tabular-nums count. Visible (per the ask) but not a loud
          dashboard progress bar — counter warm-white, turning terracotta only on the final 100. */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <span
          ref={ruleRef}
          aria-hidden
          className="block h-px w-40 origin-left bg-[rgba(241,239,234,0.55)]"
          style={{ transform: "scaleX(0)" }}
        />
        <span
          ref={countRef}
          className="font-display text-sm tabular-nums tracking-[0.4em] text-[rgba(241,239,234,0.7)]"
        >
          0
        </span>
      </div>
      </div>
    </div>
  );
}
