import { Reveal } from "@/components/ui/Reveal";
import { FACTS, CONTACT, STATUS, phoneReady } from "@/lib/site";

// 09 · ФУТЕР — calm close. Price + phone + address are real text in SSR (SEO + no-JS). Final
// brand line carries the concept word «власний берег». Whoever scrolled here is serious — give
// them everything to act. (tel: rendered server-side; the phone is a TODO placeholder until set.)
export default function Footer() {
  const ready = phoneReady();
  const year = STATUS.year || new Date().getFullYear();

  return (
    <footer className="relative bg-[#0b0b0a] py-[12vh]" aria-label="Контакти й ціна">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="border-b border-[var(--color-warm)]/12 pb-14">
          <h2
            data-reveal-child
            className="max-w-2xl text-balance text-[clamp(2.2rem,5.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Дім чекає на свого господаря.
          </h2>
          {/* The site's emotional thesis gets one adjacent action (psych: close the narrative
              into a step). Links to the live callback path while the phone is pending. */}
          <a
            data-reveal-child
            href={ready ? `tel:${CONTACT.phoneTel}` : "#cta"}
            className="mt-6 inline-block text-base text-[var(--color-warm)]/80 transition-colors duration-300 hover:text-[var(--color-warm)]"
          >
            Якщо це про Вас — зустріньмося на терасі.
          </a>
        </Reveal>

        <div className="grid gap-10 pt-12 md:grid-cols-3">
          {/* Price */}
          <Reveal>
            <p data-reveal-child className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
              Ціна
            </p>
            <p data-reveal-child className="mt-3 text-3xl font-light text-[var(--color-warm)]">
              ${FACTS.priceUsd.toLocaleString("uk-UA")}
            </p>
            <p data-reveal-child className="mt-2 text-sm text-[var(--color-text-muted)]">
              готівка або безготівка · можливий обмін із доплатою
            </p>
            {/* Self-anchor (psych P1): unit economics let the buyer justify the value internally —
                ~$1800/m² with the riverbank included, vs city apartments at a similar rate. */}
            <p data-reveal-child className="mt-1 text-xs text-[var(--color-text-muted)]/70">
              ділянка 10 соток + ~4 сотки берега · у вартість
            </p>
          </Reveal>

          {/* Contacts */}
          <Reveal>
            <p data-reveal-child className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
              Контакти
            </p>
            <div data-reveal-child className="mt-3 space-y-1.5 text-[var(--color-text)]">
              {ready ? (
                <a href={`tel:${CONTACT.phoneTel}`} className="block text-lg hover:text-[var(--color-warm)]">
                  {CONTACT.phoneDisplay}
                </a>
              ) : (
                <span className="block text-lg">
                  {CONTACT.phoneDisplay}{" "}
                  <span className="text-sm text-[var(--color-warm)]/60">(уточнюється)</span>
                </span>
              )}
              {CONTACT.telegram ? (
                <span className="block text-sm text-[var(--color-text-muted)]">Telegram / Viber: {CONTACT.telegram}</span>
              ) : null}
              <span className="block text-sm text-[var(--color-text-muted)]">{FACTS.address}</span>
              {/* Trust signal for the privacy-seeking buyer: no agent chain, no broker cut. */}
              <span className="block pt-1 text-sm text-[var(--color-warm)]/70">
                Без посередників · приватна особа
              </span>
            </div>
          </Reveal>

          {/* Concept line */}
          <Reveal>
            <p data-reveal-child className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
              Власний берег
            </p>
            <p data-reveal-child className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
              Єдиний дім у Вінниці, де власний берег Бугу починається там, де закінчується Ваша
              тераса.
            </p>
          </Reveal>
        </div>

        <p className="mt-16 text-xs text-[var(--color-text-muted)]/70">
          Дім на Нагірній · Вінниця · {year}
        </p>
      </div>
    </footer>
  );
}
