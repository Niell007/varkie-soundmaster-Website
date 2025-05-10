-- Soundmaster Admin Dashboard Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content types table
CREATE TABLE IF NOT EXISTS content_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  author_id TEXT,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (type) REFERENCES content_types(id),
  UNIQUE (type, slug)
);

-- Content metadata table
CREATE TABLE IF NOT EXISTS content_meta (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  meta_key TEXT NOT NULL,
  meta_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  UNIQUE (content_id, meta_key)
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by TEXT,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Media metadata table
CREATE TABLE IF NOT EXISTS media_meta (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL,
  meta_key TEXT NOT NULL,
  meta_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
  UNIQUE (media_id, meta_key)
);

-- Schedule table
CREATE TABLE IF NOT EXISTS schedule (
  id TEXT PRIMARY KEY,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  show_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (show_id) REFERENCES content(id)
);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Playlist tracks table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id TEXT PRIMARY KEY,
  playlist_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES content(id),
  UNIQUE (playlist_id, track_id)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial data
INSERT OR IGNORE INTO content_types (id, name, slug, description) VALUES
('page', 'Pages', 'page', 'Static pages for the website'),
('post', 'Posts', 'post', 'Blog posts and news articles'),
('track', 'Tracks', 'track', 'Music tracks and audio files'),
('show', 'Shows', 'show', 'Radio shows and podcasts');

-- Insert default admin user if not exists
INSERT OR IGNORE INTO users (id, email, name, password, role) VALUES
('admin', 'admin@soundmaster.com', 'Administrator', '$2a$10$JdJGpOxCY39PvhkPK.AMzOzOQz6AqVOIQRPYaWJ9YNbFfIohFMBIO', 'admin');

-- Insert default settings
INSERT OR IGNORE INTO settings (id, setting_key, setting_value) VALUES
('site_title', 'site_title', 'Soundmaster Radio'),
('site_description', 'site_description', 'Your favorite online radio station'),
('stream_url', 'stream_url', 'https://example.com/stream'),
('stream_format', 'stream_format', 'audio/mpeg');
