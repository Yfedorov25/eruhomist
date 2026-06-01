import uk from "@/messages/uk.json";
import en from "@/messages/en.json";

export const locales = ["uk", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "uk";

// uk.json is the canonical shape; en.json mirrors its keys with empty-string leaves
// until real EN copy lands. Types come from the UK dictionary.
export type Messages = typeof uk;

const dictionaries: Record<Locale, Messages> = { uk, en: en as Messages };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Which locales have real copy. EN is stubbed (empty leaves) — the switch to it
// stays hidden in the UI until this flips. Flip when messages/en.json is filled.
export const localeReady: Record<Locale, boolean> = { uk: true, en: false };

// String getter with UK fallback for empty/missing EN leaves, so a partially
// translated EN page never renders "" — it shows the UK string instead.
export function makeT(locale: Locale) {
  const dict = getMessages(locale);
  const fallback = getMessages(defaultLocale);
  return function t(path: string): string {
    const value = read(dict, path);
    if (typeof value === "string" && value.length > 0) return value;
    const fb = read(fallback, path);
    return typeof fb === "string" ? fb : "";
  };
}

function read(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
