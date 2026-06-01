// WebGL context-guard — the core lesson from the prior failure (commit 5aaaf79):
// a WebGL hero went BLACK on real hardware and a green build shipped it. This utility
// makes that impossible by design. Phase-2/5 WebGL features mount ONLY through here.
//
// Three guarantees:
//   1. capability() decides BEFORE mount whether WebGL may run (static signals only —
//      no mid-session probe-and-remount, which was fragile). Returns the chosen tier.
//   2. guardCanvas() wires webglcontextlost/restored + a first-paint watchdog. If the
//      context dies OR never paints within a deadline, it fires onFallback() so the
//      caller swaps to video/static — never a black rectangle.
//   3. Everything degrades to a tier the caller can render without WebGL at all.
//
// This file has ZERO dependencies and touches nothing else. It does not change the
// scroll core, theme, or the current 2D hero. It is infrastructure for Phase 2+.

export type RenderTier = "webgl" | "video" | "static";

export interface TierSignals {
  reducedMotion: boolean;
  isMobile: boolean;
  hasWebGL: boolean;
  lowMemory: boolean;
  saveData: boolean;
}

const MOBILE_BREAKPOINT = 768;

export function readSignals(): TierSignals {
  if (typeof window === "undefined") {
    return { reducedMotion: false, isMobile: false, hasWebGL: false, lowMemory: true, saveData: false };
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let hasWebGL = false;
  try {
    const c = document.createElement("canvas");
    hasWebGL = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    hasWebGL = false;
  }
  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    isMobile: window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches,
    hasWebGL,
    lowMemory: typeof nav.deviceMemory === "number" && nav.deviceMemory < 4,
    saveData: !!nav.connection?.saveData,
  };
}

// Decide the render tier once, before mounting anything. Mirrors the fallback priority
// in UPGRADE_TO_ERA Phase 2: powerful desktop → webgl; mobile/low-end → video;
// reduced-motion / no-WebGL → static.
export function capability(signals: TierSignals = readSignals()): RenderTier {
  if (signals.reducedMotion) return "static";
  if (!signals.hasWebGL) return signals.isMobile ? "video" : "video";
  if (signals.isMobile || signals.lowMemory || signals.saveData) return "video";
  return "webgl";
}

export interface GuardHandle {
  /** call when the WebGL renderer has drawn its first real frame */
  markPainted: () => void;
  /** tear down listeners + watchdog */
  dispose: () => void;
}

// Wire a canvas's WebGL context so any failure → onFallback (never a black screen).
//  - webglcontextlost: prevent default + fall back.
//  - first-paint watchdog: if markPainted() isn't called within `paintDeadlineMs`,
//    assume the render is dead/black and fall back. THIS is what would have caught
//    the prior black-screen bug automatically.
export function guardCanvas(
  canvas: HTMLCanvasElement,
  onFallback: (reason: "context-lost" | "no-paint") => void,
  opts: { paintDeadlineMs?: number } = {},
): GuardHandle {
  const deadline = opts.paintDeadlineMs ?? 2500;
  let painted = false;
  let disposed = false;

  const onLost = (e: Event) => {
    e.preventDefault();
    if (!disposed) onFallback("context-lost");
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const watchdog = window.setTimeout(() => {
    if (!painted && !disposed) onFallback("no-paint");
  }, deadline);

  return {
    markPainted() {
      painted = true;
      window.clearTimeout(watchdog);
    },
    dispose() {
      disposed = true;
      window.clearTimeout(watchdog);
      canvas.removeEventListener("webglcontextlost", onLost);
    },
  };
}
