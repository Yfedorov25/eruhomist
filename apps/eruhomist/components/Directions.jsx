"use client";

import { useRef } from "react";
import Image from "next/image";
import data from "@/content/eruhomist-data.json";
import { useReveal } from "@/components/useReveal";

/*
  Directions — три напрямки бренду.
  Композиція: асиметрична сітка (0.85fr text / 1.15fr media), чергування сторін.
  Глибина: великий ghost-номер позиціонований ЗА заголовком (absolute, z-index 0,
  opacity ~0.13) — створює шар і кінематографічну глибину.
  Моушен: useReveal — заголовок rise, текст/номер blur, медіа clip (кінематографічний
  розкрив зверху-вниз).
  CTA — у голосі бренду, по одному унікальному на напрямок.
*/

const DIRECTIONS = data.directions;

const CTAS = {
  "01": "Підібрати житло",
  "02": "Обговорити проєкт",
  "03": "Порахувати дохід",
};

export default function Directions() {
  const rootRef = useRef(null);
  useReveal(rootRef, { stagger: 0.14, duration: 1.25 });

  return (
    <section
      ref={rootRef}
      id="directions"
      className="section-shell section-shell--air section-shell--bordered"
      aria-label="Три напрямки"
      style={S.section}
    >
      {DIRECTIONS.map((d, i) => {
        const textRight = i % 2 === 1;
        const side = textRight ? "right" : "left";

        const text = (
          <div className="dir-text" style={{ gridArea: "text" }}>
            <span className="dir-ghost-num" aria-hidden>
              {d.num}
            </span>
            <span data-anim="blur" style={S.kicker}>
              Напрямок · {d.num}
            </span>
            <h2 data-anim="rise" style={S.title}>
              {d.title}
            </h2>
            <p data-anim="blur" style={S.body}>
              {d.text}
            </p>
            <a
              href="#contact"
              className="cta-line"
              data-anim="blur"
              style={S.cta}
            >
              {CTAS[d.num] || "Дізнатись більше"}{" "}
              <span className="arrow" style={S.arrow}>
                →
              </span>
            </a>
          </div>
        );

        const media = (
          <div
            className="dir-media-wrap"
            style={{ gridArea: "media" }}
          >
            <div className="dir-media" data-anim="clip">
              <Image
                src={d.image}
                alt={d.title}
                fill
                sizes="(max-width: 880px) 100vw, 55vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        );

        return (
          <div key={d.num}>
            {i > 0 && <div style={S.divider} aria-hidden />}
            <div
              className="dir-block"
              data-side={side}
              style={{
                gridTemplateAreas: textRight
                  ? '"media text"'
                  : '"text media"',
              }}
            >
              {textRight ? (
                <>
                  {media}
                  {text}
                </>
              ) : (
                <>
                  {text}
                  {media}
                </>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

const S = {
  section: { padding: 0 }, // section-shell--air would add padding; we control rhythm per .dir-block
  divider: {
    height: 1,
    background: "var(--hairline)",
    margin: "0 var(--space-section-x)",
  },
  kicker: {
    display: "inline-block",
    fontSize: "var(--text-kicker)",
    letterSpacing: "var(--ls-kicker)",
    textTransform: "uppercase",
    color: "var(--text-4)",
    marginBottom: 20,
  },
  title: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(34px, 4.4vw, 64px)",
    lineHeight: 1.04,
    letterSpacing: "-0.018em",
    margin: 0,
    color: "var(--text-1)",
    textWrap: "balance",
  },
  body: {
    marginTop: 26,
    fontSize: "var(--text-sub)",
    fontWeight: 300,
    lineHeight: 1.7,
    color: "var(--text-3)",
    maxWidth: "44ch",
  },
  cta: {
    marginTop: 40,
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    fontSize: 12,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "var(--text-2)",
    textDecoration: "none",
    width: "fit-content",
    paddingBottom: 8,
    borderBottom: "1px solid var(--accent-line)",
  },
  arrow: { color: "var(--lamp-glow)" },
};
