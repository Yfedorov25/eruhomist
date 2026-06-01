"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "@/content/eruhomist-data.json";

gsap.registerPlugin(ScrollTrigger);

/*
  Investment — інвестиції та девелопмент. Дані: investment{} з JSON.
  Темна секція, акцент на цифрах. Метрики (поріг входу, дохідність + 2),
  4 фактори прибутковості (нумерований ряд), формати (пілюлі).
  Моушен: метрики fade-in зі stagger при in-view.
*/

const INV = data.investment;

const METRICS = [
  { value: INV.entry, label: "Поріг входу" },
  { value: INV.yield, label: "Прогнозована дохідність" },
  { value: "8–12 міс", label: "Горизонт обороту" },
  { value: INV.formats.length + " формати", label: "Ліквідні напрямки" },
];

export default function Investment() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const reveal = rootRef.current.querySelectorAll("[data-reveal]");
      const metrics = gsap.utils.toArray(".inv-metric");

      if (reduce) {
        gsap.set([...reveal, ...metrics], { opacity: 1, y: 0 });
        return;
      }

      gsap.from(reveal, {
        y: 32,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: rootRef.current, start: "top 72%" },
      });

      gsap.from(metrics, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".inv-metrics", start: "top 82%" },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="investment" style={S.section} aria-label="Інвестиції">
      <header style={S.head}>
        <p data-reveal style={S.kicker}>
          Інвестиції та девелопмент
        </p>
        <h2 data-reveal style={S.title}>
          Капітал, що <b style={S.accent}>працює</b>
        </h2>
        <p data-reveal style={S.sub}>
          Підбираємо об'єкти з інвестиційною логікою: ліквідність, таймінг входу й
          реальний потенціал зростання — а не обіцянки.
        </p>
      </header>

      <div className="inv-metrics" style={S.metrics}>
        {METRICS.map((m) => (
          <div key={m.label} className="inv-metric" style={S.metric}>
            <div style={S.metricValue}>{m.value}</div>
            <div style={S.metricLabel}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="inv-lower" style={S.lower}>
        <div data-reveal style={S.factorsCol}>
          <h3 style={S.blockTitle}>4 фактори прибутковості</h3>
          <ol style={S.factors}>
            {INV.factors.map((f, i) => (
              <li key={f} style={S.factor}>
                <span style={S.factorNum}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ol>
        </div>

        <div data-reveal style={S.formatsCol}>
          <h3 style={S.blockTitle}>Формати</h3>
          <div style={S.formats}>
            {INV.formats.map((f) => (
              <span key={f} style={S.pill}>
                {f}
              </span>
            ))}
          </div>
          <a href="#contact" style={S.cta}>
            Дізнатись про інвестиції <span style={{ color: "var(--accent)" }}>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

const S = {
  section: {
    background: "var(--bg)",
    color: "var(--text)",
    padding: "clamp(72px, 12vh, 160px) clamp(24px, 8vw, 140px)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  head: { maxWidth: 660, marginBottom: "clamp(44px, 7vh, 84px)" },
  kicker: {
    fontSize: 12,
    letterSpacing: "0.4em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
    margin: "0 0 20px",
  },
  title: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(38px, 5.2vw, 80px)",
    lineHeight: 1.02,
    letterSpacing: "-0.02em",
    margin: 0,
  },
  accent: { fontWeight: 600, color: "var(--accent)" },
  sub: {
    marginTop: 24,
    fontSize: "clamp(15px, 1.3vw, 18px)",
    fontWeight: 300,
    lineHeight: 1.65,
    color: "rgba(255,255,255,0.7)",
    maxWidth: 520,
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "clamp(20px, 3vw, 48px)",
    paddingBottom: "clamp(44px, 7vh, 84px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  metric: {},
  metricValue: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(30px, 3.4vw, 52px)",
    lineHeight: 1,
    color: "var(--accent)",
    letterSpacing: "-0.01em",
  },
  metricLabel: {
    marginTop: 14,
    fontSize: 13,
    letterSpacing: "0.06em",
    color: "rgba(255,255,255,0.6)",
  },
  lower: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "clamp(32px, 6vw, 96px)",
    marginTop: "clamp(44px, 7vh, 84px)",
  },
  factorsCol: {},
  formatsCol: { display: "flex", flexDirection: "column" },
  blockTitle: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(22px, 2vw, 30px)",
    margin: "0 0 28px",
  },
  factors: { listStyle: "none", margin: 0, padding: 0 },
  factor: {
    display: "flex",
    alignItems: "baseline",
    gap: 18,
    padding: "16px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: "clamp(16px, 1.4vw, 20px)",
    fontWeight: 300,
    color: "rgba(255,255,255,0.85)",
  },
  factorNum: {
    fontFamily: "var(--font-display), Georgia, serif",
    color: "var(--accent)",
    opacity: 0.5,
    fontSize: 18,
    minWidth: 28,
  },
  formats: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 40 },
  pill: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(232,163,92,0.4)",
    borderRadius: 999,
    padding: "10px 20px",
  },
  cta: {
    marginTop: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#fff",
    textDecoration: "none",
    width: "fit-content",
    paddingBottom: 6,
    borderBottom: "1px solid rgba(232,163,92,0.4)",
  },
};
