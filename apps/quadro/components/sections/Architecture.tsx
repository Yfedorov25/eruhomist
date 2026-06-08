"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { richText, paragraphs } from "@/lib/format";
import type { Messages } from "@/lib/i18n";
import "@/lib/gsapEase"; // "air" signature ease for the H2 reveal

gsap.registerPlugin(ScrollTrigger, SplitText);

// S3 — Architecture (R11 sticky window-reveal). Pinned: a "window" mask opens from a
// small rectangle to the full frame as you scroll, camera pushing in. As the window
// opens, the DAY render cross-fades to the lit NIGHT building and a warm glow ramps up
// over the windows — literally "увечері світло вмикається зсередини" (the H2). The H2
// reveals in sync with the opening. reduced-motion -> full lit frame, no pin/anim.
export function Architecture({ m }: { m: Messages }) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const maskRef = useRef<HTMLDivElement | null>(null);
  const dayRef = useRef<HTMLImageElement | null>(null);
  const nightRef = useRef<HTMLImageElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const h2Ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = wrap.current;
    const mask = maskRef.current;
    const day = dayRef.current;
    const night = nightRef.current;
    const glow = glowRef.current;
    const h2 = h2Ref.current;
    if (!el || !mask || !day || !night || !glow || !h2) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(mask, { clipPath: "inset(0% 0% 0% 0% round 0px)" });
      gsap.set([day, night], { scale: 1 });
      gsap.set(night, { opacity: 1 });
      gsap.set(glow, { opacity: 0.5 });
      return;
    }

    const ctx = gsap.context(() => {
      let split: SplitText | null = null;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=160%",
          pin: true,
          // pinType:"transform" + anticipatePin avoid the pin-enter "jump" the user felt as
          // "фіксація на новий екран": under Lenis (which moves the page via transform), the
          // default position:fixed pin re-layouts and drifts from Lenis's scroll → a snap.
          // transform-pinning stays in Lenis's coordinate space; anticipatePin pre-applies it.
          pinType: "transform",
          anticipatePin: 1,
          scrub: 1,
          onLeaveBack: () => h2 && gsap.set(h2, { clearProps: "" }),
        },
      });

      // window opens + camera push-in
      tl.fromTo(
        mask,
        { clipPath: "inset(36% 41% 36% 41% round 12px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" },
        0,
      )
        .fromTo([day, night], { scale: 1.5 }, { scale: 1.06, ease: "none" }, 0)
        // day -> night as the window opens: the building lights up from inside
        .fromTo(night, { opacity: 0 }, { opacity: 1, ease: "none" }, 0.15)
        // warm window-glow ramps in slightly AFTER the night fade, so the lights read
        // as "turning on" (an event), not a co-timed dissolve
        .fromTo(glow, { opacity: 0 }, { opacity: 0.6, ease: "power1.in" }, 0.45);

      // H2 reveal synced to the window opening — smooth FADE-rise (small y + opacity on "air"),
      // NOT a yPercent:110 jump (the rejected "slideshow" pattern). Matches the site-wide language.
      split = new SplitText(h2, { type: "lines" });
      tl.from(
        split.lines,
        { y: 16, opacity: 0, duration: 0.5, ease: "air", stagger: 0.1 },
        0.25,
      );

      return () => split?.revert();
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="architecture"
      ref={wrap}
      className="relative h-screen w-full overflow-hidden bg-[#06080e]"
    >
      <div ref={maskRef} className="absolute inset-0">
        {/* eslint-disable @next/next/no-img-element */}
        <img
          ref={dayRef}
          src="/renders/render_05.jpg"
          alt="Архітектура QUADRO HOUSE удень"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "center 38%" }}
        />
        <img
          ref={nightRef}
          src="/renders/render_N_02.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-0"
          style={{ objectPosition: "center 38%" }}
        />
        {/* eslint-enable @next/next/no-img-element */}
        {/* warm window-glow over the night building's window bands (mirrors the hero glow) */}
        {/* No mix-blend-mode: screen-blend forces the GPU to read back + re-blend the full
            image stack EVERY scroll frame (a top scroll-stutter source). Over the dark night
            render a plain warm radial-gradient at opacity reads ~identical; will-change:opacity
            promotes it to its own layer so the backdrop isn't re-composited per frame. */}
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(38% 14% at 38% 44%, rgba(238,180,120,0.6) 0%, transparent 70%)," +
              "radial-gradient(38% 14% at 64% 44%, rgba(238,180,120,0.55) 0%, transparent 70%)," +
              "radial-gradient(48% 11% at 50% 60%, rgba(238,180,120,0.38) 0%, transparent 75%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,8,14,0.8)] via-transparent to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-20 md:px-12 md:pb-28">
        <div className="mx-auto max-w-4xl">
          <h2
            ref={h2Ref}
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
