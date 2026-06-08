// Ukrainian micro-typography. Binds "hanging" short words / numbers / separators with a
// non-breaking space so a 1-2 letter preposition or conjunction (в, з, у, і, а, та, що, як, до,
// на…) or a number never dangles at the end of a line. SSR-safe (operates on the string at
// render -> no client reflow / CLS). Lookbehind handles consecutive short words ("а з тераси").
//
// PROJECT RULE: zero em-dashes in visible copy (Fedoriv tone) -> this NEVER inserts a dash, only
// the nbsp. Hyphenation is left off on purpose (browser uk-hyphenation is unreliable;
// text-wrap:pretty in globals.css handles widows/raggedness instead).
const NBSP = String.fromCharCode(160); // non-breaking space ( ), unambiguous

export function typo(s: string): string {
  return s
    // 1-2 letter word -> bind to the next word
    .replace(/(?<=^|\s)([а-яіїєґА-ЯІЇЄҐ\d]{1,2})\s+/gu, `$1${NBSP}`)
    // number -> its unit / following word (45 м², 10 соток)
    .replace(/(\d)\s+(?=[а-яіїєґА-ЯІЇЄҐ°%²³])/gu, `$1${NBSP}`)
    // middot separator never alone at a line edge
    .replace(/\s+·\s+/g, `${NBSP}·${NBSP}`);
}
