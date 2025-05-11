/**
 * Database initialization script for Soundmaster admin dashboard
 * This script will create the necessary tables and sample data
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Database name from wrangler.jsonc
const DB_NAME = 'soundmaster-db';

// Path to schema file
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

console.log('Initializing Soundmaster database...');

try {
  // Check if schema file exists
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error('Schema file not found:', SCHEMA_PATH);
    process.exit(1);
  }

  // Execute schema file
  console.log('Applying schema...');
  execSync(`npx wrangler d1 execute ${DB_NAME} --file="${SCHEMA_PATH}"`, { stdio: 'inherit' });

  // Add sample data
  console.log('Adding sample data...');
  
  // Sample news articles
  const sampleNews = [
    {
      type: 'news',
      slug: 'new-product-launch',
      title: 'New Product Launch: SoundMaster Pro Series',
      content: '<p>We are excited to announce the launch of our new SoundMaster Pro Series, featuring state-of-the-art audio equipment for professionals.</p><p>The new series includes premium headphones, microphones, and audio interfaces designed for studio recording and live performances.</p>',
      is_published: 1,
      published_at: new Date().toISOString()
    },
    {
      type: 'news',
      slug: 'upcoming-workshop',
      title: 'Upcoming Workshop: Audio Production Essentials',
      content: '<p>Join us for a comprehensive workshop on audio production essentials. Learn from industry experts about recording techniques, mixing, and mastering.</p><p>The workshop will be held on June 15, 2025, at our main showroom. Registration is now open!</p>',
      is_published: 1,
      published_at: new Date().toISOString()
    },
    {
      type: 'news',
      slug: 'summer-sale',
      title: 'Summer Sale: Up to 30% Off Selected Items',
      content: '<p>Our annual summer sale is here! Enjoy up to 30% off on selected audio equipment, including headphones, speakers, and accessories.</p><p>The sale runs from June 1 to June 30, 2025. Don\'t miss this opportunity to upgrade your audio setup!</p>',
      is_published: 1,
      published_at: new Date().toISOString()
    }
  ];

  // Sample team members
  const sampleTeam = [
    {
      type: 'team',
      slug: 'john-smith',
      title: 'John Smith',
      content: '<p>John is our Chief Sound Engineer with over 15 years of experience in the audio industry. He specializes in studio setup and acoustic design.</p>',
      is_published: 1,
      published_at: new Date().toISOString()
    },
    {
      type: 'team',
      slug: 'sarah-johnson',
      title: 'Sarah Johnson',
      content: '<p>Sarah leads our Product Development team. With a background in electrical engineering and music production, she ensures our products meet the highest standards.</p>',
      is_published: 1,
      published_at: new Date().toISOString()
    }
  ];

  // Sample schedules
  const sampleSchedules = [
    {
      type: 'schedule',
      slug: 'product-demo-june',
      title: 'Product Demo: June 2025',
      content: '<p>Join us for a live demonstration of our latest products on June 10, 2025, at 3:00 PM.</p>',
      is_published: 1,
      published_at: new Date().toISOString()
    },
    {
      type: 'schedule',
      slug: 'workshop-july',
      title: 'Workshop: July 2025',
      content: '<p>Audio Mixing Workshop on July 15, 2025, from 10:00 AM to 4:00 PM.</p>',
      is_published: 1,
      published_at: new Date().toISOString()
    }
  ];

  // Sample playlists
  const samplePlaylists = [
    {
      type: 'playlist',
      slug: 'recommended-tracks',
      title: 'Recommended Tracks for Testing',
      content: '<p>A collection of tracks that showcase the quality of our audio equipment.</p>',
      is_published: 1,
      published_at: new Date().toISOString()
    }
  ];

  // Combine all sample content
  const sampleContent = [...sampleNews, ...sampleTeam, ...sampleSchedules, ...samplePlaylists];

  // Insert sample content
  for (const item of sampleContent) {
    const { type, slug, title, content, is_published, published_at } = item;
    // Escape single quotes in content for SQL
    const escapedContent = content.replace(/'/g, "''");
    const escapedTitle = title.replace(/'/g, "''");
    
    const query = `
      INSERT OR IGNORE INTO content (type, slug, title, content, is_published, published_at)
      VALUES ('${type}', '${slug}', '${escapedTitle}', '${escapedContent}', ${is_published}, '${published_at}')
    `;
    
    // Write query to a temporary file to avoid command line escaping issues
    const tempQueryFile = path.join(__dirname, 'temp-query.sql');
    fs.writeFileSync(tempQueryFile, query);
    
    try {
      execSync(`npx wrangler d1 execute ${DB_NAME} --file="${tempQueryFile}"`, { stdio: 'inherit' });
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempQueryFile)) {
        fs.unlinkSync(tempQueryFile);
      }
    }
  }

  // Update admin user password
  const passwordHash = 'Soundmaster2025!'; // This would normally be hashed, but we're using plaintext for simplicity
  
  const passwordQuery = `UPDATE users SET password_hash = '${passwordHash}' WHERE username = 'admin'`;
  
  // Write query to a temporary file
  const tempPasswordFile = path.join(__dirname, 'temp-password.sql');
  fs.writeFileSync(tempPasswordFile, passwordQuery);
  
  try {
    execSync(`npx wrangler d1 execute ${DB_NAME} --file="${tempPasswordFile}"`, { stdio: 'inherit' });
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempPasswordFile)) {
      fs.unlinkSync(tempPasswordFile);
    }
  }

  console.log('Database initialization completed successfully!');
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
}
