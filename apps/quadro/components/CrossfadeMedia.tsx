"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// R04: two stacked renders (day -> evening) cross-faded by scroll progress, with a
// gentle parallax drift. The evening layer fades in as the section travels through
// the viewport — echoing the hero's day->night. reduced-motion -> evening shown static.
export function CrossfadeMedia({
  day,
  evening,
  alt,
  parallax = 8,
  className = "",
}: {
  day: string;
  evening: string;
  alt: string;
  parallax?: number;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const eveningRef = useRef<HTMLImageElement | null>(null);
  const dayRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const el = wrap.current;
    const ev = eveningRef.current;
    const dy = dayRef.current;
    if (!el || !ev || !dy) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(ev, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // crossfade day -> evening across the section's scroll span
      gsap.fromTo(
        ev,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 55%", scrub: 1 },
        },
      );
      // subtle parallax drift on both layers (depth)
      gsap.fromTo(
        [dy, ev],
        { yPercent: -parallax / 2 },
        {
          yPercent: parallax / 2,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [parallax]);

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable @next/next/no-img-element */}
      <img
        ref={dayRef}
        src={day}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-[1.06] object-cover"
      />
      <img
        ref={eveningRef}
        src={evening}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-[1.06] object-cover opacity-0"
      />
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}
