"use client";

import { useActionState, useRef } from "react";
import data from "@/content/eruhomist-data.json";
import { sendLead } from "@/app/actions/sendLead";
import { useReveal } from "@/components/useReveal";

/*
  Contact — фінальна секція (id="contact"). Дані: contact{} з JSON.
  Форма надсилає заявку в Telegram через server action sendLead (токен на сервері).
  Стани: idle → pending → success | error. При помилці — фолбек на Direct/телефон.
  Reveal: useReveal на data-anim. Логіка форми (useActionState/formAction/sendLead) — недоторкана.
*/

const C = data.contact;
const initialState = { ok: null };

export default function Contact() {
  const rootRef = useRef(null);
  const [state, formAction, pending] = useActionState(sendLead, initialState);
  const sent = state?.ok === true;
  const failed = state?.ok === false;

  useReveal(rootRef, { stagger: 0.12 });

  return (
    <section
      ref={rootRef}
      id="contact"
      className="section-shell section-shell--bordered section-shell--air"
      aria-label="Контакт"
    >
      <div className="contact-grid" style={S.grid}>
        {/* ліворуч — заклик + контакти */}
        <div style={S.left}>
          <p className="kicker" data-anim="blur">
            Контакт
          </p>
          <h2 className="headline" data-anim="rise">
            Знайдемо те, що працює <b>саме для вас</b>
          </h2>
          <p className="subhead" data-anim="blur" style={{ maxWidth: "none" }}>
            Напишіть або зателефонуйте — підберемо рішення під ваші цілі: для
            життя, оренди чи інвестицій.
          </p>

          {/* Ієрархія: телефон — головний (display, важчий), IG — вторинний (sans, легший). */}
          <div data-anim="blur" style={S.contacts}>
            <a
              href={`tel:${C.phone.replace(/\s/g, "")}`}
              className="cta-line tnum"
              style={S.phoneLink}
              aria-label={`Зателефонувати ${C.phone}`}
            >
              <span style={S.phoneLabel}>Зателефонувати</span>
              <span style={S.phoneNumber}>{C.phone}</span>
            </a>

            <a
              href={C.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-line"
              style={S.igLink}
            >
              <span style={S.igLabel}>Direct в Instagram</span>
              <span style={S.igHandle}>
                {C.instagramHandle}{" "}
                <span className="arrow" aria-hidden>
                  →
                </span>
              </span>
            </a>

            <span style={S.city}>{C.city}</span>
          </div>
        </div>

        {/* праворуч — форма (success → підтвердження; решта — форма з можливою помилкою) */}
        {sent ? (
          <div data-anim="rise" style={S.sentBox} role="status" aria-live="polite">
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
                className="field cta-fill"
                style={S.submit}
              >
                Написати в Direct
              </a>
              <a
                href={`tel:${C.phone.replace(/\s/g, "")}`}
                className="cta-line tnum"
                style={S.sentTel}
              >
                {C.phone}
              </a>
            </div>
          </div>
        ) : (
          <form data-anim="rise" style={S.form} action={formAction}>
            <label style={S.label}>
              Ім'я
              <input
                name="name"
                required
                className="field"
                style={S.input}
                autoComplete="name"
              />
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
              className="field cta-fill"
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
                  <a
                    href={`tel:${C.phone.replace(/\s/g, "")}`}
                    className="tnum"
                    style={S.errLink}
                  >
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

  // Контакт-блок: телефон головний, IG вторинний, місто — caption.
  contacts: {
    marginTop: 44,
    display: "flex",
    flexDirection: "column",
    gap: 28,
    alignItems: "flex-start",
  },

  // Головний канал — телефон. Стек: каптіон зверху + великий display-номер.
  phoneLink: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    color: "var(--text-1)",
    textDecoration: "none",
    width: "fit-content",
  },
  phoneLabel: {
    fontSize: 11,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
    color: "var(--text-4)",
  },
  phoneNumber: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontSize: "clamp(28px, 3.2vw, 44px)",
    fontWeight: 300,
    lineHeight: 1.1,
    color: "var(--text-1)",
    borderBottom: "1px solid var(--accent-line)",
    paddingBottom: 6,
    letterSpacing: "-0.01em",
  },

  // Вторинний канал — IG. Менший розмір, sans, легша вага.
  igLink: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    color: "var(--text-2)",
    textDecoration: "none",
    width: "fit-content",
  },
  igLabel: {
    fontSize: 11,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
    color: "var(--text-4)",
  },
  igHandle: {
    fontSize: "clamp(16px, 1.4vw, 19px)",
    fontWeight: 400,
    color: "var(--text-2)",
    letterSpacing: "0.01em",
  },

  city: {
    fontSize: 12,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: "var(--text-4)",
    marginTop: 4,
  },

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
    background: "var(--lamp-glow)",
    color: "var(--obsidian)",
    border: "none",
    borderRadius: "var(--r-sharp)",
    padding: "17px 28px",
    fontSize: 13,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
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
