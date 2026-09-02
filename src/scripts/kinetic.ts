/**
 * src/scripts/kinetic.ts — скролл-хореография и моторика варианта дизайна 4.
 *
 * Что делает: собирает всю анимацию прототипа «Kinetic» — вступительный
 * загрузчик, кастомный курсор, построчный reveal заголовков, бегущую строку с
 * реакцией на скорость скролла, горизонтальную пин-секцию тем, рисование линии
 * таймлайна, пиксельное проявление портретов, счётчики, магнитные кнопки и
 * салют частиц по клику на CTA.
 *
 * Как работает: точка входа — `initKinetic()`, её вызывает страница прототипа.
 * Каждый эффект живёт в отдельной функции и сам находит свои элементы по
 * data-атрибутам, поэтому разметка и анимация связаны декларативно: чтобы
 * добавить блоку появление, достаточно повесить `data-anim="rise"`.
 *
 * Плавный скролл делает ScrollSmoother, ему нужна обёртка
 * `#smooth-wrapper > #smooth-content`; фиксированные слои (курсор, зерно,
 * прогресс, загрузчик) обязаны лежать вне этой обёртки. Параллакс задаётся
 * атрибутом `data-speed` и считается самим ScrollSmoother.
 *
 * Ключевые ограничения, которые здесь учтены:
 * - SplitText запускается только после `document.fonts.ready`, иначе разбивка
 *   на строки считается по подменному шрифту и ломается при подмене.
 * - при `prefers-reduced-motion` вся моторика отключается, а контент
 *   принудительно показывается — страница остаётся полностью читаемой.
 * - класс `js-kinetic` на <html> ставит инлайн-скрипт страницы: только под ним
 *   CSS прячет анимируемые элементы, поэтому при сбое загрузки бандла
 *   страница не остаётся пустой.
 *
 * Связан с: `src/pages/proto/4.astro` (разметка и data-атрибуты),
 * `src/styles/themes/kinetic.css` (стили состояний), `gsap` и его плагины.
 */
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(
  CustomEase,
  DrawSVGPlugin,
  Physics2DPlugin,
  ScrambleTextPlugin,
  ScrollSmoother,
  ScrollToPlugin,
  ScrollTrigger,
  SplitText,
);

/** Фирменная кривая варианта: резкий старт, длинное мягкое торможение. */
const EASE = CustomEase.create('kinetic', '0.16, 1, 0.3, 1');

/** Набор символов для scramble-эффекта: латиница плюс цифры и знаки. */
const SCRAMBLE_CHARS = 'upperCase';

/**
 * Точка входа. Вызывается один раз со страницы прототипа 4.
 * Решает, включать ли моторику, и запускает все эффекты в нужном порядке.
 */
export function initKinetic(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    revealEverything();
    return;
  }

  const smoother = initSmoothScroll();
  initCursor();
  initScrollProgress();
  initHeaderReaction();
  initMarquee();
  initMagnetic();
  initBurst();
  initAnchors(smoother);

  // Разбивка текста зависит от метрик шрифта, поэтому ждём загрузку шрифтов.
  document.fonts.ready.then(() => {
    const intro = buildHeroIntro();
    initLoader(intro);
    initHeadings();
    initRise();
    initWeightHover();
    initScrambleHover();
    initScheduleScramble();
    initCounters();
    initPixelReveal();
    initTimelineDraw();
    initHorizontalTopics();
    ScrollTrigger.refresh();
  });
}

/**
 * Аварийный режим для `prefers-reduced-motion`: снимает класс `js-kinetic`,
 * из-за которого CSS прячет анимируемые блоки, и убирает загрузчик.
 */
function revealEverything(): void {
  document.documentElement.classList.remove('js-kinetic');
  document.querySelector<HTMLElement>('[data-loader]')?.remove();
}

/**
 * Включает плавный скролл и параллакс `data-speed`.
 * Возвращает инстанс, чтобы им можно было скроллить к анкорам.
 */
function initSmoothScroll(): ScrollSmoother | null {
  if (!document.getElementById('smooth-wrapper')) return null;

  return ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.15,
    effects: true,
    // На тач-устройствах инерцию не подменяем: нативный скролл там лучше.
    smoothTouch: 0,
    normalizeScroll: false,
  });
}

/**
 * Вступительная анимация hero: заголовок построчно выезжает из-под маски,
 * надзаголовок «собирается» из шума, лид и кнопки подтягиваются следом.
 * Возвращает приостановленную таймлайн — её запускает загрузчик.
 */
