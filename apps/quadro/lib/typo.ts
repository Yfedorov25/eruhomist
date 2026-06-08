// Ukrainian micro-typography. Binds "hanging" short words / numbers / separators with a
// non-breaking space so a 1-2 letter preposition or conjunction (в, з, у, і, а, та, що, як, до,
// на…) or a number never dangles at the end of a line. Applied centrally in getMessages so it
// covers ALL i18n copy. NEVER inserts a dash (project rule: zero em-dashes in visible copy).
const NBSP = String.fromCharCode(160);

export function typo(s: string): string {
  return s
    .replace(/(?<=^|\s)([а-яіїєґА-ЯІЇЄҐ\d]{1,2})\s+/gu, `$1${NBSP}`)
    .replace(/(\d)\s+(?=[а-яіїєґА-ЯІЇЄҐ°%²³])/gu, `$1${NBSP}`)
    .replace(/\s+·\s+/g, `${NBSP}·${NBSP}`);
}

// Recursively apply typo() to every string value in an i18n messages object.
export function typoDeep<T>(v: T): T {
  if (typeof v === "string") return typo(v) as unknown as T;
  if (Array.isArray(v)) return v.map(typoDeep) as unknown as T;
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const k in v as Record<string, unknown>) out[k] = typoDeep((v as Record<string, unknown>)[k]);
    return out as T;
  }
  return v;
}
