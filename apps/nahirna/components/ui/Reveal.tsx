"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Shared reveal: fade + small rise when the element enters the viewport, luxury timing
// (power3.out, ~1.4s). Children with [data-reveal-child] stagger in. Under reduced-motion
// everything is simply visible (no transform). One source for the site's entrance feel.
export function Reveal({
  children,
  as: Tag = "div",
  className,
  y = 28,
  delay = 0,
  stagger = 0.12,
  start = "top 82%",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  y?: number;
  delay?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const children = ref.current?.querySelectorAll<HTMLElement>("[data-reveal-child]");
      const targets = children && children.length ? children : [ref.current!];

      if (reduced) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }

      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 1.4,
        delay,
        ease: "power3.out",
        stagger: targets.length > 1 ? stagger : 0,
        scrollTrigger: { trigger: ref.current, start, once: true },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className}>
      {children}
    </Tag>
  );
}
