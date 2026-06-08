"use client";

import { useEffect } from "react";

// Decode-ahead (award pattern, lifted from "The Ever"): images within ~700px of the viewport are
// forced to load + decode BEFORE they scroll in, so reveal animations never stutter on a
// not-yet-painted image. One global IntersectionObserver, transform-free, near-zero cost.
// Renders nothing. Safe under reduced-motion (this is loading, not motion).
export function DecodeAhead() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const img = e.target as HTMLImageElement;
          io.unobserve(img);
          if (img.loading === "lazy") img.loading = "eager"; // nudge native lazy to fetch now
          img.decode?.().catch(() => {}); // pre-decode so paint is instant on reveal
        }
      },
      { rootMargin: "700px 0px 700px 0px" }, // prep a screen-height ahead in both directions
    );

    const scan = () => document.querySelectorAll<HTMLImageElement>("img").forEach((img) => io.observe(img));
    scan();
    // re-scan once fonts/layout settle (some imgs mount after hydration)
    const t = window.setTimeout(scan, 1200);

    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, []);

  return null;
}
