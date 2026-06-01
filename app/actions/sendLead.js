"use server";

/*
  sendLead — server action: надсилає заявку з форми в Telegram-чат.
  Токен і chat_id живуть ТІЛЬКИ на сервері (.env.local), у браузер не потрапляють.

  ENV (див. .env.local.example):
    TELEGRAM_BOT_TOKEN — токен від @BotFather
    TELEGRAM_CHAT_ID    — куди слати (особистий чат або група)

  Повертає { ok: true } або { ok: false, error } — UI показує фолбек (Direct/тел).
*/

export async function sendLead(prev, formData) {
  const name = (formData.get("name") || "").toString().trim();
  const contact = (formData.get("contact") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();

  // мінімальна валідація на сервері (не лише HTML required)
  if (!name || !contact) {
    return { ok: false, error: "fill", message: "Заповніть імʼя та контакт." };
  }
  if (name.length > 100 || contact.length > 100 || message.length > 2000) {
    return { ok: false, error: "length", message: "Завеликий текст." };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    // конфіг не заданий — не вдаємо успіх
    console.error("[sendLead] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не задані");
    return { ok: false, error: "config" };
  }

  const text =
    `🏠 *Нова заявка — Єрухомість*\n\n` +
    `*Імʼя:* ${escapeMd(name)}\n` +
    `*Контакт:* ${escapeMd(contact)}\n` +
    (message ? `*Повідомлення:* ${escapeMd(message)}` : "_без повідомлення_");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
        // не вішаємо сервер надовго, якщо Telegram лежить
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[sendLead] Telegram API error", res.status, detail);
      return { ok: false, error: "api" };
    }
    return { ok: true };
  } catch (e) {
    console.error("[sendLead] network error", e?.message);
    return { ok: false, error: "network" };
  }
}

// екранування спецсимволів Telegram Markdown, щоб імʼя з * чи _ не ламало повідомлення
function escapeMd(s) {
  return s.replace(/([*_`\[])/g, "\\$1");
}
