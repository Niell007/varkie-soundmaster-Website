/**
 * Database initialization for Soundmaster Admin Dashboard
 * This module provides functions to initialize the database with sample data
 */

import { AdminUser } from './auth';

// Check if database is initialized
export async function isDatabaseInitialized(env: any): Promise<boolean> {
  try {
    // Check if users table has any records
    const result = await env.SITE_DB.prepare(
      `SELECT COUNT(*) as count FROM users`
    ).first();
    
    return result && result.count > 0;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  }
}

// Initialize database with sample data
export async function initializeDatabase(env: any): Promise<boolean> {
  try {
    console.log('Initializing database with sample data...');
    
    // Create tables if they don't exist
    await createTables(env);
    
    // Insert sample data
    await insertSampleData(env);
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Create database tables
async function createTables(env: any): Promise<void> {
  const statements = [
    // Users table for admin authentication
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'editor',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login TEXT
    )`,
    
    // Media library table
    `CREATE TABLE IF NOT EXISTS media (
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
    )`,
    
    // Content table for pages, news, etc.
    `CREATE TABLE IF NOT EXISTS content (
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
    )`,
    
    // Settings table
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  ];
  
  for (const statement of statements) {
    await env.SITE_DB.prepare(statement).run();
  }
}

// Insert sample data
async function insertSampleData(env: any): Promise<void> {
  const now = new Date().toISOString();
  
  // Insert default admin user
  await env.SITE_DB.prepare(`
    INSERT OR IGNORE INTO users (username, password_hash, email, role) 
    VALUES ('admin', 'Soundmaster2025!', 'admin@example.com', 'admin')
  `).run();
  
  // Insert default settings
  await env.SITE_DB.prepare(`
    INSERT OR IGNORE INTO settings (key, value) 
    VALUES ('site_name', 'Soundmaster')
  `).run();
  
  await env.SITE_DB.prepare(`
    INSERT OR IGNORE INTO settings (key, value) 
    VALUES ('site_description', 'Professional Audio Equipment')
  `).run();
  
  // Sample news articles
  const sampleNews = [
    {
      type: 'news',
      slug: 'new-product-launch',
      title: 'New Product Launch: SoundMaster Pro Series',
      content: '<p>We are excited to announce the launch of our new SoundMaster Pro Series, featuring state-of-the-art audio equipment for professionals.</p><p>The new series includes premium headphones, microphones, and audio interfaces designed for studio recording and live performances.</p>',
      is_published: 1,
      published_at: now
    },
    {
      type: 'news',
      slug: 'upcoming-workshop',
      title: 'Upcoming Workshop: Audio Production Essentials',
      content: '<p>Join us for a comprehensive workshop on audio production essentials. Learn from industry experts about recording techniques, mixing, and mastering.</p><p>The workshop will be held on June 15, 2025, at our main showroom. Registration is now open!</p>',
      is_published: 1,
      published_at: now
    },
    {
      type: 'news',
      slug: 'summer-sale',
      title: 'Summer Sale: Up to 30% Off Selected Items',
      content: '<p>Our annual summer sale is here! Enjoy up to 30% off on selected audio equipment, including headphones, speakers, and accessories.</p><p>The sale runs from June 1 to June 30, 2025. Don\'t miss this opportunity to upgrade your audio setup!</p>',
      is_published: 1,
      published_at: now
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
      published_at: now
    },
    {
      type: 'team',
      slug: 'sarah-johnson',
      title: 'Sarah Johnson',
      content: '<p>Sarah leads our Product Development team. With a background in electrical engineering and music production, she ensures our products meet the highest standards.</p>',
      is_published: 1,
      published_at: now
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
      published_at: now
    },
    {
      type: 'schedule',
      slug: 'workshop-july',
      title: 'Workshop: July 2025',
      content: '<p>Audio Mixing Workshop on July 15, 2025, from 10:00 AM to 4:00 PM.</p>',
      is_published: 1,
      published_at: now
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
      published_at: now
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
    
    await env.SITE_DB.prepare(`
      INSERT OR IGNORE INTO content (
        type, slug, title, content, is_published, published_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      type,
      slug,
      escapedTitle,
      escapedContent,
      is_published,
      published_at
    ).run();
  }
}
