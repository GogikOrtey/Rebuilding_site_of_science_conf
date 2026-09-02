/**
 * src/i18n/index.ts — хелперы двуязычной маршрутизации.
 *
 * Что делает: определяет текущую локаль по URL и строит ссылки на страницы в
 * нужной локали, включая ссылку-переключатель языка. Учитывает Astro `base`
 * (стенд: `/Rebuilding_site_of_science_conf`).
 *
 * Как работает: русская локаль по умолчанию и живёт без префикса (`/`,
 * `/registration`), английская — с префиксом `/en` (`/en`, `/en/registration`).
 * Это соответствует настройке `i18n.routing.prefixDefaultLocale: false` в
 * astro.config.mjs. Функции чистые, работают и на сборке, и в браузере.
 *
 * Связан с: `astro.config.mjs` (секция i18n + base), `src/data/index.ts`,
 * `src/layouts/BaseLayout.astro`, переключатель языка в шапке.
 */
import type { Locale } from '~/data/types';
import { defaultLocale, locales } from '~/data';

/**
 * Нормализованный base без завершающего слэша (`''` если сайт в корне).
 * Берётся из `import.meta.env.BASE_URL`, который Astro выставляет из `base`.
 */
function getBasePath(): string {
  const raw = import.meta.env.BASE_URL || '/';
  return raw.replace(/\/+$/, '') || '';
}

/**
 * Убирает Astro base из pathname, чтобы дальше разбирать локаль и сегменты.
 * Используется в getLocaleFromUrl / getAlternatePath.
 */
function stripBase(pathname: string): string {
  const base = getBasePath();
  if (!base) return pathname || '/';
  if (pathname === base || pathname.startsWith(`${base}/`)) {
    const rest = pathname.slice(base.length);
    return rest || '/';
  }
  return pathname || '/';
}

/**
 * Добавляет Astro base к внутреннему пути сайта.
 * Якоря (`#…`) и внешние URL не трогает. Используется в localizePath и в
 * шаблонах с хардкод-ссылками на страницы прототипов.
 */
export function withBase(path: string): string {
  if (!path || path.startsWith('#') || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('mailto:')) {
    return path;
  }
  const base = getBasePath();
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (!base) return clean === '' ? '/' : clean;
  if (clean === '/') return base;
  return `${base}${clean}`;
}

/**
 * Извлекает локаль из URL страницы.
 * Используется в лейауте и компонентах, которым нужен текст: локаль берётся из
 * адреса, а не передаётся пропсами через всё дерево.
 */
export function getLocaleFromUrl(url: URL): Locale {
  const segment = stripBase(url.pathname).split('/').filter(Boolean)[0];
  return locales.includes(segment as Locale) ? (segment as Locale) : defaultLocale;
}

/**
 * Строит путь к странице в указанной локали с учётом Astro base.
 * `localizePath('/registration', 'en')` → `/Rebuilding_site_of_science_conf/en/registration`,
 * `localizePath('/registration', 'ru')` → `/Rebuilding_site_of_science_conf/registration`.
 */
export function localizePath(path: string, locale: Locale): string {
  const clean = `/${path.replace(/^\/+|\/+$/g, '')}`;
  if (locale === defaultLocale) {
    return withBase(clean === '/' ? '/' : clean);
  }
  return withBase(clean === '/' ? `/${locale}` : `/${locale}${clean}`);
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
  const segments = stripBase(url.pathname).split('/').filter(Boolean);
  if (locales.includes(segments[0] as Locale)) segments.shift();
  return localizePath(`/${segments.join('/')}`, getAlternateLocale(locale));
}

/** Код языка для атрибута `lang` и hreflang. */
export function getHtmlLang(locale: Locale): string {
  return locale === 'ru' ? 'ru-RU' : 'en';
}
