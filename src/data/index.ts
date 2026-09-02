/**
 * src/data/index.ts — точка доступа к локализованному контенту.
 *
 * Что делает: отдаёт компонентам контент нужной локали и список локалей для
 * генерации статических путей.
 *
 * Как работает: русская и английская версии импортируются статически, поэтому
 * попадают в бандл только та, что реально использована на странице (Astro
 * вырезает неиспользованное при сборке страницы). `getContent` — единственный
 * способ получить текст: компоненты не хранят строки у себя.
 *
 * Связан с: `src/data/content.ru.ts`, `src/data/content.en.ts`,
 * `src/data/types.ts`, `src/i18n/index.ts`.
 */
import type { ConferenceContent, Locale } from './types';
import { ru } from './content.ru';
import { en } from './content.en';

const dictionaries: Record<Locale, ConferenceContent> = { ru, en };

/** Все поддерживаемые локали в порядке приоритета. */
export const locales: Locale[] = ['ru', 'en'];

/** Локаль по умолчанию — совпадает с `i18n.defaultLocale` в astro.config.mjs. */
export const defaultLocale: Locale = 'ru';

/**
 * Возвращает весь контент сайта для указанной локали.
 * Используется в каждой странице и в секционных компонентах как единственный
 * источник текста.
 */
export function getContent(locale: Locale): ConferenceContent {
  return dictionaries[locale];
}

export type { ConferenceContent, Locale };
