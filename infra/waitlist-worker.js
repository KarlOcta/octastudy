/**
 * octastudy — Android-Warteliste
 *
 * Aufgaben:
 *   POST  /           nimmt eine Anmeldung entgegen und schreibt sie nach D1
 *   GET   /liste      geschützte Übersicht als HTML-Tabelle
 *   GET   /liste.csv  geschützter CSV-Download
 *   POST  /lauf       anonyme Statistik eines Testdurchlaufs
 *   GET   /statistik  geschützte Auswertung der Testdurchläufe
 *   POST  /meta-event meldet das Event "QuizCompleteAppClick" zusätzlich
 *                     serverseitig an Meta (Conversions API), nur mit
 *                     Einwilligung bzw. US-Ausnahme ausgelöst — siehe
 *                     BaseLayout.astro und datenschutz.astro Ziffer 8
 *
 * Kein Mailversand, keine eigenen Cookies, kein Tracking außer dem
 * ausdrücklich in der Datenschutzerklärung offengelegten Meta-Event oben.
 *
 * Erforderlich:
 *   D1-Binding  DB               → Datenbank octastudy
 *   Secret      ADMIN_PASSWORT   → frei wählbares Passwort für /liste
 *   Secret      META_CAPI_TOKEN  → Zugriffstoken aus Events Manager
 *                                  (Conversions API), nötig für /meta-event
 *
 * Ohne gesetztes ADMIN_PASSWORT ist die Übersicht komplett gesperrt. Ohne
 * gesetztes META_CAPI_TOKEN antwortet /meta-event nur mit einem Fehlercode,
 * ohne dass am Frontend etwas kaputtgeht.
 */

const ERLAUBTE_HERKUNFT = [
  'https://octastudy.com',
  'https://www.octastudy.com',
  'http://localhost:4321',
  'http://localhost:4343',
];

/* Meta-Pixel-ID des eigens fuer octastudy.com angelegten Datasets
   ("Octa – octastudy.com" in Events Manager). Nicht geheim — dieselbe ID
   steht ohnehin oeffentlich im Seitenquelltext (siehe site.ts). Das
   eigentliche Geheimnis ist allein das Zugriffstoken, siehe META_CAPI_TOKEN
   unten (Cloudflare-Secret, nicht im Code). */
const META_PIXEL_ID = '830306140110313';

/* ------------------------------------------------------------ Hilfsmittel */

function kopf(origin) {
  const ok = ERLAUBTE_HERKUNFT.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : ERLAUBTE_HERKUNFT[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
  };
}

