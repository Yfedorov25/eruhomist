"use client";

import { useEffect } from "react";

// Decode-ahead: images within ~700px of the viewport are forced to load + decode BEFORE they
// scroll in, so reveals never stutter on a not-yet-painted image. One global IntersectionObserver,
// near-zero cost. Renders nothing. (Agency-doctrine module, ported from nahirna.)
export function DecodeAhead() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const img = e.target as HTMLImageElement;
          io.unobserve(img);
          if (img.loading === "lazy") img.loading = "eager";
          img.decode?.().catch(() => {});
        }
      },
      { rootMargin: "700px 0px 700px 0px" },
    );
    const scan = () => document.querySelectorAll<HTMLImageElement>("img").forEach((img) => io.observe(img));
    scan();
    const t = window.setTimeout(scan, 1200);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, []);
  return null;
}
