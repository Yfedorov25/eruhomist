"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { richText, paragraphs } from "@/lib/format";
import type { Messages } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

// S3 — Architecture (R11 sticky window-reveal). Pinned section: a "window" mask opens
// from a small rectangle to the full frame as you scroll, like a camera moving in
// through an opening — the second, deeper echo of the hero. Paired with a slow scale
// "push-in" for depth. reduced-motion -> full frame, no pin.
export function Architecture({ m }: { m: Messages }) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const maskRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const el = wrap.current;
    const mask = maskRef.current;
    const img = imgRef.current;
    if (!el || !mask || !img) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(mask, { clipPath: "inset(0% 0% 0% 0% round 0px)" });
      gsap.set(img, { scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=130%",
          pin: true,
          scrub: 1,
        },
      });
      tl.fromTo(
        mask,
        { clipPath: "inset(34% 40% 34% 40% round 10px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" },
      ).fromTo(img, { scale: 1.45 }, { scale: 1.06, ease: "none" }, "<"); // camera push-in
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="architecture" ref={wrap} className="relative h-screen w-full overflow-hidden">
      <div ref={maskRef} className="absolute inset-0">
        {/* eslint-disable @next/next/no-img-element */}
        <img
          ref={imgRef}
          src="/renders/render_06.jpg"
          alt="Архітектура QUADRO HOUSE"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* eslint-enable @next/next/no-img-element */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,8,14,0.78)] via-transparent to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-20 md:px-12 md:pb-28">
        <div className="mx-auto max-w-4xl">
          <h2
            className="font-display text-4xl leading-tight text-[#f0eeea] md:text-6xl"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
          >
            {richText(m.architecture.h2)}
          </h2>
          <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-[rgba(240,238,234,0.82)]">
            {paragraphs(m.architecture.body).map((p, i) => (
              <p key={i}>{richText(p)}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
