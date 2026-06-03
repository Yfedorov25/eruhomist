"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Custom cursor — a small warm ring that trails the pointer (gsap.quickTo) and grows softly
// over interactive elements. Desktop + fine-pointer only; off on touch and reduced-motion.
// Restrained, not gimmicky: low opacity, blend-mode so it reads on dark and light media.
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const dot = dotRef.current;
    if (!dot) return;
    dot.style.opacity = "0";

    const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3.out" });
    const scaleTo = gsap.quickTo(dot, "scale", { duration: 0.3, ease: "power2.out" });

    let shown = false;
    const onMove = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.to(dot, { opacity: 1, duration: 0.4 });
      }
      xTo(e.clientX);
      yTo(e.clientY);
      // Grow over anything clickable.
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, input, label, [role=button], summary");
      scaleTo(interactive ? 2.4 : 1);
    };
    const onLeave = () => gsap.to(dot, { opacity: 0, duration: 0.3 });

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
      style={{
        border: "1px solid var(--color-warm)",
        mixBlendMode: "difference",
        willChange: "transform",
      }}
    />
  );
}
