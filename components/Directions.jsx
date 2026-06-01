"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "@/content/eruhomist-data.json";

gsap.registerPlugin(ScrollTrigger);

/*
  Directions — секція "Три напрямки".
  Дані: directions[] з content/eruhomist-data.json.
  3 повноширинні блоки ~80vh, чергуються ліво/право (01 текст зліва, 02 справа, 03 зліва).
  Між блоками — тонкий розділювач rgba(255,255,255,.08).
  Моушен (ScrollTrigger): заголовок виїжджає знизу, номер+текст зі stagger; parallax зображення.
  Поважає prefers-reduced-motion.
*/

const DIRECTIONS = data.directions;

export default function Directions() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      gsap.utils.toArray(".dir-block").forEach((block) => {
        const media = block.querySelector(".dir-media");
        const reveal = block.querySelectorAll("[data-reveal]");

        if (reduce) {
          gsap.set(reveal, { opacity: 1, y: 0 });
          return;
        }

        gsap.from(reveal, {
          y: 40,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: block,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.fromTo(
          media,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: block,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} style={S.section} aria-label="Три напрямки">
      {DIRECTIONS.map((d, i) => {
        const textRight = i % 2 === 1; // block 02 -> текст справа
        return (
          <div key={d.num}>
            {i > 0 && <div style={S.divider} aria-hidden />}
            <div
              className="dir-block"
              style={{
                ...S.block,
                gridTemplateAreas: textRight ? '"media text"' : '"text media"',
              }}
            >
              {/* текстова колонка */}
              <div style={{ ...S.textCol, gridArea: "text" }}>
                <span data-reveal style={S.num}>
                  {d.num}
                </span>
                <h2 data-reveal style={S.title}>
                  {d.title}
                </h2>
                <p data-reveal style={S.body}>
                  {d.text}
                </p>
                <a href="#contact" data-reveal style={S.cta}>
                  Дізнатись більше <span style={S.arrow}>→</span>
                </a>
              </div>

              {/* зображення */}
              <div style={{ ...S.mediaWrap, gridArea: "media" }}>
                <div className="dir-media" style={S.media}>
                  <Image
                    src={d.image}
                    alt={d.title}
                    fill
                    sizes="(max-width: 880px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

const S = {
  section: { background: "var(--bg)", color: "var(--text)", width: "100%" },
  divider: {
    height: 1,
    background: "var(--hairline)",
    margin: "0 clamp(24px, 8vw, 140px)",
  },
  block: {
    minHeight: "80vh",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    alignItems: "center",
    gap: "clamp(32px, 6vw, 96px)",
    padding: "clamp(48px, 8vh, 120px) clamp(24px, 8vw, 140px)",
  },
  textCol: {
    display: "flex",
    flexDirection: "column",
    maxWidth: 520,
    position: "relative",
    zIndex: 1,
  },
  num: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(72px, 9vw, 120px)",
    lineHeight: 0.85,
    color: "var(--accent)",
    opacity: 0.22,
    letterSpacing: "-0.02em",
    marginBottom: "clamp(8px, 2vh, 24px)",
    pointerEvents: "none",
    userSelect: "none",
  },
  title: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(32px, 4.2vw, 60px)",
    lineHeight: 1.05,
    letterSpacing: "-0.015em",
    margin: 0,
  },
  body: {
    marginTop: 24,
    fontSize: "clamp(15px, 1.3vw, 18px)",
    fontWeight: 300,
    lineHeight: 1.65,
    color: "rgba(255,255,255,0.7)",
    maxWidth: 440,
  },
  cta: {
    marginTop: 36,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.9)",
    textDecoration: "none",
    width: "fit-content",
    paddingBottom: 6,
    borderBottom: "1px solid var(--accent-line)",
  },
  arrow: { color: "var(--accent)" },
  mediaWrap: {
    position: "relative",
    width: "100%",
    height: "min(62vh, 560px)",
  },
  media: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    borderRadius: 2,
    border: "1px solid var(--hairline)",
  },
};
