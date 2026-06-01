"use client";

import { useRef } from "react";
import data from "@/content/eruhomist-data.json";
import SectionHeader from "@/components/SectionHeader";
import { useReveal } from "@/components/useReveal";

/*
  Investment — інвестиції та девелопмент. Дані: investment{} з JSON.
  Композиція: одна метрика-зірка («до 25% річних») домінує масштабом,
  поряд — три дрібні контекстні нотатки. Нижче — нумеровані фактори
  й формати-пілюлі. Ритм: section-shell--sink (заглиблена поверхня).
*/

const INV = data.investment;

// Дрібні контекстні нотатки навколо зірки — без дублювання yield.
const NOTES = [
  { value: INV.entry, label: "Поріг входу" },
  { value: "8–12 міс", label: "Горизонт обороту" },
  { value: INV.formats.length + " формати", label: "Ліквідні напрямки" },
];

export default function Investment() {
  const rootRef = useRef(null);
  useReveal(rootRef, {});

  return (
    <section
      ref={rootRef}
      id="investment"
      className="section-shell section-shell--bordered section-shell--sink"
      aria-label="Інвестиції"
    >
      <SectionHeader
        kicker="Інвестиції та девелопмент"
        title={<>Капітал, що <b>працює</b></>}
        sub="Підбираємо об'єкти з інвестиційною логікою: ліквідність, таймінг входу й реальний потенціал зростання — а не обіцянки."
        maxWidth={660}
      />

      {/* Hero metric — одна цифра-домінанта */}
      <div style={S.heroRow}>
        <div style={S.heroMetric}>
          <span className="kicker" data-anim="blur" style={S.heroKicker}>
            Прогнозована дохідність
          </span>
          <div className="tnum" data-anim="scale" style={S.heroValue}>
            {INV.yield}
          </div>
          <p data-anim="blur" style={S.disclaimer}>
            Орієнтовно, на основі реалізованих угод. Не є гарантією.
          </p>
        </div>

        <ul style={S.notes} aria-label="Контекст інвестиції">
          {NOTES.map((n) => (
            <li key={n.label} data-anim="blur" style={S.note}>
              <span className="tnum" style={S.noteValue}>{n.value}</span>
              <span style={S.noteLabel}>{n.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={S.divider} />

      <div style={S.lower}>
        <div style={S.factorsCol}>
          <h3 data-anim="rise" style={S.blockTitle}>
            4 фактори прибутковості
          </h3>
          <ol style={S.factors}>
            {INV.factors.map((f, i) => (
              <li key={f} data-anim="rise" style={S.factor}>
                <span className="tnum" style={S.factorNum}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={S.factorText}>{f}</span>
              </li>
            ))}
          </ol>
        </div>

        <div style={S.formatsCol}>
          <h3 data-anim="rise" style={S.blockTitle}>
            Формати
          </h3>
          <div style={S.formats}>
            {INV.formats.map((f) => (
              <span key={f} data-anim="blur" style={S.pill}>
                {f}
              </span>
            ))}
          </div>
          <a
            href="#contact"
            className="cta-line"
            data-anim="blur"
            style={S.cta}
          >
            Порахувати дохідність <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

const S = {
  // Hero row — асиметрія: домінанта зліва (~64%), нотатки справа (~36%).
  heroRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)",
    gap: "clamp(32px, 6vw, 96px)",
    alignItems: "end",
  },
  heroMetric: { minWidth: 0 },
  heroKicker: { display: "block", marginBottom: 18 },
  heroValue: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(72px, 11vw, 132px)",
    lineHeight: 0.9,
    letterSpacing: "-0.035em",
    color: "var(--lamp-glow)",
    textWrap: "balance",
  },
  disclaimer: {
    marginTop: 22,
    fontSize: 12,
    lineHeight: 1.55,
    color: "var(--text-4)",
    maxWidth: "38ch",
    letterSpacing: "0.01em",
  },
  // Дрібні нотатки — стовпчик, тонші за зірку, з лівим хайрлайном.
  notes: {
    listStyle: "none",
    margin: 0,
    padding: "8px 0 8px 28px",
    borderLeft: "1px solid var(--hairline)",
    display: "flex",
    flexDirection: "column",
    gap: "clamp(22px, 3vw, 36px)",
  },
  note: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  noteValue: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(22px, 2.2vw, 30px)",
    lineHeight: 1,
    color: "var(--text-1)",
    letterSpacing: "-0.01em",
  },
  noteLabel: {
    fontSize: 12,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "var(--text-4)",
  },
  divider: {
    height: 1,
    background: "var(--hairline)",
    margin: "clamp(56px, 9vh, 104px) 0 clamp(40px, 6vh, 72px)",
  },
  lower: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "clamp(32px, 6vw, 96px)",
  },
  factorsCol: { minWidth: 0 },
  formatsCol: { display: "flex", flexDirection: "column", minWidth: 0 },
  blockTitle: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(20px, 1.8vw, 26px)",
    margin: "0 0 28px",
    letterSpacing: "-0.005em",
    color: "var(--text-2)",
  },
  factors: { listStyle: "none", margin: 0, padding: 0 },
  factor: {
    display: "grid",
    gridTemplateColumns: "44px 1fr",
    alignItems: "baseline",
    gap: 18,
    padding: "18px 0",
    borderBottom: "1px solid var(--hairline)",
    fontSize: "clamp(16px, 1.4vw, 20px)",
    fontWeight: 300,
  },
  factorNum: {
    fontFamily: "var(--font-display), Georgia, serif",
    color: "var(--lamp-glow)",
    opacity: 0.55,
    fontSize: 14,
    letterSpacing: "0.05em",
  },
  factorText: { color: "var(--text-2)" },
  formats: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: "clamp(32px, 4vh, 48px)",
  },
  pill: {
    fontSize: 13,
    color: "var(--text-2)",
    border: "1px solid var(--accent-line)",
    borderRadius: "var(--r-pill)",
    padding: "9px 18px",
    letterSpacing: "0.01em",
  },
  cta: {
    marginTop: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--text-1)",
    textDecoration: "none",
    width: "fit-content",
    paddingBottom: 6,
    borderBottom: "1px solid var(--accent-line)",
  },
};
