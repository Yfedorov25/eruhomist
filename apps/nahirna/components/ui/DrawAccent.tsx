"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "@/lib/gsapEase";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Short self-drawing accent line (svgLength language, GPU scaleX) — draws in under a section
// eyebrow on scroll-enter. Editorial emphasis that ties the type system to the "self-drawing"
// motion language. Reduced-motion: static.
export function DrawAccent({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

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
          duration: 1.1,
          transformOrigin: "left center",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <span
      ref={ref}
      aria-hidden
      className={`block h-px w-10 origin-left bg-[var(--color-warm)]/55 ${className}`}
    />
  );
}
