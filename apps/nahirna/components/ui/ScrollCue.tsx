"use client";

import { useEffect, useRef, useState } from "react";

// Scroll-down cue (award base: R_hero / D_Lusion — a quiet LABEL + hairline, NOT a persistent
// animated chevron). It appears only AFTER its section has settled in view (IntersectionObserver
// + a short delay), and fades out the moment you scroll on. Place at a section's bottom-center.
export function ScrollCue({ label = "гортайте" }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // settle delay — the cue arrives a beat after the section stabilizes, not during the scroll-in
          t = window.setTimeout(() => setShow(true), 650);
        } else {
          if (t) window.clearTimeout(t);
          setShow(false);
        }
      },
      { threshold: 1, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (t) window.clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none flex flex-col items-center gap-2.5 transition-opacity duration-[900ms] ease-out ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-warm)]/70">{label}</span>
      <span className="relative block h-11 w-px overflow-hidden bg-[var(--color-warm)]/20">
        <span className="scroll-cue-dot absolute left-1/2 top-0 block h-2.5 w-px -translate-x-1/2 bg-[var(--color-warm)]" />
      </span>
    </div>
  );
}
