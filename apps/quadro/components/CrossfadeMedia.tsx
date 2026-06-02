"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// R04 depth-parallax (Phase 4). A day render cross-fades to its evening twin as the
// section travels through the viewport — the single HEROIC moment of the section
// (council verdict: the $10k feeling is time-of-day-as-narrative, not layer count).
// Restraint by design — exactly TWO layers of real motion:
//   1. media (day+evening stacked) drifts slowly  -> the "far" plane
//   2. a warm atmospheric light-leak drifts faster + brightens toward evening -> "near" plane
// Everything is transform/opacity only (CLS-safe). Desktop gets both planes; mobile
// (matchMedia) keeps only the slow media drift (yPercent). reduced-motion -> evening, static.
export function CrossfadeMedia({
  day,
  evening,
  alt,
  parallax = 10,
  glowIntensity = 1,
  dayFilter,
  className = "",
}: {
  day: string;
  evening: string;
  alt: string;
  parallax?: number;
  // Warm light-leak intensity multiplier. 1 = full (facade windows, S2). Lower it when the
  // evening render already carries its own warm lights (e.g. courtyard path-lights) so the
  // leak doesn't double-expose them.
  glowIntensity?: number;
  // Optional CSS filter on the DAY plate only — lift a flat daylight render's exposure so
  // the day->evening crossfade actually crosses temperature instead of starting half-dusk.
  dayFilter?: string;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const eveningRef = useRef<HTMLImageElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const bleedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrap.current;
    const media = mediaRef.current;
    const ev = eveningRef.current;
    const glow = glowRef.current;
    const bleed = bleedRef.current;
    if (!el || !media || !ev || !glow || !bleed) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(ev, { opacity: 1 });
      gsap.set([glow, bleed], { opacity: 0.42 * glowIntensity });
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // crossfade day -> evening across the section's scroll span (heroic moment).
      // Runs on every device — the emotional payload, not a perf cost.
      gsap.fromTo(
        ev,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 72%", end: "center 48%", scrub: 1 },
        },
      );

      // warm light-leak ramps in slightly AFTER the night fade, so the evening reads as
      // light "arriving" (an event), not a flat dissolve. Brightens toward dusk. The in-frame
      // glow and the frame-escaping bleed share one timeline so the light reads continuous.
      gsap.fromTo(
        [glow, bleed],
        { opacity: 0 },
        {
          opacity: 0.5 * glowIntensity,
          ease: "power1.in",
          scrollTrigger: { trigger: el, start: "top 60%", end: "center 45%", scrub: 1 },
        },
      );

      // DESKTOP: two-plane depth. Media drifts slowly (far), light-leak faster (near).
      mm.add("(min-width: 768px)", () => {
        gsap.fromTo(
          media,
          { yPercent: -parallax / 2 },
          {
            yPercent: parallax / 2,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        gsap.fromTo(
          glow,
          { yPercent: -parallax },
          {
            yPercent: parallax,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      // MOBILE: single, lighter plane — media yPercent only (council §7: mobile = yPercent).
      mm.add("(max-width: 767px)", () => {
        gsap.fromTo(
          media,
          { yPercent: -parallax / 3 },
          {
            yPercent: parallax / 3,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, [parallax, glowIntensity]);

  // Soft edge feather so the building dissolves into the evening surface instead of
  // reading as a hard-edged rectangle (the "flat plate" slop tell). Bottom fades harder
  // to ground it into the dark surface; a whisper of side-feather keeps it from looking
  // pinned to the gutter wall. Two masks composited (intersect).
  const featherMask =
    "linear-gradient(to bottom, transparent 0%, #000 7%, #000 84%, transparent 100%)," +
    "linear-gradient(to right, transparent 0%, #000 4%, #000 97%, transparent 100%)";

  return (
    <div className={`relative ${className}`}>
      {/* warm light bleeding OUT of the frame onto the surrounding surface as evening
          arrives — sits behind the clipped frame and escapes it (council: the atmospheric
          layer is the luxury signal). Screen-blend, large soft pool from the window band. */}
      <div
        ref={bleedRef}
        aria-hidden
        className="pointer-events-none absolute inset-[-22%] opacity-0"
        style={{
          // was mix-blend-mode:screen — re-blended the whole backdrop every scroll frame.
          // Plain opacity over the dark evening surface looks the same; will-change promotes it.
          willChange: "opacity",
          background:
            "radial-gradient(52% 40% at 58% 64%, rgba(236,178,118,0.4) 0%, transparent 70%)",
        }}
      />

      <div ref={wrap} className="relative h-full w-full overflow-hidden rounded-[inherit]">
        {/* media plane (far) — day under, evening over, both over-scaled for drift headroom.
            Edges feathered into the surface via mask-image. */}
        <div
          ref={mediaRef}
          className="absolute inset-0"
          style={{
            maskImage: featherMask,
            WebkitMaskImage: featherMask,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          {/* eslint-disable @next/next/no-img-element */}
          <img
            src={day}
            alt={alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-[1.08] object-cover"
            style={dayFilter ? { filter: dayFilter } : undefined}
          />
          <img
            ref={eveningRef}
            src={evening}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-[1.08] object-cover opacity-0"
          />
          {/* eslint-enable @next/next/no-img-element */}
        </div>

        {/* atmospheric warm light-leak (near plane). Soft 2700K pools over the window/lamp
            bands; ramps toward evening. No screen-blend (per-frame backdrop re-blend = jank);
            plain opacity over the evening render reads ~the same, will-change promotes it. */}
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-[-12%] opacity-0"
          style={{
            willChange: "opacity",
            background:
              "radial-gradient(46% 30% at 62% 70%, rgba(238,180,120,0.6) 0%, transparent 72%)," +
              "radial-gradient(40% 26% at 30% 58%, rgba(238,180,120,0.44) 0%, transparent 74%)",
          }}
        />

        {/* gentle bottom scrim so any overlaid edges read against the evening render */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(8,10,16,0.34) 0%, transparent 42%)",
          }}
        />
      </div>
    </div>
  );
}
