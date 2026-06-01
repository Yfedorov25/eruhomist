"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  HeroSection — scroll-controlled cinematic hero (exterior → interior).

  Pipeline:
    Kling 6s video -> FFmpeg -> webp frame sequence -> <canvas> -> GSAP ScrollTrigger scrub.

  Frames live in /public/hero/desktop/frame_0001.webp ... frame_0145.webp
  and          /public/hero/mobile/frame_0001.webp  ... frame_0145.webp

  The component:
   - picks desktop or mobile frame set by viewport width
   - preloads all frames with a progress indicator
   - pins the canvas while the user scrolls through SCRUB_VH of scroll distance
   - draws the frame matching scroll progress, with lerp smoothing for a buttery feel
   - fades the intro overlay out near the start and the outro title in near the end
*/

const FRAME_COUNT = 145; // ALL frames on disk (frame_0001..frame_0145) — full motion, full quality
const SCRUB_VH = 400; // hero occupies 400vh of scroll (4 screens)
const MOBILE_BREAKPOINT = 768;

// Streaming decoder window: keep only a sliding window of decoded bitmaps in RAM
// instead of all 145 (~1.1GB). ~120MB total. Decode ahead in the scroll direction.
const WINDOW_BACK = 8; // frames to keep behind the current frame
const WINDOW_AHEAD = 16; // frames to decode ahead (scroll usually goes forward)
const INITIAL_PRELOAD = 20; // decode this many up front before revealing the hero
const MAX_CONCURRENT_DECODES = 6; // avoid flooding the decoder

function framePath(set, frameIndex) {
  const n = String(frameIndex + 1).padStart(4, "0");
  return `/hero/${set}/frame_${n}.webp`;
}

