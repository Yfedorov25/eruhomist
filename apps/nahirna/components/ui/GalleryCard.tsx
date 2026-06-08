"use client";

import { useState, useRef } from "react";
import Image from "next/image";

// Gallery card that "comes alive" on click (council/kickoff F2):
//   • night: day image + a night twin → click crossfades (lights come on — same room, can't morph)
//   • video: a cinemagraph (terrace water) plays on click, with a poster still as the resting frame
// Falls back to a plain still + hover-zoom when neither. Reduced-motion = no auto-effects.
export type Card = {
  src: string;
  title: string;
  meta: string;
  span: string;
  alt: string;
  night?: string; // night-twin image → click crossfades day↔night
  video?: string; // cinemagraph mp4 → click plays (water motion)
};

export function GalleryCard({ c }: { c: Card }) {
  const [live, setLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const interactive = !!(c.night || c.video);

  const toggle = () => {
    if (!interactive) return;
    const next = !live;
    setLive(next);
    if (c.video && videoRef.current) {
      if (next) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  };

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={toggle}
      onKeyDown={interactive ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } } : undefined}
      aria-pressed={interactive ? live : undefined}
      data-clip="up"
      data-cursor={interactive ? (c.video ? "грати" : "вечір") : undefined}
      className={`group relative aspect-[4/3] overflow-hidden rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-warm)] md:aspect-auto md:h-full ${c.span} ${
        interactive ? "cursor-pointer" : ""
      }`}
    >
      {/* Base day image */}
      <Image
        src={c.src}
        alt={c.alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        loading="lazy"
        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-[1.04]"
      />

      {/* Night twin — crossfades in on click. */}
      {c.night ? (
        <Image
          src={c.night}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
          aria-hidden
          className="object-cover transition-opacity duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ opacity: live ? 1 : 0 }}
        />
      ) : null}

      {/* Cinemagraph video — fades in + plays on click. */}
      {c.video ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={c.src}
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: live ? 1 : 0 }}
        >
          <source src={c.video} type="video/mp4" />
        </video>
      ) : null}

      {/* Caption scrim */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(15,15,14,0.78) 0%, transparent 48%)" }}
        aria-hidden
      />

      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <span className="text-lg text-[var(--color-text)] md:text-xl" style={{ fontFamily: "var(--font-display)" }}>
          {c.title}
        </span>
        <span className="shrink-0 text-xs uppercase tracking-[0.18em] text-[var(--color-warm)]/90">{c.meta}</span>
      </figcaption>

      {/* "tap to come alive" affordance — only on interactive cards, hidden once live. */}
      {interactive ? (
        <span
          className="pointer-events-none absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[rgba(15,15,14,0.4)] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--color-plaster)] backdrop-blur-[2px] transition-opacity duration-500"
          style={{ opacity: live ? 0 : 1 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warm)]" aria-hidden />
          {c.video ? "оживити" : "увімкнути вечір"}
        </span>
      ) : null}
    </div>
  );
}
