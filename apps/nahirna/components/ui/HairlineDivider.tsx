"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "@/lib/gsapEase";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Self-drawing hairline — a thin warm line draws left→right on scroll-enter (the "svgLength"
// editorial device, done GPU-cheap via scaleX). Acts as a montage "cut" between scenes so the
// page reads as one continuous film, not stacked blocks. Reduced-motion: drawn static.
export function HairlineDivider() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { scaleX: 1 });
        return;
      }
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
    },
    { scope: ref },
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-[3vh]" aria-hidden>
      <div ref={ref} className="h-px w-full origin-left bg-[var(--color-warm)]/20" />
    </div>
  );
}
