// @ts-check
/**
 * astro.config.mjs — конфигурация Astro для сайта конференции.
 *
 * Что делает: описывает статическую сборку сайта (output: 'static'), подключает
 * Tailwind CSS v4 через официальный Vite-плагин и настраивает двуязычную
 * маршрутизацию (ru — по умолчанию без префикса, en — в /en/...).
 *
 * Как работает: Astro собирает `src/pages/**` в статический HTML в `dist/`,
 * который затем отдаётся nginx-ом с VPS. JS попадает в бандл только из
 * компонентов-островков (`client:*`), поэтому базовые страницы уезжают почти
 * без JavaScript.
 *
 * Связан с: `src/styles/global.css` (точка входа Tailwind), `src/i18n/*`
 * (словари и хелперы локалей), `package.json` (скрипты dev/build).
 */
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://soc-innovations.urfu.ru',
  output: 'static',
  trailingSlash: 'never',

  i18n: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    inlineStylesheets: 'auto',
  },
});
