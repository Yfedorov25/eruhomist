import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getMessages } from "@/lib/i18n";
import { richText, paragraphs } from "@/lib/format";
import { conversion } from "@/lib/conversion";

// /privacy — personal-data policy (placeholder, to be vetted by a lawyer before public
// launch). Plain readable page on the stable evening surface; no scroll choreography.
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  const p = m.privacy;

  return (
    <main className="content-surface min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-28 md:px-12 md:py-36">
        <Link
          href={`/${locale}`}
          className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]"
        >
          ← {p.back}
        </Link>

        <h1 className="font-display mt-10 text-4xl leading-tight md:text-5xl">{p.title}</h1>
        <p className="mt-3 text-sm text-[var(--ink-muted)]">{p.updated}</p>

        <div className="mt-10 space-y-5 text-lg leading-relaxed text-[var(--ink-muted)]">
          {paragraphs(p.body).map((para, i) => (
            <p key={i}>{richText(para)}</p>
          ))}
        </div>

        {(conversion.phone || conversion.telegram) && (
          <div className="mt-12 border-t border-[var(--ink-muted)]/15 pt-8 text-[var(--ink-muted)]">
            {conversion.phone && (
              <a
                href={`tel:${conversion.phone.replace(/[^+\d]/g, "")}`}
                className="text-[var(--accent)]"
              >
                {conversion.phone}
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
