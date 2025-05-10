-- Initial schema for Soundmaster Admin Dashboard

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  published BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Posts table (for news/blog)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  published BOOLEAN NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Shows table
CREATE TABLE IF NOT EXISTS shows (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  host TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Schedule table
CREATE TABLE IF NOT EXISTS schedule (
  id TEXT PRIMARY KEY,
  day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  show_name TEXT NOT NULL,
  show_description TEXT,
  dj_name TEXT,
  UNIQUE(day_of_week, start_time)
);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Playlist tracks table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id TEXT PRIMARY KEY,
  playlist_id TEXT NOT NULL,
  track_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  duration TEXT,
  audio_url TEXT,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  UNIQUE(playlist_id, track_order)
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Stream settings table
CREATE TABLE IF NOT EXISTS stream_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  metric TEXT NOT NULL,
  value INTEGER NOT NULL,
  UNIQUE(date, metric)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Insert default site settings
INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('site_name', 'Soundmaster Radio'),
  ('site_description', 'Online Radio Station for Entertainment'),
  ('contact_email', 'info@soundmaster.co.za'),
  ('facebook_url', ''),
  ('twitter_url', ''),
  ('instagram_url', ''),
  ('youtube_url', ''),
  ('theme_color', '#071e24'),
  ('accent_color', '#15d2ef'),
  ('logo_url', '/images/logo.jpg');

-- Insert default stream settings
INSERT OR IGNORE INTO stream_settings (key, value) VALUES
  ('stream_url', ''),
  ('stream_type', 'audio/mpeg'),
  ('youtube_live_id', 'LIVE_STREAM_ID'),
  ('is_live', 'false'),
  ('auto_play', 'false'),
  ('now_playing_api', '');
