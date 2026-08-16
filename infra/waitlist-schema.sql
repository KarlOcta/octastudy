-- Tabelle für die Android-Warteliste.
-- Einmalig in der D1-Konsole ausführen (Cloudflare Dashboard → Storage & Databases
-- → D1 → octastudy → Console).

CREATE TABLE IF NOT EXISTS warteliste (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  fach          TEXT,
  quelle        TEXT,
  einwilligung  TEXT NOT NULL,
  angelegt_am   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_warteliste_angelegt ON warteliste (angelegt_am);

-- Nützliche Abfragen für später:
--   SELECT COUNT(*) FROM warteliste;
--   SELECT fach, COUNT(*) AS anzahl FROM warteliste GROUP BY fach ORDER BY anzahl DESC;
--   SELECT email, fach, angelegt_am FROM warteliste ORDER BY angelegt_am DESC;
--   DELETE FROM warteliste WHERE email = 'jemand@beispiel.de';   -- Löschverlangen
