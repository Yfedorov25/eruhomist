"use client";

import { useActionState, useEffect } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { sendLead, type LeadResult } from "@/app/actions/sendLead";
import { CONTACT, phoneReady } from "@/lib/site";
import { trackCall, trackFormSubmit } from "@/lib/analytics";

// 08 · CTA — the main conversion. Calm, dignified, no pressure. Primary = the call (tel: +
// magnetic button); secondary = a 3-field callback form → Telegram (server action). Human
// microcopy from COPY (no "Error"). Analytics fire on call-click and form submit.
// Error messages map to the human lines from COPY §МІКРОКОПІ.
const ERRORS: Record<string, string> = {
  fill: "Заповніть, будь ласка, імʼя і номер.",
  phone: "Здається, у номері загубилася цифра. Перевірте, будь ласка.",
  length: "Трохи задовгий запис — скоротіть, будь ласка.",
  consent: "Підтвердіть згоду на обробку даних, будь ласка.",
  config: "Форма тимчасово недоступна. Зателефонуйте, будь ласка.",
  api: "Не вдалося надіслати. Спробуйте ще раз або зателефонуйте.",
  network: "Зникло зʼєднання. Спробуйте ще раз, будь ласка.",
};

export default function CTA() {
  const [state, formAction, pending] = useActionState<LeadResult | null, FormData>(sendLead, null);

  useEffect(() => {
    if (state?.ok) trackFormSubmit(true);
    else if (state && !state.ok) trackFormSubmit(false);
  }, [state]);

  const ready = phoneReady();

  return (
    <section id="cta" className="relative overflow-hidden bg-night py-[16vh]" aria-label="Звʼязатися — записатися на перегляд">
      {/* Warm evening backdrop (subtle, behind a heavy scrim). */}
      <Image
        src="/images/exterior-night-2.webp"
        alt=""
        fill
        sizes="100vw"
        loading="lazy"
        aria-hidden
        className="object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-[var(--color-night)]/70" aria-hidden />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-2 lg:items-center">
        {/* Left — the invitation + the call */}
        <Reveal>
          <p data-reveal-child className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
            Перегляд
          </p>
          <h2
            data-reveal-child
            className="text-balance text-[clamp(2rem,5vw,3.4rem)] font-normal leading-[1.12] tracking-[-0.02em] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Це з тих домів, які треба відчути ногами
          </h2>
          <p data-reveal-child className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
            Один будинок. Один господар. Якщо відгукнулося — приїдьте, постійте на терасі,
            послухайте воду. Решту зрозумієте самі.
          </p>

          <div data-reveal-child className="mt-9">
            {ready ? (
              <MagneticButton
                href={`tel:${CONTACT.phoneTel}`}
                onClick={() => trackCall("cta")}
                ariaLabel={`Зателефонувати ${CONTACT.phoneDisplay}`}
                className="inline-flex items-center gap-3 rounded-full bg-[var(--color-warm)] px-8 py-4 text-sm font-medium uppercase tracking-[0.14em] text-[var(--color-night)] will-change-transform"
              >
                Зателефонувати
                <span className="font-normal tracking-normal">{CONTACT.phoneDisplay}</span>
              </MagneticButton>
            ) : (
              // No real number yet — show it as text TODO and lead with the form.
              <p className="text-sm text-[var(--color-text-muted)]">
                Телефон:{" "}
                <span className="text-[var(--color-text)]">{CONTACT.phoneDisplay}</span>{" "}
                <span className="text-[var(--color-warm)]/60">(уточнюється)</span>
              </p>
            )}
          </div>
        </Reveal>

        {/* Right — callback form (3 fields) */}
        <Reveal>
          <div data-reveal-child className="rounded-sm border border-[var(--color-warm)]/15 bg-[var(--color-brick)]/30 p-7 backdrop-blur-sm">
            <p className="text-lg text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
              Передзвоніть мені
            </p>
            {/* Owner signature (psych P0 — biggest trust lever): the buyer wants to know a person
                answers, not an agent farm. Names the owner when provided, role-only meanwhile. */}
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {CONTACT.ownerName
                ? `Відповідає ${CONTACT.ownerName}, господар будинку. Передзвонимо протягом дня.`
                : "Відповідає господар будинку особисто. Передзвонимо протягом дня."}
            </p>

            {state?.ok ? (
              <p className="mt-5 text-base text-[var(--color-warm)]">
                Дякуємо. Передзвонимо у зручний час.
              </p>
            ) : (
              <form action={formAction} className="mt-5 space-y-4">
                {/* Field order (psych): name → WHEN → phone. Asking "when" before the phone number
                    frames the exchange as scheduling on the buyer's terms, not number-capture. */}
                <Field name="name" label="Як до Вас звертатися" type="text" autoComplete="name" />
                <Field name="when" label="Коли Вам зручно" type="text" required={false} />
                <Field name="phone" label="Номер телефону" type="tel" autoComplete="tel" inputMode="tel" />

                {state && !state.ok ? (
                  <p className="text-sm text-[#d98a6a]">{ERRORS[state.error] ?? ERRORS.api}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-full bg-[var(--color-warm)] px-6 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-[var(--color-night)] transition-opacity duration-300 disabled:opacity-60"
                >
                  {pending ? "Надсилаємо…" : "Передзвоніть мені"}
                </button>

                {/* Consent as fine-print UNDER the submit (PDPL-valid, lower friction than a
                    blocking checkbox before the button). Still required server-side. */}
                <label className="flex items-start gap-2.5 text-xs leading-relaxed text-[var(--color-text-muted)]">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--color-warm)]"
                  />
                  <span>
                    Натискаючи кнопку, погоджуюся на обробку даних для звʼязку щодо цього обʼєкта.
                    Передзвонимо у вказаний час. Без розсилок.
                  </span>
                </label>
              </form>
            )}
          </div>
        </Reveal>
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
      {/* Sentence-case (not uppercase): the form should feel like a private conversation,
          not a contract. Uppercase tracking stays the brand voice everywhere ELSE. */}
      <span className="mb-1.5 block text-[13px] text-[var(--color-text-muted)]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="w-full rounded-sm border border-[var(--color-warm)]/20 bg-[var(--color-night)]/40 px-4 py-3 text-[var(--color-text)] outline-none transition-colors duration-300 placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-warm)]/60"
      />
    </label>
  );
}
