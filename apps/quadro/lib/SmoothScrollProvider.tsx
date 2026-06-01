"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// One Lenis + GSAP ScrollTrigger pipeline for the whole page (R04). Mounted ABOVE
// the [locale] route so a UK<->EN switch does NOT recreate it (no stacked tickers).
// The hero (R01) and other sections attach their own ScrollTriggers to this single
// scroll proxy — NOT drei <ScrollControls> (the two cannot coexist).
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // reduced-motion: skip Lenis entirely, native scroll, ScrollTrigger without scrub.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    let rafFn: ((time: number) => void) | null = null;

    if (!reduced) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      rafFn = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(rafFn);
      gsap.ticker.lagSmoothing(0);
    }

    // Drive a global 0..1 scroll-progress CSS var on :root for the day->night theme.
    // Throttle to ~2-decimal steps: a :root var change invalidates style for every
    // element referencing it, so updating only on a perceptible delta (0.01) keeps the
    // theme smooth while cutting full-document style recalcs on throttled CPUs.
    let lastProgress = -1;
    const progressTrigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const p = Math.round(self.progress * 100) / 100;
        if (p === lastProgress) return;
        lastProgress = p;
        document.documentElement.style.setProperty("--scroll-progress", String(p));
      },
    });

    // Global data-parallax layers (R04 pattern D): yPercent driven by scroll.
    const parallaxCtx = gsap.context(() => {
      if (reduced) return;
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((node) => {
        const amount = Number(node.dataset.parallax || "0");
        gsap.fromTo(
          node,
          { yPercent: -amount / 2 },
          {
            yPercent: amount / 2,
            ease: "none",
            scrollTrigger: { trigger: node, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    });

    // Recompute trigger positions once fonts + initial layout settle.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      parallaxCtx.revert();
      progressTrigger.kill();
      if (rafFn) gsap.ticker.remove(rafFn);
      lenis?.destroy();
      ScrollTrigger.killAll();
    };
  }, []);

  return <>{children}</>;
}
