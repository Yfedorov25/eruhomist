"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import "@/lib/gsapEase";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Kinetic heading — characters rise from a per-line mask on scroll-enter (award pattern, AIR
// signature ease). Splits only AFTER fonts load (correct metrics, no CLS), reverts on unmount,
// and under reduced-motion renders plain text (no split, fully visible). Below-the-fold only —
// never used on the LCP hero, to protect the perf budget.
export function SplitReveal({
  children,
  as: Tag = "h2",
  className,
  start = "top 82%",
  stagger = 0.045,
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  start?: string;
  stagger?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      let split: SplitText | undefined;
      const run = () => {
        split = new SplitText(el, { type: "lines,chars", linesClass: "split-line" });
        gsap.set(split.lines, { overflow: "hidden" });
        gsap.from(split.chars, {
          yPercent: 115,
          duration: 1.0,
          ease: "air",
          stagger,
          scrollTrigger: { trigger: el, start, once: true },
        });
      };
      if (document.fonts && document.fonts.status !== "loaded") document.fonts.ready.then(run);
      else run();
      return () => split?.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className} style={style}>
      {children}
    </Tag>
  );
}
