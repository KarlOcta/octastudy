/**
 * Gemeinsame Bausteine für die Suche über die Jura-Lernunterlagen.
 *
 * Der Suchtext wird beim Bauen erzeugt und bereits normalisiert abgelegt,
 * damit der Browser zur Laufzeit nur noch die Eingabe normalisieren muss.
 * `normalisieren` muss deshalb mit der gleichnamigen Funktion in
 * JuraSuche.astro übereinstimmen — ändert sich eine, ändert sich die andere.
 */

export function normalisieren(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

type Schema = {
  slug: string;
  keyword: string;
  linkLabel?: string;
  h1: string;
  teilgebiet: string;
  rechtsgebiet: string;
  suchbegriffe?: string;
};

/**
 * Alles, worüber gefunden werden soll: Paragraf, Gesetz, Klarname,
 * Teilgebiet, Rechtsgebiet und die redaktionell gepflegten Synonyme.
 */
export function suchtextFuer(e: Schema, extra = ''): string {
  const roh = normalisieren(
    [
      e.slug.replace(/-/g, ' '),
      e.keyword,
      e.linkLabel ?? '',
      e.h1,
      e.teilgebiet,
      e.rechtsgebiet,
      e.suchbegriffe ?? '',
      extra,
    ].join(' ')
  );
  /* Doppelte Wörter raus. Gesucht wird Wort für Wort, nie nach ganzen
     Wendungen — die Reihenfolge ist also gleichgültig, und "bgb" dreimal im
     Text bringt nichts außer Bytes. Auf den Detailseiten liegen 53 dieser
     Texte im HTML, da zählt das. */
  return [...new Set(roh.split(' '))].join(' ');
}

/** Kurzer Ankertext: Klarname mit Paragraf, sonst das Stichwort. */
export function kurzLabel(e: Schema): string {
  return e.linkLabel ?? e.keyword.replace(/\s*Schema$/, '');
}
