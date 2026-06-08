"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { typo } from "@/lib/typo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 03b · ЖИТТЯ НАДВОРІ — editorial reveals (award base E4 text + E7 clip-path mask + E8 parallax):
// a statement lands centered & alone, then on scroll the photo masks open with parallax and the
// copy rises. Landscape = a visualisation of the plot's potential (disclosure below).
export default function Landscape() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) {
        gsap.set(".ls-rise", { opacity: 1, y: 0 });
        gsap.set(".ls-line", { yPercent: 0 });
        gsap.set(".ls-frame", { clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }
      // Centered statement rises from a mask (E4 — wrapped in overflow-hidden so nothing flashes).
      gsap.utils.toArray<HTMLElement>(".ls-statement").forEach((st) => {
        gsap.from(st.querySelectorAll<HTMLElement>(".ls-line"), {
          yPercent: 100, duration: 1.3, stagger: 0.08, ease: "expo.out",
          scrollTrigger: { trigger: st, start: "top 68%", once: true },
        });
        gsap.from(st.querySelectorAll<HTMLElement>(".ls-eyebrow"), {
          opacity: 0, y: 14, duration: 1.0, ease: "expo.out",
          scrollTrigger: { trigger: st, start: "top 70%", once: true },
        });
      });
      // Photos mask open (E7 clip-path curtain). Parallax inside is the global [data-parallax] (E8).
      gsap.utils.toArray<HTMLElement>(".ls-frame").forEach((fr) => {
        gsap.fromTo(fr, { clipPath: "inset(100% 0% 0% 0%)" }, {
          clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out",
          scrollTrigger: { trigger: fr, start: "top 82%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>(".ls-copy").forEach((c) => {
        gsap.from(c.querySelectorAll<HTMLElement>(".ls-rise"), {
          opacity: 0, y: 26, duration: 1.2, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: c, start: "top 84%", once: true },
        });
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="relative bg-night" aria-label="Життя на власному березі">
      {/* Statement lands centered & alone → scroll → photo masks open + parallax */}
      <div className="ls-statement relative flex min-h-[80svh] flex-col items-center justify-center px-6 pt-[12vh] text-center">
        <p className="ls-eyebrow mb-6 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">Життя надворі</p>
        <h3 className="max-w-[20ch] overflow-hidden text-[clamp(2.2rem,6vw,4.4rem)] font-normal leading-[1.05] tracking-[-0.025em] text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          <span className="ls-line block">Кожен метр ділянки</span>
          <span className="ls-line block text-[var(--color-warm)]">кличе надвір.</span>
        </h3>
        <div className="absolute inset-x-0 bottom-8 flex justify-center">
          <ScrollCue />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-[16vh] md:grid-cols-2">
        <div className="ls-frame relative aspect-[4/5] overflow-hidden rounded-sm">
          <div className="absolute inset-[-7%]" data-parallax="12" data-parallax-lag="1.25">
            <Image src="/images/landscape/lounge-pergola-garland.webp?v=2" alt="Зона відпочинку з гірляндою для вечорів просто неба" fill sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" className="object-cover" />
          </div>
        </div>
        <div className="ls-copy">
          <p className="ls-rise max-w-md text-lg leading-relaxed text-[var(--color-text-muted)] md:text-xl">
            {typo("Простір для довгих вечорів просто неба. Вогнище, біля якого збираються разом. Газон, що збігає до самої води. Це не подвір'я між парканами. Це продовження дому під відкритим небом.")}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-[18vh] md:grid-cols-2">
        <div className="ls-copy order-2 md:order-1">
          <h3 className="ls-rise text-[clamp(1.7rem,3.6vw,2.6rem)] font-normal leading-[1.12] tracking-[-0.02em] text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
            Там, де закінчується сад, починається Буг.
          </h3>
          <p className="ls-rise mt-5 max-w-md text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
            {typo("Спокійна вода, дерева понад нею, тиша. Берег, на якому Ви єдиний господар. Сюди не дійде ні чужий погляд, ні чужий шум.")}
          </p>
          <p className="ls-rise mt-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-warm)]/25 px-4 py-2 text-sm text-[var(--color-warm)]/90">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warm)]" aria-hidden />
            {typo("Подвір'я показано як приклад. Ділянку Ви облаштуєте на свій смак.")}
          </p>
        </div>
        <div className="ls-frame relative order-1 aspect-[3/2] overflow-hidden rounded-sm md:order-2">
          <div className="absolute inset-[-7%]" data-parallax="12" data-parallax-lag="1.25">
            <Image src="/images/landscape/riverbank-reeds-lilies.webp?v=2" alt="Берег Південного Бугу: спокійна вода й дерева біля будинку" fill sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
