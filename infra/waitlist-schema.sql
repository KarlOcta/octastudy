-- Datenbank octastudy — zwei Tabellen.
-- In der D1-Konsole ausführen (Cloudflare Dashboard → Storage & Databases
-- → D1 → octastudy → Console).


-- ---------------------------------------------------------------------------
-- 1) Android-Warteliste (personenbezogen, Einwilligung erforderlich)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS warteliste (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  fach          TEXT,
  lerntyp       TEXT,
  quelle        TEXT,
  einwilligung  TEXT NOT NULL,
  angelegt_am   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_warteliste_angelegt ON warteliste (angelegt_am);


-- ---------------------------------------------------------------------------
-- 2) Testdurchläufe (anonym, kein Personenbezug)
-- ---------------------------------------------------------------------------
-- `lauf` ist eine im Browser je Seitenaufruf neu erzeugte Zufallskennung. Sie
-- wird nirgends gespeichert und ist nach dem Verlassen der Seite verloren; sie
-- dient allein dazu, mehrere Meldungen desselben Durchlaufs zusammenzuführen.
-- Es werden weder IP-Adresse noch Cookie noch sonst ein Merkmal erfasst, das
-- eine Person wiedererkennbar macht.

CREATE TABLE IF NOT EXISTS testlaeufe (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  lauf           TEXT NOT NULL UNIQUE,
  fach           TEXT    DEFAULT '',
  schritt        INTEGER NOT NULL DEFAULT 0,
  abgeschlossen  INTEGER NOT NULL DEFAULT 0,
  lerntyp        TEXT    DEFAULT '',
  antworten      TEXT    DEFAULT '',
  dauer_sek      INTEGER DEFAULT 0,
  geraet         TEXT    DEFAULT '',
  angelegt_am    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_testlaeufe_angelegt ON testlaeufe (angelegt_am);
CREATE INDEX IF NOT EXISTS idx_testlaeufe_fertig ON testlaeufe (abgeschlossen);


-- ---------------------------------------------------------------------------
-- Nachträglich: fehlende Spalte in einer älteren warteliste-Tabelle
-- ---------------------------------------------------------------------------
-- Nur nötig, wenn die Tabelle vor dem 16.08.2026 angelegt wurde. Meldet die
-- Konsole "duplicate column name", ist alles in Ordnung.

-- ALTER TABLE warteliste ADD COLUMN lerntyp TEXT;


-- ---------------------------------------------------------------------------
-- Nützliche Abfragen
-- ---------------------------------------------------------------------------
--   SELECT COUNT(*) FROM warteliste;
--   SELECT lerntyp, COUNT(*) AS anzahl FROM warteliste GROUP BY lerntyp ORDER BY anzahl DESC;
--   SELECT email, fach, lerntyp, angelegt_am FROM warteliste ORDER BY angelegt_am DESC;
--   DELETE FROM warteliste WHERE email = 'jemand@beispiel.de';   -- Löschverlangen
--
--   SELECT COUNT(*) FROM testlaeufe;
--   SELECT abgeschlossen, COUNT(*) FROM testlaeufe GROUP BY abgeschlossen;
--   SELECT lerntyp, COUNT(*) AS anzahl FROM testlaeufe WHERE abgeschlossen = 1
--     GROUP BY lerntyp ORDER BY anzahl DESC;
--   SELECT schritt, COUNT(*) AS anzahl FROM testlaeufe WHERE abgeschlossen = 0
--     GROUP BY schritt ORDER BY schritt;
