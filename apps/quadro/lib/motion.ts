"use client";

import { useEffect, useState } from "react";

export const MOBILE_BREAKPOINT = 768; // matches the sibling eruhomist hero

// prefers-reduced-motion — drives the static-frame fallbacks across every section.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

// Static, mount-time tier decision (NOT a mid-session FPS probe — the eng review
// flagged runtime canvas remounts as fragile). Mobile uses the lighter hero path.
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

// Coarse capability gate for the WebGL hero: desktop + WebGL available + not
// memory-starved + not reduced-motion. Decided once, before mounting the canvas.
export function canRunWebglHero(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches) return false;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === "number" && mem < 4) return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return !!gl;
  } catch {
    return false;
  }
}
