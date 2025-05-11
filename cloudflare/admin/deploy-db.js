/**
 * Deploy database script for Soundmaster admin dashboard
 * This script will push sample data to the remote Cloudflare D1 database
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Database name from wrangler.jsonc
const DB_NAME = 'soundmaster-db';

console.log('Deploying Soundmaster database to Cloudflare...');

try {
  // Create sample data SQL file
  const sampleDataSQL = `
  -- Sample news articles
  INSERT OR IGNORE INTO content (type, slug, title, content, is_published, published_at)
  VALUES ('news', 'new-product-launch', 'New Product Launch: SoundMaster Pro Series', '<p>We are excited to announce the launch of our new SoundMaster Pro Series, featuring state-of-the-art audio equipment for professionals.</p><p>The new series includes premium headphones, microphones, and audio interfaces designed for studio recording and live performances.</p>', 1, '${new Date().toISOString()}');
  
  INSERT OR IGNORE INTO content (type, slug, title, content, is_published, published_at)
  VALUES ('news', 'upcoming-workshop', 'Upcoming Workshop: Audio Production Essentials', '<p>Join us for a comprehensive workshop on audio production essentials. Learn from industry experts about recording techniques, mixing, and mastering.</p><p>The workshop will be held on June 15, 2025, at our main showroom. Registration is now open!</p>', 1, '${new Date().toISOString()}');
  
  INSERT OR IGNORE INTO content (type, slug, title, content, is_published, published_at)
  VALUES ('news', 'summer-sale', 'Summer Sale: Up to 30% Off Selected Items', '<p>Our annual summer sale is here! Enjoy up to 30% off on selected audio equipment, including headphones, speakers, and accessories.</p><p>The sale runs from June 1 to June 30, 2025. Don''t miss this opportunity to upgrade your audio setup!</p>', 1, '${new Date().toISOString()}');
  
  -- Sample team members
  INSERT OR IGNORE INTO content (type, slug, title, content, is_published, published_at)
  VALUES ('team', 'john-smith', 'John Smith', '<p>John is our Chief Sound Engineer with over 15 years of experience in the audio industry. He specializes in studio setup and acoustic design.</p>', 1, '${new Date().toISOString()}');
  
  INSERT OR IGNORE INTO content (type, slug, title, content, is_published, published_at)
  VALUES ('team', 'sarah-johnson', 'Sarah Johnson', '<p>Sarah leads our Product Development team. With a background in electrical engineering and music production, she ensures our products meet the highest standards.</p>', 1, '${new Date().toISOString()}');
  
  -- Sample schedules
  INSERT OR IGNORE INTO content (type, slug, title, content, is_published, published_at)
  VALUES ('schedule', 'product-demo-june', 'Product Demo: June 2025', '<p>Join us for a live demonstration of our latest products on June 10, 2025, at 3:00 PM.</p>', 1, '${new Date().toISOString()}');
  
  INSERT OR IGNORE INTO content (type, slug, title, content, is_published, published_at)
  VALUES ('schedule', 'workshop-july', 'Workshop: July 2025', '<p>Audio Mixing Workshop on July 15, 2025, from 10:00 AM to 4:00 PM.</p>', 1, '${new Date().toISOString()}');
  
  -- Sample playlists
  INSERT OR IGNORE INTO content (type, slug, title, content, is_published, published_at)
  VALUES ('playlist', 'recommended-tracks', 'Recommended Tracks for Testing', '<p>A collection of tracks that showcase the quality of our audio equipment.</p>', 1, '${new Date().toISOString()}');
  
  -- Update admin user password
  UPDATE users SET password_hash = 'Soundmaster2025!' WHERE username = 'admin';
  `;
  
  // Write sample data to a file
  const sampleDataFile = path.join(__dirname, 'sample-data.sql');
  fs.writeFileSync(sampleDataFile, sampleDataSQL);
  
  // First, deploy the schema
  console.log('Deploying schema...');
  execSync(`npx wrangler d1 execute ${DB_NAME} --file="${path.join(__dirname, 'schema.sql')}" --remote`, { stdio: 'inherit' });
  
  // Then, deploy the sample data
  console.log('Deploying sample data...');
  execSync(`npx wrangler d1 execute ${DB_NAME} --file="${sampleDataFile}" --remote`, { stdio: 'inherit' });
  
  // Clean up
  if (fs.existsSync(sampleDataFile)) {
    fs.unlinkSync(sampleDataFile);
  }
  
  console.log('Database deployment completed successfully!');
} catch (error) {
  console.error('Error deploying database:', error);
  process.exit(1);
}
