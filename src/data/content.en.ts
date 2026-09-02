/**
 * src/data/content.en.ts — английский контент сайта конференции.
 *
 * Что делает: содержит весь текст англоязычной версии сайта: метаданные,
 * навигацию, hero, ключевые факты, темы, форматы работы, расписание по
 * часовым поясам, дедлайны, условия участия, оргкомитет, спикеров, контакты,
 * поля формы регистрации и футер.
 *
 * Как работает: экспортирует один объект, типизированный как
 * `ConferenceContent`, поэтому любое расхождение с русской версией по составу
 * полей ловится компилятором. Компоненты никогда не хранят текст у себя —
 * только читают его отсюда через `getContent(locale)`.
 *
 * Источник данных: перевод и адаптация `content.ru.ts` (контент действующего
 * сайта soc-innovations.urfu.ru, переработанный по формулировкам и структуре;
 * см. cursorcontext.md). Технические идентификаторы полей формы (`name`,
 * `value`) и ISO-даты совпадают с русской версией.
 *
 * Связан с: `src/data/types.ts`, `src/data/links.ts`, `src/data/index.ts`,
 * `src/data/people.ts`, `src/data/content.ru.ts`.
 */
import type { ConferenceContent } from './types';
import { contactPoints, dpoPrice, externalLinks } from './links';

