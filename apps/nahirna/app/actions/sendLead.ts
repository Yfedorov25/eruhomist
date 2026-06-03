"use server";

/*
  sendLead — server action: sends a "Дім на Нагірній" callback request to Telegram.
  Same bot/chat as apps/quadro & apps/eruhomist (token + chat_id live ONLY on the server,
  .env.local). Form fields per COPY §08: name, phone, when-to-call. Returns {ok} — the UI
  shows the human microcopy from COPY on failure. NEVER fakes success when unconfigured.
*/

export type LeadResult = { ok: true } | { ok: false; error: string };

export async function sendLead(_prev: LeadResult | null, formData: FormData): Promise<LeadResult> {
  const name = (formData.get("name") || "").toString().trim();
  const phone = (formData.get("phone") || "").toString().trim();
  const when = (formData.get("when") || "").toString().trim();
  const consent = formData.get("consent") === "on";

  if (!name || !phone) return { ok: false, error: "fill" };
  if (name.length > 100 || phone.length > 100 || when.length > 120) return { ok: false, error: "length" };
  // Basic phone sanity: must contain enough digits (the UI shows the human "загубилася цифра" msg).
  if ((phone.match(/\d/g) || []).length < 9) return { ok: false, error: "phone" };
  // Personal-data consent required (Ukraine PDPL) — enforce server-side too.
  if (!consent) return { ok: false, error: "consent" };

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[sendLead] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set");
    return { ok: false, error: "config" };
  }

  const text =
    `🏠 *Нова заявка — Дім на Нагірній*\n\n` +
    `*Імʼя:* ${escapeMd(name)}\n` +
    `*Телефон:* ${escapeMd(phone)}` +
    (when ? `\n*Коли подзвонити:* ${escapeMd(when)}` : "");

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

function escapeMd(s: string): string {
  return s.replace(/([*_`[])/g, "\\$1");
}
