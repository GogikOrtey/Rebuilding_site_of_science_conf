/**
 * src/data/links.ts — единый реестр внешних URL проекта.
 *
 * Что делает: держит все внешние адреса (журнал ВАК, программа ДПО, политика
 * обработки персональных данных, сайты организаторов, кредит дизайнера) в одном месте.
 *
 * Как работает: адреса не зависят от локали, поэтому вынесены из контентных
 * файлов — русский и английский тексты ссылаются на одни и те же константы.
 * Это исключает расхождение URL между версиями сайта при правках.
 *
 * Связан с: `src/data/content.ru.ts`, `src/data/content.en.ts`.
 */

export const externalLinks = {
  /** Журнал ВАК «Вопросы управления» — главная страница. */
  journal: 'https://journal-management.com/main',
  /** Требования к статьям и правила подачи в журнал. */
  journalSubmissions: 'https://journal-management.com/main/about/submissions',
  /** Программа повышения квалификации УрФУ по управлению социальным капиталом. */
  dpoProgram: 'https://dpo.urfu.ru/programs/1276',
  /** Положение УрФУ об обработке персональных данных (PDF). */
  privacyPolicy:
    'https://ozi.urfu.ru/fileadmin/user_upload/site_15891/ZI/UrFU_Polozhenie_o_personalnykh_dannykh.pdf',
  /** Уральский федеральный университет. */
  urfu: 'https://urfu.ru',
  /** Уральский институт управления — филиал РАНХиГС. */
  ranepa: 'https://ui.ranepa.ru/',
  /** Магистратура «Организация и управление в сфере социальной работы». */
  masterProgram: 'https://programms.edu.urfu.ru/ru/9978/',
  /** Дополнительное профессиональное образование ФТИ УрФУ. */
  urfuDpo: 'https://fizteh.urfu.ru/ru/dpo/',
  /** Российско-Бразильский центр РГГУ. */
  rsuhBrazil: 'https://www.rsuh.ru/international/centers/russian-brazilian/',
  /** Кафедра политической психологии СПбГУ. */
  spbu: 'https://psy.spbu.ru/department/teachers/456-deyneka-os',
  /** Российская ассоциация консультантов по управлению «НИСКУ». */
  cmcRussia: 'https://cmcrussia.ru/',
  /** Среднеуральский фонд развития малого предпринимательства. */
  sredneuralsk:
    'https://sredneuralsk.midural.ru/administratsiya/sredneuralskiy-fond-razvitiya-malogo-predprinimatelstva-/',
  /** АНО «Просто100благо». */
  pro100blago: 'https://pro100blago.ru/',
  /** VK-профиль Георгия Орлова — примеры дизайна (кредит в подвале). */
  designerVk: 'https://vk.ru/gog.ortey',
} as const;

/** Контакты оргкомитета, продублированные в разных секциях сайта. */
export const contactPoints = {
  patrakovEmail: 'e.v.patrakov@urfu.ru',
  patrakovPhone: '+7 922 219 4294',
  belozerovaEmail: 'anna.belozerova@urfu.ru',
} as const;

/** Стоимость программы повышения квалификации, руб. */
export const dpoPrice = 7900;
