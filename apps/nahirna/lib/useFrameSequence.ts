"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

// Frame-sequence decoder for the tour overlay (section 05). Adapted from the production
// hero decoder in apps/quadro — every council concern is solved here by prior experience:
//   • sliding window (current −BACK .. +AHEAD) with .close() eviction → bounded RAM (~160MB)
//   • nearestDecoded() → the canvas NEVER goes blank/black on a decode miss (held frame)
//   • crossfade the two bracketing frames → continuous motion, not "clicky" frame-stepping
//   • backing store capped at 1280px → ~6× smaller GPU upload per scroll frame (no commit lag)
//   • the frame index is read DIRECTLY from the overlay scroller's scrollTop in the rAF loop,
//     then low-pass smoothed once (NOT ScrollTrigger — a custom non-window scroller fought it).
//     One smoothing integrator = no double-eased lag, and it Just Works in a fixed overlay.
//   • idle fast-path — stops redrawing when the scrub settles
//   • frees all bitmaps on close (no leak)

type Decoded = ImageBitmap | HTMLImageElement;

const WINDOW_BACK = 6;
const WINDOW_AHEAD = 16;
const INITIAL_PRELOAD = 20; // eager (CLAUDE.md: ~20 frames), rest progressive
const MAX_CONCURRENT = 6;
const MAX_CANVAS_EDGE = 1280;
const MOBILE_BREAKPOINT = 768;

