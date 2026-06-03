"use client";

import { useEffect, useState } from "react";

// SSR-safe prefers-reduced-motion hook. Returns false on the server and first client paint,
// then updates after mount (and live, if the OS setting changes). Sections gate their
// scrub/stagger on this and render a static state when true.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
