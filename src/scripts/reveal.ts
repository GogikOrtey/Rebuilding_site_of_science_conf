/**
 * src/scripts/reveal.ts — появление блоков при скролле.
 *
 * Что делает: навешивает класс `is-revealed` на элементы с атрибутом
 * `data-reveal`, когда они попадают во вьюпорт. Само оформление перехода
 * (opacity/transform) описано в `src/styles/global.css`, скрипт только
 * переключает состояние.
 *
 * Как работает: один IntersectionObserver на всю страницу вместо обработчика
 * scroll — это не вызывает пересчёт лейаута на каждый кадр. После показа
 * элемент снимается с наблюдения, поэтому анимация не повторяется и observer
 * постепенно освобождается. Если пользователь отключил анимации в системе,
 * скрипт сразу показывает всё и не создаёт observer вообще.
 *
 * Задержка каскада задаётся на элементе через `--reveal-delay` или атрибут
 * `data-reveal-delay` (в миллисекундах).
 *
 * Связан с: `src/styles/global.css` (стили состояния), `BaseLayout.astro`
 * (подключение скрипта), любые секции с `data-reveal`.
 */

/**
 * Инициализирует наблюдение за элементами `[data-reveal]`.
 * Вызывается один раз при загрузке страницы из BaseLayout.
 */
export function initReveal(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (items.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const delay = el.dataset.revealDelay;
        if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`);
        el.classList.add('is-revealed');
        observer.unobserve(el);
      }
    },
    // Запускаем чуть раньше нижней кромки экрана, чтобы блок не «дёргался».
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );

  items.forEach((el) => observer.observe(el));
}
