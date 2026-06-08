"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { richText } from "@/lib/format";
import type { Messages } from "@/lib/i18n";
import { HERO_FRAME_COUNT, heroFramePath } from "@/lib/hero-frames";
import "@/lib/gsapEase"; // "air" signature ease for the H1 reveal

gsap.registerPlugin(ScrollTrigger, SplitText);

// S1 — Hero. Scroll-scrubbed day→night frame sequence on a 2D <canvas> (proven
// decoder pattern from apps/eruhomist). Works on desktop AND mobile — the cinematic
// reaches the mobile majority. Sliding-window decode keeps RAM bounded and the canvas
// never goes blank (draws nearest decoded frame). Grain + vignette are a CSS overlay.
// reduced-motion: static day frame, no scrub.

const SCRUB_VH = 180; // hero occupies 180vh (was 400 then 250 — user wants less scroll to reach
// full day→night). ~1.8 screens to traverse; crossfade keeps it smooth despite fewer px/frame.
const MOBILE_BREAKPOINT = 768;
// Memory/GPU budget tuned for low-RAM machines (the user's M2 has 8GB, ~1.5GB free): each
// decoded 1920×1080 frame is ~8MB live in RAM/GPU, so the window size directly sets the
// hero's memory footprint. 14 ahead + 6 back = ~160MB peak (was 24+8 ≈ 256MB → memory
// pressure on 8GB → texture eviction → the day→night scrub lag). The manual rAF lerp is gone
// now, so a smaller ahead-window no longer risks the old "frame can't keep up" stutter.
const WINDOW_BACK = 6;
const WINDOW_AHEAD = 14;
const INITIAL_PRELOAD = 16;
const MAX_CONCURRENT = 6;

type Decoded = ImageBitmap | HTMLImageElement;

