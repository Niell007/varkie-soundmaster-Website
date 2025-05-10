-- Database schema for Soundmaster website

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT
);

-- Media library table
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  alt_text TEXT,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT 0,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  uploaded_by INTEGER,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Content table for pages, news, etc.
CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  meta_description TEXT,
  featured_image INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT,
  created_by INTEGER,
  FOREIGN KEY (featured_image) REFERENCES media(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE(type, slug)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default admin user (password will be set via environment variable)
INSERT OR IGNORE INTO users (username, password_hash, email, role) 
VALUES ('admin', '', 'admin@example.com', 'admin');

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_name', 'Soundmaster');
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_description', 'Professional Audio Equipment');
