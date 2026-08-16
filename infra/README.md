# Android-Warteliste — Einrichtung

Die Warteliste besteht aus zwei Teilen: einer D1-Datenbank (Speicher) und einem
Worker (nimmt das Formular entgegen und schreibt hinein). Beides liegt im
kostenlosen Cloudflare-Tarif. Kein Kommandozeilen-Werkzeug nötig, alles im
Browser.

## 1. Konto

Auf `dash.cloudflare.com` ein kostenloses Konto anlegen. Es muss **keine** Domain
zu Cloudflare umgezogen werden — octastudy.com bleibt bei Ionos und GitHub Pages.

## 2. Datenbank anlegen

Links im Menü **Storage & Databases → D1 SQL Database → Create Database**.

- Name: `octastudy`
- Unter **Data location** auf *Specify jurisdiction* umstellen und **eu** wählen.

Das ist der wichtige Schritt: Die Jurisdiktion lässt sich später **nicht mehr
ändern**, und nur mit `eu` bleiben die Daten garantiert in der EU. Steht dort
etwas anderes, die Datenbank löschen und neu anlegen.

## 3. Tabelle anlegen

In der neuen Datenbank auf den Reiter **Console**, den Inhalt von
`waitlist-schema.sql` einfügen und ausführen.

## 4. Worker anlegen

**Compute → Workers & Pages → Create → Start from Hello World**.

- Name: `octastudy-warteliste`
- Deploy klicken, danach **Edit code**.
- Den vorhandenen Code komplett durch den Inhalt von `waitlist-worker.js`
  ersetzen und **Deploy** klicken.

## 5. Datenbank an den Worker binden

Im Worker auf den Reiter **Bindings** (eigener Reiter oben neben *Deployments*,
nicht unter *Settings*) → **Add binding** → **D1 database**.

- Variable name: `DB` (genau so, in Großbuchstaben — der Worker greift über
  `env.DB` darauf zu)
- D1 database: `octastudy`

Speichern. Deployt Cloudflare nicht von selbst neu, einmal im Code-Editor auf
**Deploy** klicken.

Nicht zu verwechseln mit *Settings → Variables and secrets*: dort werden nur
Textwerte und Passwörter hinterlegt, keine Datenbanken.

## 6. URL eintragen

Der Worker hat jetzt eine Adresse in der Form
`https://octastudy-warteliste.<dein-name>.workers.dev`.

Diese Adresse in `src/pages/tools/lerntyp-test.astro` bei
`CONFIG.waitlistEndpoint` eintragen. Solange dort ein leerer String steht, zeigt
der Dialog den mailto-Fallback statt des Formulars.

## Später: Liste ansehen

Im Dashboard unter D1 → `octastudy` → **Console**:

```sql
SELECT email, fach, angelegt_am FROM warteliste ORDER BY angelegt_am DESC;
SELECT fach, COUNT(*) AS anzahl FROM warteliste GROUP BY fach ORDER BY anzahl DESC;
```

Die Ergebnisse lassen sich dort als CSV herunterladen — damit kann die Liste
jederzeit in ein Mailwerkzeug übernommen werden, wenn die Android-Version steht.

## Datenschutz

Ziffer 6 der Datenschutzerklärung beschreibt genau diese Verarbeitung. Wird der
Anbieter oder der Einwilligungstext geändert, muss beides mitgezogen werden:
der Text im Dialog (`WL_EINWILLIGUNG` in `lerntyp-test.astro`) und Ziffer 6.
