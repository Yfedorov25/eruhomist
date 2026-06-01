"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "@/content/eruhomist-data.json";

gsap.registerPlugin(ScrollTrigger);

/*
  Contact — фінальна секція (id="contact"). Дані: contact{} з JSON.
  Заклик, телефон (tel:), Instagram, проста форма.
  ФОРМА БЕЗ БЕКЕНДУ: console.log + mailto-фолбек. TODO: підключити надсилання.
  Моушен: fade-in секції.
*/

const C = data.contact;

export default function Contact() {
  const rootRef = useRef(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const reveal = rootRef.current.querySelectorAll("[data-reveal]");
      if (reduce) {
        gsap.set(reveal, { opacity: 1, y: 0 });
        return;
      }
      gsap.from(reveal, {
        y: 34,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = {
      name: form.name.value,
      contact: form.contact.value,
      message: form.message.value,
    };
    // TODO: підключити реальне надсилання (бекенд / форм-сервіс).
    console.log("[Єрухомість] заявка з форми:", payload);
    const body = encodeURIComponent(
      `Ім'я: ${payload.name}\nКонтакт: ${payload.contact}\n\n${payload.message}`
    );
    // mailto-фолбек поки немає бекенду
    window.location.href = `mailto:?subject=${encodeURIComponent(
      "Заявка з сайту Єрухомість"
    )}&body=${body}`;
    setSent(true);
  }

  return (
    <section ref={rootRef} id="contact" style={S.section} aria-label="Контакт">
      <div className="contact-grid" style={S.grid}>
        {/* ліворуч — заклик + контакти */}
        <div style={S.left}>
          <p data-reveal style={S.kicker}>
            Контакт
          </p>
          <h2 data-reveal style={S.title}>
            Знайдемо те, що працює <b style={S.accent}>саме для вас</b>
          </h2>
          <p data-reveal style={S.sub}>
            Напишіть або зателефонуйте — підберемо рішення під ваші цілі: для
            життя, оренди чи інвестицій.
          </p>

          <div data-reveal style={S.contacts}>
            <a href={`tel:${C.phone.replace(/\s/g, "")}`} style={S.contactLink}>
              {C.phone}
            </a>
            <a
              href={C.instagram}
              target="_blank"
              rel="noopener noreferrer"
              style={S.contactLink}
            >
              {C.instagramHandle}
            </a>
            <span style={S.city}>{C.city}</span>
          </div>
        </div>

        {/* праворуч — форма */}
        <form data-reveal style={S.form} onSubmit={handleSubmit}>
          <label style={S.label}>
            Ім'я
            <input name="name" required style={S.input} autoComplete="name" />
          </label>
          <label style={S.label}>
            Телефон або контакт
            <input
              name="contact"
              required
              style={S.input}
              placeholder="+380 / @нік"
            />
          </label>
          <label style={S.label}>
            Повідомлення
            <textarea
              name="message"
              rows={4}
              style={{ ...S.input, resize: "vertical" }}
              placeholder="Що шукаєте?"
            />
          </label>
          <button type="submit" style={S.submit}>
            {sent ? "Дякуємо! Відкриваємо пошту…" : "Надіслати заявку"}
          </button>
          <p style={S.note}>
            Натискаючи, ви погоджуєтесь, що ми зв'яжемося з вами. {/* TODO: бекенд */}
          </p>
        </form>
      </div>
    </section>
  );
}

const S = {
  section: {
    background: "var(--bg)",
    color: "var(--text)",
    padding: "clamp(80px, 14vh, 180px) clamp(24px, 8vw, 140px)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "clamp(40px, 7vw, 110px)",
    alignItems: "start",
  },
  left: { maxWidth: 520 },
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
    fontSize: "clamp(34px, 4.6vw, 68px)",
    lineHeight: 1.05,
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
  },
  contacts: { marginTop: 40, display: "flex", flexDirection: "column", gap: 16 },
  contactLink: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontSize: "clamp(22px, 2.2vw, 32px)",
    fontWeight: 300,
    color: "#fff",
    textDecoration: "none",
    width: "fit-content",
    borderBottom: "1px solid rgba(232,163,92,0.4)",
    paddingBottom: 4,
  },
  city: { fontSize: 14, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
  },
  input: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 2,
    padding: "14px 16px",
    color: "#fff",
    fontSize: 16,
    fontFamily: "inherit",
    outline: "none",
  },
  submit: {
    marginTop: 8,
    background: "var(--accent)",
    color: "#0a0c0f",
    border: "none",
    borderRadius: 2,
    padding: "17px 28px",
    fontSize: 13,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontWeight: 600,
    cursor: "pointer",
  },
  note: { margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 },
};
