/**
 * Zentrale Konfiguration der Seite.
 * Alle mit [PLATZHALTER] markierten Werte vor dem Livegang ersetzen.
 */

export const SITE = {
  name: 'octastudy',
  url: 'https://octastudy.com',
  /** Wird als <title>-Suffix und in der Schema.org-Organisation genutzt */
  tagline: 'Prüfungsschemata und Lerntools fürs Studium',
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
  /** Maskottchen — der kleine Oktopus. Fuer Zubehoer wie Karteikarten- und
   *  Schema-Seiten, wo eine Portion Persoenlichkeit neben der reinen App-CTA
   *  gut tut. */
  mascot: '/img/octa-mascot@1x.webp',
} as const;

/**
 * Echte App-Store-Gesamtbewertung, fuer Bewertungs-Elemente ausserhalb des
 * Lerntyp-Tests (z. B. die rotierenden Slides der StickyAppCta). Inhaltlich
 * identisch mit der Konstante STORE im Lerntyp-Test
 * (src/pages/tools/lerntyp-test.astro bzw. .../en/tools/lerntyp-test.astro)
 * — bei einer Aktualisierung bitte an beiden Stellen nachziehen.
 */
export const APP_RATING = {
  de: { schnitt: '5,0', anzahl: 9, stand: 'Juli 2026' },
  en: { schnitt: '5.0', anzahl: 9, stand: 'July 2026' },
} as const;

/**
 * Echte App-Store-Rezensionen, fuer die rotierenden Slides der StickyAppCta.
 * Inhaltlich dieselben drei Rezensionen wie R im Lerntyp-Test (siehe
 * Kommentar bei APP_RATING) — dort behalten "fifi" und "dexter" bewusst
 * ihr englisches Zitat ("Simple, effective, and motivating" / "one app
 * that replaces many"), weil das dort redaktionell eingebettet ist. Im
 * engen Rotator der StickyAppCta stehen sie dagegen isoliert und einzeln
 * fuer sich, ohne den umgebenden Satz — deshalb hier vollstaendig auf
 * Deutsch uebersetzt, damit auf der deutschen Seite nicht ploetzlich ein
 * rein englischer Ausschnitt auftaucht. Verfassername ohne "· App Store"-
 * Zusatz, da der Platz im Rotator knapp ist.
 */
export const APP_REVIEWS = {
  de: [
    {
      t: 'Zwei Tage vor der Klausur, Lernplan in zwei Minuten — am Ende 12 Punkte.',
      w: 'Timmi.bremmen',
    },
    {
      t: 'Einfach, wirksam und motivierend — vor allem hilft es mir, organisiert zu bleiben.',
      w: 'So fifi',
    },
    {
      t: 'Endlich eine App, die viele ersetzt: Karteikarten, Übersetzer und Sprachnotizen zusammen.',
      w: 'DexterBerlin36',
    },
  ],
  en: [
    {
      t: 'Two days before the final, study plan in two minutes — ended up with an A.',
      w: 'Timmi.bremmen',
    },
    {
      t: '"Simple, effective, and motivating" — it mostly just helps me stay organized.',
      w: 'So fifi',
    },
    {
      t: 'Finally "one app that replaces many": flashcards, translator, and voice notes all together.',
      w: 'DexterBerlin36',
    },
  ],
} as const;

/**
 * Eigene Custom Product Page je Studienfach im App Store. Wird auf
 * Schema-/Lernunterlagen-Seiten fuer den fachbezogenen "Octa im App Store
 * ansehen"-Link und in den zugehoerigen PDF-Downloads (QR-Code + Button)
 * verwendet, statt auf den generischen Store-Eintrag zu verlinken.
 * Quelle: dieselben CPP-Links wie in APPSTORE_FACH im Lerntyp-Test.
 */
export const APPSTORE_CPP: Record<string, string> = {
  bwl: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=5e62b38e-ae44-4737-b678-a8f9e0c96bb5',
  jura: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=a3a05de4-ab6d-4092-9e53-cfa0f9e532a0',
  medizin: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=63728cf3-1a70-4e35-82a0-866343086ac9',
  maschinenbau: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=6318a976-b1a9-456e-a118-c0fbad9b685e',
  informatik: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=df1d796b-97d9-4bd4-87e2-758042118c8d',
  psychologie: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=b662772d-b6a5-46f6-b92d-c3aa747ddd76',
  lehramt: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=822e9c4a-bf4d-4bc9-ad68-9b563dc48b6c',
  biologie: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=b3b8b246-30ed-42c3-b413-5a1636a3b0a4',
  elektrotechnik: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=1531593d-c66a-4be7-b69c-fe76c032dd4c',
  bauingenieurwesen: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=2716c635-5308-4841-8016-777ffebc4bbf',
  wirtschaftsingenieurwesen: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=4745253d-cc47-4bbe-86c2-2a0d0275d96e',
  sozialearbeit: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=f2595664-5e02-4b28-844f-3f156417d735',
  politikwissenschaft: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=0694b941-3a93-44db-8cb3-1f44383dee27',
  chemie: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=8b5e5b12-f6f9-48a6-acc0-01f352b39ac9',
  sportwissenschaften: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=fba84a84-1863-4fd5-ac19-ab5433b32c1d',
  andere: 'https://apps.apple.com/us/app/octa-ai-tutor-study-plan/id6751514384?ppid=79f9c591-a1f8-4bb6-94f2-eef83077bd8f',
};

/**
 * Liefert den fachbezogenen App-Store-Link (Custom Product Page) in der
 * passenden Storefront-Sprache. APPSTORE_CPP ist mit der US-Storefront
 * (/us/app/) hinterlegt; fuer deutschsprachige Seiten wird daraus die
 * deutsche Storefront (/de/app/) abgeleitet — die ppid (und damit die in
 * App Store Connect hinterlegte Custom Product Page) bleibt dieselbe, nur
 * Sprache/Waehrung der Store-Seite aendern sich, genau wie es OCTA.appStoreUrl
 * (/de/) gegenueber OCTA.appStoreUrlEn (/us/) fuer den generischen Store-Link
 * bereits vormacht. Ohne eigene CPP fuer das Fach greift der generische
 * Store-Link in der jeweiligen Sprache.
 */
export function appStoreCppUrl(subject: string, lang: 'de' | 'en' = 'de'): string {
  const cpp = APPSTORE_CPP[subject];
  if (!cpp) return lang === 'en' ? OCTA.appStoreUrlEn : OCTA.appStoreUrl;
  return lang === 'en' ? cpp : cpp.replace('/us/app/', '/de/app/');
}

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
export const NAV_EN: NavItem[] = [{ label: 'The App', href: '/en/app/' }];

export const FOOTER_NAV_EN: NavItem[] = [
  { label: 'Imprint', href: '/impressum/' },
  { label: 'Privacy Policy', href: '/datenschutz/' },
];

export const SITE_EN = {
  tagline: 'Study tools and exam prep for students',
} as const;
