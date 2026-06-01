"use client";

import { useRef } from "react";
import Image from "next/image";
import data from "@/content/eruhomist-data.json";
import { useReveal } from "@/components/useReveal";

/*
  About — про нас + таймлайн. Дані: timeline[] + contact.values з JSON.
  Reveal: useReveal на data-anim (rise/clip/blur). Таймлайн — справжня лінія-зʼєднувач
  через всі роки з крапками НА лінії; роки промальовуються зліва-направо як шлях.
*/

const TIMELINE = data.timeline;
const VALUES = data.contact.values;

export default function About() {
  const rootRef = useRef(null);
  useReveal(rootRef, { stagger: 0.14 });

  return (
    <section
      ref={rootRef}
      id="about"
      className="section-shell section-shell--bordered section-shell--air"
      aria-label="Про нас"
    >
      <div className="about-top" style={S.top}>
        <div style={S.manifestCol}>
          <p className="kicker" data-anim="blur">
            Про нас
          </p>
          <h2 className="headline" data-anim="rise">
            Про людей, ідеї та <b>масштабні можливості</b>
          </h2>
          <p data-anim="blur" style={S.manifest}>
            Єрухомість — це шлях від перших кроків в оренді до девелоперських
            проєктів. Ми не просто продаємо нерухомість — ми вибудовуємо стратегію,
            яка працює на вас і ваш капітал.
          </p>
          <div data-anim="rise" style={S.values}>
            {VALUES.map((v) => (
              <span key={v} style={S.value}>
                {v}
              </span>
            ))}
          </div>
        </div>

        <div data-anim="clip" style={S.photoWrap}>
          <div style={S.photo}>
            <Image
              src="/objects/brand-team.jpg"
              alt="Команда Єрухомість"
              fill
              sizes="(max-width: 860px) 100vw, 42vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </div>

      {/* Таймлайн: горизонтальна лінія через всі роки, крапки сидять НА лінії. */}
      <div className="tl" style={S.tl}>
        <span className="tl-line" aria-hidden style={S.tlLine} />
        {TIMELINE.map((t, i) => (
          <div key={t.year} className="tl-item" data-anim="rise" style={S.item}>
            <div className="tnum" style={S.year}>
              {t.year}
            </div>
            <span style={S.dot} aria-hidden />
            <p style={S.itemText}>{t.text}</p>
            {i === TIMELINE.length - 1 && (
              <span style={S.itemTail} aria-hidden />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

const S = {
  top: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr",
    gap: "clamp(36px, 6vw, 96px)",
    alignItems: "center",
    marginBottom: "clamp(72px, 11vh, 140px)",
  },
  manifestCol: { maxWidth: 560 },
  manifest: {
    marginTop: 24,
    fontSize: "clamp(15px, 1.3vw, 18px)",
    fontWeight: 300,
    lineHeight: 1.7,
    color: "var(--text-3)",
  },
  values: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32 },
  value: {
    fontSize: 13,
    color: "var(--text-2)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "var(--r-pill)",
    padding: "8px 16px",
  },
  photoWrap: { position: "relative", width: "100%", height: "min(56vh, 520px)" },
  photo: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    borderRadius: 3,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  // ── Таймлайн ──────────────────────────────────────────────
  // Позиція relative → щоб лінія абсолютно протягнулась через всі колонки.
  // paddingTop робить простір для года над лінією, лінія йде на висоті крапки.
  tl: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "clamp(20px, 3vw, 48px)",
    paddingTop: "clamp(32px, 5vh, 56px)",
    borderTop: "1px solid var(--hairline-soft)",
  },
  // Лінія-зʼєднувач — тонка, золотиста (--accent-line). Йде через всі 4 колонки,
  // на тій же висоті, де сидить .dot (margin-top року + radius/2).
  // Висота: paddingTop + висота року + (margin крапки до тексту року) ≈ обчислюється
  // через top у .tlLine. Простіше — крапка і лінія співпадають через однаковий offset.
  tlLine: {
    position: "absolute",
    left: "clamp(20px, 3vw, 48px)",
    right: "clamp(20px, 3vw, 48px)",
    // top рахується від верху .tl: paddingTop + висота року (~clamp 28-46) + 20px (margin крапки) + 4px (центр крапки 8px)
    top: "calc(clamp(32px, 5vh, 56px) + clamp(28px, 3vw, 46px) + 24px)",
    height: 1,
    background:
      "linear-gradient(90deg, transparent 0%, var(--accent-line) 14%, var(--accent-line) 86%, transparent 100%)",
    pointerEvents: "none",
  },
  item: { position: "relative" },
  year: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(28px, 3vw, 46px)",
    color: "var(--lamp-glow)",
    lineHeight: 1,
    letterSpacing: "-0.01em",
  },
  // Крапка сидить НА лінії: margin вирівняний так, щоб центр (8/2=4px) збігся з top лінії.
  dot: {
    display: "block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--lamp-glow)",
    boxShadow: "0 0 0 4px var(--obsidian)", // "вирізає" точку з лінії — лінія не проходить крізь крапку
    margin: "20px 0",
    position: "relative",
    zIndex: 1,
  },
  itemText: {
    margin: 0,
    fontSize: "clamp(14px, 1.1vw, 16px)",
    fontWeight: 300,
    lineHeight: 1.6,
    color: "var(--text-3)",
    maxWidth: "26ch",
  },
  itemTail: { display: "none" }, // зарезервовано (на випадок майбутньої стрілки в кінці)
};
