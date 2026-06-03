"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Cinematic splash — a warm-dark veil over the hero. The concept word «Власний берег» reveals
// while a 0→100 counter runs, then the veil fades the moment the hero's day-image paints
// (`nahirna:hero-ready` = the LCP moment). Ported from the proven apps/quadro Preloader.
//
// LCP safety (council): the hero paints UNDER this veil; the veil lifts as soon as the hero
// signals ready, so it TRACKS LCP rather than delaying it. Safety timeout lifts even if the
// event never fires (slow net / decode fail) — never traps. Once per session; reduced-motion skips.
// NO water-rising animation (council unanimous: couples LCP to frame-preload, reads as slop).
const SESSION_KEY = "nahirna:splash-seen";
const MIN_MS = 900; // elegance floor — hero LCP is ~fast, so don't trap a return-visitor longer
const SAFETY_MS = 5000; // hard cap — lift no matter what

export function Preloader() {
  const root = useRef<HTMLDivElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const ruleRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (reduced || seen) {
      el.style.display = "none";
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");

    const mountedAt = performance.now();
    let lifted = false;
    let liftCall: gsap.core.Tween | null = null;

    const counter = { v: 0 };
    const countTween = gsap.to(counter, {
      v: 100,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.round(counter.v));
        if (ruleRef.current) ruleRef.current.style.transform = `scaleX(${counter.v / 100})`;
      },
    });

    const finish = () => {
      countTween.kill();
      if (countRef.current) {
        countRef.current.textContent = "100";
        countRef.current.style.color = "var(--color-accent)";
      }
      if (ruleRef.current) ruleRef.current.style.transform = "scaleX(1)";
    };

    const lift = () => {
      if (lifted) return;
      lifted = true;
      finish();
      const wait = Math.max(0, MIN_MS - (performance.now() - mountedAt));
      liftCall = gsap.delayedCall(wait / 1000, () => {
        gsap.to(el, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            el.style.display = "none";
          },
        });
      });
    };

    window.addEventListener("nahirna:hero-ready", lift, { once: true });
    const safety = window.setTimeout(lift, SAFETY_MS);

    return () => {
      countTween.kill();
      liftCall?.kill();
      window.removeEventListener("nahirna:hero-ready", lift);
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-night)]"
    >
      {/* faint warm vignette so the dark veil isn't a flat fill */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(60% 50% at 50% 45%, rgba(232,201,160,0.08) 0%, transparent 70%)",
        }}
      />
      {/* The concept word IS the entry beat — the whole product thesis in two words. */}
      <div
        className="text-[clamp(2.2rem,6vw,4.5rem)] font-medium tracking-[0.04em] text-[var(--color-plaster)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Власний берег
      </div>
      {/* Restrained loading signal: a hairline rule filling left→right + a small tabular count. */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <span
          ref={ruleRef}
          aria-hidden
          className="block h-px w-40 origin-left bg-[var(--color-warm)]/45"
          style={{ transform: "scaleX(0)" }}
        />
        <span
          ref={countRef}
          className="text-sm tabular-nums tracking-[0.4em] text-[var(--color-text-muted)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          0
        </span>
      </div>
    </div>
  );
}
