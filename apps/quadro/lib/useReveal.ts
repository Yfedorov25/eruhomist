"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/lib/gsapEase"; // "air" signature ease

gsap.registerPlugin(ScrollTrigger);

// Staggered reveal of [data-reveal] children when the container scrolls into view.
// AIR-calibrated: y 28, signature "air" ease, ~1.2s, 60ms cascade. A smooth FADE-rise (dissolve),
// NOT a per-char/line jump. reduced-motion -> visible, no anim.
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
        duration: opts?.duration ?? 1.2,
        ease: "air",
        stagger: opts?.stagger ?? 0.06,
        scrollTrigger: { trigger: el, start: "top 78%" },
      });
    }, el);
    return () => ctx.revert();
  }, [opts?.duration, opts?.stagger, opts?.y]);
  return ref;
}
