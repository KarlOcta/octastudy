/**
 * Zentrale Konfiguration der Seite.
 * Alle mit [PLATZHALTER] markierten Werte vor dem Livegang ersetzen.
 */

export const SITE = {
  name: 'octastudy',
  url: 'https://octastudy.com',
  /** Wird als <title>-Suffix und in der Schema.org-Organisation genutzt */
  tagline: 'Prüfungsschemata, Lerntools und Karteikarten für dein Studium',
  description:
    'Vollständige Prüfungsschemata zum Ausklappen und Ausdrucken, kostenlose Lerntools und fertige Karteikarten-Decks — für Studierende, die effizienter lernen wollen.',
  locale: 'de_DE',
  lang: 'de',
} as const;

/**
 * Angaben für Impressum und Datenschutz.
 * Übernommen von octa-ai.app/imprint.
 */
export const OWNER = {
  /** Marke / Geschäftsbezeichnung */
  brand: 'octa AI — Intelligent Learning Solutions',
  name: 'Mathias Horner',
  street: 'Heinrichsallee 42',
  city: '52062 Aachen',
  country: 'Deutschland',
  email: 'info@octaai.com',
} as const;

/** Redaktion — für E-E-A-T und Article-Markup auf den Schema-Seiten */
export const AUTHOR = {
  name: '[PLATZHALTER: Name des Autors]',
  role: '[PLATZHALTER: z. B. Volljurist / Jurastudent im 8. Semester]',
  bio: '[PLATZHALTER: 2–3 Sätze fachlicher Hintergrund]',
} as const;

/** Fachlicher Gegenleser für die juristischen Inhalte */
export const REVIEWER = {
  name: '[PLATZHALTER: Name des fachlichen Gegenlesers]',
  role: '[PLATZHALTER: Qualifikation, z. B. Rechtsanwalt]',
} as const;

export const OCTA = {
  name: 'Octa',
  appStoreUrl:
    'https://apps.apple.com/de/app/octa-ai-tutor-study-plan/id6751514384',
  appStoreUrlEn:
    'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384',
  pitch:
    'Octa macht aus deinen hochgeladenen Unterlagen automatisch Karteikarten. Du sprichst die Antwort ein und bekommst echtes mündliches Feedback.',
  pitchEn:
    'Octa automatically turns your uploaded material into flashcards. You speak your answer out loud and get real spoken feedback.',
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const NAV: NavItem[] = [
  { label: 'Lernunterlagen', href: '/lernunterlagen/' },
  { label: 'Tools', href: '/tools/' },
  // { label: 'Über uns', href: '/ueber-uns/' },  ← wieder einblenden, sobald Autor + Gegenleser feststehen
];

export const FOOTER_NAV: NavItem[] = [
  // { label: 'Über uns', href: '/ueber-uns/' },  ← siehe oben
  { label: 'Impressum', href: '/impressum/' },
  { label: 'Datenschutz', href: '/datenschutz/' },
];

/**
 * Englische Navigation. Bewusst schlank: Solange nur einzelne Seiten (z. B.
 * der Lerntyp-Test) uebersetzt sind, verlinkt die Hauptnavigation nicht auf
 * deutschsprachige Unterseiten, die ein englischsprachiger Besucher nicht
 * lesen kann. Wird erweitert, sobald mehr /en/-Seiten existieren.
 */
export const NAV_EN: NavItem[] = [];

export const FOOTER_NAV_EN: NavItem[] = [
  { label: 'Imprint', href: '/impressum/' },
  { label: 'Privacy Policy', href: '/datenschutz/' },
];

export const SITE_EN = {
  tagline: 'Study tools and exam prep for students',
} as const;
