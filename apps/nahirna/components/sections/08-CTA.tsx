"use client";

import { useActionState, useEffect } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { DrawAccent } from "@/components/ui/DrawAccent";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { sendLead, type LeadResult } from "@/app/actions/sendLead";
import { CONTACT, FACTS, STATUS, phoneReady } from "@/lib/site";
import { typo } from "@/lib/typo";
import { trackCall, trackFormSubmit } from "@/lib/analytics";

// 08 · ФІНАЛ — the merged closing (was CTA + Footer). Award pattern: one crescendo screen that
// closes on the WATER (the «власний берег» promise, NOT the house again — the villa already
// appeared in §00/§02), bookending the hero ("Прокидатися від води" → "Прокидатися саме тут").
// Holds the conversion (callback form / call) + the footer essentials (price, contacts, concept)
// + a minimal footer line. Real text in SSR (SEO + no-JS): price, address.
const ERRORS: Record<string, string> = {
  fill: "Заповніть, будь ласка, імʼя і номер.",
  phone: "Здається, у номері загубилася цифра. Перевірте, будь ласка.",
  length: "Трохи задовгий запис, скоротіть, будь ласка.",
  consent: "Підтвердіть згоду на обробку даних, будь ласка.",
  config: "Форма тимчасово недоступна. Зателефонуйте, будь ласка.",
  api: "Не вдалося надіслати. Спробуйте ще раз або зателефонуйте.",
  network: "Зникло зʼєднання. Спробуйте ще раз, будь ласка.",
};

export default function CTA() {
  const [state, formAction, pending] = useActionState<LeadResult | null, FormData>(sendLead, null);
  const ready = phoneReady();
  const year = STATUS.year || "2026";

  useEffect(() => {
    if (state?.ok) trackFormSubmit(true);
    else if (state && !state.ok) trackFormSubmit(false);
  }, [state]);

  return (
    <section id="cta" className="relative overflow-hidden bg-night" aria-label="Звʼязатися — записатися на перегляд">
      {/* Backdrop = the house facade at night, eaves lit and windows warm — the final image before
          the call is the home itself at its most expensive hour ("here you could live"), which sells
          harder than abstract water. Lagged background parallax (dual-rate depth): the facade trails
          the content scrolling over it. */}
      <div className="absolute inset-[-6%]" data-parallax="14" data-parallax-lag="1.35" aria-hidden>
        <Image
          src="/images/gallery/facade-night.webp"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(15,15,14,0.95) 0%, rgba(15,15,14,0.82) 30%, rgba(15,15,14,0.5) 62%, rgba(15,15,14,0.55) 100%)" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-[10vh] pb-10">
        {/* Invite */}
        <Reveal className="max-w-3xl">
          <p data-reveal-child className="mb-3 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/85">
            Перегляд
          </p>
          <DrawAccent className="mb-6" />
          <h2
            data-reveal-child
            className="scrim-text text-balance text-[clamp(2.6rem,7vw,5.5rem)] font-normal leading-[0.98] tracking-[-0.02em] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Прокидатися саме тут.
          </h2>
          <p data-reveal-child className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text)]/90 md:text-lg">
            {typo("Такий берег у Вінниці один. Приїдьте, постійте на ньому, послухайте воду. Без агентів і без тиску. Далі Ви все зрозумієте самі.")}
          </p>
        </Reveal>

        {/* Conversion (left) + details (right) */}
        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          {/* Form / call */}
          <Reveal>
            <div data-reveal-child className="max-w-md rounded-sm border border-[var(--color-warm)]/15 bg-[var(--color-night)]/55 p-7 backdrop-blur-md">
              <p className="text-lg text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                Залиште номер
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {typo(
                  CONTACT.ownerName
                    ? `Відповідає ${CONTACT.ownerName}, господар. Без посередників. Передзвонимо сьогодні.`
                    : "Відповідає господар особисто, без посередників. Передзвонимо сьогодні.",
                )}
              </p>

              {state?.ok ? (
                <p className="mt-5 text-base text-[var(--color-warm)]">Дякуємо. Передзвонимо вам сьогодні.</p>
              ) : (
                <form action={formAction} className="mt-5 space-y-4">
                  <Field name="name" label="Як до Вас звертатися" type="text" autoComplete="name" />
                  <Field name="phone" label="Номер телефону" type="tel" autoComplete="tel" inputMode="tel" />
                  {state && !state.ok ? <p className="text-sm text-[#d98a6a]">{ERRORS[state.error] ?? ERRORS.api}</p> : null}
                  <button
                    type="submit"
                    disabled={pending}
                    className="group flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-warm)] px-6 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-[var(--color-night)] transition-[transform,opacity] duration-300 ease-[var(--ease-out-quad)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <span>{pending ? "Надсилаємо…" : "Хочу подивитися берег"}</span>
                    {!pending ? (
                      <span aria-hidden className="transition-transform duration-300 ease-[var(--ease-out-quad)] group-hover:translate-x-1 motion-reduce:transition-none">
                        →
                      </span>
                    ) : null}
                  </button>
                  <label className="flex items-start gap-2.5 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    <input type="checkbox" name="consent" required className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--color-warm)]" />
                    <span>Натискаючи кнопку, погоджуюся на обробку даних для звʼязку щодо цього обʼєкта. Без розсилок.</span>
                  </label>
                </form>
              )}
            </div>
          </Reveal>

          {/* Details (price · contacts · concept) */}
          <Reveal>
            <div data-reveal-child className="border-t border-[var(--color-warm)]/15 pt-7 lg:border-t-0 lg:pt-1">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-muted)]">Ціна, відкрито</p>
              <p className="mt-2 text-[clamp(2.6rem,4vw,3.4rem)] font-light leading-none text-[var(--color-warm)]">
                ${FACTS.priceUsd.toLocaleString("uk-UA")}
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {typo("Дім, ділянка 10 соток і ~4 сотки власного берега. Усе у вартості.")}
              </p>

              <div className="mt-7 border-t border-[var(--color-warm)]/12 pt-6">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-muted)]">Контакти</p>
                {ready ? (
                  <a href={`tel:${CONTACT.phoneTel}`} onClick={() => trackCall("footer")} className="mt-2 block text-lg text-[var(--color-text)] hover:text-[var(--color-warm)]">
                    {CONTACT.phoneDisplay}
                  </a>
                ) : (
                  <p className="mt-2 text-base leading-relaxed text-[var(--color-text)]">
                    {typo("Передзвонимо протягом дня. Залиште номер у формі поруч.")}
                  </p>
                )}
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{FACTS.address}</p>
              </div>

              <div className="mt-7 border-t border-[var(--color-warm)]/12 pt-6">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-muted)]">Власний берег</p>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {typo("Єдиний дім у Вінниці, де власний берег Бугу починається там, де закінчується Ваша тераса.")}
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Minimal footer line — essentials only, no giant wordmark. */}
        <div className="mt-[12vh] flex flex-wrap justify-between gap-3 border-t border-[var(--color-warm)]/12 pt-5 text-xs text-[var(--color-text-muted)]/70">
          <span>Вінниця · Південний Буг</span>
          <span>{year}</span>
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type,
  required = true,
  autoComplete,
  inputMode,
}: {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "tel" | "text";
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] text-[var(--color-text-muted)]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="w-full rounded-sm border border-[var(--color-warm)]/20 bg-[var(--color-night)]/40 px-4 py-3 text-base text-[var(--color-text)] outline-none transition-colors duration-300 placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-warm)]/60"
      />
    </label>
  );
}