function buildHeroIntro(): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });

  const titleLines = gsap.utils.toArray<HTMLElement>('[data-hero-line] > *');
  if (titleLines.length > 0) {
    tl.fromTo(
      titleLines,
      { yPercent: 115, rotate: 4, opacity: 1 },
      { yPercent: 0, rotate: 0, duration: 1.15, stagger: 0.09 },
      0,
    );
  }

  const eyebrow = document.querySelector<HTMLElement>('[data-hero-eyebrow]');
  if (eyebrow) {
    const text = eyebrow.textContent ?? '';
    tl.fromTo(
      eyebrow,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.4,
        scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.5, revealDelay: 0.2 },
      },
      0.15,
    );
  }

  const lead = document.querySelector<HTMLElement>('[data-hero-lead]');
  if (lead) {
    const split = SplitText.create(lead, { type: 'lines', mask: 'lines' });
    // Сам абзац скрыт стилями до старта: видимость возвращаем строкам, не ему.
    tl.set(lead, { opacity: 1 }, 0).fromTo(
      split.lines,
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
      0.5,
    );
  }

  const tail = gsap.utils.toArray<HTMLElement>('[data-hero-tail]');
  if (tail.length > 0) {
    tl.fromTo(tail, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.07 }, 0.7);
  }

  return tl;
}

/**
 * Загрузчик: счётчик до 100, затем лаймовая шторка уходит вверх и передаёт
 * управление вступительной анимации hero. Если разметки загрузчика нет —
 * просто играет hero сразу.
 */
function initLoader(intro: gsap.core.Timeline): void {
  const loader = document.querySelector<HTMLElement>('[data-loader]');
  if (!loader) {
    intro.play();
    return;
  }

  const counter = loader.querySelector<HTMLElement>('[data-loader-count]');
  const progress = { value: 0 };

  const tl = gsap.timeline({
    onComplete: () => {
      loader.remove();
      intro.play();
    },
  });

  if (counter) {
    tl.to(progress, {
      value: 100,
      duration: 1,
      ease: 'power2.inOut',
      onUpdate: () => {
        counter.textContent = String(Math.round(progress.value)).padStart(3, '0');
      },
    });
  }

  tl.to(loader.querySelector('[data-loader-bar]'), { scaleX: 1, duration: 1, ease: 'power2.inOut' }, 0)
    .to(loader.querySelector('[data-loader-inner]'), { opacity: 0, duration: 0.3 }, '+=0.1')
    .to(loader, { yPercent: -100, duration: 0.9, ease: EASE }, '<0.1');
}

/**
 * Кастомный курсор: точка следует за указателем почти мгновенно, кольцо —
 * с задержкой. Над элементами с `data-cursor="grow"` кольцо раздувается.
 */
function initCursor(): void {
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  if (!dot || !ring) return;
  if (!window.matchMedia('(hover: hover)').matches) return;

  gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

  window.addEventListener(
    'pointermove',
    (event) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      gsap.to([dot, ring], { opacity: 1, duration: 0.3, overwrite: 'auto' });
    },
    { passive: true },
  );

  document.addEventListener('pointerleave', () => {
    gsap.to([dot, ring], { opacity: 0, duration: 0.3, overwrite: 'auto' });
  });

  document.querySelectorAll<HTMLElement>('[data-cursor="grow"]').forEach((el) => {
    el.addEventListener('pointerenter', () => {
      gsap.to(ring, { scale: 1.9, duration: 0.35, ease: EASE, overwrite: 'auto' });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(ring, { scale: 1, duration: 0.35, ease: EASE, overwrite: 'auto' });
    });
  });
}

/** Полоса прогресса чтения сверху: масштаб привязан к позиции скролла. */
function initScrollProgress(): void {
  const bar = document.querySelector<HTMLElement>('[data-scroll-progress]');
  if (!bar) return;

  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });
}

/**
 * Шапка: уезжает вверх при скролле вниз и возвращается при скролле вверх,
 * плюс получает фон и линию, когда страница уже прокручена.
 */
function initHeaderReaction(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  const hide = gsap.to(header, {
    yPercent: -100,
    duration: 0.45,
    ease: EASE,
    paused: true,
  });

  ScrollTrigger.create({
    start: 'top -80',
    end: 'max',
    onUpdate: (self) => {
      if (self.direction === 1) hide.play();
      else hide.reverse();
    },
    onEnter: () => header.classList.add('is-stuck'),
    onLeaveBack: () => {
      header.classList.remove('is-stuck');
      hide.reverse();
    },
  });
}

/**
 * Бегущая строка: базовая скорость постоянна, а скорость и направление
 * скролла добавляются к ней — лента «подхватывает» движение страницы.
 */
