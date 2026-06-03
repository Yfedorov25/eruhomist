"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Count-up that runs once when scrolled into view (power3.out, ~1.6s). Reduced-motion →
// the final value is rendered immediately (no animation). Locale-formatted, supports a
// fractional `prefix` (e.g. "~") and decimals for values like 29.83.
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const fmt = (n: number) =>
        prefix +
        n.toLocaleString("uk-UA", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = fmt(value);
        return;
      }

      const obj = { n: 0 };
      el.textContent = fmt(0);
      gsap.to(obj, {
        n: value,
        duration: 1.6,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = fmt(obj.n);
        },
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    { scope: ref },
  );

  return <span ref={ref} className={className} aria-hidden />;
}
