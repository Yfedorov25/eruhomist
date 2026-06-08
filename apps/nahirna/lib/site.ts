// Single source of truth for facts + contact. Exact data is from CLAUDE.md / COPY (do NOT
// change price/area/address). Placeholders are flagged TODO_CLIENT and centralized here so
// they swap in one place when the client answers (anti-slop: never invent these inline).

export const FACTS = {
  priceUsd: 300000,
  areaHouse: 150, // м²
  plotSotky: 10, // соток
  bankSotky: 4, // ~соток власного берега
  terrace: 29.83, // м²
  kitchenLiving: 45, // м²
  carport: 36.92, // м²
  bedrooms: 3,
  floors: 1,
  address: "вул. Нагірна, Вінниця",
  river: "Південний Буг",
} as const;

// Exact room data from the Archicad plan (COPY §04) — used by the interactive floorplan.
// Order roughly matches the plan's reading order. Areas are exact; never round/invent.
export const ROOMS = [
  { id: "kitchen", name: "Кухня-вітальня", area: 45.0, sells: true, look: "на терасу й Буг" },
  { id: "terrace", name: "Тераса", area: 29.83, sells: true, look: "на воду" },
  { id: "carport", name: "Навіс під авто", area: 36.92, look: "окремо від будинку" },
  { id: "corridor", name: "Коридор", area: 17.53 },
  { id: "master", name: "Майстер-спальня", area: 16.65, sells: true, look: "власний санвузол + гардероб" },
  { id: "bed2", name: "Спальня", area: 14.43 },
  { id: "room", name: "Кімната", area: 13.41 },
  { id: "wardrobe-c", name: "Гардероб (центр.)", area: 9.36 },
  { id: "porch", name: "Ганок", area: 9.02 },
  { id: "hall", name: "Прихожа", area: 6.21 },
  { id: "boiler", name: "Топкова", area: 6.15 },
  { id: "bath1", name: "Санвузол", area: 6.09 },
  { id: "bath2", name: "Санвузол (майстер)", area: 5.82 },
  { id: "wardrobe-m", name: "Гардероб (майстер)", area: 5.48 },
] as const;

// ⚠️ TODO_CLIENT — real values pending. Until provided, the phone link is disabled in the
// UI (shown as text only) and unverified POIs stay hidden. Do NOT publish invented numbers.
export const CONTACT = {
  // Set to the real number (digits only for tel:, formatted for display) when the client gives it.
  phoneTel: "", // e.g. "+380679891251" — empty = TODO, link disabled
  phoneDisplay: "+380 XX XXX XX XX", // TODO_CLIENT
  telegram: "", // TODO_CLIENT — "@..."
  viber: "", // TODO_CLIENT
  // Who answers the call/form. A named owner is the biggest trust signal for this buyer
  // (psych scan P0). TODO_CLIENT: replace with the real first name when provided.
  ownerName: "", // e.g. "Олександр" — empty = show the role only ("господар будинку")
} as const;

export const phoneReady = (): boolean => CONTACT.phoneTel.trim().length > 0;

// Location POIs. Only `verified: true` rows render; the rest stay hidden behind this flag
// until the client confirms a real distance (council: a fake/vague map kills trust).
export const POIS = [
  { id: "bank", label: "Власний берег", value: "0 хвилин", note: "Він просто внизу.", verified: true },
  { id: "center", label: "Центр Вінниці", value: "TODO_CLIENT", note: "хв авто", verified: false },
  { id: "school", label: "Школа й садок", value: "TODO_CLIENT", note: "хв", verified: false },
] as const;

// Completion year / status — TODO_CLIENT. Status copy (honest tone) is safe to show now.
export const STATUS = {
  year: "", // TODO_CLIENT
  line: "Зараз завершують фасад і ставлять огорожу. Будинок на фінішній прямій.",
} as const;