function initMarquee(): void {
  const tracks = gsap.utils.toArray<HTMLElement>('[data-marquee]');
  if (tracks.length === 0) return;

  tracks.forEach((track) => {
    const tween = gsap.to(track, {
      xPercent: -50,
      duration: Number(track.dataset.marqueeDuration ?? 26),
      ease: 'none',
      repeat: -1,
    });

    ScrollTrigger.create({
      trigger: track,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        // Скорость скролла подмешивается в timeScale, знак задаёт направление.
        const boost = gsap.utils.clamp(-6, 6, self.getVelocity() / 260);
        gsap.to(tween, {
          timeScale: 1 + Math.abs(boost),
          duration: 0.4,
          overwrite: true,
        });
        tween.reversed(boost < -0.6);
      },
      onLeave: () => gsap.to(tween, { timeScale: 1, duration: 0.6 }),
    });
  });
}

/**
 * Заголовки секций: разбиваются на слова и выезжают из-под маски со сдвигом.
 * Вешается на `[data-anim="heading"]`.
 */
function initHeadings(): void {
  gsap.utils.toArray<HTMLElement>('[data-anim="heading"]').forEach((heading) => {
    const split = SplitText.create(heading, { type: 'words', mask: 'words' });

    gsap.fromTo(
      split.words,
      { yPercent: 110, rotate: 3 },
      {
        yPercent: 0,
        rotate: 0,
        duration: 1,
        ease: EASE,
        stagger: 0.05,
        scrollTrigger: { trigger: heading, start: 'top 85%' },
      },
    );
  });
}

/**
 * Обычное появление блоков `[data-anim="rise"]`.
 * Собирается через batch, чтобы на одну секцию был один общий stagger,
 * а не десятки независимых триггеров.
 */
function initRise(): void {
  const items = gsap.utils.toArray<HTMLElement>('[data-anim="rise"]');
  if (items.length === 0) return;

  ScrollTrigger.batch(items, {
    start: 'top 88%',
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: EASE, stagger: 0.08, overwrite: true },
      );
    },
  });
}

/**
 * Эффект «weight hover»: вес переменного шрифта у каждой буквы зависит от
 * расстояния до курсора, поэтому под указателем текст «наливается».
 * Вешается на `[data-weight-hover]`.
 */
function initWeightHover(): void {
  if (!window.matchMedia('(hover: hover)').matches) return;

  gsap.utils.toArray<HTMLElement>('[data-weight-hover]').forEach((el) => {
    const split = SplitText.create(el, {
      type: 'words,chars',
      wordsClass: 'wh-word',
      charsClass: 'wh-char',
    });
    el.classList.add('weight-hover');

    function onMove(event: PointerEvent): void {
      split.chars.forEach((charEl) => {
        const rect = (charEl as HTMLElement).getBoundingClientRect();
        const dist = Math.abs(event.clientX - (rect.left + rect.width / 2));
        const force = gsap.utils.clamp(0, 1, 1 - dist / 140);
        gsap.set(charEl, { '--wght': Math.round(400 + force * 500) });
      });
    }

    function onLeave(): void {
      gsap.to(split.chars, { '--wght': 400, duration: 0.4, ease: EASE });
    }

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
  });
}

/**
 * Scramble-эффект по наведению: текст на миг рассыпается в шум и собирается
 * обратно. Вешается на `[data-scramble]` — пункты списка тем.
 */
function initScrambleHover(): void {
  gsap.utils.toArray<HTMLElement>('[data-scramble]').forEach((el) => {
    const original = el.textContent ?? '';

    el.addEventListener('pointerenter', () => {
      gsap.to(el, {
        duration: 0.7,
        ease: 'none',
        scrambleText: { text: original, chars: SCRAMBLE_CHARS, speed: 0.7 },
        overwrite: true,
      });
    });
  });
}

/**
 * Время в расписании «набирается» цифрами при первом появлении строки:
 * подчёркивает, что таблица про точные значения.
 */
function initScheduleScramble(): void {
  const cells = gsap.utils.toArray<HTMLElement>('[data-time-scramble]');
  if (cells.length === 0) return;

  cells.forEach((cell) => {
    const original = cell.textContent ?? '';
    gsap.to(cell, {
      duration: 0.9,
      ease: 'none',
      scrambleText: { text: original, chars: '0123456789', speed: 0.6 },
      scrollTrigger: { trigger: cell, start: 'top 92%' },
    });
  });
}

