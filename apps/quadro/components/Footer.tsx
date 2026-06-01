import type { Locale, Messages } from "@/lib/i18n";
import { LangSwitch } from "./LangSwitch";

export function Footer({ locale, m }: { locale: Locale; m: Messages }) {
  return (
    <footer className="border-t border-[var(--fg-muted)]/15 px-6 py-12 text-sm text-[var(--fg-muted)] md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <span className="font-display text-base tracking-[0.3em] text-[var(--fg)]">
          {m.footer.rights}
        </span>
        <span>{m.footer.location}</span>
        <LangSwitch current={locale} />
      </div>
    </footer>
  );
}
