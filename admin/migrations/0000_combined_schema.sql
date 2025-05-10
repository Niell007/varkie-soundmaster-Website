-- Combined schema for Soundmaster Admin Dashboard
-- This combines all tables into a single database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create content table
CREATE TABLE IF NOT EXISTS content (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  author TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);

-- Create schedule table
CREATE TABLE IF NOT EXISTS schedule (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  dj_id TEXT,
  playlist_id TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create playlist_tracks table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id TEXT PRIMARY KEY,
  playlist_id TEXT NOT NULL,
  track_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration INTEGER,
  audio_url TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Create stream_settings table
CREATE TABLE IF NOT EXISTS stream_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data TEXT,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TEXT NOT NULL
);

-- Insert default admin user
INSERT OR IGNORE INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@soundmaster.com',
  -- This is a hashed version of 'admin123' (for testing only)
  '5d41402abc4b2a76b9719d911017c592:5d41402abc4b2a76b9719d911017c592',
  'Admin',
  'admin',
  '2025-05-10T00:00:00.000Z',
  '2025-05-10T00:00:00.000Z'
);

-- Insert default site settings
INSERT OR IGNORE INTO site_settings (key, value) VALUES
('site_name', 'Soundmaster'),
('site_description', 'Your ultimate radio streaming platform'),
('site_logo', '/images/logo.jpg'),
('primary_color', '#071e24'),
('accent_color', '#15d2ef'),
('contact_email', 'contact@soundmaster.com'),
('social_facebook', 'https://facebook.com/soundmaster'),
('social_twitter', 'https://twitter.com/soundmaster'),
('social_instagram', 'https://instagram.com/soundmaster');

-- Insert default stream settings
INSERT OR IGNORE INTO stream_settings (key, value) VALUES
('stream_url', 'https://stream.soundmaster.com/listen'),
('stream_format', 'audio/mpeg'),
('stream_bitrate', '128'),
('stream_status', 'online'),
('stream_current_show', 'No show currently playing'),
('stream_current_dj', 'No DJ currently scheduled');