/** Счётчики `[data-count-to]`: число набегает от нуля при появлении блока. */
function initCounters(): void {
  gsap.utils.toArray<HTMLElement>('[data-count-to]').forEach((el) => {
    const target = Number(el.dataset.countTo ?? 0);
    const state = { value: 0 };

    gsap.to(state, {
      value: target,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = String(Math.round(state.value));
      },
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });
}

/**
 * Пиксельное проявление портретов: поверх фото раскладывается сетка плиток,
 * которые исчезают в случайном порядке. Плитки генерируются здесь, а не в
 * разметке, чтобы HTML оставался чистым.
 */
function initPixelReveal(): void {
  gsap.utils.toArray<HTMLElement>('[data-pixel-reveal]').forEach((holder) => {
    const cols = 8;
    const rows = 10;
    const overlay = document.createElement('div');
    overlay.className = 'pointer-events-none absolute inset-0 grid';
    overlay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    overlay.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    overlay.setAttribute('aria-hidden', 'true');

    const cells: HTMLElement[] = [];
    for (let i = 0; i < cols * rows; i += 1) {
      const cell = document.createElement('span');
      cell.className = 'block bg-bg';
      overlay.append(cell);
      cells.push(cell);
    }

    holder.append(overlay);

    gsap.to(cells, {
      opacity: 0,
      duration: 0.5,
      ease: 'none',
      stagger: { each: 0.012, from: 'random' },
      scrollTrigger: { trigger: holder, start: 'top 85%' },
      onComplete: () => overlay.remove(),
    });
  });
}

/**
 * Таймлайн ключевых дат: вертикальная линия прорисовывается по скроллу
 * (DrawSVG), а точки и подписи «зажигаются», когда линия до них доходит.
 */
function initTimelineDraw(): void {
  const section = document.querySelector<HTMLElement>('[data-timeline]');
  const line = section?.querySelector<SVGPathElement>('[data-timeline-line]');
  if (!section || !line) return;

  gsap.fromTo(
    line,
    { drawSVG: '0%' },
    {
      drawSVG: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 65%',
        end: 'bottom 75%',
        scrub: 0.5,
      },
    },
  );

  gsap.utils.toArray<HTMLElement>('[data-timeline-item]').forEach((item) => {
    gsap.fromTo(
      item,
      { opacity: 0.25, x: -14 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: EASE,
        scrollTrigger: { trigger: item, start: 'top 75%' },
      },
    );
  });
}

/**
 * Горизонтальная лента тем: секция пинится, а панели едут влево по мере
 * вертикального скролла. На узких экранах эффект отключён — там лента
 * листается пальцем как обычный горизонтальный скролл.
 */
function initHorizontalTopics(): void {
  const section = document.querySelector<HTMLElement>('[data-horizontal]');
  const track = section?.querySelector<HTMLElement>('[data-horizontal-track]');
  if (!section || !track) return;

  const progress = section.querySelector<HTMLElement>('[data-horizontal-progress]');
  const counter = section.querySelector<HTMLElement>('[data-horizontal-counter]');
  const total = section.querySelectorAll('[data-scramble]').length;

  // matchMedia сам откатывает анимацию при уходе с брейкпоинта — на мобильном
  // пин не создаётся и лента остаётся обычным вертикальным списком.
  gsap.matchMedia().add('(min-width: 1024px)', () => {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progress) gsap.set(progress, { scaleX: self.progress });
          if (counter && total > 0) {
            const current = Math.min(total, Math.floor(self.progress * total) + 1);
            counter.textContent = String(current).padStart(2, '0');
          }
        },
      },
    });
  });
}

/**
 * Магнитные кнопки: элемент притягивается к курсору в пределах своей области.
 * Вешается на `[data-magnetic]`.
 */
function initMagnetic(): void {
  if (!window.matchMedia('(hover: hover)').matches) return;

  gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = Number(el.dataset.magnetic ?? 0.35);

    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) * strength;
      const y = (event.clientY - (rect.top + rect.height / 2)) * strength;
      gsap.to(el, { x, y, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
    });

    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    });
  });
}

/**
 * Салют по клику на главный CTA: частицы разлетаются по баллистике
 * (Physics2DPlugin) и удаляются после падения. Навигация не блокируется —
 * эффект чисто декоративный и живёт на фиксированном слое.
 */
function initBurst(): void {
  document.querySelectorAll<HTMLElement>('[data-burst]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const colors = ['var(--color-accent)', 'var(--color-accent-2)', 'var(--color-ink)'];

      for (let i = 0; i < 26; i += 1) {
        const particle = document.createElement('span');
        particle.className = 'burst-particle';
        particle.style.background = colors[i % colors.length] ?? '';
        particle.style.left = `${event.clientX}px`;
        particle.style.top = `${event.clientY}px`;
        document.body.append(particle);

        gsap.to(particle, {
          duration: gsap.utils.random(0.7, 1.3),
          physics2D: {
            velocity: gsap.utils.random(180, 460),
            angle: gsap.utils.random(230, 310),
            gravity: 900,
          },
          scale: gsap.utils.random(0.4, 1.3),
          opacity: 0,
          ease: 'power1.out',
          onComplete: () => particle.remove(),
        });
      }
    });
  });
}

/**
 * Переходы по анкорам при включённом ScrollSmoother: нативный
 * `scroll-behavior` с ним не работает, поэтому скроллим через инстанс.
 */
function initAnchors(smoother: ScrollSmoother | null): void {
  if (!smoother) return;

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      smoother.scrollTo(target, true, 'top 90px');
    });
  });
}
