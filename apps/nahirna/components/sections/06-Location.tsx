"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 06 · ЛОКАЦІЯ — «Здається, що за містом». REBUILT (council: stylized NOT satellite — legal+dim+
// privacy-breadcrumb+slop, zero lift). A dense stylized district plate (chocolate streets, the
// Південний Буг S-bend, a GOLD glowing "own shore" stretch) + scroll-driven gold overlay (pin on
// the DISTRICT not the exact yard — privacy-safe by construction; an illustration can't leak a
// yard). Map's job is INFORMATION: the one verified number (0 хв berg) + an honest line for the
// rest (no invented distances). Subtle pointer-parallax tilt on the plate for premium depth.
export default function Location() {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fine = window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;

      if (reduced) {
        gsap.set("[data-map-layer]", { opacity: 1, scale: 1, y: 0 });
        return;
      }

      // Overlay layers reveal in sequence as the map enters (luxury tempo, stagger).
      gsap.from("[data-map-layer]", {
        opacity: 0,
        y: 14,
        scale: 0.96,
        duration: 1.4,
        ease: "power3.out",
        stagger: 0.18,
        transformOrigin: "center",
        scrollTrigger: { trigger: stage.current, start: "top 72%", once: true },
      });

      // Pointer-parallax: tilt the plate a few degrees toward the cursor (desktop fine-pointer).
      if (fine && plate.current && stage.current) {
        const pl = plate.current;
        const st = stage.current;
        const rotX = gsap.quickTo(pl, "rotationX", { duration: 0.6, ease: "power2.out" });
        const rotY = gsap.quickTo(pl, "rotationY", { duration: 0.6, ease: "power2.out" });
        const onMove = (e: PointerEvent) => {
          const r = st.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          rotX(3 - dy * 2.5);
          rotY(dx * 3);
        };
        const onLeave = () => {
          rotX(3);
          rotY(0);
        };
        gsap.set(pl, { rotationX: 3 });
        st.addEventListener("pointermove", onMove);
        st.addEventListener("pointerleave", onLeave);
        return () => {
          st.removeEventListener("pointermove", onMove);
          st.removeEventListener("pointerleave", onLeave);
        };
      }
    },
    { scope: wrap },
  );

  return (
    <section ref={wrap} className="relative bg-night py-[14vh]" aria-label="Локація — вул. Нагірна, Вінниця">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-12 max-w-3xl">
          <p data-reveal-child className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
            Локація
          </p>
          <h2
            data-reveal-child
            className="text-balance text-[clamp(2rem,5vw,3.4rem)] font-normal leading-[1.12] tracking-[-0.02em] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Здається, що за містом. Насправді — у Вінниці.
          </h2>
          <p data-reveal-child className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
            Тупікова вулиця тримає Вас осторонь від руху й шуму. Але до міста — рукою подати.
          </p>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          {/* Stylized district plate + scroll-driven gold overlay. */}
          <Reveal>
            <div ref={stage} className="relative aspect-[1200/800] w-full" style={{ perspective: "1200px" }}>
              <div
                ref={plate}
                className="relative h-full w-full overflow-hidden rounded-sm border border-[var(--color-warm)]/10"
                style={{ transformStyle: "preserve-3d", willChange: "transform" }}
              >
                {/* The stylized map plate (inline via background — vector-crisp, themeable, light). */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/plan/district-map.svg')" }}
                  aria-hidden
                />
                {/* soft inner vignette to seat the plate */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "radial-gradient(120% 100% at 70% 75%, transparent 40%, rgba(15,15,14,0.5) 100%)" }}
                  aria-hidden
                />

                {/* Overlay shapes (SVG over the plate, animate on scroll). */}
                <svg viewBox="0 0 1200 800" className="absolute inset-0 h-full w-full" role="img"
                     aria-label="Стилізована схема: тупікова вулиця, що виходить до власного берега Південного Бугу">
                  {/* Gold pin on the DISTRICT (near where the dead-end street meets the shore). */}
                  <g data-map-layer transform="translate(880,548)">
                    <circle r="34" fill="#E8C9A0" opacity="0.14">
                      <animate attributeName="r" values="24;40;24" dur="3.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.16;0.04;0.16" dur="3.4s" repeatCount="indefinite" />
                    </circle>
                    <circle r="7" fill="#E8C9A0" />
                    <circle r="7" fill="none" stroke="#0f0f0e" strokeWidth="2" />
                  </g>
                </svg>

                {/* Labels (DOM, over the plate). */}
                <span data-map-layer className="absolute left-5 top-4 text-[10px] uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                  Вінниця
                </span>
                <span data-map-layer className="absolute bottom-4 right-5 text-[10px] uppercase tracking-[0.24em] text-[var(--color-warm)]/80">
                  Південний Буг
                </span>
                <span
                  data-map-layer
                  className="absolute text-[11px] text-[var(--color-text)]"
                  style={{ left: "73%", top: "73%", transform: "translate(-50%, 14px)" }}
                >
                  вул. Нагірна
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--color-text-muted)]/80">
              Точну адресу показуємо серйозним покупцям на перегляді — задля приватності власника.
            </p>
          </Reveal>

          {/* Right column — the one verified number + honest line (council: no invented distances). */}
          <Reveal className="space-y-8" stagger={0.14}>
            <div data-reveal-child className="border-l border-[var(--color-warm)]/25 pl-6">
              <p className="text-[clamp(3rem,5vw,4.2rem)] font-light leading-none text-[var(--color-warm)]">0</p>
              <p className="mt-2 text-lg text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                хвилин до власного берега
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">Він просто внизу.</p>
            </div>

            <div data-reveal-child className="border-l border-[var(--color-text-muted)]/20 pl-6">
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                Час до центру, школи й садка{" "}
                <span className="text-[var(--color-text)]">назвемо точно на перегляді</span> — без
                округлень і без «приблизно».
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
