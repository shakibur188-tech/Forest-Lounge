CREATE TABLE site_content (id INTEGER PRIMARY KEY, data TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);
CREATE TABLE reservations (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', visit_date TEXT NOT NULL, visit_time TEXT NOT NULL, guests INTEGER NOT NULL, occasion TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new', session_hash TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX reservation_created_idx ON reservations(created_at);
CREATE INDEX reservation_session_idx ON reservations(session_hash,created_at);
CREATE TABLE activity (day TEXT NOT NULL, event TEXT NOT NULL, session_hash TEXT NOT NULL, device TEXT NOT NULL, referrer TEXT NOT NULL, PRIMARY KEY(day,event,session_hash));
CREATE INDEX activity_day_idx ON activity(day);
