"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { richText } from "@/lib/format";
import type { Messages } from "@/lib/i18n";
import { canRunWebglHero, useIsMobile } from "@/lib/motion";
import { HERO_POSTER } from "@/lib/hero-frames";

gsap.registerPlugin(SplitText);

// Three.js only ships when the WebGL tier is actually used (not on fallback paths).
const HeroCanvas = dynamic(() => import("../hero/HeroCanvas").then((m) => m.HeroCanvas), {
  ssr: false,
});

// S1 — Hero. Tier decided ONCE at mount from static signals (no mid-session FPS remount):
//   WebGL (desktop, GL available, enough memory, motion ok) -> scroll-scrubbed canvas
//   otherwise -> static day poster (frame 0001) as the LCP element.
// The poster is always the LCP element (renders immediately); the canvas cross-fades in.
export function Hero({ m }: { m: Messages }) {
  const mobile = useIsMobile();
  const [useWebgl, setUseWebgl] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const decidedRef = useRef(false);

  useEffect(() => {
    if (decidedRef.current) return;
    decidedRef.current = true;
    setUseWebgl(canRunWebglHero());
  }, []);

  // H1 reveal: luxury tempo (1.5–2s), split by lines. reduced-motion -> no split, just show.
  const h1Ref = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    const el = h1Ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = new SplitText(el, { type: "lines", linesClass: "overflow-hidden" });
      gsap.from(split.lines, {
        yPercent: 110,
        opacity: 0,
        duration: 1.8,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.2,
      });
    }, el);
    return () => {
      split?.revert(); // eng review: useGSAP/context does NOT auto-revert SplitText
      ctx.revert();
    };
  }, []);

  const posterSrc = mobile ? HERO_POSTER.mobile : HERO_POSTER.desktop;

  return (
    <section id="hero" className="relative flex min-h-screen items-end overflow-hidden">
      {/* Poster = LCP element, always present underneath. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc}
        alt={m.a11y.heroVideoAlt}
        className="absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-1000"
        style={{ opacity: useWebgl && canvasReady ? 0 : 1 }}
        fetchPriority="high"
      />

      {useWebgl && (
        <div className="absolute inset-0 -z-10">
          <HeroCanvas
            set={mobile ? "mobile" : "desktop"}
            pinTarget="#hero"
            onReady={() => setCanvasReady(true)}
          />
        </div>
      )}

      {/* Readability scrim: bottom-anchored gradient guaranteeing contrast for the
          bottom-left text block regardless of how bright the hero frame is. Stronger
          on the tall mobile crop where the poster is sky-heavy behind the text. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-[5] h-[78%]"
        style={{
          background:
            "linear-gradient(to top, rgba(6,8,14,0.9) 0%, rgba(6,8,14,0.62) 42%, rgba(6,8,14,0) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 w-full px-6 pb-24 md:px-12 md:pb-32">
        <h1
          ref={h1Ref}
          className="font-display max-w-4xl text-4xl leading-[1.05] md:text-7xl"
          style={{ color: "var(--fg-night, #f0eeea)" }}
        >
          {richText(m.hero.h1)}
        </h1>
        <p
          className="mt-6 max-w-2xl text-lg md:text-2xl"
          style={{ color: "rgba(240,238,234,.85)", textShadow: "0 1px 16px rgba(0,0,0,0.45)" }}
        >
          {richText(m.hero.sub)}
        </p>
        <p
          className="mt-12 text-xs uppercase tracking-[0.3em]"
          style={{ color: "rgba(240,238,234,.6)" }}
        >
          {m.hero.scrollHint}
        </p>
      </div>
    </section>
  );
}
