"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Staggered reveal of [data-reveal] children when the container scrolls into view.
// Luxury tempo (R04): y 28, power3.out, ~1.4s, stagger 110ms. reduced-motion -> visible, no anim.
export function useReveal<T extends HTMLElement = HTMLElement>(opts?: {
  duration?: number;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll("[data-reveal]");
    if (targets.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y: opts?.y ?? 28,
        opacity: 0,
        duration: opts?.duration ?? 1.4,
        ease: "power3.out",
        stagger: opts?.stagger ?? 0.11,
        scrollTrigger: { trigger: el, start: "top 78%" },
      });
    }, el);
    return () => ctx.revert();
  }, [opts?.duration, opts?.stagger, opts?.y]);
  return ref;
}
