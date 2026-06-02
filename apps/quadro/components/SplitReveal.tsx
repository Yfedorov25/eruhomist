"use client";

import { useEffect, useRef, createElement, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Headline that rises in line-by-line when it scrolls into view (R23 kinetic type).
// Luxury tempo (R04): lines clipped, yPercent 110 -> 0, power3.out, stagger 0.12.
// reduced-motion -> shown immediately, no split/anim. Used by S2/S4/S5 section headers.
export function SplitReveal({
  children,
  as = "h2",
  className = "",
}: {
  children: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false; // guard the async fonts.ready -> don't split after unmount
    const ctx = gsap.context(() => {
      let split: SplitText | null = null;
      // wait for fonts so the split measures final glyph metrics (no reflow jump)
      const run = () => {
        if (cancelled || !el.isConnected) return;
        // Mask each line generously: a tight clip box shears descenders/ascenders
        // during the yPercent rise (the "broken glyph" slop tell). pb leaves room for
        // descenders, the negative margin keeps the visual line-height unchanged.
        split = new SplitText(el, {
          type: "lines",
          linesClass: "overflow-hidden pb-[0.18em] -mb-[0.18em]",
        });
        gsap.from(split.lines, {
          yPercent: 110,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 82%" },
        });
      };
      if (document.fonts?.ready) document.fonts.ready.then(run);
      else run();
      return () => split?.revert();
    }, el);
    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);

  return createElement(as, { ref, className }, children);
}