export const en: ConferenceContent = {
  locale: 'en',

  meta: {
    title:
      'Social Capital of Small and Medium-Sized Business — Conference, 12–13 November 2026, Yekaterinburg',
    description:
      'International academic and practice-oriented conference on the social capital of small and medium-sized business. 12–13 November 2026, Yekaterinburg — on site and online. Publication in the VAK-listed journal "Voprosy Upravleniya" (Management Issues); UrFU certificate of professional development.',
    ogTitle: 'Social Capital of Small and Medium-Sized Business',
    ogDescription:
      'International academic and practice-oriented conference. 12–13 November 2026, Yekaterinburg. On site and online; working languages — Russian and English.',
    keywords: [
      'social capital',
      'conference',
      'small and medium-sized business',
      'UrFU',
      'Yekaterinburg',
      'academic and practice-oriented conference',
      'Voprosy Upravleniya',
      'professional development',
    ],
  },

  nav: [
    { label: 'About', href: '#about' },
    { label: 'Topics', href: '#topics' },
    { label: 'Programme', href: '#program', pending: true },
    { label: 'Speakers', href: '#speakers' },
    { label: 'Publications', href: externalLinks.journalSubmissions, external: true },
    { label: 'Contacts', href: '#contacts' },
  ],

  event: {
    dateLabel: '12–13 November 2026',
    startISO: '2026-11-12',
    endISO: '2026-11-13',
    city: 'Yekaterinburg',
    country: 'Russia',
    format: 'On site and online',
    formatNote:
      'The conference is held in a hybrid format. Online access links are sent to registered participants and speakers.',
    languages: ['Russian', 'English'],
  },

  hero: {
    eyebrow: 'International Academic and Practice-Oriented Conference',
    title: 'Social Capital of Small and Medium-Sized Business',
    titleLines: ['Social', 'Capital', 'of Small and Medium-Sized', 'Business'],
    lead:
      'Two days on how trust, reputation and networks become a measurable organisational asset—and how to manage that asset.',
    primaryCta: { label: 'Register', href: '#registration' },
    secondaryCta: { label: 'Conference topics', href: '#topics' },
  },

  sectionTitles: {
    keyFacts: 'Why take part',
    topics: 'Conference topics',
    program: 'Sessions, seminars and workshops',
    schedule: 'Times and languages',
    deadlines: 'Key dates',
    conditions: 'Participation requirements',
    committee: 'Organising committee',
    speakers: 'Keynote speakers and trainers',
    contacts: 'Contacts',
    registration: 'Registration',
  },

  keyFacts: [
    {
      id: 'format',
      title: 'Hybrid format',
      body: 'Join us on site in Yekaterinburg or online. Access links are sent to registered participants and speakers.',
    },
    {
      id: 'audience',
      title: 'Who we invite',
      body: 'Academic and teaching staff, undergraduate and postgraduate students, experts in human resource management, marketing and social development, as well as representatives of NGOs and of small and medium-sized business.',
    },
    {
      id: 'formats',
      title: 'A range of formats',
      body: 'Round tables, author-led seminars, workshops, peer exchange and problem-focused discussion—rather than a single stream of presentations.',
    },
    {
      id: 'publication',
      title: 'Publication in a VAK-listed journal',
      body: 'A special issue of "Voprosy Upravleniya" (Management Issues), No. 1, 2027. Competitive selection; submissions close on 21 September 2026.',
      link: {
        label: 'Author guidelines',
        href: externalLinks.journalSubmissions,
        external: true,
      },
    },
    {
      id: 'certificate',
      title: 'UrFU certificate',
      body: `Professional development programme "Managing an Organisation's Social Capital". Fee RUB ${dpoPrice.toLocaleString('en-US')}; registration open until 1 November 2026.`,
      link: {
        label: 'About the programme',
        href: externalLinks.dpoProgram,
        external: true,
      },
    },
    {
      id: 'international',
      title: 'Five countries, one programme',
      body: 'Russia, Belarus, Brazil, Mozambique and India. Papers and discussion in Russian and English.',
    },
  ],

  topics: {
    items: [
      {
        index: '01',
        title: 'Social capital: why it matters for business and civic organisations',
      },
      {
        index: '02',
        title: 'Economic returns on social projects and events',
      },
      {
        index: '03',
        title: 'What business social policy should look like today',
      },
      {
        index: '04',
        title: 'Corporate communications as social capital',
      },
      {
        index: '05',
        title: 'Information environments for employees and partners',
      },
      {
        index: '06',
        title: 'International cooperation as a resource for building social capital',
      },
    ],
    note: 'The list is open: participants may propose their own topic when registering.',
  },

  program: {
    note: 'Sessions, seminars and workshops are being finalised and will be published on 20 October 2026.',
    items: [
      { kind: 'section', title: 'Session 1' },
      { kind: 'section', title: 'Session 2' },
      { kind: 'section', title: 'Session 3' },
      { kind: 'seminar', title: 'Author-led seminar 1' },
      { kind: 'seminar', title: 'Author-led seminar 2' },
      { kind: 'workshop', title: 'Workshop 1' },
      { kind: 'workshop', title: 'Workshop 2' },
    ],
    kindLabels: {
      section: 'Session',
      seminar: 'Seminar',
      workshop: 'Workshop',
    },
    download: { label: 'Download the programme', href: '#program' },
    downloadNote: 'The programme will be available on 20 October 2026',
  },

  schedule: {
    note: 'Both days follow Yekaterinburg local time. Please allow for the November time difference.',
    rows: [
      { city: 'Yekaterinburg', utc: 'UTC+5', start: '12:00', end: '19:00', primary: true },
      { city: 'Moscow / Minsk', utc: 'UTC+3', start: '10:00', end: '17:00' },
      { city: 'Maputo', utc: 'UTC+2', start: '09:00', end: '16:00' },
      { city: 'Brasília', utc: 'UTC−3', start: '04:00', end: '11:00' },
      { city: 'Delhi', utc: 'UTC+5:30', start: '12:30', end: '19:30' },
    ],
    columns: { city: 'City', start: 'Start', end: 'End' },
    languagesLabel: 'Conference languages',
  },

  deadlines: [
    {
      dateLabel: '21 September 2026',
      dateISO: '2026-09-21',
      title: 'Article submissions for the VAK-listed journal',
      note: 'Final day to submit materials for the special issue of "Voprosy Upravleniya".',
    },
    {
      dateLabel: '20 October 2026',
      dateISO: '2026-10-20',
      title: 'Programme published',
      note: 'Sessions, seminars, workshops and the timetable are announced.',
    },
    {
      dateLabel: '1 November 2026',
      dateISO: '2026-11-01',
      title: 'Enrolment for the professional development programme',
      note: 'Final day to register for the programme leading to a certificate of professional development issued by UrFU.',
    },
    {
      dateLabel: '12–13 November 2026',
      dateISO: '2026-11-12',
      title: 'Conference',
      note: 'Yekaterinburg, on site and online.',
      highlight: true,
    },
    {
      dateLabel: '15 January 2027',
      dateISO: '2027-01-15',
      title: 'Publication decisions',
      note: 'Authors are notified of the results of the competitive selection.',
    },
  ],

  conditions: [
    {
      title: 'Papers and presentations',
      paragraphs: [
        'Presentations may be prepared in Russian or English.',
        'When registering as a speaker, please upload your presentation for prior moderation.',
      ],
      list: ['Session paper — 10 minutes', 'Discussion after the paper — up to 5 minutes'],
    },
    {
      title: 'Certificates',
      paragraphs: [
        'After the conference, all registered participants receive electronic documents.',
      ],
      list: [
        'Speakers — speaker certificate',
        'Attendees — participant certificate',
        'Sent to the email address provided at registration within one month of the event',
      ],
    },
    {
      title: 'Publication and professional development certificate',
      paragraphs: [
        'Articles are selected competitively for a special issue of the VAK-listed journal "Voprosy Upravleniya" (Management Issues), No. 1, 2027.',
        `Separately, you may enrol in the professional development programme "Managing an Organisation's Social Capital" and receive a certificate of professional development issued by UrFU. Fee — RUB ${dpoPrice.toLocaleString('en-US')}.`,
      ],
    },
  ],

  committee: [
    {
      photoKey: 'patrakov',
      name: 'Eduard Patrakov',
      role: 'Associate Professor; Head of the Master\'s programme "Organisation and Management in Social Work", Ural Federal University (UrFU)',
      country: 'Russia',
      link: { label: "Master's programme", href: externalLinks.masterProgram, external: true },
    },
    {
      photoKey: 'gushchin',
      name: 'Oleg Gushchin',
      role: 'Director, Ural Institute of Management, a branch of RANEPA',
      country: 'Russia',
      link: { label: 'Ural Institute of Management, RANEPA', href: externalLinks.ranepa, external: true },
    },
    {
      photoKey: 'chevtaeva',
      name: 'Nataliya Chevtaeva',
      role: 'Head of the Department of Human Resource Management and Sociology, Ural Institute of Management, RANEPA; Editor-in-Chief of the journal "Voprosy Upravleniya" (Management Issues)',
      country: 'Russia',
      link: {
        label: '"Voprosy Upravleniya" (Management Issues)',
        href: externalLinks.journal,
        external: true,
      },
    },
    {
      photoKey: 'belozerova',
      name: 'Anna Belozerova',
      role: 'Engineer, Department of Innovation Studies and Intellectual Property; Continuing Professional Education Programme Manager, Institute of Physics and Technology, UrFU',
      country: 'Russia',
      link: {
        label: 'Continuing professional education, Institute of Physics and Technology, UrFU',
        href: externalLinks.urfuDpo,
        external: true,
      },
    },
    {
      photoKey: 'baturina',
      name: 'Lyudmila Baturina',
      role: 'Associate Professor, Department of Foreign Languages, Lomonosov Institute of Fine Chemical Technologies; Director of the International Russian–Brazilian Centre, Russian State University for the Humanities (RSUH); consultant on international partnership',
      country: 'Russia',
      link: {
        label: 'Russian–Brazilian Centre, RSUH',
        href: externalLinks.rsuhBrazil,
        external: true,
      },
    },
    {
      photoKey: 'sosnin',
      name: 'Maksim Sosnin',
      role: 'PhD candidate, Department of Innovation Studies and Intellectual Property, Institute of Physics and Technology, UrFU; conference website moderator',
      country: 'Russia',
    },
    { name: 'To be confirmed', role: '', country: '', pending: true },
    { name: 'To be confirmed', role: '', country: '', pending: true },
  ],

  speakers: [
    {
      photoKey: 'baturina',
      name: 'Lyudmila Baturina',
      role: 'Associate Professor, Department of Foreign Languages, Lomonosov Institute of Fine Chemical Technologies; Director of the International Russian–Brazilian Centre, Russian State University for the Humanities (RSUH)',
      country: 'Russia',
      link: {
        label: 'Russian–Brazilian Centre, RSUH',
        href: externalLinks.rsuhBrazil,
        external: true,
      },
    },
    {
      photoKey: 'deyneka',
      name: 'Olga Deyneka',
      role: 'Doctor of Psychological Sciences; Acting Head of the Department of Political Psychology, Faculty of Psychology, Saint Petersburg State University (SPbU)',
      country: 'Russia',
      link: {
        label: 'Department of Political Psychology, SPbU',
        href: externalLinks.spbu,
        external: true,
      },
    },
    {
      photoKey: 'matemulane',
      name: 'José Matemulane',
      role: "Professor; Head of the Master's programme, Pedagogical University of Maputo",
      country: 'Mozambique',
    },
    {
      photoKey: 'chevtaeva',
      name: 'Nataliya Chevtaeva',
      role: 'Head of the Department of Human Resource Management and Sociology, Ural Institute of Management, RANEPA; Editor-in-Chief of the journal "Voprosy Upravleniya" (Management Issues)',
      country: 'Russia',
      link: {
        label: '"Voprosy Upravleniya" (Management Issues)',
        href: externalLinks.journal,
        external: true,
      },
    },
    {
      photoKey: 'lobanova',
      name: 'Tatyana Lobanova',
      role: 'Candidate of Psychological Sciences; President of the Association of Management Consultants of Russia (NISKU)',
      country: 'Russia',
      link: { label: 'NISKU', href: externalLinks.cmcRussia, external: true },
    },
    {
      photoKey: 'vorontsova',
      name: 'Tatyana Vorontsova',
      role: 'Director, Sredneuralsk Foundation for Small Business Development',
      country: 'Russia',
      link: {
        label: 'Sredneuralsk Foundation',
        href: externalLinks.sredneuralsk,
        external: true,
      },
    },
    {
      photoKey: 'kuntsevich',
      name: 'Lyubov Kuntsevich',
      role: 'Director, Prosto100blago non-profit',
      country: 'Russia',
      link: { label: 'Prosto100blago', href: externalLinks.pro100blago, external: true },
    },
    { name: 'To be confirmed', role: '', country: '', pending: true },
    { name: 'To be confirmed', role: '', country: '', pending: true },
    { name: 'To be confirmed', role: '', country: '', pending: true },
    { name: 'To be confirmed', role: '', country: '', pending: true },
    { name: 'To be confirmed', role: '', country: '', pending: true },
  ],

  pendingPersonLabel: 'Participation being confirmed',

  contacts: [
    {
      country: 'Russia',
      org: 'UrFU, Yekaterinburg',
      people: [
        {
          name: 'Eduard Patrakov',
          email: contactPoints.patrakovEmail,
          phone: contactPoints.patrakovPhone,
        },
        {
          name: 'Anna Belozerova',
          email: contactPoints.belozerovaEmail,
        },
      ],
    },
    { country: 'Belarus', people: [], pending: true },
    { country: 'Brazil', people: [], pending: true },
    { country: 'Mozambique', people: [], pending: true },
    { country: 'India', people: [], pending: true },
  ],

  contactsPendingLabel: 'Coordinator to be confirmed',

  registration: {
    title: 'Conference registration',
    lead: 'Four short steps. Required fields are marked with an asterisk—the rest are optional.',
    progressLabel: 'Step {current} of {total}',
    steps: [
      {
        id: 'about',
        title: 'About you',
        description: 'How we should address you and where you are based.',
        fields: [
          {
            name: 'fullName',
            label: 'Full name',
            type: 'text',
            required: true,
            placeholder: 'Jane Smith',
            error: 'Please enter your first and last name',
          },
          {
            name: 'country',
            label: 'Country',
            type: 'radio',
            required: true,
            options: [
              { value: 'ru', label: 'Russia' },
              { value: 'by', label: 'Belarus' },
              { value: 'br', label: 'Brazil' },
              { value: 'mz', label: 'Mozambique' },
              { value: 'in', label: 'India' },
              { value: 'other', label: 'Other' },
            ],
            error: 'Please select a country',
          },
          {
            name: 'countryOther',
            label: 'Which country',
            hint: 'Required if you selected "Other".',
            type: 'text',
            placeholder: 'For example, Kazakhstan',
          },
          {
            name: 'organization',
            label: 'Organisation',
            hint: 'Full official name of your university or company.',
            type: 'text',
            required: true,
            placeholder: 'Ural Federal University',
            error: 'Please enter your organisation',
          },
        ],
      },
      {
        id: 'role',
        title: 'Your role',
        description: 'This helps us assign participants to sessions.',
        fields: [
          {
            name: 'position',
            label: 'How you are taking part',
            type: 'radio',
            required: true,
            options: [
              { value: 'researcher', label: 'Academic / teaching staff' },
              { value: 'student', label: 'Bachelor\'s or Master\'s student' },
              { value: 'phd', label: 'PhD candidate / doctoral student' },
              { value: 'nonprofit', label: 'Representative of the non-profit sector' },
              { value: 'business', label: 'Representative of small or medium-sized business' },
              { value: 'other', label: 'Other' },
            ],
            error: 'Please select an option',
          },
          {
            name: 'positionOther',
            label: 'Please specify your role',
            hint: 'Required if you selected "Other".',
            type: 'text',
          },
          {
            name: 'researchProfile',
            label: 'Research profile',
            hint: 'Link to ORCID, Scopus, ResearchGate, Lattes or a personal page.',
            type: 'url',
            placeholder: 'https://orcid.org/0000-0001-7564-9136',
            error: 'Please enter a valid URL',
          },
          {
            name: 'professionalPage',
            label: 'Professional page',
            hint: 'Organisation website or your profile, if available.',
            type: 'url',
            placeholder: 'https://example.org/team/smith',
            error: 'Please enter a valid URL',
          },
        ],
      },
      {
        id: 'participation',
        title: 'Participation format',
        description: 'You may select more than one option.',
        fields: [
          {
            name: 'participation',
            label: 'How you plan to take part',
            type: 'checkbox-group',
            required: true,
            options: [
              {
                value: 'listener',
                label: 'Attendee: full conference participation without a paper',
              },
              {
                value: 'academic',
                label: 'Oral research paper without published proceedings',
              },
              {
                value: 'practical',
                label:
                  'Oral practice-oriented paper on building or implementing social capital',
              },
            ],
            error: 'Please select at least one option',
          },
          {
            name: 'wantsPublication',
            label:
              'I wish to submit an article to the special issue of the VAK-listed journal "Voprosy Upravleniya" (Management Issues), No. 1, 2027',
            hint: 'Submissions close on 21 September 2026; publication decisions by 15 January 2027. Selection is competitive.',
            type: 'checkbox',
          },
          {
            name: 'wantsCertificate',
            label: 'I would like more information about the professional development programme',
            hint: `"Managing an Organisation's Social Capital"; certificate of professional development issued by UrFU; RUB ${dpoPrice.toLocaleString('en-US')}; registration until 1 November 2026.`,
            type: 'checkbox',
          },
        ],
      },
      {
        id: 'contact',
        title: 'Contact details',
        description: 'Access links and materials will be sent to this address.',
        fields: [
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'example@site.com',
            error: 'Please enter a valid email address',
          },
          {
            name: 'comment',
            label: 'Topic you would like to discuss',
            hint: 'Optional. If you wish to propose a discussion topic, enter it here.',
            type: 'textarea',
          },
        ],
      },
    ],
    submitLabel: 'Submit registration',
    backLabel: 'Back',
    nextLabel: 'Next',
    consent: 'I consent to the processing of my personal data',
    consentLink: {
      label: 'Personal data processing policy',
      href: externalLinks.privacyPolicy,
      external: true,
    },
    successTitle: 'Registration submitted',
    successBody:
      'We have received your registration. Materials and access links will be sent to the email address you provided.',
    errorTitle: 'Submission failed',
    errorBody: `Please try again or write to us at ${contactPoints.patrakovEmail}.`,
  },

  footer: {
    note: 'International academic and practice-oriented conference "Social Capital of Small and Medium-Sized Business". Organised by UrFU and the Ural Institute of Management, RANEPA.',
    imagesNote: 'Illustrations are drawn from open sources.',
    links: [
      { label: 'UrFU', href: externalLinks.urfu, external: true },
      {
        label: 'Ural Institute of Management, RANEPA',
        href: externalLinks.ranepa,
        external: true,
      },
      {
        label: '"Voprosy Upravleniya" (Management Issues)',
        href: externalLinks.journal,
        external: true,
      },
      {
        label: 'Personal data processing',
        href: externalLinks.privacyPolicy,
        external: true,
      },
    ],
  },

  ui: {
    skipToContent: 'Skip to content',
    menu: 'Menu',
    close: 'Close',
    languageSwitch: 'Русский',
    scrollHint: 'Scroll down',
    toTop: 'Back to top',
    externalLinkHint: 'Opens in a new tab',
  },
};
