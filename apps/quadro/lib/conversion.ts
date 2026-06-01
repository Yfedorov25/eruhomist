// Conversion content (UC2 from the /autoplan review). USER-SUPPLIED — do NOT invent.
// Fill these in and the matching UI slots appear automatically; left empty, the slots
// stay hidden (no placeholder text ships). CLAUDE.md forbids generating this copy.

export type FloorPlan = { title: string; area: string; src: string };

export const conversion = {
  // e.g. "від $185 000" — anchor price. Empty string = hidden.
  priceFrom: "",

  // visible tap-to-call. Also used as the form's failure-state fallback contact.
  // e.g. "+380 67 000 00 00". Empty = hidden + form falls back to a generic message.
  phone: "",
  telegram: "", // e.g. "@quadro_house" — optional Direct fallback

  // developer / trust block. Empty title = whole block hidden.
  developer: {
    name: "", // e.g. "Забудовник: ..."
    blurb: "", // 1-2 sentences of track record / trust
    logo: "", // optional /path.svg
  },

  // 4 floor plans. Empty array = section hidden. Put images in public/plans/.
  floorPlans: [] as FloorPlan[],
};

export const hasConversionExtras =
  !!conversion.priceFrom || !!conversion.phone || !!conversion.developer.name;
