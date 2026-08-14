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

/** Angaben für Impressum, Datenschutz und E-E-A-T. Vor Livegang ersetzen. */
export const OWNER = {
  name: '[PLATZHALTER: Vor- und Nachname]',
  street: '[PLATZHALTER: Straße und Hausnummer]',
  city: '[PLATZHALTER: PLZ und Ort]',
  country: 'Deutschland',
  email: '[PLATZHALTER: kontakt@octastudy.com]',
  /** Optional, nur falls vorhanden: */
  vatId: '[PLATZHALTER: USt-IdNr. oder Zeile löschen]',
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
  appStoreUrl: 'https://apps.apple.com/app/octa',
  pitch:
    'Octa macht aus deinen hochgeladenen Unterlagen automatisch Karteikarten. Du sprichst die Antwort ein und bekommst echtes mündliches Feedback.',
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const NAV: NavItem[] = [
  { label: 'Schemata', href: '/schemata/' },
  { label: 'Tools', href: '/tools/' },
  { label: 'Über uns', href: '/ueber-uns/' },
];

export const FOOTER_NAV: NavItem[] = [
  { label: 'Über uns', href: '/ueber-uns/' },
  { label: 'Impressum', href: '/impressum/' },
  { label: 'Datenschutz', href: '/datenschutz/' },
];
