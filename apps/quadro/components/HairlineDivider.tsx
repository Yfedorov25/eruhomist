"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/lib/gsapEase";

gsap.registerPlugin(ScrollTrigger);

// Self-drawing hairline — a thin warm line draws left→right on scroll-enter (the "svgLength"
// editorial device, GPU scaleX). A montage "cut" between scenes so the page reads as one
// continuous film. Reduced-motion: drawn static.
export function HairlineDivider() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { scaleX: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "air",
          duration: 1.4,
          transformOrigin: "left center",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-[3vh]" aria-hidden>
      <div ref={ref} className="h-px w-full origin-left bg-[var(--accent)]/25" />
    </div>
  );
}
