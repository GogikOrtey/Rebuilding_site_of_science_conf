/**
 * src/data/types.ts — типы контентной модели сайта конференции.
 *
 * Что делает: описывает единую структуру `ConferenceContent`, которой обязаны
 * соответствовать все локали. Благодаря этому русский и английский контент
 * гарантированно совпадают по составу блоков, а компоненты получают
 * типизированные данные без проверок на undefined.
 *
 * Как работает: чистый файл типов, в рантайм не попадает. Локализованные
 * значения лежат в `content.ru.ts` / `content.en.ts` и типизируются как
 * `ConferenceContent`; выбор локали делает `src/data/index.ts`.
 *
 * Связан с: `src/data/content.*.ts`, `src/data/index.ts`, `src/data/people.ts`
 * (изображения портретов), компоненты секций в `src/components/sections`.
 */

/** Поддерживаемые локали сайта. Совпадают с `i18n.locales` в astro.config.mjs. */
export type Locale = 'ru' | 'en';

/** Внешняя или внутренняя ссылка с подписью. */
export interface Link {
  label: string;
  href: string;
  /** true — ссылка ведёт на внешний ресурс, открывается в новой вкладке. */
  external?: boolean;
}

/** Пункт главной навигации. `href` — либо anchor вида `#topics`, либо путь. */
export interface NavItem {
  label: string;
  href: string;
  /** Раздел ещё не наполнен: показываем пометку и не даём ложных обещаний. */
  pending?: boolean;
  external?: boolean;
}

/** SEO- и OG-метаданные страницы. */
export interface Meta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  keywords: string[];
}

/** Фактические параметры события: даты, место, формат. */
export interface EventInfo {
  /** Человекочитаемая дата, например «12–13 ноября 2026». */
  dateLabel: string;
  /** ISO-даты для микроразметки Schema.org и элемента <time>. */
  startISO: string;
  endISO: string;
  city: string;
  country: string;
  /** Короткое описание формата: «Очно и онлайн». */
  format: string;
  /** Расширенное пояснение формата. */
  formatNote: string;
  languages: string[];
}

/** Ключевой факт о конференции — блок «почему стоит участвовать». */
export interface KeyFact {
  id: string;
  /** Короткий заголовок факта. */
  title: string;
  /** Раскрытие в 1–2 предложения. */
  body: string;
  /** Необязательная ссылка «подробнее». */
  link?: Link;
}

/** Тема конференции в списке направлений. */
export interface Topic {
  /** Порядковый номер для editorial-нумерации 01…06. */
  index: string;
  title: string;
}

/** Формат работы: секция, семинар или мастер-класс. */
export interface ProgramItem {
  kind: 'section' | 'seminar' | 'workshop';
  title: string;
}

/** Город с локальным временем начала и конца заседаний. */
export interface TimezoneRow {
  city: string;
  /** Смещение UTC для подписи, например «UTC+5». */
  utc: string;
  start: string;
  end: string;
  /** true — город проведения, выделяется в таблице. */
  primary?: boolean;
}

/** Дедлайн в таймлайне подготовки к конференции. */
export interface Deadline {
  /** Дата для отображения, например «21 сентября 2026». */
  dateLabel: string;
  dateISO: string;
  title: string;
  note?: string;
  /** true — сама конференция, а не подготовительный срок. */
  highlight?: boolean;
}

/** Блок условий участия: заголовок плюс абзацы и/или список. */
export interface ConditionBlock {
  title: string;
  paragraphs: string[];
  list?: string[];
}

/** Персона: член оргкомитета или спикер. */
export interface Person {
  /** Ключ портрета в `src/data/people.ts`; отсутствует у нераскрытых персон. */
  photoKey?: string;
  name: string;
  /** Должность и организация одной строкой. */
  role: string;
  country: string;
  /** Ссылка на организацию или профиль. */
  link?: Link;
  /** true — «персона на согласовании», карточка-заглушка. */
  pending?: boolean;
}

/** Контакт по стране. */
export interface CountryContact {
  country: string;
  /** Организация-координатор, если известна. */
  org?: string;
  people: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;
  /** true — ответственное лицо ещё не назначено. */
  pending?: boolean;
}

/** Вариант выбора в поле формы. */
export interface FormOption {
  value: string;
  label: string;
}

/** Одно поле регистрационной формы. */
export interface FormField {
  name: string;
  label: string;
  /** Пояснение под подписью поля. */
  hint?: string;
  placeholder?: string;
  type: 'text' | 'email' | 'url' | 'radio' | 'checkbox' | 'checkbox-group' | 'textarea';
  required?: boolean;
  options?: FormOption[];
  /** Сообщение при непройденной валидации. */
  error?: string;
}

/** Шаг многошаговой регистрационной формы. */
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

/** Полное описание регистрационной формы. */
export interface RegistrationForm {
  title: string;
  lead: string;
  steps: FormStep[];
  submitLabel: string;
  backLabel: string;
  nextLabel: string;
  /** Текст согласия на обработку персональных данных. */
  consent: string;
  consentLink: Link;
  successTitle: string;
  successBody: string;
  errorTitle: string;
  errorBody: string;
  /** Подпись прогресса, например «Шаг {current} из {total}». */
  progressLabel: string;
}

/** Корневая структура локализованного контента сайта. */
export interface ConferenceContent {
  locale: Locale;
  meta: Meta;
  nav: NavItem[];
  event: EventInfo;
  hero: {
    eyebrow: string;
    title: string;
    /** Название, разбитое на строки для крупного набора в hero. */
    titleLines: string[];
    lead: string;
    primaryCta: Link;
    secondaryCta: Link;
  };
  sectionTitles: {
    keyFacts: string;
    topics: string;
    program: string;
    schedule: string;
    deadlines: string;
    conditions: string;
    committee: string;
    speakers: string;
    contacts: string;
    registration: string;
  };
  keyFacts: KeyFact[];
  topics: {
    items: Topic[];
    note: string;
  };
  program: {
    note: string;
    items: ProgramItem[];
    kindLabels: Record<ProgramItem['kind'], string>;
    /** Подпись кнопки скачивания программы. */
    download: Link;
    downloadNote: string;
  };
  schedule: {
    note: string;
    rows: TimezoneRow[];
    columns: { city: string; start: string; end: string };
    languagesLabel: string;
  };
  deadlines: Deadline[];
  conditions: ConditionBlock[];
  committee: Person[];
  speakers: Person[];
  pendingPersonLabel: string;
  contacts: CountryContact[];
  contactsPendingLabel: string;
  registration: RegistrationForm;
  footer: {
    note: string;
    imagesNote: string;
    /** Кредит дизайнера (ссылка в нижней полосе подвала). */
    designCredit: Link;
    links: Link[];
  };
  /** Общие подписи интерфейса. */
  ui: {
    skipToContent: string;
    menu: string;
    close: string;
    languageSwitch: string;
    scrollHint: string;
    toTop: string;
    externalLinkHint: string;
  };
}
