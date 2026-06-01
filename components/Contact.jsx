"use client";

import { useActionState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "@/content/eruhomist-data.json";
import { sendLead } from "@/app/actions/sendLead";

gsap.registerPlugin(ScrollTrigger);

/*
  Contact — фінальна секція (id="contact"). Дані: contact{} з JSON.
  Форма надсилає заявку в Telegram через server action sendLead (токен на сервері).
  Стани: idle → pending → success | error. При помилці — фолбек на Direct/телефон.
  Моушен: fade-in секції.
*/

const C = data.contact;
const initialState = { ok: null };

export default function Contact() {
  const rootRef = useRef(null);
  const [state, formAction, pending] = useActionState(sendLead, initialState);
  const sent = state?.ok === true;
  const failed = state?.ok === false;

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

  return (
    <section
      ref={rootRef}
      id="contact"
      className="section-shell section-shell--bordered"
      aria-label="Контакт"
      style={{ paddingTop: "clamp(80px, 14vh, 180px)", paddingBottom: "clamp(80px, 14vh, 180px)" }}
    >
      <div className="contact-grid" style={S.grid}>
        {/* ліворуч — заклик + контакти */}
        <div style={S.left}>
          <p className="kicker" data-reveal>
            Контакт
          </p>
          <h2 className="headline" data-reveal>
            Знайдемо те, що працює <b>саме для вас</b>
          </h2>
          <p className="subhead" data-reveal style={{ maxWidth: "none" }}>
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

        {/* праворуч — форма (success → підтвердження; решта — форма з можливою помилкою) */}
        {sent ? (
          <div data-reveal style={S.sentBox} role="status" aria-live="polite">
            <p style={S.sentTitle}>Дякуємо! Заявку отримано.</p>
            <p style={S.sentText}>
              Звʼяжемося з вами протягом робочого дня. Хочете швидше — напишіть
              напряму в Direct або зателефонуйте.
            </p>
            <div style={S.sentActions}>
              <a
                href={C.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="field"
                style={S.submit}
              >
                Написати в Direct
              </a>
              <a href={`tel:${C.phone.replace(/\s/g, "")}`} style={S.sentTel}>
                {C.phone}
              </a>
            </div>
          </div>
        ) : (
          <form data-reveal style={S.form} action={formAction}>
            <label style={S.label}>
              Ім'я
              <input name="name" required className="field" style={S.input} autoComplete="name" />
            </label>
            <label style={S.label}>
              Телефон або контакт
              <input
                name="contact"
                required
                className="field"
                style={S.input}
                placeholder="+380 / @нік"
              />
            </label>
            <label style={S.label}>
              Повідомлення
              <textarea
                name="message"
                rows={4}
                className="field"
                style={{ ...S.input, resize: "vertical" }}
                placeholder="Що шукаєте?"
              />
            </label>
            <button
              type="submit"
              className="field"
              style={{ ...S.submit, opacity: pending ? 0.7 : 1 }}
              disabled={pending}
            >
              {pending ? "Надсилаємо…" : "Надіслати заявку"}
            </button>

            {failed && (
              <div style={S.errBox} role="alert" aria-live="assertive">
                {state.message ||
                  "Не вдалося надіслати. Напишіть нам напряму — так найшвидше:"}
                <div style={S.errActions}>
                  <a
                    href={C.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={S.errLink}
                  >
                    {C.instagramHandle}
                  </a>
                  <a href={`tel:${C.phone.replace(/\s/g, "")}`} style={S.errLink}>
                    {C.phone}
                  </a>
                </div>
              </div>
            )}

            <p style={S.note}>
              Не передаємо ваші дані третім особам. Відповідаємо протягом робочого дня.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

const S = {
  grid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "clamp(40px, 7vw, 110px)",
    alignItems: "start",
  },
  left: { maxWidth: 520 },
  contacts: { marginTop: 40, display: "flex", flexDirection: "column", gap: 16 },
  contactLink: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontSize: "clamp(22px, 2.2vw, 32px)",
    fontWeight: 300,
    color: "var(--text-1)",
    textDecoration: "none",
    width: "fit-content",
    borderBottom: "1px solid var(--accent-line)",
    paddingBottom: 4,
  },
  city: { fontSize: 14, letterSpacing: "0.1em", color: "var(--text-4)" },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-4)",
  },
  input: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "var(--r-sharp)",
    padding: "14px 16px",
    color: "var(--text-1)",
    fontSize: 16,
    fontFamily: "inherit",
  },
  submit: {
    marginTop: 8,
    background: "var(--accent)",
    color: "var(--obsidian)",
    border: "none",
    borderRadius: "var(--r-sharp)",
    padding: "17px 28px",
    fontSize: 13,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontWeight: 600,
    cursor: "pointer",
  },
  note: { margin: 0, fontSize: 12, color: "var(--text-4)", lineHeight: 1.5 },
  sentBox: {
    border: "1px solid var(--accent-line)",
    borderRadius: "var(--r-card)",
    padding: "clamp(28px, 4vw, 44px)",
    background: "var(--surface-1)",
  },
  sentTitle: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: 300,
    fontSize: "clamp(24px, 2.4vw, 34px)",
    margin: 0,
    color: "var(--text-1)",
  },
  sentText: {
    marginTop: 14,
    fontSize: "clamp(15px, 1.3vw, 17px)",
    fontWeight: 300,
    lineHeight: 1.6,
    color: "var(--text-3)",
  },
  sentActions: {
    marginTop: 28,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 20,
  },
  sentTel: {
    fontSize: 16,
    color: "var(--text-2)",
    textDecoration: "none",
    borderBottom: "1px solid var(--accent-line)",
    paddingBottom: 3,
  },
  errBox: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "var(--text-2)",
    border: "1px solid rgba(232,163,92,0.5)",
    borderRadius: "var(--r-card)",
    padding: "16px 18px",
    background: "rgba(232,163,92,0.06)",
  },
  errActions: { display: "flex", flexWrap: "wrap", gap: 18, marginTop: 12 },
  errLink: {
    color: "var(--lamp-glow)",
    textDecoration: "none",
    borderBottom: "1px solid var(--accent-line)",
    paddingBottom: 2,
  },
};
