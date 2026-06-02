"use client";

import { useActionState } from "react";
import { sendLead, type LeadResult } from "@/app/[locale]/actions/sendLead";
import type { Messages } from "@/lib/i18n";
import { conversion } from "@/lib/conversion";

// S7 form. States: idle / submitting / success (replaces form) / error (inline +
// honest fallback to phone/Direct on a config/network failure — never fakes success).
export function ContactForm({ m, locale }: { m: Messages; locale: string }) {
  const [state, formAction, pending] = useActionState<LeadResult | null, FormData>(
    sendLead,
    null,
  );

  if (state?.ok) {
    return (
      <p className="font-display text-2xl text-[var(--accent)]" role="status">
        {m.cta.form.success}
      </p>
    );
  }

  const fieldError =
    state && !state.ok && (state.error === "fill" || state.error === "length");
  const consentError = state && !state.ok && state.error === "consent";
  // A delivery failure (config/api/network) — show the form again but surface a fallback.
  const deliveryFailed =
    state && !state.ok && !["fill", "length"].includes(state.error);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          {m.cta.form.name}
        </span>
        <input
          name="name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          className="border-b border-[var(--ink-muted)]/40 bg-transparent py-3 text-lg text-[var(--ink)] outline-none transition-colors focus:border-[var(--accent)]"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          {m.cta.form.phone}
        </span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          required
          maxLength={100}
          autoComplete="tel"
          className="border-b border-[var(--ink-muted)]/40 bg-transparent py-3 text-lg text-[var(--ink)] outline-none transition-colors focus:border-[var(--accent)]"
        />
      </label>

      {fieldError && (
        <p className="text-sm text-[var(--ink-muted)]" role="alert">
          {state && !state.ok && state.error === "fill"
            ? m.cta.form.errorName
            : m.cta.form.errorPhone}
        </p>
      )}

      {/* Personal-data consent (Ukraine PDPL). Required; also enforced server-side. */}
      <label className="flex items-start gap-3 text-sm leading-snug text-[var(--ink-muted)]">
        <input
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
        />
        <span>
          {m.cta.form.consent}.{" "}
          <a
            href={`/${locale}/privacy`}
            className="underline decoration-[var(--ink-muted)]/40 underline-offset-2 hover:text-[var(--ink)]"
          >
            {m.cta.form.consentLink}
          </a>
        </span>
      </label>

      {consentError && (
        <p className="text-sm text-[var(--ink-muted)]" role="alert">
          {m.cta.form.errorConsent}
        </p>
      )}

      {deliveryFailed && (
        // Honest fallback — never fakes success. Shows the real contact if supplied
        // (conversion.phone/telegram), otherwise a generic ask to try again.
        <p className="text-sm text-[var(--ink-muted)]" role="alert">
          {conversion.phone || conversion.telegram
            ? `${m.cta.form.errorPhone} ${[conversion.phone, conversion.telegram].filter(Boolean).join(" · ")}`
            : m.cta.form.errorPhone}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 min-h-[44px] self-start border border-[var(--accent)] px-8 py-3 text-sm uppercase tracking-[0.2em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--deep)] disabled:opacity-50"
      >
        {pending ? "…" : m.cta.form.submit}
      </button>
    </form>
  );
}