export default function HeroSection() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const introRef = useRef(null);
  const outroRef = useRef(null);

  const stateRef = useRef({ target: 0, current: 0, raf: 0 });

  const [progress, setProgress] = useState(0); // initial preload progress 0..1
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const set =
      window.innerWidth <= MOBILE_BREAKPOINT ? "mobile" : "desktop";
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const supportsBitmap = typeof createImageBitmap === "function";

    let mounted = true;
    let lastDrawn = -1;

    // Sliding-window decoded-frame cache: index -> ImageBitmap (or HTMLImageElement fallback).
    const bitmaps = new Map();
    const decoding = new Set(); // indices currently being decoded
    let inFlight = 0;
    const queue = []; // pending indices to decode, nearest-first

    function freeFrame(b) {
      if (b && typeof b.close === "function") b.close(); // release decoded memory now
    }

    // ---- canvas sizing (retina-aware, cover-fit) ----
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // high-quality scaling — frames upscale ~1.25x on retina; default smoothing is soft
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      lastDrawn = -1; // force redraw after resize resets the context
      drawFrame(stateRef.current.current);
    }

    function frameDims(img) {
      return {
        w: img.naturalWidth || img.width,
        h: img.naturalHeight || img.height,
      };
    }

    function paint(img) {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const { w: iw, h: ih } = frameDims(img);
      if (!iw || !ih) return;
      const ir = iw / ih;
      const cr = cw / ch;
      let w, h, x, y;
      if (ir > cr) {
        h = ch;
        w = ch * ir;
        x = (cw - w) / 2;
        y = 0;
      } else {
        w = cw;
        h = cw / ir;
        x = 0;
        y = (ch - h) / 2;
      }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, x, y, w, h);
    }

    // Draw the requested frame, or the NEAREST already-decoded one (never blocks on decode).
    function drawFrame(idx) {
      const want = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(idx)));
      let pick = -1;
      if (bitmaps.has(want)) pick = want;
      else {
        // search outward for the closest decoded frame so the canvas never goes blank
        for (let d = 1; d < FRAME_COUNT; d++) {
          if (bitmaps.has(want - d)) { pick = want - d; break; }
          if (bitmaps.has(want + d)) { pick = want + d; break; }
        }
      }
      if (pick === -1 || pick === lastDrawn) return;
      lastDrawn = pick;
      paint(bitmaps.get(pick));
    }

    // ---- decode scheduler: keep a window around `current`, decode ahead, evict the rest ----
    function pumpQueue() {
      while (inFlight < MAX_CONCURRENT_DECODES && queue.length) {
        const i = queue.shift();
        if (bitmaps.has(i) || decoding.has(i)) continue;
        decoding.add(i);
        inFlight++;
        decodeFrame(i).finally(() => {
          inFlight--;
          decoding.delete(i);
          if (mounted) pumpQueue();
        });
      }
    }

    async function decodeFrame(i) {
      try {
        const res = await fetch(framePath(set, i));
        const blob = await res.blob();
        let bmp;
        if (supportsBitmap) bmp = await createImageBitmap(blob);
        else {
          bmp = await new Promise((resolve, reject) => {
            const im = new Image();
            im.onload = () => resolve(im);
            im.onerror = reject;
            im.src = URL.createObjectURL(blob);
          });
        }
        if (!mounted) { freeFrame(bmp); return; }
        bitmaps.set(i, bmp);
        // if this is the frame we currently want, paint immediately
        if (Math.round(stateRef.current.current) === i) { lastDrawn = -1; drawFrame(i); }
      } catch (e) {
        /* swallow — drawFrame falls back to nearest decoded frame */
      }
    }

    // Recompute which frames should be resident; queue missing ones, evict far ones.
    function updateWindow() {
      const cur = Math.round(stateRef.current.current);
      const lo = Math.max(0, cur - WINDOW_BACK);
      const hi = Math.min(FRAME_COUNT - 1, cur + WINDOW_AHEAD);

      // evict frames outside the window
      for (const i of bitmaps.keys()) {
        if (i < lo || i > hi) { freeFrame(bitmaps.get(i)); bitmaps.delete(i); }
      }
      // queue missing frames, nearest-to-current first (ahead prioritised)
      const wanted = [];
      for (let i = cur; i <= hi; i++) wanted.push(i);
      for (let i = cur - 1; i >= lo; i--) wanted.push(i);
      queue.length = 0;
      for (const i of wanted) {
        if (!bitmaps.has(i) && !decoding.has(i)) queue.push(i);
      }
      pumpQueue();
    }

    // ---- lerp render loop (frame chases scroll target) ----
    let windowTick = 0;
    function tick() {
      const s = stateRef.current;
      s.current += (s.target - s.current) * 0.12;
      if (Math.abs(s.target - s.current) < 0.01) s.current = s.target;
      drawFrame(s.current);
      // refresh the decode window a few times per second, not every frame
      if (++windowTick % 6 === 0) updateWindow();
      s.raf = requestAnimationFrame(tick);
    }

    // ---- initial preload: decode the first INITIAL_PRELOAD frames, then reveal ----
    let decodedInitial = 0;
    async function preloadInitial() {
      const first = [];
      for (let i = 0; i < Math.min(INITIAL_PRELOAD, FRAME_COUNT); i++) first.push(i);
      let active = 0, ptr = 0;
      await new Promise((resolve) => {
        const next = () => {
          if (decodedInitial >= first.length) return resolve();
          while (active < MAX_CONCURRENT_DECODES && ptr < first.length) {
            const i = first[ptr++];
            active++;
            decodeFrame(i).finally(() => {
              active--;
              decodedInitial++;
              if (mounted) {
                setProgress(decodedInitial / first.length);
                if (i === 0) drawFrame(0);
              }
              if (decodedInitial >= first.length) resolve();
              else next();
            });
          }
        };
        next();
      });
      if (!mounted) return;
      setReady(true);
      resize();
      tick();
      buildScrollTrigger();
      updateWindow();
    }
    preloadInitial();

    // ---- GSAP ScrollTrigger: scrub frame index + overlay opacities ----
    let st;
    function buildScrollTrigger() {
      st = ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          stateRef.current.target = p * (FRAME_COUNT - 1);

          // intro overlay: visible 0..0.10, fades out by 0.18
          const introOpacity = gsap.utils.clamp(
            0,
            1,
            1 - (p - 0.1) / 0.08
          );
          if (introRef.current)
            introRef.current.style.opacity = String(introOpacity);

          // outro title: fades in 0.78..0.9
          const outroOpacity = gsap.utils.clamp(0, 1, (p - 0.78) / 0.12);
          if (outroRef.current)
            outroRef.current.style.opacity = String(outroOpacity);
        },
      });
      ScrollTrigger.refresh();
    }

    window.addEventListener("resize", resize);

    return () => {
      mounted = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(stateRef.current.raf);
      if (st) st.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      // release all decoded bitmaps
      for (const b of bitmaps.values()) freeFrame(b);
      bitmaps.clear();
    };
  }, []);

  return (
    <section ref={wrapRef} style={{ height: `${SCRUB_VH}vh`, position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          background: "#0a0c0f",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />

        {/* cinematic vignette */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 65% 50%, transparent 35%, rgba(0,0,0,0.45) 100%)",
          }}
        />

        {/* intro overlay */}
        <div
          ref={introRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 8vw",
            pointerEvents: "none",
            color: "#fff",
          }}
        >
          <p
            style={{
              fontSize: 13,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
              marginBottom: 24,
            }}
          >
            Вінниця · нерухомість · девелопмент
          </p>
          <h1
            style={{
              fontSize: "clamp(48px, 7vw, 104px)",
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
            }}
          >
            Дім, який <b style={{ fontWeight: 600, color: "#e8a35c" }}>працює</b>
            <br />
            на вас
          </h1>
          <p
            style={{
              marginTop: 28,
              fontSize: "clamp(15px, 1.4vw, 19px)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.75)",
              maxWidth: 440,
              lineHeight: 1.6,
            }}
          >
            Підбираємо нерухомість під ваш стиль життя — для життя, інвестицій та
            доходу.
          </p>
          <a
            href="#contact"
            style={{
              marginTop: 40,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 32px",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: 2,
              fontSize: 14,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#fff",
              width: "fit-content",
              pointerEvents: "auto",
              textDecoration: "none",
            }}
          >
            Підібрати об'єкт →
          </a>
        </div>

        {/* outro title */}
        <div
          ref={outroRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 8vw",
            pointerEvents: "none",
            color: "#fff",
            opacity: 0,
          }}
        >
          <h2
            style={{
              fontSize: "clamp(32px, 4.5vw, 64px)",
              fontWeight: 300,
              lineHeight: 1.05,
              maxWidth: 520,
            }}
          >
            Заходьте.
            <br />
            Тут починається{" "}
            <span style={{ color: "#e8a35c" }}>ваша історія</span>.
          </h2>
        </div>

        {/* preloader */}
        {!ready && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              background: "#0a0c0f",
              color: "rgba(255,255,255,0.6)",
              fontSize: 12,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            завантаження
            <div
              style={{
                width: 180,
                height: 1,
                background: "rgba(255,255,255,0.15)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${Math.round(progress * 100)}%`,
                  background: "#e8a35c",
                  transition: "width 0.2s ease",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
