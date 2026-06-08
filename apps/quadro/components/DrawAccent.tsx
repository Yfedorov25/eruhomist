"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/lib/gsapEase";

gsap.registerPlugin(ScrollTrigger);

// Short self-drawing accent line (svgLength language, GPU scaleX) — draws in under a section
// eyebrow on scroll-enter. Editorial emphasis tying the type system to the motion language.
export function DrawAccent({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
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
          duration: 1.1,
          transformOrigin: "left center",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return <span ref={ref} aria-hidden className={`block h-px w-10 origin-left bg-[var(--accent)]/60 ${className}`} />;
}
