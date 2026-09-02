# cursorcontext.md — память проекта

Статический сайт международной научно-практической конференции
«Социальный капитал малого и среднего бизнеса» (УрФУ, Екатеринбург,
12–13 ноября 2026). Стек: Astro 7 + Tailwind 4 + TypeScript.
Домен: `https://soc-innovations.urfu.ru`.

## Локализация и контент

- `src/data/types.ts` — модель `ConferenceContent` (общая для всех локалей).
- `src/data/content.ru.ts` — русский контент (`export const ru`).
- `src/data/content.en.ts` — английский контент (`export const en`);
  структура и технические идентификаторы формы совпадают с русской версией;
  `ui.languageSwitch` = `'Русский'`.
- `src/data/links.ts` — реестр внешних URL и `dpoPrice` (не хардкодить URL в контенте).
- `src/data/people.ts` — ключи портретов (`photoKey`).
- `src/data/index.ts` — `getContent(locale)`, `locales`, `defaultLocale`.

Маршрутизация: `ru` без префикса, `en` под `/en/` (`astro.config.mjs` → `i18n`).

## Важно при правках контента

- Поля формы: `name` и `value` опций — технические ID, одинаковые в ru/en.
- `photoKey`, `dateISO` / `startISO` / `endISO` не локализуются.
- Цена ДПО: `dpoPrice.toLocaleString('ru-RU')` / `('en-US')` + «₽» / «RUB».
