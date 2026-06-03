"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Magnetic button — the element eases toward the cursor (gsap.quickTo, transform-only).
// Disabled on touch + reduced-motion (ТЗ 08). Renders as <a> when href, else <button>.
export function MagneticButton({
  children,
  href,
  onClick,
  className,
  strength = 0.35,
  ariaLabel,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  strength?: number;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const touch = window.matchMedia("(pointer: coarse)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (touch || reduced) return; // no magnetism on touch / reduced-motion

      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        xTo(mx * strength);
        yTo(my * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: ref },
  );

  const cls = className;
  if (href) {
    return (
      <a ref={ref} href={href} onClick={onClick} aria-label={ariaLabel} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button ref={ref} type="button" onClick={onClick} aria-label={ariaLabel} className={cls}>
      {children}
    </button>
  );
}