export function useFrameSequence(opts: {
  active: boolean; // overlay open?
  canvasRef: RefObject<HTMLCanvasElement | null>;
  scrollerRef: RefObject<HTMLElement | null>; // the overlay's own scroll container
  frameCount: number;
  framePath: (set: "desktop" | "mobile", i1based: number) => string;
  onProgress?: (p: number) => void; // 0..1, for caption/progress UI
}) {
  const { active, canvasRef, scrollerRef, frameCount, framePath, onProgress } = opts;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false); // total decode failure → static fallback
  const stateRef = useRef({ target: 0, current: 0, raf: 0 });

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const scroller = scrollerRef.current;
    if (!canvas || !scroller) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const set: "desktop" | "mobile" = window.innerWidth <= MOBILE_BREAKPOINT ? "mobile" : "desktop";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsBitmap = typeof createImageBitmap === "function";

    let mounted = true;
    let lastBlend = "";
    let decodedAny = false;
    const bitmaps = new Map<number, Decoded>();
    const decoding = new Set<number>();
    let inFlight = 0;
    const queue: number[] = [];

    const free = (b?: Decoded) => {
      if (b && "close" in b && typeof b.close === "function") b.close();
    };

    function resize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(1, MAX_CANVAS_EDGE / Math.max(vw, vh));
      canvas!.width = Math.round(vw * scale);
      canvas!.height = Math.round(vh * scale);
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = "medium";
      lastBlend = "";
      drawFrame(stateRef.current.current);
    }

    function paint(img: Decoded, alpha = 1, clear = true) {
      const cw = canvas!.width;
      const ch = canvas!.height;
      const iw = (img as HTMLImageElement).naturalWidth || (img as ImageBitmap).width;
      const ih = (img as HTMLImageElement).naturalHeight || (img as ImageBitmap).height;
      if (!iw || !ih) return;
      const ir = iw / ih;
      const cr = cw / ch;
      let w: number, h: number, x: number, y: number;
      if (ir > cr) {
        h = ch; w = ch * ir; x = (cw - w) / 2; y = 0;
      } else {
        w = cw; h = cw / ir; x = 0; y = (ch - h) / 2;
      }
      if (clear) ctx!.clearRect(0, 0, cw, ch);
      ctx!.globalAlpha = alpha;
      ctx!.drawImage(img, x, y, w, h);
      ctx!.globalAlpha = 1;
    }

    function nearestDecoded(i: number): number {
      if (bitmaps.has(i)) return i;
      for (let d = 1; d < frameCount; d++) {
        if (bitmaps.has(i - d)) return i - d;
        if (bitmaps.has(i + d)) return i + d;
      }
      return -1;
    }

    function drawFrame(idx: number) {
      const clamped = Math.max(0, Math.min(frameCount - 1, idx));
      const lo = Math.floor(clamped);
      const hi = Math.min(frameCount - 1, lo + 1);
      const frac = clamped - lo;
      const pLo = nearestDecoded(lo);
      const pHi = nearestDecoded(hi);
      if (pLo === -1 && pHi === -1) return;
      const key = `${pLo}:${pHi}:${frac.toFixed(2)}`;
      if (key === lastBlend) return;
      lastBlend = key;
      if (pLo === -1) {
        paint(bitmaps.get(pHi)!);
        return;
      }
      paint(bitmaps.get(pLo)!, 1, true);
      if (pHi !== -1 && pHi !== pLo && frac > 0.01) {
        paint(bitmaps.get(pHi)!, frac, false);
      }
    }

    function pump() {
      while (inFlight < MAX_CONCURRENT && queue.length) {
        const i = queue.shift()!;
        if (bitmaps.has(i) || decoding.has(i)) continue;
        decoding.add(i);
        inFlight++;
        decodeFrame(i).finally(() => {
          inFlight--;
          decoding.delete(i);
          if (mounted) pump();
        });
      }
    }

    async function decodeFrame(i: number) {
      try {
        const res = await fetch(framePath(set, i + 1));
        const blob = await res.blob();
        let bmp: Decoded;
        if (supportsBitmap) bmp = await createImageBitmap(blob);
        else
          bmp = await new Promise<HTMLImageElement>((resolve, reject) => {
            const im = new Image();
            im.onload = () => resolve(im);
            im.onerror = reject;
            im.src = URL.createObjectURL(blob);
          });
        if (!mounted) return free(bmp);
        bitmaps.set(i, bmp);
        decodedAny = true;
        if (Math.abs(stateRef.current.current - i) <= 1) {
          lastBlend = "";
          drawFrame(stateRef.current.current);
        }
      } catch {
        /* nearest-frame fallback covers a single miss */
      }
    }

    function updateWindow() {
      const cur = Math.round(stateRef.current.current);
      const lo = Math.max(0, cur - WINDOW_BACK);
      const hi = Math.min(frameCount - 1, cur + WINDOW_AHEAD);
      for (const i of bitmaps.keys()) {
        if (i < lo || i > hi) {
          free(bitmaps.get(i));
          bitmaps.delete(i);
        }
      }
      queue.length = 0;
      for (let i = cur; i <= hi; i++) if (!bitmaps.has(i) && !decoding.has(i)) queue.push(i);
      for (let i = cur - 1; i >= lo; i--) if (!bitmaps.has(i) && !decoding.has(i)) queue.push(i);
      pump();
    }

    // Read scrub target straight from the overlay scroller (0..1 → frame index). One low-pass
    // smoother in the loop gives buttery follow without ScrollTrigger's custom-scroller fragility.
    function readTarget() {
      const max = scroller!.scrollHeight - scroller!.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scroller!.scrollTop / max)) : 0;
      stateRef.current.target = p * (frameCount - 1);
      return p;
    }

    let windowTick = 0;
    function tick() {
      const s = stateRef.current;
      const p = readTarget();
      onProgress?.(p);
      // Single low-pass smoother (lerp 0.18) → continuous scrub, no double-easing lag.
      const diff = s.target - s.current;
      if (Math.abs(diff) < 0.004) {
        // settled: idle fast-path, keep the rAF alive but skip redraw/window work
        s.raf = requestAnimationFrame(tick);
        return;
      }
      s.current += diff * 0.18;
      drawFrame(s.current);
      if (++windowTick % 6 === 0) updateWindow();
      s.raf = requestAnimationFrame(tick);
    }

    async function preloadInitial() {
      const first = Array.from({ length: Math.min(INITIAL_PRELOAD, frameCount) }, (_, i) => i);
      let activeCount = 0, ptr = 0, done = 0;
      await new Promise<void>((resolve) => {
        const next = () => {
          if (done >= first.length) return resolve();
          while (activeCount < MAX_CONCURRENT && ptr < first.length) {
            const i = first[ptr++];
            activeCount++;
            decodeFrame(i).finally(() => {
              activeCount--; done++;
              if (mounted && i === 0) drawFrame(0);
              if (done >= first.length) resolve();
              else next();
            });
          }
        };
        next();
      });
      if (!mounted) return;
      // Total-decode-failure guard (council blind spot): if nothing decoded, show static fallback.
      if (!decodedAny) {
        setFailed(true);
        return;
      }
      setReady(true);
      resize();
      if (reduced) {
        drawFrame(0); // static first frame, no scrub (reduced-motion fallback)
      } else {
        updateWindow();
        tick(); // rAF loop reads scrollTop directly — no ScrollTrigger needed
      }
    }
    preloadInitial();

    window.addEventListener("resize", resize);
    return () => {
      mounted = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(stateRef.current.raf);
      for (const b of bitmaps.values()) free(b);
      bitmaps.clear();
      setReady(false);
    };
  }, [active, canvasRef, scrollerRef, frameCount, framePath, onProgress]);

  return { ready, failed };
}
