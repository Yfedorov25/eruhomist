"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeReady, type Locale } from "@/lib/i18n";

// Switches the leading /[locale] segment. EN is hidden until its copy lands
// (localeReady.en) so visitors never land on a page of empty strings.
export function LangSwitch({ current }: { current: Locale }) {
  const pathname = usePathname();
  const targets = locales.filter((l) => l !== current && localeReady[l]);
  if (targets.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em]">
      {targets.map((l) => {
        const href = pathname.replace(/^\/[^/]+/, `/${l}`);
        return (
          <Link key={l} href={href} className="opacity-70 transition-opacity hover:opacity-100">
            {l}
          </Link>
        );
      })}
    </div>
  );
}
