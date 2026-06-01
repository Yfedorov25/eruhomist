"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "@/content/eruhomist-data.json";

gsap.registerPlugin(ScrollTrigger);

/*
  About — про нас + таймлайн. Дані: timeline[] + contact.values з JSON.
  1. Маніфест бренду + цінності (теги). Фото команди (brand-team.jpg).
  2. Таймлайн 2022->2025: рік акцентом, текст поряд, лінія-з'єднувач.
  Моушен: пункти таймлайну з'являються один за одним при скролі.
*/

const TIMELINE = data.timeline;
const VALUES = data.contact.values;

export default function About() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const reveal = rootRef.current.querySelectorAll("[data-reveal]");
      const items = gsap.utils.toArray(".tl-item");

      if (reduce) {
        gsap.set([...reveal, ...items], { opacity: 1, y: 0 });
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

      gsap.from(items, {
        y: 36,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.18,
        scrollTrigger: { trigger: ".tl", start: "top 80%" },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="about" style={S.section} aria-label="Про нас">
      <div className="about-top" style={S.top}>
        <div style={S.manifestCol}>
          <p data-reveal style={S.kicker}>
            Про нас
          </p>
          <h2 data-reveal style={S.title}>
            Про людей, ідеї та <b style={S.accent}>масштабні можливості</b>
          </h2>
          <p data-reveal style={S.manifest}>
            Єрухомість — це шлях від перших кроків в оренді до девелоперських
            проєктів. Ми не просто продаємо нерухомість — ми вибудовуємо стратегію,
            яка працює на вас і ваш капітал.
          </p>
          <div data-reveal style={S.values}>
            {VALUES.map((v) => (
              <span key={v} style={S.value}>
                {v}
              </span>
            ))}
          </div>
        </div>

        <div data-reveal style={S.photoWrap}>
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

      <div className="tl" style={S.tl}>
        {TIMELINE.map((t) => (
          <div key={t.year} className="tl-item" style={S.item}>
            <div style={S.year}>{t.year}</div>
            <div style={S.dot} aria-hidden />
            <p style={S.itemText}>{t.text}</p>
          </div>
        ))}
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
  top: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr",
    gap: "clamp(36px, 6vw, 96px)",
    alignItems: "center",
    marginBottom: "clamp(56px, 9vh, 120px)",
  },
  manifestCol: { maxWidth: 560 },
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
    fontSize: "clamp(32px, 4vw, 58px)",
    lineHeight: 1.08,
    letterSpacing: "-0.015em",
    margin: 0,
  },
  accent: { fontWeight: 600, color: "var(--accent)" },
  manifest: {
    marginTop: 24,
    fontSize: "clamp(15px, 1.3vw, 18px)",
    fontWeight: 300,
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.7)",
  },
  values: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32 },
  value: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 999,
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
  tl: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "clamp(20px, 3vw, 48px)",
    borderTop: "1px solid rgba(255,255,255,0.12)",
    paddingTop: "clamp(32px, 5vh, 56px)",
  },
  item: { position: "relative" },
  year: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(28px, 3vw, 46px)",
    color: "var(--accent)",
    lineHeight: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--accent)",
    margin: "20px 0",
  },
  itemText: {
    margin: 0,
    fontSize: "clamp(14px, 1.1vw, 16px)",
    fontWeight: 300,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.7)",
  },
};
