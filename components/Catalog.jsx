"use client";

import { useRef } from "react";
import Image from "next/image";
import data from "@/content/eruhomist-data.json";
import SectionHeader from "@/components/SectionHeader";
import { useReveal } from "@/components/useReveal";

/*
  Catalog — каталог об'єктів. Дані: objects[] з content/eruhomist-data.json.
  Композиція ламається спеціально (Von Restorff):
    - 1-й об'єкт (Соборна 22, 128k$) — HERO-card: на всю ширину, фото+текст поруч.
    - Решта 5 — звичайна 3-в-ряд сітка.
  Бейдж "у продажу" (дефолт) приховано як banner-blind. Лишаються тільки значущі статуси:
  "ціну знижено" та "інвестиційна".
  Моушен: useReveal — hero data-anim="clip" (кінематографічний розкрив), картки rise зі stagger.
*/

const OBJECTS = data.objects;
const STATUS_MEANINGFUL = new Set(["ціну знижено", "інвестиційна"]);

function ObjectMeta({ o, size = "card" }) {
  const titleSize =
    size === "hero"
      ? "clamp(26px, 2.6vw, 38px)"
      : "clamp(20px, 1.7vw, 26px)";
  return (
    <>
      <h3
        style={{
          ...S.cardTitle,
          fontSize: titleSize,
          fontWeight: size === "hero" ? 300 : 400,
        }}
      >
        {o.title}
      </h3>
      <p style={S.loc}>
        <span style={S.pin} aria-hidden>
          ◍
        </span>
        {o.location}
      </p>
      <div style={S.row}>
        <span style={S.area}>{o.area}</span>
        <span className="tnum" style={S.price}>
          {o.price}
        </span>
      </div>
      <div style={S.tags}>
        {o.tags.slice(0, size === "hero" ? 4 : 3).map((t) => (
          <span key={t} style={S.tag}>
            {t}
          </span>
        ))}
      </div>
    </>
  );
}

function StatusBadge({ status }) {
  if (!STATUS_MEANINGFUL.has(status)) return null;
  return (
    <span style={{ ...S.badge, ...S.badgeStatus }}>
      {status}
    </span>
  );
}

export default function Catalog() {
  const rootRef = useRef(null);
  useReveal(rootRef, { stagger: 0.09, duration: 1.1 });

  const [hero, ...rest] = OBJECTS;

  return (
    <section
      ref={rootRef}
      id="catalog"
      className="section-shell section-shell--bordered section-shell--lift"
      aria-label="Об'єкти"
    >
      <SectionHeader
        kicker="Каталог"
        title={
          <>
            Об'єкти, які варто <b>розглянути</b>
          </>
        }
        sub="Добірка під різні цілі — для життя, оренди та інвестицій. Підберемо й те, чого тут немає."
      />

      {/* ── Hero card: 1-й об'єкт (Соборна 22) ─────────────────── */}
      <article className="cat-hero" data-anim="clip">
        <div className="cat-hero__img">
          <Image
            src={hero.image}
            alt={hero.title}
            fill
            sizes="(max-width: 880px) 100vw, 60vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <span style={{ ...S.badge, ...S.badgeType }}>{hero.type}</span>
          <StatusBadge status={hero.status} />
        </div>
        <div className="cat-hero__body">
          <span style={S.heroKicker}>Витвір центру</span>
          <ObjectMeta o={hero} size="hero" />
        </div>
      </article>

      {/* ── Решта сітка 3-в-ряд ──────────────────────────────── */}
      <div className="cat-grid">
        {rest.map((o) => (
          <article key={o.id} className="cat-card" data-anim="rise">
            <div className="cat-card__img">
              <Image
                src={o.image}
                alt={o.title}
                fill
                sizes="(max-width: 620px) 100vw, (max-width: 980px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
              />
              <span style={{ ...S.badge, ...S.badgeType }}>{o.type}</span>
              <StatusBadge status={o.status} />
            </div>
            <div style={S.cardBody}>
              <ObjectMeta o={o} size="card" />
            </div>
          </article>
        ))}
      </div>

      <div style={S.ctaWrap}>
        <a href="#contact" className="cta-line" data-anim="blur" style={S.cta}>
          Знайти свій об'єкт{" "}
          <span className="arrow" style={{ color: "var(--lamp-glow)" }}>
            →
          </span>
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
  heroKicker: {
    fontSize: "var(--text-kicker)",
    letterSpacing: "var(--ls-kicker)",
    textTransform: "uppercase",
    color: "var(--text-4)",
    marginBottom: 4,
  },
  cardBody: { padding: "22px 22px 26px" },
  cardTitle: {
    fontFamily: "var(--font-display), Georgia, serif",
    lineHeight: 1.18,
    margin: 0,
    color: "var(--text-1)",
    letterSpacing: "-0.01em",
  },
  loc: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    margin: "12px 0 0",
    fontSize: 14,
    color: "var(--text-4)",
  },
  pin: { color: "var(--lamp-glow)", fontSize: 12 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
    margin: "20px 0 0",
    paddingTop: 18,
    borderTop: "1px solid var(--hairline)",
  },
  area: { fontSize: 14, color: "var(--text-3)" },
  price: {
    fontSize: "clamp(18px, 1.6vw, 24px)",
    fontWeight: 600,
    color: "var(--lamp-glow)",
    letterSpacing: "-0.005em",
  },
  tags: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 },
  tag: {
    fontSize: 11,
    letterSpacing: "0.04em",
    color: "var(--text-4)",
    border: "1px solid var(--hairline)",
    borderRadius: "var(--r-pill)",
    padding: "5px 11px",
  },
  ctaWrap: { marginTop: "clamp(48px, 7vh, 84px)", textAlign: "center" },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    fontSize: 12,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "var(--text-2)",
    textDecoration: "none",
    paddingBottom: 8,
    borderBottom: "1px solid var(--accent-line)",
  },
};
