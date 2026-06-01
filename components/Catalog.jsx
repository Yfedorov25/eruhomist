"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "@/content/eruhomist-data.json";
import SectionHeader from "@/components/SectionHeader";

gsap.registerPlugin(ScrollTrigger);

/*
  Catalog — каталог об'єктів. Дані: objects[] з content/eruhomist-data.json.
  Сітка карток (десктоп 3, планшет 2, моб 1 — у globals.css .cat-grid).
  Картка: фото 4:3 (hover zoom), бейджі типу+статусу, заголовок, локація, площа+ціна, теги.
  Ціни/площі — рівно з JSON. Моушен: картки fade-up зі stagger при скролі.
*/

const OBJECTS = data.objects;

export default function Catalog() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const head = rootRef.current.querySelectorAll("[data-reveal]");
      const cards = gsap.utils.toArray(".cat-card");

      if (reduce) {
        gsap.set([...head, ...cards], { opacity: 1, y: 0 });
        return;
      }

      gsap.from(head, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });

      gsap.from(cards, {
        y: 44,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".cat-grid", start: "top 80%" },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="catalog" className="section-shell" aria-label="Об'єкти">
      <SectionHeader
        kicker="Каталог"
        title={<>Об'єкти, які варто <b>розглянути</b></>}
        sub="Добірка під різні цілі — для життя, оренди та інвестицій. Підберемо й те, чого тут немає."
      />


      <div className="cat-grid">
        {OBJECTS.map((o) => (
          <article key={o.id} className="cat-card">
            <div className="cat-card__img">
              <Image
                src={o.image}
                alt={o.title}
                fill
                sizes="(max-width: 620px) 100vw, (max-width: 980px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
              />
              <span style={{ ...S.badge, ...S.badgeType }}>{o.type}</span>
              <span style={{ ...S.badge, ...S.badgeStatus }}>{o.status}</span>
            </div>

            <div style={S.cardBody}>
              <h3 style={S.cardTitle}>{o.title}</h3>
              <p style={S.loc}>
                <span style={S.pin} aria-hidden>
                  ◍
                </span>
                {o.location}
              </p>

              <div style={S.row}>
                <span style={S.area}>{o.area}</span>
                <span style={S.price}>{o.price}</span>
              </div>

              <div style={S.tags}>
                {o.tags.slice(0, 3).map((t) => (
                  <span key={t} style={S.tag}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div style={S.ctaWrap}>
        <a href="#contact" style={S.cta}>
          Підібрати під запит <span style={{ color: "var(--accent)" }}>→</span>
        </a>
      </div>
    </section>
  );
}

const S = {
  badge: {
    position: "absolute",
    top: 14,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "6px 12px",
    borderRadius: "var(--r-sharp)",
    backdropFilter: "blur(8px)",
  },
  badgeType: {
    left: 14,
    background: "var(--surface-glass)",
    color: "var(--text-1)",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  badgeStatus: {
    right: 14,
    background: "var(--accent-strong)",
    color: "var(--obsidian)",
    fontWeight: 600,
  },
  cardBody: { padding: "22px 22px 26px" },
  cardTitle: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 400,
    fontSize: "clamp(20px, 1.7vw, 26px)",
    lineHeight: 1.2,
    margin: 0,
  },
  loc: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    margin: "12px 0 0",
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
  },
  pin: { color: "var(--accent)", fontSize: 12 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
    margin: "20px 0 0",
    paddingTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  area: { fontSize: 14, color: "rgba(255,255,255,0.7)" },
  price: {
    fontSize: "clamp(18px, 1.5vw, 22px)",
    fontWeight: 600,
    color: "var(--accent)",
  },
  tags: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 },
  tag: {
    fontSize: 11,
    letterSpacing: "0.04em",
    color: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 999,
    padding: "5px 11px",
  },
  ctaWrap: { marginTop: "clamp(40px, 6vh, 72px)", textAlign: "center" },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#fff",
    textDecoration: "none",
    padding: "16px 34px",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 2,
  },
};
