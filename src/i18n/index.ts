/**
 * src/i18n/index.ts — хелперы двуязычной маршрутизации.
 *
 * Что делает: определяет текущую локаль по URL и строит ссылки на страницы в
 * нужной локали, включая ссылку-переключатель языка.
 *
 * Как работает: русская локаль по умолчанию и живёт без префикса (`/`,
 * `/registration`), английская — с префиксом `/en` (`/en`, `/en/registration`).
 * Это соответствует настройке `i18n.routing.prefixDefaultLocale: false` в
 * astro.config.mjs. Функции чистые, работают и на сборке, и в браузере.
 *
 * Связан с: `astro.config.mjs` (секция i18n), `src/data/index.ts`,
 * `src/layouts/BaseLayout.astro`, переключатель языка в шапке.
 */
import type { Locale } from '~/data/types';
import { defaultLocale, locales } from '~/data';

/**
 * Извлекает локаль из URL страницы.
 * Используется в лейауте и компонентах, которым нужен текст: локаль берётся из
 * адреса, а не передаётся пропсами через всё дерево.
 */
export function getLocaleFromUrl(url: URL): Locale {
  const segment = url.pathname.split('/').filter(Boolean)[0];
  return locales.includes(segment as Locale) ? (segment as Locale) : defaultLocale;
}

/**
 * Строит абсолютный путь к странице в указанной локали.
 * `localizePath('/registration', 'en')` → `/en/registration`,
 * `localizePath('/registration', 'ru')` → `/registration`.
 */
export function localizePath(path: string, locale: Locale): string {
  const clean = `/${path.replace(/^\/+|\/+$/g, '')}`;
  if (locale === defaultLocale) {
    return clean === '/' ? '/' : clean;
  }
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

/** Возвращает противоположную локаль — для кнопки переключения языка. */
export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'ru' ? 'en' : 'ru';
}

/**
 * Возвращает путь текущей страницы в другой локали.
 * Используется переключателем языка, чтобы остаться на том же разделе.
 */
export function getAlternatePath(url: URL, locale: Locale): string {
  const segments = url.pathname.split('/').filter(Boolean);
  if (locales.includes(segments[0] as Locale)) segments.shift();
  return localizePath(`/${segments.join('/')}`, getAlternateLocale(locale));
}

/** Код языка для атрибута `lang` и hreflang. */
export function getHtmlLang(locale: Locale): string {
  return locale === 'ru' ? 'ru-RU' : 'en';
}