export function Hero({ m }: { m: Messages }) {
  const wrapRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const h1Ref = useRef<HTMLHeadingElement | null>(null);
  const stateRef = useRef({ target: 0, current: 0, raf: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const set: "desktop" | "mobile" =
      window.innerWidth <= MOBILE_BREAKPOINT ? "mobile" : "desktop";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsBitmap = typeof createImageBitmap === "function";

    let mounted = true;
    let lastBlend = ""; // last drawn frame-pair+blend key (skip redundant repaints)
    const bitmaps = new Map<number, Decoded>();
    const decoding = new Set<number>();
    let inFlight = 0;
    const queue: number[] = [];

    const free = (b?: Decoded) => {
      if (b && "close" in b && typeof b.close === "function") b.close();
    };

    // The measured root cause of the scroll lag (Chrome trace on the user's M2 8GB: a single
    // ~49ms compositor `Commit` = 98% of the scroll window) was the full-viewport canvas TEXTURE
    // being re-uploaded to the GPU every scroll frame. Shrink that texture: draw into a backing
    // store capped at 1280px on the long edge and let CSS stretch it to fill (className h-full
    // w-full). 1280×720 ≈ 0.9MP vs a 1440×900 viewport ≈ 1.3MP (and ~5.2MP at the old DPR 1.5) →
    // ~6× smaller GPU upload per frame → commit drops from ~49ms to single-digit ms. Invisible on
    // a moving scrub. paint() must measure against the BACKING-STORE size, not the viewport.
    const MAX_CANVAS_EDGE = 1280;
    function resize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(1, MAX_CANVAS_EDGE / Math.max(vw, vh));
      canvas!.width = Math.round(vw * scale);
      canvas!.height = Math.round(vh * scale);
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.imageSmoothingEnabled = true;
      // "medium": "low" made the downscaled frames look harsh/clicky between steps; medium is
      // visibly smoother on the day→night blend at negligible extra cost on the small canvas.
      ctx!.imageSmoothingQuality = "medium";
      lastBlend = "";
      drawFrame(stateRef.current.current);
    }

    function paint(img: Decoded, alpha = 1, clear = true) {
      const cw = canvas!.width; // cover-fit against the backing store, not the viewport
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

    // Find the nearest decoded frame to `i` (so we never draw blank).
    function nearestDecoded(i: number): number {
      if (bitmaps.has(i)) return i;
      for (let d = 1; d < HERO_FRAME_COUNT; d++) {
        if (bitmaps.has(i - d)) return i - d;
        if (bitmaps.has(i + d)) return i + d;
      }
      return -1;
    }

    // CROSSFADE the two frames bracketing the fractional scrub position. 96 discrete photos
    // drawn one-at-a-time "click" frame-to-frame (the choppy "обривки"); blending the lower
    // frame (full) with the upper frame (alpha = fractional part) makes the day→night flow
    // CONTINUOUSLY between frames — smooth without adding a second easing integrator.
    function drawFrame(idx: number) {
      const clamped = Math.max(0, Math.min(HERO_FRAME_COUNT - 1, idx));
      const lo = Math.floor(clamped);
      const hi = Math.min(HERO_FRAME_COUNT - 1, lo + 1);
      const frac = clamped - lo;
      const pLo = nearestDecoded(lo);
      const pHi = nearestDecoded(hi);
      if (pLo === -1 && pHi === -1) return;
      // skip redundant repaints (same pair + ~same blend) — keeps idle cheap
      const key = `${pLo}:${pHi}:${frac.toFixed(2)}`;
      if (key === lastBlend) return;
      lastBlend = key;
      if (pLo === -1) { paint(bitmaps.get(pHi)!); return; }
      paint(bitmaps.get(pLo)!, 1, true); // base frame, clears canvas
      if (pHi !== -1 && pHi !== pLo && frac > 0.01) {
        paint(bitmaps.get(pHi)!, frac, false); // blend the next frame on top by fraction
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
        const res = await fetch(heroFramePath(set, i + 1)); // files are 1-based
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
        // if a just-decoded frame is one of the two bracketing the current scrub position,
        // force a repaint so the crossfade picks it up (instead of a nearest-decoded stand-in).
        if (Math.abs(stateRef.current.current - i) <= 1) { lastBlend = ""; drawFrame(stateRef.current.current); }
      } catch {
        /* nearest-frame fallback covers it */
      }
    }

    function updateWindow() {
      const cur = Math.round(stateRef.current.current);
      const lo = Math.max(0, cur - WINDOW_BACK);
      const hi = Math.min(HERO_FRAME_COUNT - 1, cur + WINDOW_AHEAD);
      for (const i of bitmaps.keys()) {
        if (i < lo || i > hi) { free(bitmaps.get(i)); bitmaps.delete(i); }
      }
      queue.length = 0;
      for (let i = cur; i <= hi; i++) if (!bitmaps.has(i) && !decoding.has(i)) queue.push(i);
      for (let i = cur - 1; i >= lo; i--) if (!bitmaps.has(i) && !decoding.has(i)) queue.push(i);
      pump();
    }

    let windowTick = 0;
    let aberration = 0;
    let lastTarget = -1;
    function tick() {
      const s = stateRef.current;
      // "moving" = the scrubbed target changed since we last drew (ScrollTrigger scrub:0.6
      // keeps easing s.target for ~0.6s after the wheel stops, so this stays true through the
      // settle, then goes quiet).
      const moving = Math.abs(s.target - lastTarget) >= 0.01;
      // Idle fast-path: target settled AND aberration decayed → do nothing but keep the rAF
      // alive. Previously the loop redrew + wrote a CSS var every frame forever, even far below
      // the hero, forcing a page-wide style recalc 60×/s that competed with content scroll.
      if (!moving && aberration <= 0.001) {
        s.raf = requestAnimationFrame(tick);
        return;
      }
      lastTarget = s.target;
      // NO manual lerp. The council's #1 finding: a rAF lerp here was a SECOND easing
      // integrator stacked on top of ScrollTrigger's scrub (and Lenis) — three low-pass
      // filters with different time-constants fighting = the scroll stutter, and the lag
      // also made the hero feel "slow". ScrollTrigger `scrub: 0.6` is now the single
      // smoother; we just mirror its already-eased value, so decode/draw stay in sync.
      s.current = s.target;
      drawFrame(s.current);
      if (++windowTick % 6 === 0) updateWindow();
      // decay the chromatic-aberration var toward 0 when scrolling settles
      if (aberration > 0.001) {
        aberration *= 0.9;
        wrap!.style.setProperty("--hero-aberration", aberration.toFixed(3));
      }
      s.raf = requestAnimationFrame(tick);
    }

    let st: ScrollTrigger | null = null;
    function buildScrollTrigger() {
      st = ScrollTrigger.create({
        trigger: wrap!,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6, // single smoothing authority (was true=instant; the easing was the manual
        // rAF lerp we just deleted). 0.6 = buttery follow without the double-smoothed lag.
        onUpdate: (self) => {
          stateRef.current.target = self.progress * (HERO_FRAME_COUNT - 1);
          // Film-grade CSS drivers (R-CSS, no WebGL): --hero-night ramps the warm
          // window-glow in as we reach evening; --hero-aberration spikes the chromatic
          // edge-split with scroll velocity, then decays in the rAF loop.
          const el = wrap!;
          el.style.setProperty("--hero-night", self.progress.toFixed(3));
          const v = Math.min(1, Math.abs(self.getVelocity()) / 2500);
          aberration = v; // seed the decay var the tick loop reads (and writes the CSS var)
          el.style.setProperty("--hero-aberration", v.toFixed(3));
        },
      });
      ScrollTrigger.refresh();
    }

    async function preloadInitial() {
      const first = Array.from({ length: Math.min(INITIAL_PRELOAD, HERO_FRAME_COUNT) }, (_, i) => i);
      let active = 0, ptr = 0, done = 0;
      await new Promise<void>((resolve) => {
        const next = () => {
          if (done >= first.length) return resolve();
          while (active < MAX_CONCURRENT && ptr < first.length) {
            const i = first[ptr++];
            active++;
            decodeFrame(i).finally(() => {
              active--; done++;
              if (mounted && i === 0) drawFrame(0);
              if (done >= first.length) resolve();
              else next();
            });
          }
        };
        next();
      });
      if (!mounted) return;
      setReady(true);
      // signal the preloader (Phase 6) that the hero's first frames are painted (LCP moment)
      window.dispatchEvent(new Event("quadro:hero-ready"));
      resize();
      if (reduced) {
        drawFrame(0); // static day frame, no scrub/raf
      } else {
        tick();
        buildScrollTrigger();
        updateWindow();
      }
    }
    preloadInitial();

    window.addEventListener("resize", resize);
    return () => {
      mounted = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(stateRef.current.raf);
      st?.kill();
      for (const b of bitmaps.values()) free(b);
      bitmaps.clear();
    };
  }, []);

  // H1 reveal (luxury 1.8s, split by lines). reduced-motion -> shown as-is.
  useEffect(() => {
    const el = h1Ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      // Smooth FADE-rise (dissolve), not a yPercent:110 "slideshow" jump — the rejected pattern
      // from the sister site. Small y + opacity on the "air" ease = the unified motion language.
      split = new SplitText(el, { type: "lines" });
      gsap.from(split.lines, {
        y: 16, opacity: 0, duration: 1.4, ease: "air", stagger: 0.08, delay: 0.25,
      });
    }, el);
    return () => { split?.revert(); ctx.revert(); };
  }, []);

  return (
    <section
      ref={wrapRef}
      id="hero"
      style={{ height: `${SCRUB_VH}vh`, position: "relative" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0a0c0f]">
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

        {/* film-grade (R-CSS, no WebGL): grain + vignette + scroll-velocity chromatic
            aberration + warm window-glow that ramps in toward night. */}
        <div aria-hidden className="hero-grain pointer-events-none absolute inset-0 z-[1]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse at 60% 45%, transparent 38%, rgba(0,0,0,0.5) 100%)",
          }}
        />
        {/* warm window-glow — opacity tracks --hero-night so the building "lights up"
            as the page reaches evening. Sits over the building's window band. */}
        <div aria-hidden className="hero-window-glow pointer-events-none absolute inset-0 z-[1]" />
        {/* chromatic aberration — RGB edge fringes that intensify with scroll velocity. */}
        <div aria-hidden className="hero-aberration pointer-events-none absolute inset-0 z-[1]" />

        {/* text scrim for guaranteed legibility over the bright daytime frames */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[80%]"
          style={{
            background:
              "linear-gradient(to top, rgba(6,8,14,0.9) 0%, rgba(6,8,14,0.6) 42%, rgba(6,8,14,0) 100%)",
          }}
        />

        {/* hero copy — anchored bottom, never clipped (padding + max height guard) */}
        <div className="absolute inset-x-0 bottom-0 z-[3] px-6 pb-20 md:px-12 md:pb-28">
          <div className="mx-auto max-w-7xl">
            <h1
              ref={h1Ref}
              className="font-display max-w-4xl text-[clamp(2rem,6vw,4.5rem)] leading-[1.04]"
              style={{ color: "#f1efea", textShadow: "0 2px 28px rgba(0,0,0,0.5)" }}
            >
              {richText(m.hero.h1)}
            </h1>
            <p
              className="mt-5 max-w-2xl text-lg md:text-2xl"
              style={{ color: "rgba(241,239,234,0.88)", textShadow: "0 1px 16px rgba(0,0,0,0.5)" }}
            >
              {richText(m.hero.sub)}
            </p>
            <p
              className="mt-10 text-xs uppercase tracking-[0.3em]"
              style={{ color: "rgba(241,239,234,0.62)" }}
            >
              {m.hero.scrollHint}
            </p>
          </div>
        </div>

        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0c0f]">
            <span className="font-display text-2xl tracking-[0.4em] text-[rgba(241,239,234,0.7)]">
              QUADRO
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
