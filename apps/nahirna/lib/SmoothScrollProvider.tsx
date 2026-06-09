"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/lib/gsapEase"; // registers the "air" signature ease once, app-wide

// One Lenis + GSAP ScrollTrigger pipeline for the whole page. Every section attaches its
// own ScrollTriggers to this single scroll proxy. lerp 0.1 — AIR-calibrated (slightly livelier
// than the old 0.08, matches aircenter.space's scroll feel). autoRaf is OFF — Lenis is driven from the
// GSAP ticker so scroll + tweens share one clock (canonical Lenis×GSAP integration).
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // reduced-motion: skip Lenis entirely → native scroll; sections fall back to no-scrub.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    let rafFn: ((time: number) => void) | null = null;

    if (!reduced) {
      // NATIVE touch (no syncTouch): native touch scroll is the smoothest and lets horizontal
      // scroll-snap children (the gallery strip) work. syncTouch made touch feel heavy/rubbery and
      // swallowed the gallery's sideways scroll. The jumpy-pin problem is instead solved by NOT
      // pinning heavy sections on mobile (each story section has a max-width:767px no-pin branch),
      // so there is nothing for native momentum to desync from. (perf-doctrine: one smoother; the
      // smoother is desktop-only — touch stays native.)
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      rafFn = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(rafFn);
      // lagSmoothing(500, 33): if a frame takes >500ms, rebase time (no huge jump); clamp
      // per-tick delta to 33ms so one heavy paint frame is absorbed, not cascaded into a
      // visible scrub stutter. (Sister-project lesson — fully-off lagSmoothing showed spikes.)
      gsap.ticker.lagSmoothing(500, 33);
    }

    // Global [data-parallax] layers: yPercent driven by scroll (transform-only, GPU-cheap).
    // Amount in px-ish units via data-parallax="40". DUAL-RATE DEPTH: foreground layers stay
    // locked to scroll (scrub:true, snappy); background layers add data-parallax-lag="1.3" → a
    // scrub catch-up so they TRAIL the foreground. That speed/lag differential between layers is
    // the "depth" the award sites get from a slower second lerp loop — here GSAP-native, GPU only.
    // Skipped under reduced-motion.
    const parallaxCtx = gsap.context(() => {
      if (reduced) return;
      // Continuous parallax is desktop-only — it costs scroll FPS on mid-tier phones for little
      // gain (award pattern: lighter mobile). Clip wipes (once, cheap) still run on all devices.
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      if (isDesktop) gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((node) => {
        const amount = Number(node.dataset.parallax || "0");
        const lag = node.dataset.parallaxLag ? Number(node.dataset.parallaxLag) : true;
        gsap.fromTo(
          node,
          { yPercent: -amount / 2 },
          {
            yPercent: amount / 2,
            ease: "none",
            scrollTrigger: { trigger: node, start: "top bottom", end: "bottom top", scrub: lag },
          },
        );
      });

      // Directional clip-path wipes ([data-clip]="up|down|left|right"): media uncovers with a
      // cinematic edge wipe on scroll-enter (signature ease). Optional data-clip-delay for stagger.
      const CLIP_FROM: Record<string, string> = {
        up: "inset(100% 0% 0% 0%)",
        down: "inset(0% 0% 100% 0%)",
        left: "inset(0% 100% 0% 0%)",
        right: "inset(0% 0% 0% 100%)",
      };
      gsap.utils.toArray<HTMLElement>("[data-clip]").forEach((node) => {
        const from = CLIP_FROM[node.dataset.clip || "up"] || CLIP_FROM.up;
        const delay = node.dataset.clipDelay ? Number(node.dataset.clipDelay) : 0;
        gsap.fromTo(
          node,
          { clipPath: from },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "air",
            duration: 1.3,
            delay,
            scrollTrigger: { trigger: node, start: "top 85%", once: true },
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
