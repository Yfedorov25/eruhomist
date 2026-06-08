import { Reveal } from "@/components/ui/Reveal";
import { DrawAccent } from "@/components/ui/DrawAccent";
import { CountUp } from "@/components/ui/CountUp";
import { FACTS, STATUS } from "@/lib/site";
import { typo } from "@/lib/typo";

// 07 · ФАКТИ + СТАТУС — the rational beat (numbers + open price) before the §06 location peak
// and the ask. Honest, dignified, open price.
// count-up on scroll-into-view (reduced-motion → instant). Semantic <dl> for SEO/a11y: the
// numbers are real text (the CountUp span is aria-hidden, the <dd> carries the accessible value).
const STATS = [
  { value: FACTS.areaHouse, decimals: 0, unit: "м²", label: "площа будинку", a11y: "150 м²" },
  { value: FACTS.plotSotky, decimals: 0, unit: "соток", label: "ділянка", a11y: "10 соток" },
  { value: FACTS.bankSotky, decimals: 0, prefix: "~", unit: "сотки", label: "власний берег", a11y: "близько 4 соток" },
  { value: FACTS.bedrooms, decimals: 0, unit: "", label: "спальні", a11y: "3" },
  { value: FACTS.floors, decimals: 0, unit: "", label: "поверх", a11y: "1" },
];

export default function Facts() {
  return (
    <section className="relative bg-night pt-[14vh] pb-[16vh]" aria-label="Факти про будинок">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-14 max-w-3xl">
          <p data-reveal-child className="mb-3 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
            Факти
          </p>
          <DrawAccent className="mb-5" />
          <h2
            data-reveal-child
            className="text-balance text-[clamp(2rem,5vw,3.4rem)] font-normal leading-[1.12] tracking-[-0.02em] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Те, що можна виміряти.
          </h2>
        </Reveal>

        {/* Stats grid — semantic dl. */}
        <Reveal as="dl" className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3 lg:grid-cols-5" stagger={0.07}>
          {STATS.map((s) => (
            <div key={s.label} data-reveal-child>
              <dt className="sr-only">{s.label}</dt>
              <dd className="m-0">
                <span className="flex items-baseline gap-1.5 text-[clamp(2.6rem,5vw,3.6rem)] font-light leading-none text-[var(--color-warm)]">
                  <CountUp value={s.value} decimals={s.decimals} prefix={s.prefix} />
                  {/* accessible real value (CountUp span is aria-hidden) */}
                  <span className="sr-only">{s.a11y}</span>
                  {s.unit ? <span className="text-[0.5em] tracking-[0.05em] text-[var(--color-warm)]/70">{s.unit}</span> : null}
                </span>
                <span className="mt-3 block text-sm text-[var(--color-text-muted)]">{s.label}</span>
              </dd>
            </div>
          ))}
        </Reveal>

        {/* Price — open, calm, accent. */}
        <Reveal className="mt-16 flex flex-col gap-8 border-t border-[var(--color-warm)]/12 pt-12 md:flex-row md:items-end md:justify-between">
          <div data-reveal-child>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-muted)]">Ціна, відкрито</p>
            <p className="mt-3 text-[clamp(2.4rem,6vw,4rem)] font-light leading-none text-[var(--color-warm)]">
              ${FACTS.priceUsd.toLocaleString("uk-UA")}
            </p>
          </div>
          <div data-reveal-child className="max-w-md">
            <p className="text-base leading-relaxed text-[var(--color-text)]">{typo(STATUS.line)}</p>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              {typo("За бажанням: басейн, сауна, камін, пірс.")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
