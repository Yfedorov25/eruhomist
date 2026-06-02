"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { richText } from "@/lib/format";
import type { Messages } from "@/lib/i18n";
import { HERO_FRAME_COUNT, heroFramePath } from "@/lib/hero-frames";

gsap.registerPlugin(ScrollTrigger, SplitText);

// S1 — Hero. Scroll-scrubbed day→night frame sequence on a 2D <canvas> (proven
// decoder pattern from apps/eruhomist). Works on desktop AND mobile — the cinematic
// reaches the mobile majority. Sliding-window decode keeps RAM bounded and the canvas
// never goes blank (draws nearest decoded frame). Grain + vignette are a CSS overlay.
// reduced-motion: static day frame, no scrub.

const SCRUB_VH = 250; // hero occupies 250vh of scroll (was 400 — too slow: 96 frames over 4
// screens = ~24 frames/screen, so the building barely moved per screen. 250 = faster traverse.)
const MOBILE_BREAKPOINT = 768;
const WINDOW_BACK = 8;
const WINDOW_AHEAD = 24; // was 16 — keep ahead of the scrub on fast flicks so drawFrame never
const INITIAL_PRELOAD = 20; // falls back to a distant nearest-decoded frame (the "image stutter")
const MAX_CONCURRENT = 8; // was 6 — refill the window faster after a flick

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
    let lastDrawn = -1;
    const bitmaps = new Map<number, Decoded>();
    const decoding = new Set<number>();
    let inFlight = 0;
    const queue: number[] = [];

    const free = (b?: Decoded) => {
      if (b && "close" in b && typeof b.close === "function") b.close();
    };

    function resize() {
      // Cap DPR at 1.5: the source frames are 1920×1080, so a 2× backing store just upscales
      // (no detail gained) at ~1.8× the per-frame draw cost. 1.5 is sharp enough and much
      // cheaper to redraw every scroll frame.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // "low" smoothing: on a moving frame-scrub the quality difference is invisible, but
      // "high" resampling of a 1080p image into a DPR-scaled canvas every frame was the main
      // per-draw cost behind the scroll hitches. Cheap draw = smooth scrub.
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = "low";
      lastDrawn = -1;
      drawFrame(stateRef.current.current);
    }

    function paint(img: Decoded) {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
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
      ctx!.clearRect(0, 0, cw, ch);
      ctx!.drawImage(img, x, y, w, h);
    }

    // Draw requested frame, or nearest already-decoded one (never blank).
    function drawFrame(idx: number) {
      const want = Math.max(0, Math.min(HERO_FRAME_COUNT - 1, Math.round(idx)));
      let pick = -1;
      if (bitmaps.has(want)) pick = want;
      else {
        for (let d = 1; d < HERO_FRAME_COUNT; d++) {
          if (bitmaps.has(want - d)) { pick = want - d; break; }
          if (bitmaps.has(want + d)) { pick = want + d; break; }
        }
      }
      if (pick === -1 || pick === lastDrawn) return;
      lastDrawn = pick;
      paint(bitmaps.get(pick)!);
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
        if (Math.round(stateRef.current.current) === i) { lastDrawn = -1; drawFrame(i); }
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
      split = new SplitText(el, { type: "lines", linesClass: "overflow-hidden py-[0.08em]" });
      gsap.from(split.lines, {
        yPercent: 110, opacity: 0, duration: 1.8, ease: "power3.out", stagger: 0.12, delay: 0.25,
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