function antwort(daten, status, head) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { ...head, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/* Passwortvergleich mit konstanter Laufzeit, damit sich das Passwort nicht
   zeichenweise erraten lässt. */
function gleich(a, b) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/* Liest das Passwort aus dem Basic-Auth-Kopf. Wichtig: atob liefert Bytes als
   Zeichen zurueck; Umlaute und Sonderzeichen muessen erst wieder als UTF-8
   gelesen werden, sonst stimmt der Vergleich bei solchen Passwoertern nie. */
function passwortAus(header) {
  if (!header.startsWith('Basic ')) return null;
  try {
    const roh = atob(header.slice(6).trim());
    const bytes = Uint8Array.from(roh, (c) => c.charCodeAt(0));
    const text = new TextDecoder('utf-8').decode(bytes);
    const i = text.indexOf(':');
    return i === -1 ? null : text.slice(i + 1);
  } catch {
    return null;
  }
}

/* Gibt zurueck, warum es nicht geklappt hat — damit sich ein fehlendes Secret
   von einem falschen Passwort unterscheiden laesst. */
function pruefen(request, env) {
  const pw = env.ADMIN_PASSWORT;
  if (typeof pw !== 'string' || pw.length === 0) return 'kein-secret';
  if (pw.length < 8) return 'zu-kurz';
  const eingabe = passwortAus(request.headers.get('Authorization') || '');
  if (eingabe === null) return 'falsch';
  return gleich(eingabe, pw) ? 'ok' : 'falsch';
}

/* Muss eine Funktion sein: Cloudflare erlaubt kein Response-Objekt im globalen
   Gueltigkeitsbereich, es darf erst innerhalb des Handlers entstehen. */
function sperre() {
  return new Response('Zugang nur mit Passwort.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="octastudy Warteliste", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

/* Klartext-Hinweis statt Passwortfenster — sonst fragt der Browser endlos
   nach, obwohl das Problem gar nicht beim eingegebenen Passwort liegt. */
function hinweis(text) {
  return new Response(text, {
    status: 503,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

/* Fragen und Antworten des Tests — nur zur Beschriftung der Statistik.
   Aendert sich der Quiz-Text in lerntyp-test.astro, hier mitziehen. */
const FRAGEN = [
  {
    q: "Du setzt dich hin, um zu lernen. Was passiert in den ersten zehn Minuten?",
    a: [
      "Ich blättere durch meine Unterlagen und suche, womit ich anfange",
      "Ich lese da weiter, wo ich aufgehört habe, und markiere",
      "Ich rechne aus, wie viele Tage noch bis zur Prüfung sind",
      "Ich fange an — aber es merkt ohnehin niemand, ob ich dranbleibe",
    ],
  },
  {
    q: "Wie sehen deine Unterlagen gerade aus?",
    a: [
      "Skripte, Fotos, Screenshots, PDFs — verteilt über mehrere Apps",
      "Ordentlich abgelegt, aber nie wirklich durchgearbeitet",
      "Vollgeschrieben und in drei Farben markiert",
      "Kaum was. Ich lerne aus dem, was ich kurz vorher zusammensuche",
    ],
  },
  {
    q: "Du hast ein Kapitel gelesen und verstanden. Zwei Tage später?",
    a: [
      "Ich erkenne alles wieder — frei wiedergeben könnte ich es nicht",
      "Weg. Als hätte ich es nie gelesen",
      "Sitzt — solange ich es aufschreiben darf",
      "Keine Ahnung, so früh lerne ich nie",
    ],
  },
  {
    q: "Jemand fragt dich mündlich ab. Erster Gedanke?",
    a: [
      "Bitte nicht. Ich weiß es, ich kriege es nur nicht raus",
      "Gern — so merke ich überhaupt erst, was ich wirklich kann",
      "Geht klar, wenn ich vorher kurz nachsehen darf",
      "Kommt drauf an, wer fragt. Vor anderen wird es schlimmer",
    ],
  },
  {
    q: "Wann lernst du wirklich — nicht wann du es dir vornimmst?",
    a: [
      "Ab etwa einer Woche vorher, dann ziemlich konstant",
      "Zwei, drei Tage vorher. Dann aber durch",
      "Ich fange früh an und verliere schnell wieder den Faden",
      "Ich nehme mir jeden Tag etwas vor und schiebe es dann",
    ],
  },
  {
    q: "Allein oder mit anderen?",
    a: [
      "Allein. Alles andere lenkt mich ab",
      "Allein — aber mir fehlt jemand, dem auffällt, wenn ich nichts t…",
      "Mit anderen. Wobei wir mehr reden als lernen",
      "Gegenseitig abfragen ist das Einzige, was bei mir hängen bleibt",
    ],
  },
  {
    q: "Was sagst du am häufigsten nach einer Prüfung?",
    a: [
      "Ich hatte einfach zu wenig Zeit",
      "Ich habe das Falsche gelernt",
      "Ich wusste es. Ich habe es nur nicht rausbekommen",
      "Gelesen hatte ich es. Abrufbar war es nicht",
    ],
  },
  {
    q: "Was fehlt dir gerade am meisten?",
    a: [
      "Jemand, der mich abfragt und merkt, wenn die Antwort schwammig…",
      "Ordnung in dem, was ich schon alles gesammelt habe",
      "Eine Methode, bei der es wirklich hängen bleibt",
      "Ein Plan, der mir sagt, was heute dran ist",
      "Jemand, dem auffällt, ob ich dranbleibe",
      "Ein Rhythmus, statt immer nur kurz vorher",
    ],
  },
];

/* Lesbare Namen für die Fach-Schlüssel aus dem Lerntyp-Test */
const FACH = {
  bwl: 'BWL & Wirtschaft',
  jura: 'Rechtswissenschaft',
  medizin: 'Medizin',
  maschinenbau: 'Maschinenbau',
  informatik: 'Informatik',
  psychologie: 'Psychologie',
  lehramt: 'Lehramt',
  biologie: 'Biologie',
  elektrotechnik: 'Elektrotechnik',
  bauingenieurwesen: 'Bauingenieurwesen',
  wirtschaftsingenieurwesen: 'Wirtschaftsingenieurwesen',
  sozialearbeit: 'Soziale Arbeit',
  politikwissenschaft: 'Politikwissenschaft',
  chemie: 'Chemie',
  sportwissenschaften: 'Sportwissenschaften',
  andere: 'Anderes Fach',
};

const fachName = (k) => FACH[k] || (k ? String(k) : '— ohne Angabe');

/* Lesbare Namen für die sechs Lerntypen */
const TYP = {
  koenner: 'Der stille Könner',
  sammler: 'Der Sammler',
  markierer: 'Der Markierer',
  ueberfordert: 'Der Überforderte',
  einzel: 'Der Einzelkämpfer',
  sprinter: 'Der Sprinter',
};

const typName = (k) => TYP[k] || (k ? String(k) : '— ohne Angabe');

function datum(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return esc(iso);
  const z = (n) => String(n).padStart(2, '0');
  return `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()} ${z(d.getHours())}:${z(d.getMinutes())}`;
}

/* ------------------------------------------------------------- Übersicht */

function seite(zeilen) {
  const gesamt = zeilen.length;

  const proFach = {};
  for (const z of zeilen) {
    const n = fachName(z.fach);
    proFach[n] = (proFach[n] || 0) + 1;
  }
  const faecher = Object.entries(proFach).sort((a, b) => b[1] - a[1]);

  const proTyp = {};
  for (const z of zeilen) {
    const n = typName(z.lerntyp);
    proTyp[n] = (proTyp[n] || 0) + 1;
  }
  const typen = Object.entries(proTyp).sort((a, b) => b[1] - a[1]);

  const heute = new Date().toISOString().slice(0, 10);
  const neu = zeilen.filter((z) => String(z.angelegt_am).slice(0, 10) === heute).length;

  const tabelle = gesamt
    ? zeilen
        .map(
          (z, i) => `<tr>
            <td class="n">${gesamt - i}</td>
            <td><a href="mailto:${esc(z.email)}">${esc(z.email)}</a></td>
            <td>${esc(fachName(z.fach))}</td>
            <td>${esc(typName(z.lerntyp))}</td>
            <td class="d">${datum(z.angelegt_am)}</td>
          </tr>`
        )
        .join('')
    : `<tr><td colspan="5" class="leer">Noch keine Anmeldungen.</td></tr>`;

  const balken = (paare) =>
    paare.length
      ? paare
          .map(
            ([f, n]) =>
              `<li><span class="bal" style="width:${Math.round((n / paare[0][1]) * 100)}%"></span>
               <b>${esc(f)}</b><i>${n}</i></li>`
          )
          .join('')
      : '<li class="leer">—</li>';

  return `<!doctype html>
<html lang="de"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Android-Warteliste — octastudy</title>
<style>
  :root{--pink:#d6146e;--violett:#5b4bd0;--navy:#2c2a44;--rand:#e7e4f2;--soft:#f6f4fd}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
       color:var(--navy);background:#fcfbff;padding:2.5rem 1.5rem 5rem}
  .w{max-width:940px;margin:0 auto}
  h1{font-size:1.7rem;font-weight:800;letter-spacing:-.012em}
  h1 span{color:var(--pink)}
  .sub{color:#6f6b8e;margin-top:.35rem}
  .zahlen{display:flex;gap:1rem;flex-wrap:wrap;margin:2rem 0}
  .z{flex:1;min-width:150px;background:#fff;border:1px solid var(--rand);
     border-radius:14px;padding:1.1rem 1.2rem}
  .z b{display:block;font-size:1.9rem;font-weight:800;line-height:1.15;overflow-wrap:break-word}
  .z small{color:#6f6b8e}
  h2{font-size:1.05rem;font-weight:800;margin:2.2rem 0 .9rem}
  h2::after{content:"";display:block;width:52px;height:3px;border-radius:2px;margin-top:.45rem;
            background:linear-gradient(90deg,var(--pink),var(--violett))}
  ul{list-style:none;background:#fff;border:1px solid var(--rand);border-radius:14px;overflow:hidden}
  li{position:relative;display:flex;align-items:center;gap:.6rem;padding:.7rem 1rem;
     border-top:1px solid var(--rand)}
  li:first-child{border-top:0}
  .bal{position:absolute;left:0;top:0;bottom:0;background:var(--soft);z-index:0}
  li b,li i{position:relative;z-index:1}
  li b{font-weight:600}
  li i{margin-left:auto;font-style:normal;font-weight:800;color:var(--violett)}
  table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--rand);
        border-radius:14px;overflow:hidden}
  th{text-align:left;font-size:.75rem;letter-spacing:.07em;text-transform:uppercase;
     color:#6f6b8e;padding:.75rem 1rem;background:var(--soft)}
  td{padding:.75rem 1rem;border-top:1px solid var(--rand)}
  td.n{color:#9b97b5;width:52px}
  td.d{color:#6f6b8e;white-space:nowrap}
  td.leer{text-align:center;color:#9b97b5;padding:2.5rem}
  a{color:var(--violett)}
  .btn{display:inline-block;margin-top:1.2rem;background:linear-gradient(90deg,var(--pink),#c51e8f);
       color:#fff;text-decoration:none;font-weight:700;padding:.7rem 1.3rem;border-radius:999px}
  .hint{color:#6f6b8e;font-size:.87rem;margin:-.35rem 0 .8rem;max-width:60ch}
  .nav{margin:1.4rem 0 0;font-size:.9rem}
  .nav a{color:var(--violett);margin-right:1.2rem}
  .fuss{margin-top:2.5rem;font-size:.82rem;color:#8b87a6;line-height:1.6}
  @media(max-width:560px){td.d,th.d{display:none}}
</style></head><body><div class="w">

<h1>Android-<span>Warteliste</span></h1>
<p class="sub">Anmeldungen aus dem Lerntyp-Test auf octastudy.com</p>
<p class="nav"><a href="/statistik">→ Test-Statistik</a><a href="/liste.csv">→ Als CSV</a></p>

<div class="zahlen">
  <div class="z"><b>${gesamt}</b><small>Anmeldungen insgesamt</small></div>
  <div class="z"><b>${neu}</b><small>davon heute</small></div>
  <div class="z"><b>${esc(typen.length ? typen[0][0] : '—')}</b><small>häufigster Lerntyp</small></div>
</div>

<h2>Nach Lerntyp</h2>
<p class="hint">Welches Problem die Leute bei sich selbst sehen — die Grundlage dafür,
worauf die Werbung einzahlen sollte.</p>
<ul>${balken(typen)}</ul>

<h2>Nach Studienfach</h2>
<ul>${balken(faecher)}</ul>

<h2>Alle Anmeldungen</h2>
<table>
  <tr><th class="n">#</th><th>E-Mail</th><th>Fach</th><th>Lerntyp</th><th class="d">Eingetragen</th></tr>
  ${tabelle}
</table>
<a class="btn" href="/liste.csv">Als CSV herunterladen</a>

<p class="fuss">
  Personenbezogene Daten. Nicht weitergeben, nicht in unverschlüsselten Kanälen teilen.<br>
  Löschverlangen erfüllst du im Cloudflare-Dashboard unter D1 &rarr; octastudy &rarr; Console:<br>
  <code>DELETE FROM warteliste WHERE email = 'adresse@beispiel.de';</code>
</p>

</div></body></html>`;
}

function csv(zeilen) {
  const feld = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const kopfzeile = 'email,fach,lerntyp,quelle,angelegt_am,einwilligung';
  const body = zeilen
    .map((z) => [z.email, z.fach, z.lerntyp, z.quelle, z.angelegt_am, z.einwilligung].map(feld).join(','))
    .join('\n');
  return '﻿' + kopfzeile + '\n' + body + '\n';
}



/* --------------------------------------------------------- Testdurchlauf */

/* Speichert einen Testdurchlauf anonym. Der Schluessel `lauf` wird im Browser
   je Seitenaufruf neu erzeugt und nirgends abgelegt — er dient allein dazu,
   spaetere Meldungen desselben Durchlaufs derselben Zeile zuzuordnen. Es
   werden weder IP-Adresse noch Cookie noch Kennwiedererkennung gespeichert. */
async function lauf(request, env) {
  const origin = request.headers.get('Origin') || '';
  const head = kopf(origin);
  if (!ERLAUBTE_HERKUNFT.includes(origin)) {
    return antwort({ ok: false, fehler: 'herkunft' }, 403, head);
  }

  let d;
  try {
    d = JSON.parse(await request.text());
  } catch {
    return antwort({ ok: false, fehler: 'format' }, 400, head);
  }

  const id = String(d.lauf || '').slice(0, 64);
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) {
    return antwort({ ok: false, fehler: 'lauf' }, 400, head);
  }

  const ganz = (v, min, max) => {
    const n = parseInt(v, 10);
    return isNaN(n) ? min : Math.min(max, Math.max(min, n));
  };

  const fach = String(d.fach || '').slice(0, 60);
  const lerntypWert = String(d.lerntyp || '').slice(0, 40);
  const schritt = ganz(d.schritt, 0, 20);
  const fertig = d.abgeschlossen ? 1 : 0;
  const dauer = ganz(d.dauer_sek, 0, 86400);
  const geraet = ['ios', 'android', 'desktop', 'andere'].includes(d.geraet) ? d.geraet : 'andere';
  const antworten = String(d.antworten || '')
    .replace(/[^0-9,]/g, '')
    .slice(0, 60);

  try {
    await env.DB.prepare(
      `INSERT INTO testlaeufe
         (lauf, fach, schritt, abgeschlossen, lerntyp, antworten, dauer_sek, geraet, angelegt_am)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
       ON CONFLICT(lauf) DO UPDATE SET
         fach          = excluded.fach,
         schritt       = MAX(testlaeufe.schritt, excluded.schritt),
         abgeschlossen = MAX(testlaeufe.abgeschlossen, excluded.abgeschlossen),
         lerntyp       = CASE WHEN excluded.lerntyp <> '' THEN excluded.lerntyp ELSE testlaeufe.lerntyp END,
         antworten     = CASE WHEN LENGTH(excluded.antworten) >= LENGTH(testlaeufe.antworten)
                              THEN excluded.antworten ELSE testlaeufe.antworten END,
         dauer_sek     = MAX(testlaeufe.dauer_sek, excluded.dauer_sek),
         geraet        = excluded.geraet`
    )
      .bind(id, fach, schritt, fertig, lerntypWert, antworten, dauer, geraet, new Date().toISOString())
      .run();
  } catch (e) {
    return antwort({ ok: false, fehler: 'datenbank' }, 500, head);
  }

  return antwort({ ok: true }, 200, head);
}

/* --------------------------------------------------- Meta Conversions API */

/* Meldet das eine, fest vorgegebene Ereignis "QuizCompleteAppClick"
   zusaetzlich serverseitig an Meta — redundant zum clientseitigen Pixel-
   Aufruf in BaseLayout.astro, mit derselben event_id, damit Meta beide
   Meldungen als ein Ereignis erkennt (Deduplizierung) statt es doppelt zu
   zaehlen. Kein beliebiger Eventname von aussen annehmbar, keine
   personenbezogenen Daten ausser IP-Adresse und Browser-Kennung, die fuer
   die Zuordnung bei Meta noetig sind. Siehe datenschutz.astro Ziffer 8. */
async function metaEvent(request, env) {
  const origin = request.headers.get('Origin') || '';
  const head = kopf(origin);
  if (!ERLAUBTE_HERKUNFT.includes(origin)) {
    return antwort({ ok: false, fehler: 'herkunft' }, 403, head);
  }

  if (!env.META_CAPI_TOKEN) {
    // Kein Secret hinterlegt -> Anfrage ruhig verwerfen. Kein 500, damit im
    // Browser keine Fehlermeldung auftaucht, waehrend das Token noch fehlt.
    return antwort({ ok: false, fehler: 'kein-secret' }, 503, head);
  }

  let d;
  try {
    d = JSON.parse(await request.text());
  } catch {
    return antwort({ ok: false, fehler: 'format' }, 400, head);
  }

  const eventId = String(d.event_id || '').slice(0, 100);
  if (!eventId) return antwort({ ok: false, fehler: 'event_id' }, 400, head);

  const jetzt = Math.floor(Date.now() / 1000);
  const eingabeZeit = parseInt(d.event_time, 10);
  const eventTime =
    isNaN(eingabeZeit) || Math.abs(jetzt - eingabeZeit) > 3600 ? jetzt : eingabeZeit;

  const quelle = String(d.event_source_url || '').slice(0, 500);
  const fbp = String(d.fbp || '').slice(0, 200);
  const fbc = String(d.fbc || '').slice(0, 200);

  const userData = {
    client_ip_address: request.headers.get('CF-Connecting-IP') || undefined,
    client_user_agent: request.headers.get('User-Agent') || undefined,
  };
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const payload = {
    data: [
      {
        event_name: 'QuizCompleteAppClick',
        event_time: eventTime,
        event_id: eventId,
        action_source: 'website',
        event_source_url: quelle,
        user_data: userData,
      },
    ],
  };

  try {
    await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${env.META_CAPI_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  } catch (e) {
    // Ein Problem bei Meta darf dem Besuch nichts anmerken lassen.
  }

  return antwort({ ok: true }, 200, head);
}

/* ------------------------------------------------------------ Statistik */

function statistikSeite(z) {
  const gesamt = z.length;
  const fertig = z.filter((r) => r.abgeschlossen === 1);
  const quote = gesamt ? Math.round((fertig.length / gesamt) * 100) : 0;

  const dauern = fertig.map((r) => r.dauer_sek).filter((d) => d > 0 && d < 3600).sort((a, b) => a - b);
  const median = dauern.length ? dauern[Math.floor(dauern.length / 2)] : 0;

  const zaehl = (liste, f) => {
    const m = {};
    for (const r of liste) {
      const k = f(r);
      if (k !== null && k !== undefined && k !== '') m[k] = (m[k] || 0) + 1;
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };

  const balken = (paare, gesamtN) =>
    paare.length
      ? paare
          .map(([f, n]) => {
            const p = gesamtN ? Math.round((n / gesamtN) * 100) : 0;
            return `<li><span class="bal" style="width:${paare[0][1] ? Math.round((n / paare[0][1]) * 100) : 0}%"></span>
              <b>${esc(f)}</b><i>${n}<em>${p}%</em></i></li>`;
          })
          .join('')
      : '<li class="leer">Noch keine Daten.</li>';

  /* Abbruch: bei welcher Frage sind die Unfertigen stehengeblieben */
  const abbruch = [];
  for (let i = 0; i <= FRAGEN.length; i++) {
    const n = z.filter((r) => r.abgeschlossen !== 1 && r.schritt === i).length;
    if (n) abbruch.push([i === 0 ? 'Nach der Fachwahl, vor Frage 1' : `Nach Frage ${i}`, n]);
  }

  /* Antwortverteilung je Frage */
  const antwortBlock = FRAGEN.map((frage, qi) => {
    const m = {};
    let n = 0;
    for (const r of z) {
      const teile = String(r.antworten || '').split(',');
      const v = parseInt(teile[qi], 10);
      if (!isNaN(v) && v >= 0 && v < frage.a.length) {
        m[v] = (m[v] || 0) + 1;
        n++;
      }
    }
    const paare = Object.entries(m)
      .map(([k, v]) => [frage.a[k], v])
      .sort((a, b) => b[1] - a[1]);
    return `<h3>${qi + 1}. ${esc(frage.q)}</h3>
      <p class="klein">${n} Antworten</p>
      <ul>${balken(paare, n)}</ul>`;
  }).join('');

  return `<!doctype html>
<html lang="de"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Test-Statistik — octastudy</title>
<style>
  :root{--pink:#d6146e;--violett:#5b4bd0;--navy:#2c2a44;--rand:#e7e4f2;--soft:#f6f4fd}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
       color:var(--navy);background:#fcfbff;padding:2.5rem 1.5rem 5rem}
  .w{max-width:940px;margin:0 auto}
  h1{font-size:1.7rem;font-weight:800;letter-spacing:-.012em}
  h1 span{color:var(--pink)}
  .sub{color:#6f6b8e;margin-top:.35rem}
  .nav{margin:1.4rem 0 0;font-size:.9rem}
  .nav a{color:var(--violett);margin-right:1.2rem}
  .zahlen{display:flex;gap:1rem;flex-wrap:wrap;margin:1.8rem 0}
  .z{flex:1;min-width:150px;background:#fff;border:1px solid var(--rand);
     border-radius:14px;padding:1.1rem 1.2rem}
  .z b{display:block;font-size:1.9rem;font-weight:800;line-height:1.15}
  .z small{color:#6f6b8e}
  h2{font-size:1.05rem;font-weight:800;margin:2.4rem 0 .9rem}
  h2::after{content:"";display:block;width:52px;height:3px;border-radius:2px;margin-top:.45rem;
            background:linear-gradient(90deg,var(--pink),var(--violett))}
  h3{font-size:.97rem;font-weight:700;margin:1.8rem 0 .3rem}
  .klein{font-size:.8rem;color:#9b97b5;margin-bottom:.5rem}
  .hint{color:#6f6b8e;font-size:.87rem;margin:-.35rem 0 .8rem;max-width:64ch}
  ul{list-style:none;background:#fff;border:1px solid var(--rand);border-radius:14px;overflow:hidden}
  li{position:relative;display:flex;align-items:center;gap:.6rem;padding:.65rem 1rem;
     border-top:1px solid var(--rand)}
  li:first-child{border-top:0}
  .bal{position:absolute;left:0;top:0;bottom:0;background:var(--soft);z-index:0}
  li b,li i{position:relative;z-index:1}
  li b{font-weight:600}
  li i{margin-left:auto;font-style:normal;font-weight:800;color:var(--violett);white-space:nowrap}
  li i em{font-style:normal;font-weight:600;color:#9b97b5;margin-left:.5rem;font-size:.85em}
  li.leer{color:#9b97b5;justify-content:center;padding:2rem}
  .fuss{margin-top:2.5rem;font-size:.82rem;color:#8b87a6;line-height:1.6}
</style></head><body><div class="w">

<h1>Test-<span>Statistik</span></h1>
<p class="sub">Anonyme Auswertung der Durchläufe des Lerntyp-Tests</p>
<p class="nav"><a href="/liste">→ Android-Warteliste</a><a href="/statistik.csv">→ Rohdaten als CSV</a></p>

<div class="zahlen">
  <div class="z"><b>${gesamt}</b><small>Tests begonnen</small></div>
  <div class="z"><b>${fertig.length}</b><small>abgeschlossen</small></div>
  <div class="z"><b>${quote}%</b><small>Abschlussquote</small></div>
  <div class="z"><b>${median ? Math.floor(median / 60) + ':' + String(median % 60).padStart(2, '0') : '—'}</b><small>Dauer im Mittel</small></div>
</div>

<h2>Ergebnisse</h2>
<p class="hint">Welcher Lerntyp am Ende herauskommt. Das ist der direkteste Hinweis darauf,
welches Problem die Besucher bei sich selbst sehen.</p>
<ul>${balken(zaehl(fertig, (r) => typName(r.lerntyp)), fertig.length)}</ul>

<h2>Studienfächer</h2>
<ul>${balken(zaehl(z, (r) => fachName(r.fach)), gesamt)}</ul>

<h2>Wo abgebrochen wird</h2>
<p class="hint">Nur unvollständige Durchläufe. Eine auffällige Stufe heißt: an dieser Frage
steigen die Leute aus.</p>
<ul>${balken(abbruch, gesamt - fertig.length)}</ul>

<h2>Geräte</h2>
<ul>${balken(zaehl(z, (r) => r.geraet), gesamt)}</ul>

<h2>Antworten im Einzelnen</h2>
<p class="hint">Über alle Durchläufe hinweg, auch über abgebrochene.</p>
${antwortBlock}

<p class="fuss">
  Diese Auswertung enthält keine personenbezogenen Daten: keine IP-Adresse, kein Cookie,
  keine Kennung, die über den einzelnen Seitenaufruf hinaus Bestand hätte.
</p>

</div></body></html>`;
}

function statistikCsv(z) {
  const feld = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const kopfzeile = 'angelegt_am,fach,lerntyp,abgeschlossen,schritt,dauer_sek,geraet,antworten';
  const body = z
    .map((r) =>
      [r.angelegt_am, r.fach, r.lerntyp, r.abgeschlossen, r.schritt, r.dauer_sek, r.geraet, r.antworten]
        .map(feld)
        .join(',')
    )
    .join('\n');
  return '\ufeff' + kopfzeile + '\n' + body + '\n';
}

/* ------------------------------------------------------------------ Route */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pfad = url.pathname.replace(/\/+$/, '') || '/';

    /* --- Anonyme Statistik eines Testdurchlaufs ------------------------- */
    if (request.method === 'POST' && pfad === '/lauf') {
      return lauf(request, env);
    }

    /* --- Meta Conversions API (QuizCompleteAppClick) -------------------- */
    if (request.method === 'POST' && pfad === '/meta-event') {
      return metaEvent(request, env);
    }

    /* --- Übersicht, Statistik, CSV ------------------------------------- */
    const geschuetzt = ['/liste', '/liste.csv', '/statistik', '/statistik.csv'];
    if (request.method === 'GET' && geschuetzt.includes(pfad)) {
      const stand = pruefen(request, env);
      if (stand === 'kein-secret') {
        return hinweis(
          'Es ist kein Passwort hinterlegt.\n\n' +
            'Lege im Worker unter Settings -> Variables and secrets eine Variable an:\n' +
            '  Type:  Secret\n' +
            '  Name:  ADMIN_PASSWORT\n' +
            '  Value: dein Passwort, mindestens 8 Zeichen\n\n' +
            'Danach den Worker einmal neu deployen.'
        );
      }
      if (stand === 'zu-kurz') {
        return hinweis(
          'Das hinterlegte Passwort ist kuerzer als 8 Zeichen.\n' +
            'Setze ADMIN_PASSWORT auf einen laengeren Wert und deploye neu.'
        );
      }
      if (stand !== 'ok') return sperre();

      const abfrage =
        pfad.startsWith('/statistik')
          ? `SELECT fach, lerntyp, abgeschlossen, schritt, antworten, dauer_sek, geraet, angelegt_am
               FROM testlaeufe ORDER BY angelegt_am DESC`
          : `SELECT email, fach, lerntyp, quelle, einwilligung, angelegt_am
               FROM warteliste ORDER BY angelegt_am DESC`;

      let zeilen = [];
      try {
        const r = await env.DB.prepare(abfrage).all();
        zeilen = r.results || [];
      } catch (e) {
        return new Response(
          'Die Datenbank ist nicht erreichbar, oder eine Tabelle fehlt.\n' +
            'Pruefe das D1-Binding mit dem Namen DB und ob die Tabellen warteliste\n' +
            'und testlaeufe angelegt sind (siehe waitlist-schema.sql).',
          { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        );
      }

      if (pfad === '/statistik') {
        return new Response(statistikSeite(zeilen), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Robots-Tag': 'noindex, nofollow',
          },
        });
      }
      if (pfad === '/statistik.csv') {
        return new Response(statistikCsv(zeilen), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="testlaeufe.csv"',
            'Cache-Control': 'no-store',
            'X-Robots-Tag': 'noindex, nofollow',
          },
        });
      }
      if (pfad === '/liste.csv') {
        return new Response(csv(zeilen), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="warteliste.csv"',
            'Cache-Control': 'no-store',
            'X-Robots-Tag': 'noindex, nofollow',
          },
        });
      }
      return new Response(seite(zeilen), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
    }

    /* --- Anmeldung ------------------------------------------------------ */
    const origin = request.headers.get('Origin') || '';
    const head = kopf(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: head });
    }
    if (request.method !== 'POST') {
      return antwort({ ok: false, fehler: 'methode' }, 405, head);
    }
    if (!ERLAUBTE_HERKUNFT.includes(origin)) {
      return antwort({ ok: false, fehler: 'herkunft' }, 403, head);
    }

    let d;
    try {
      d = await request.json();
    } catch {
      return antwort({ ok: false, fehler: 'format' }, 400, head);
    }

    // Honigtopf: ein für Menschen unsichtbares Feld. Ist es gefüllt, war es ein
    // Bot. Wir antworten freundlich, speichern aber nichts.
    if (d.hp) return antwort({ ok: true }, 200, head);

    const email = String(d.email || '').trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return antwort({ ok: false, fehler: 'email' }, 400, head);
    }

    const einwilligung = String(d.einwilligung || '').slice(0, 600);
    if (einwilligung.length < 20) {
      return antwort({ ok: false, fehler: 'einwilligung' }, 400, head);
    }

    const fach = String(d.fach || '').slice(0, 60);
    const lerntyp = String(d.lerntyp || '').slice(0, 40);
    const quelle = String(d.quelle || '').slice(0, 160);

    try {
      await env.DB.prepare(
        `INSERT INTO warteliste (email, fach, lerntyp, quelle, einwilligung, angelegt_am)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(email) DO NOTHING`
      )
        .bind(email, fach, lerntyp, quelle, einwilligung, new Date().toISOString())
        .run();
    } catch (e) {
      return antwort({ ok: false, fehler: 'datenbank' }, 500, head);
    }

    return antwort({ ok: true }, 200, head);
  },
};
