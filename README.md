# Єрухомість — monorepo

Монорепозиторій проєктів агенції нерухомості **Єрухомість** (Вінниця).

## Структура

```
apps/
└── eruhomist/    — головний сайт (Next.js, App Router, GSAP)
                    кінематографічний scroll-hero + секції, форма заявок у Telegram
```

## Робота з проєктом

Кожен застосунок самодостатній — свій `package.json`, свої залежності.

```bash
cd apps/eruhomist
npm install
npm run dev      # розробка
npm run build    # прод-збірка
npm start        # прод-сервер
```

## Конвенції

- Кожен новий застосунок — окрема тека в `apps/<name>/` зі своїм `package.json`.
- Секрети — у `apps/<name>/.env.local` (не комітяться; шаблон у `.env.local.example`).
- Спільні `.gitignore` і цей README — у корені.
