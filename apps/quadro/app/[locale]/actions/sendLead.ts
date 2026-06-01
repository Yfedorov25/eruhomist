"use server";

/*
  sendLead — server action: sends a QUADRO HOUSE lead to a Telegram chat.
  Adapted from apps/eruhomist/app/actions/sendLead.js — brand changed to QUADRO HOUSE,
  the contact field is "phone" (matches messages form.phone), ported to TypeScript.

  Token + chat_id live ONLY on the server (.env.local). See .env.local.example.
  Returns { ok: true } or { ok: false, error } — the UI shows a fallback (phone/Direct).
  It does NOT fake success when unconfigured.
*/

export type LeadResult = { ok: true } | { ok: false; error: string };

export async function sendLead(_prev: LeadResult | null, formData: FormData): Promise<LeadResult> {
  const name = (formData.get("name") || "").toString().trim();
  const phone = (formData.get("phone") || "").toString().trim();

  if (!name || !phone) return { ok: false, error: "fill" };
  if (name.length > 100 || phone.length > 100) return { ok: false, error: "length" };

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[sendLead] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set");
    return { ok: false, error: "config" };
  }

  const text =
    `🏠 *Нова заявка — QUADRO HOUSE*\n\n` +
    `*Імʼя:* ${escapeMd(name)}\n` +
    `*Телефон:* ${escapeMd(phone)}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[sendLead] Telegram API error", res.status, detail);
      return { ok: false, error: "api" };
    }
    return { ok: true };
  } catch (e) {
    console.error("[sendLead] network error", (e as Error)?.message);
    return { ok: false, error: "network" };
  }
}

// Escape Telegram Markdown specials so a name with * or _ can't break the message.
function escapeMd(s: string): string {
  return s.replace(/([*_`[])/g, "\\$1");
}
