"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { useFrameSequence } from "@/lib/useFrameSequence";
import {
  TOUR_FRAME_COUNT,
  tourFramePath,
  TOUR_POSTER,
  TOUR_CAPTIONS,
} from "@/lib/tour-frames";
import { trackCta } from "@/lib/analytics";

// 05 · ПРОХІД БУДИНКОМ — the wow section. A fullscreen overlay opened by the §03 CTA (or the
// in-section button). Inside, a tall scroll container scrubs a 181-frame WebP sequence on a
// <canvas> (decoder + all fallbacks live in useFrameSequence). Scroll down = forward, up =
// reverse. Close (X / Esc) frees all bitmaps. The walkthrough ENDS on the golden-hour water —
// peak emotional moment — where a "Записатися на перегляд" CTA surfaces (council conversion win).
export default function Walkthrough() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const { ready, failed } = useFrameSequence({
    active: open,
    canvasRef,
    scrollerRef,
    frameCount: TOUR_FRAME_COUNT,
    framePath: tourFramePath,
    onProgress: setProgress,
  });

  // Open via the §03 CTA event, the in-section button, or close via Esc. Lock body scroll while open.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-tour", onOpen);
    return () => window.removeEventListener("open-tour", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // Reset the overlay scroll to top each open so the tour starts at the courtyard.
    requestAnimationFrame(() => scrollerRef.current?.scrollTo(0, 0));
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const showClimaxCta = progress > 0.9;

  return (
    <section className="relative bg-night py-[12vh]" aria-label="Прохід будинком">
      {/* In-page invitation (the §03 CTA also opens the overlay). */}
      <Reveal className="mx-auto max-w-4xl px-6 text-center">
        <p data-reveal-child className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
          Прогулянка
        </p>
        <h2
          data-reveal-child
          className="text-balance text-[clamp(2rem,5vw,3.4rem)] font-normal leading-[1.12] tracking-[-0.02em] text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Пройдіть будинок, не встаючи з крісла
        </h2>
        <p data-reveal-child className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
          Від воріт — через ганок і коридор у вітальню, а звідти на терасу, до самої води. У Вашому
          темпі: гортайте повільно.
        </p>
        <button
          data-reveal-child
          type="button"
          onClick={() => {
            trackCta("tour_open");
            setOpen(true);
          }}
          className="group mt-9 inline-flex items-baseline gap-4 text-[var(--color-text)]"
        >
          <span
            className="text-[clamp(1.3rem,2vw,1.7rem)] leading-none tracking-[-0.01em] [text-decoration-line:underline] [text-decoration-thickness:1px] [text-underline-offset:8px] decoration-[var(--color-warm)]/45 transition-[text-decoration-color,letter-spacing] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:tracking-[0] group-hover:decoration-[var(--color-warm)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Відкрити на весь екран
          </span>
        </button>
      </Reveal>

      {/* Fullscreen overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black" role="dialog" aria-modal="true" aria-label="Тур будинком">
          {failed ? (
            // Total-decode-failure / data-saver fallback: static golden-hour climax + CTA.
            <div className="relative h-full w-full">
              <Image src={TOUR_POSTER.desktop} alt="Прохід будинком — вид від воріт" fill priority className="object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/40 px-6 text-center">
                <p className="max-w-md text-lg text-[var(--color-text)]">
                  Тур не завантажився. Подивіться будинок наживо — приїдьте на перегляд.
                </p>
              </div>
              <CloseButton onClick={() => setOpen(false)} />
            </div>
          ) : (
            <>
              {/* The scroll container drives the scrub. Tall inner spacer = scrub distance. */}
              <div
                ref={scrollerRef}
                className="relative h-full w-full overflow-y-auto overscroll-contain"
                style={{ scrollbarWidth: "none" }}
              >
                {/* Spacer defines how much scroll = full tour (~5 screens for an unhurried pace). */}
                <div style={{ height: "500vh" }} aria-hidden />
                {/* Canvas is fixed within the overlay, painted by useFrameSequence. */}
                <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 block h-full w-full" />
              </div>

              {/* Loading state until first frames are painted. */}
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <span
                    className="text-xl tracking-[0.4em] text-[var(--color-text)]/70"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Заходимо…
                  </span>
                </div>
              )}

              {/* Beat captions — fade in/out by progress. */}
              {TOUR_CAPTIONS.map((c) => {
                const visible = progress >= c.at && progress <= c.until;
                return (
                  <span
                    key={c.text}
                    className="pointer-events-none fixed bottom-24 left-1/2 -translate-x-1/2 text-sm uppercase tracking-[0.32em] text-[var(--color-text)] transition-opacity duration-700"
                    style={{ opacity: visible ? 0.85 : 0, textShadow: "0 1px 16px rgba(0,0,0,0.6)" }}
                  >
                    {c.text}
                  </span>
                );
              })}

              {/* Progress rail. */}
              <div className="pointer-events-none fixed inset-x-0 bottom-0 h-px bg-white/15">
                <div
                  className="h-full bg-[var(--color-warm)]"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>

              {/* Scroll hint at start. */}
              <span
                className="pointer-events-none fixed bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.32em] text-[var(--color-text)]/60 transition-opacity duration-500"
                style={{ opacity: progress < 0.04 && ready ? 1 : 0 }}
              >
                гортайте — і Ви всередині
              </span>

              {/* Climax CTA — surfaces at the golden-hour water (peak emotional moment). */}
              <div
                className="fixed inset-x-0 bottom-20 flex justify-center transition-all duration-700"
                style={{
                  opacity: showClimaxCta ? 1 : 0,
                  transform: showClimaxCta ? "translateY(0)" : "translateY(16px)",
                  pointerEvents: showClimaxCta ? "auto" : "none",
                }}
              >
                {/* Peak-end: the verb carries the terrace feeling forward, not bureaucracy. */}
                <a
                  href="#cta"
                  onClick={() => {
                    trackCta("tour_climax");
                    setOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 rounded-full bg-[var(--color-warm)] px-9 py-4 text-center text-[var(--color-night)] transition-transform duration-500 hover:scale-[1.03]"
                >
                  <span className="text-base" style={{ fontFamily: "var(--font-display)" }}>
                    Постояти тут наживо
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">
                    записатися на перегляд
                  </span>
                </a>
              </div>

              <CloseButton onClick={() => setOpen(false)} />
            </>
          )}
        </div>
      )}
    </section>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Закрити тур"
      className="fixed right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-[var(--color-text)] backdrop-blur transition-colors duration-300 hover:border-[var(--color-warm)] hover:text-[var(--color-warm)]"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
