"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// One Lenis + GSAP ScrollTrigger pipeline for the whole page. Every section attaches its
// own ScrollTriggers to this single scroll proxy. CLAUDE.md mandates lerp 0.08 (slow,
// non-rubbery luxury inertia) for this project. autoRaf is OFF — Lenis is driven from the
// GSAP ticker so scroll + tweens share one clock (canonical Lenis×GSAP integration).
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // reduced-motion: skip Lenis entirely → native scroll; sections fall back to no-scrub.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    let rafFn: ((time: number) => void) | null = null;

    if (!reduced) {
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      rafFn = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(rafFn);
      // lagSmoothing(500, 33): if a frame takes >500ms, rebase time (no huge jump); clamp
      // per-tick delta to 33ms so one heavy paint frame is absorbed, not cascaded into a
      // visible scrub stutter. (Sister-project lesson — fully-off lagSmoothing showed spikes.)
      gsap.ticker.lagSmoothing(500, 33);
    }

    // Global [data-parallax] layers: yPercent driven by scroll (transform-only, GPU-cheap).
    // Amount in px-ish units via data-parallax="40". Skipped under reduced-motion.
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

    // Recompute trigger positions once fonts + initial layout settle (serif metrics shift layout).
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      parallaxCtx.revert();
      if (rafFn) gsap.ticker.remove(rafFn);
      lenis?.destroy();
      ScrollTrigger.killAll();
    };
  }, []);

  return <>{children}</>;
}
