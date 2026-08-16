/**
 * octastudy — Android-Warteliste
 *
 * Nimmt die Anmeldungen aus dem Lerntyp-Test entgegen und schreibt sie in eine
 * D1-Datenbank. Kein Mailversand, keine Cookies, kein Tracking.
 *
 * Erwartet ein D1-Binding mit dem Namen DB.
 * Tabelle siehe waitlist-schema.sql.
 */

const ERLAUBTE_HERKUNFT = [
  'https://octastudy.com',
  'https://www.octastudy.com',
  'http://localhost:4321',
  'http://localhost:4343',
];

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

export default {
  async fetch(request, env) {
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
    const quelle = String(d.quelle || '').slice(0, 160);

    try {
      await env.DB.prepare(
        `INSERT INTO warteliste (email, fach, quelle, einwilligung, angelegt_am)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(email) DO NOTHING`
      )
        .bind(email, fach, quelle, einwilligung, new Date().toISOString())
        .run();
    } catch (e) {
      return antwort({ ok: false, fehler: 'datenbank' }, 500, head);
    }

    return antwort({ ok: true }, 200, head);
  },
};
