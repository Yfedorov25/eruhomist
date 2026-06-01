"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "@/content/eruhomist-data.json";
import SectionHeader from "@/components/SectionHeader";

gsap.registerPlugin(ScrollTrigger);

/*
  Cases — результати. Дані: cases[] з JSON.
  3 блоки-докази: велика метрика акцентом, заголовок, текст.
  Моушен: reveal зі stagger при скролі.
*/

const CASES = data.cases;

export default function Cases() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const reveal = rootRef.current.querySelectorAll("[data-reveal]");
      const rows = gsap.utils.toArray(".case-row");

      if (reduce) {
        gsap.set([...reveal, ...rows], { opacity: 1, y: 0 });
        return;
      }

      gsap.from(reveal, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });

      rows.forEach((row) => {
        gsap.from(row.querySelectorAll("[data-cr]"), {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: row, start: "top 80%" },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="cases"
      className="section-shell section-shell--bordered"
      aria-label="Результати"
    >
      <SectionHeader kicker="Результати" title={<>Цифри, які <b>говорять</b></>} />


      <div style={S.list}>
        {CASES.map((c, i) => (
          <div
            key={i}
            className="case-row"
            style={{
              ...S.row,
              borderTop:
                i === 0 ? "1px solid rgba(255,255,255,0.1)" : undefined,
            }}
          >
            <div data-cr style={S.metric}>
              {c.metric}
            </div>
            <div style={S.content}>
              <h3 data-cr style={S.caseTitle}>
                {c.title}
              </h3>
              <p data-cr style={S.text}>
                {c.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const S = {
  list: {},
  row: {
    display: "grid",
    gridTemplateColumns: "minmax(180px, 0.8fr) 1.6fr",
    gap: "clamp(24px, 5vw, 80px)",
    alignItems: "center",
    padding: "clamp(36px, 5vh, 56px) 0",
    borderBottom: "1px solid var(--hairline)",
  },
  metric: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(40px, 5.5vw, 88px)",
    lineHeight: 0.95,
    color: "var(--accent)",
    letterSpacing: "-0.02em",
    fontVariantNumeric: "tabular-nums",
  },
  content: { maxWidth: 560 },
  caseTitle: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 400,
    fontSize: "clamp(20px, 2vw, 30px)",
    lineHeight: 1.2,
    margin: 0,
  },
  text: {
    marginTop: 16,
    fontSize: "clamp(15px, 1.3vw, 18px)",
    fontWeight: 300,
    lineHeight: 1.65,
    color: "rgba(255,255,255,0.7)",
  },
};
