-- Soundmaster Database Schema

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News articles
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  author TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members
CREATE TABLE IF NOT EXISTS team (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT NOT NULL,
  image TEXT NOT NULL,
  social_email TEXT,
  social_linkedin TEXT,
  social_twitter TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule items
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  host TEXT NOT NULL,
  time TEXT NOT NULL,
  days TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlists
CREATE TABLE IF NOT EXISTS playlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlist tracks
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playlist_id INTEGER NOT NULL,
  track_name TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE
);

-- Media items
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  duration TEXT,
  size TEXT,
  category TEXT,
  description TEXT,
  uploaded_at TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
-- Password: Soundmaster2025! (this would be hashed in a real application)
INSERT OR IGNORE INTO users (username, password_hash, role) 
VALUES ('admin', 'Soundmaster2025!', 'admin');

-- Insert sample news articles
INSERT OR IGNORE INTO news (title, content, date, author, image) 
VALUES 
('New Music Director Joins Soundmaster', 'We''re excited to announce that Jane Smith has joined our team as the new Music Director.', '2025-05-01', 'Admin', 'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'),
('Summer Concert Series Announced', 'Join us for our summer concert series featuring local artists every Friday night.', '2025-04-15', 'Admin', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80');

-- Insert sample team members
INSERT OR IGNORE INTO team (name, position, bio, image, social_email, social_linkedin, social_twitter) 
VALUES 
('John Doe', 'Station Manager', 'John has been with Soundmaster for over 10 years and brings a wealth of experience in radio broadcasting.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80', 'john@soundmasterradio.com', 'https://linkedin.com/in/johndoe', 'https://twitter.com/johndoe'),
('Jane Smith', 'Music Director', 'Jane is a music industry veteran with a passion for discovering new talent.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80', 'jane@soundmasterradio.com', 'https://linkedin.com/in/janesmith', 'https://twitter.com/janesmith');

-- Insert sample schedule items
INSERT OR IGNORE INTO schedules (title, host, time, days, description) 
VALUES 
('Morning Show', 'John Doe', '6:00 AM - 10:00 AM', 'Monday-Friday', 'Start your day with the latest hits and news.'),
('Afternoon Drive', 'Jane Smith', '3:00 PM - 7:00 PM', 'Monday-Friday', 'The perfect mix to get you through your commute.');

-- Insert sample playlists
INSERT OR IGNORE INTO playlists (title, description, image) 
VALUES 
('Top 40 Hits', 'The most popular songs of the week.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'),
('Throwback Thursday', 'Classic hits from the 80s, 90s, and 2000s.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80');

-- Insert sample playlist tracks
INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_name, position) 
VALUES 
(1, 'Track 1 - Artist 1', 1),
(1, 'Track 2 - Artist 2', 2),
(1, 'Track 3 - Artist 3', 3),
(2, 'Track 4 - Artist 4', 1),
(2, 'Track 5 - Artist 5', 2),
(2, 'Track 6 - Artist 6', 3);

-- Insert sample media items
INSERT OR IGNORE INTO media (name, type, url, thumbnail, duration, size, category, description, uploaded_at) 
VALUES 
('Interview with Local Artist', 'audio', '/media/interview.mp3', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80', '24:15', '12.4 MB', 'interviews', 'An exclusive interview with a rising local artist.', '2025-04-10'),
('Summer Festival Promo', 'video', '/media/summer-festival.mp4', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', '01:30', '45.8 MB', 'promos', 'Promotional video for our upcoming summer festival.', '2025-05-01');
