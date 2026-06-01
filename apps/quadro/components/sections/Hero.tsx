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

const SCRUB_VH = 400; // hero occupies 400vh of scroll
const MOBILE_BREAKPOINT = 768;
const WINDOW_BACK = 8;
const WINDOW_AHEAD = 16;
const INITIAL_PRELOAD = 20;
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
    let lastDrawn = -1;
    const bitmaps = new Map<number, Decoded>();
    const decoding = new Set<number>();
    let inFlight = 0;
    const queue: number[] = [];

    const free = (b?: Decoded) => {
      if (b && "close" in b && typeof b.close === "function") b.close();
    };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = "high";
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
    function tick() {
      const s = stateRef.current;
      s.current += (s.target - s.current) * 0.12;
      if (Math.abs(s.target - s.current) < 0.01) s.current = s.target;
      drawFrame(s.current);
      if (++windowTick % 6 === 0) updateWindow();
      s.raf = requestAnimationFrame(tick);
    }

    let st: ScrollTrigger | null = null;
    function buildScrollTrigger() {
      st = ScrollTrigger.create({
        trigger: wrap!,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          stateRef.current.target = self.progress * (HERO_FRAME_COUNT - 1);
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

        {/* cinematic grain + vignette (CSS overlay — replaces the GLSL shader). */}
        <div aria-hidden className="hero-grain pointer-events-none absolute inset-0 z-[1]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse at 60% 45%, transparent 38%, rgba(0,0,0,0.5) 100%)",
          }}
        />

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
