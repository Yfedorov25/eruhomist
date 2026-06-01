"use client";

import { useRef } from "react";
import data from "@/content/eruhomist-data.json";
import SectionHeader from "@/components/SectionHeader";
import { useReveal } from "@/components/useReveal";

/*
  Cases — результати. Дані: cases[] з JSON.
  Чергуємо композицію кейсів: метрика зліва / справа / зліва. Метрики —
  data-anim="scale" (наближення підкреслює доказ), заголовок — "rise",
  текст — "blur". Ритм секції: --dense (контраст із air-сусідами).
  Розділювач між кейсами — тонкий --hairline.
*/

const CASES = data.cases;

export default function Cases() {
  const rootRef = useRef(null);
  useReveal(rootRef, {});

  return (
    <section
      ref={rootRef}
      id="cases"
      className="section-shell section-shell--bordered section-shell--dense"
      aria-label="Результати"
    >
      <SectionHeader
        kicker="Результати"
        title={<>Цифри, які <b>говорять</b></>}
      />

      <ol style={S.list}>
        {CASES.map((c, i) => {
          // Чергування: 0 — метрика зліва, 1 — справа, 2 — зліва.
          const right = i % 2 === 1;
          // Варіація ширин — друга колонка-доказ трохи ширша.
          const cols = right
            ? "minmax(0, 1.5fr) minmax(220px, 0.9fr)"
            : i === 2
            ? "minmax(200px, 0.7fr) minmax(0, 1.7fr)"
            : "minmax(220px, 0.9fr) minmax(0, 1.5fr)";

          return (
            <li
              key={i}
              style={{
                ...S.row,
                gridTemplateColumns: cols,
                borderTop:
                  i === 0 ? "1px solid var(--hairline)" : undefined,
              }}
            >
              {/* index marker — тонкий counter зверху */}
              <span style={S.index} data-anim="blur">
                {String(i + 1).padStart(2, "0")} / {String(CASES.length).padStart(2, "0")}
              </span>

              {right ? (
                <>
                  <div style={{ ...S.content, ...S.contentRight }}>
                    <h3 data-anim="rise" style={S.caseTitle}>
                      {c.title}
                    </h3>
                    <p data-anim="blur" style={S.text}>
                      {c.text}
                    </p>
                  </div>
                  <div
                    className="tnum"
                    data-anim="scale"
                    style={{ ...S.metric, ...S.metricRight }}
                  >
                    {c.metric}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="tnum"
                    data-anim="scale"
                    style={S.metric}
                  >
                    {c.metric}
                  </div>
                  <div style={S.content}>
                    <h3 data-anim="rise" style={S.caseTitle}>
                      {c.title}
                    </h3>
                    <p data-anim="blur" style={S.text}>
                      {c.text}
                    </p>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const S = {
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    position: "relative",
  },
  row: {
    position: "relative",
    display: "grid",
    gap: "clamp(24px, 5vw, 80px)",
    alignItems: "center",
    padding: "clamp(40px, 6vh, 72px) 0",
    borderBottom: "1px solid var(--hairline)",
  },
  index: {
    position: "absolute",
    top: "clamp(20px, 2.6vh, 28px)",
    right: 0,
    fontSize: 11,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "var(--text-4)",
    fontVariantNumeric: "tabular-nums",
  },
  metric: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(48px, 7vw, 112px)",
    lineHeight: 0.92,
    color: "var(--lamp-glow)",
    letterSpacing: "-0.03em",
    textWrap: "balance",
  },
  metricRight: { textAlign: "right" },
  content: { maxWidth: 560, minWidth: 0 },
  contentRight: { justifySelf: "start" },
  caseTitle: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 400,
    fontSize: "clamp(22px, 2.1vw, 32px)",
    lineHeight: 1.2,
    margin: 0,
    color: "var(--text-1)",
    letterSpacing: "-0.01em",
  },
  text: {
    marginTop: 18,
    fontSize: "clamp(15px, 1.3vw, 18px)",
    fontWeight: 300,
    lineHeight: 1.7,
    color: "var(--text-3)",
    maxWidth: "52ch",
  },
};
