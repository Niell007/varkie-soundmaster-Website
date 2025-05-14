// Database initialization script for Cloudflare D1
// Run this script with: npx wrangler d1 execute soundmaster-db --local --file=./src/scripts/init-db.js

// Read the schema from schema.sql
const fs = require('fs');
const path = require('path');

// Path to the schema file
const schemaPath = path.join(__dirname, '../../schema.sql');

// Read the schema file
try {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  console.log('Schema loaded successfully. Run this script with:');
  console.log('npx wrangler d1 execute soundmaster-db --local --file=./src/scripts/init-db.js');
  console.log('Or for production:');
  console.log('npx wrangler d1 execute soundmaster-db --file=./src/scripts/init-db.js');
  
  // The schema will be executed when this script is run with wrangler
  module.exports = schema;
} catch (error) {
  console.error('Error reading schema file:', error);
  process.exit(1);
}

// Sample data to insert after schema creation
const sampleData = `
-- Insert sample user
INSERT INTO users (username, password_hash, role, created_at) 
VALUES ('admin', 'Soundmaster2025!', 'admin', datetime('now')) 
ON CONFLICT(username) DO NOTHING;

-- Insert sample news articles
INSERT INTO news (title, content, image_url, published_at, author_id) 
VALUES 
  ('New Studio Equipment Arrives', 'We have upgraded our studio with state-of-the-art equipment...', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04', datetime('now'), 1),
  ('Summer Music Festival Announced', 'Join us for our annual summer music festival...', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4', datetime('now', '-1 day'), 1)
ON CONFLICT(id) DO NOTHING;

-- Insert sample team members
INSERT INTO team (name, role, bio, image_url, social_links) 
VALUES 
  ('Jane Smith', 'Station Manager', 'Jane has been with Soundmaster for over 10 years...', 'https://images.unsplash.com/photo-1580489944761-15a19d654956', '{"twitter": "https://twitter.com/janesmith", "instagram": "https://instagram.com/janesmith"}'),
  ('John Doe', 'Lead DJ', 'John is our resident electronic music expert...', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', '{"twitter": "https://twitter.com/johndoe", "instagram": "https://instagram.com/johndoe"}')
ON CONFLICT(id) DO NOTHING;

-- Insert sample schedules
INSERT INTO schedule (title, description, start_time, end_time, day_of_week, host_id) 
VALUES 
  ('Morning Show', 'Start your day with the latest hits and news.', '06:00:00', '10:00:00', 1, 1),
  ('Afternoon Drive', 'The perfect mix to get you through your commute.', '15:00:00', '19:00:00', 1, 2)
ON CONFLICT(id) DO NOTHING;

-- Insert sample playlists
INSERT INTO playlist (title, description, image_url, created_at, created_by) 
VALUES 
  ('Top 40 Hits', 'The most popular songs of the week.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4', datetime('now'), 1),
  ('Throwback Thursday', 'Classic hits from the 80s, 90s, and 2000s.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819', datetime('now'), 2)
ON CONFLICT(id) DO NOTHING;
`;

// Export the sample data to be executed after the schema
module.exports += sampleData;
