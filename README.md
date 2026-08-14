# octastudy.com

Student-Hub für Octa — Astro + GitHub Pages. Sprint 0 (Setup & Grundlayout).

## Lokal starten

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # Produktions-Build nach dist/
npm run preview  # Build lokal ansehen
```

## Projektstruktur

```
src/
├── site.ts                 ← ZENTRALE KONFIGURATION (Platzhalter hier ersetzen!)
├── layouts/BaseLayout.astro ← SEO-Meta, Schema.org, Breadcrumbs, Skip-Link
├── components/
│   ├── Header.astro
│   └── Footer.astro
├── styles/global.css        ← Design-System (CSS-Variablen, Dark Mode)
└── pages/
    ├── index.astro          → /
    ├── schemata/index.astro → /schemata/   (Hub, Inhalte folgen in Sprint 2)
    ├── tools/index.astro    → /tools/      (Tools folgen in Sprint 1)
    ├── ueber-uns.astro      → /ueber-uns/  (E-E-A-T + KI-Transparenz)
    ├── impressum.astro      → /impressum/  (noindex)
    ├── datenschutz.astro    → /datenschutz/ (noindex)
    └── 404.astro

public/
├── CNAME        ← octastudy.com (nötig für die eigene Domain)
├── robots.txt
└── favicon.svg

.github/workflows/deploy.yml ← Auto-Deploy bei Push auf main
```

## Vor dem Livegang erledigen

1. **`src/site.ts` öffnen** und alle `[PLATZHALTER: …]` durch echte Angaben
   ersetzen — Name, Anschrift, E-Mail für Impressum und Datenschutz, sowie
   Autor und fachlicher Gegenleser für die E-E-A-T-Angaben.
2. **App-Store-Link** in `OCTA.appStoreUrl` durch die echte Octa-URL ersetzen.
3. **Impressum und Datenschutz juristisch prüfen lassen.** Beide Texte sind
   Vorlagen, die den aktuellen technischen Stand beschreiben (statisches
   Hosting, keine Cookies, kein Tracking, keine externen Schriftarten).
   Sobald Analytics, Formulare oder eingebettete Inhalte dazukommen, muss die
   Datenschutzerklärung ergänzt werden.

## GitHub Pages einrichten

1. Repo auf GitHub anlegen und pushen (Branch `main`).
2. Im Repo: **Settings → Pages → Source: „GitHub Actions"**.
3. Push auf `main` löst den Workflow aus. Der erste Lauf dauert ~1 Minute.
4. **Settings → Pages → Custom domain:** `octastudy.com` eintragen und
   „Enforce HTTPS" aktivieren (erscheint, sobald das Zertifikat ausgestellt ist,
   meist nach wenigen Minuten).

> **Achtung:** GitHub Pages aus einem **privaten** Repo erfordert einen
> kostenpflichtigen Plan (GitHub Pro/Team). Bei einem kostenlosen Konto muss
> das Repo öffentlich sein.

## DNS bei Ionos

Für die Apex-Domain `octastudy.com` vier A-Records auf die GitHub-Pages-IPs
setzen (und optional die AAAA-Records für IPv6):

| Typ | Name | Wert |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | `<github-benutzername>.github.io` |

Die aktuell gültigen IPs stehen in der GitHub-Dokumentation unter
„Managing a custom domain for your GitHub Pages site" — vor dem Eintragen
kurz abgleichen.

## Konventionen

- **Keine externen Web-Fonts** (Google Fonts o. ä.). Systemschriften vermeiden
  DSGVO-Probleme und laden sofort.
- **`trailingSlash: 'always'`** — alle internen Links enden auf `/`.
- **Neue Seiten** bekommen `title`, `description` und `breadcrumbs` über das
  `BaseLayout`; Schema.org-BreadcrumbList wird daraus automatisch erzeugt.
- **Rechtsseiten** sind auf `noindex` gesetzt und aus der Sitemap gefiltert
  (siehe `astro.config.mjs`).
