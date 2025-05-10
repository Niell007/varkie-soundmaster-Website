// Database operations for Soundmaster Admin Dashboard
import type { Env } from '../index';

// Content Types
export type ContentType = 'pages' | 'posts' | 'tracks' | 'shows';

// Content Interfaces
export interface BaseContent {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Page extends BaseContent {
  content: string;
  meta_description?: string;
  featured_image?: string;
}

export interface Post extends BaseContent {
  content: string;
  excerpt?: string;
  author_id: string;
  category_id?: string;
  featured_image?: string;
  tags?: string;
}

export interface Track extends BaseContent {
  artist: string;
  duration: number;
  file_url: string;
  cover_image?: string;
  genre?: string;
  release_date?: string;
}

export interface Show extends BaseContent {
  description: string;
  host: string;
  schedule_id: string;
  cover_image?: string;
}

// User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'user';
  created_at: string;
  updated_at: string;
}

// Schedule Interface
export interface Schedule {
  id: string;
  day_of_week: number; // 0-6 (Sunday to Saturday)
  start_time: string;  // HH:MM format
  end_time: string;    // HH:MM format
  show_id: string;
  repeat: boolean;
  created_at: string;
  updated_at: string;
}

// Playlist Interface
export interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  created_at: string;
  updated_at: string;
}

// Playlist Track Interface
export interface PlaylistTrack {
  playlist_id: string;
  track_id: string;
  position: number;
}

// Content Operations
export async function getContentList(env: Env, type: ContentType): Promise<BaseContent[]> {
  try {
    const stmt = env.DB.prepare(`SELECT * FROM ${type} ORDER BY updated_at DESC`);
    const result = await stmt.all();
    return result.results as unknown as BaseContent[];
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    throw new Error(`Failed to fetch ${type}`);
  }
}

export async function getContentById(env: Env, type: ContentType, id: string): Promise<BaseContent | null> {
  try {
    const stmt = env.DB.prepare(`SELECT * FROM ${type} WHERE id = ?`);
    const result = await stmt.bind(id).first();
    return result as BaseContent | null;
  } catch (error) {
    console.error(`Error fetching ${type} by ID:`, error);
    throw new Error(`Failed to fetch ${type} by ID`);
  }
}

export async function createContent(env: Env, type: ContentType, content: Partial<BaseContent>): Promise<string> {
  try {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    
    // Create column names and placeholders for the SQL query
    const columns = Object.keys(content).concat(['id', 'created_at', 'updated_at']).join(', ');
    const placeholders = Array(Object.keys(content).length + 3).fill('?').join(', ');
    
    // Create values array for binding
    const values = Object.values(content).concat([id, now, now]);
    
    const stmt = env.DB.prepare(`INSERT INTO ${type} (${columns}) VALUES (${placeholders})`);
    await stmt.bind(...values).run();
    
    return id;
  } catch (error) {
    console.error(`Error creating ${type}:`, error);
    throw new Error(`Failed to create ${type}`);
  }
}

export async function updateContent(env: Env, type: ContentType, id: string, content: Partial<BaseContent>): Promise<void> {
  try {
    const now = new Date().toISOString();
    
    // Create SET clause for the SQL query
    const setClause = Object.keys(content)
      .map(key => `${key} = ?`)
      .concat(['updated_at = ?'])
      .join(', ');
    
    // Create values array for binding
    const values = Object.values(content).concat([now, id]);
    
    const stmt = env.DB.prepare(`UPDATE ${type} SET ${setClause} WHERE id = ?`);
    await stmt.bind(...values).run();
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
    throw new Error(`Failed to update ${type}`);
  }
}

export async function deleteContent(env: Env, type: ContentType, id: string): Promise<void> {
  try {
    const stmt = env.DB.prepare(`DELETE FROM ${type} WHERE id = ?`);
    await stmt.bind(id).run();
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    throw new Error(`Failed to delete ${type}`);
  }
}

// User Operations
export async function getUserByEmail(env: Env, email: string): Promise<User | null> {
  try {
    const stmt = env.DB.prepare('SELECT * FROM users WHERE email = ?');
    const result = await stmt.bind(email).first();
    return result as User | null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw new Error('Failed to fetch user by email');
  }
}

export async function getUserList(env: Env): Promise<User[]> {
  try {
    const stmt = env.DB.prepare('SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY name');
    const result = await stmt.all();
    return result.results as unknown as User[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

// Schedule Operations
export async function getScheduleList(env: Env): Promise<Schedule[]> {
  try {
    const stmt = env.DB.prepare(`
      SELECT s.*, sh.title as show_title 
      FROM schedule s
      LEFT JOIN shows sh ON s.show_id = sh.id
      ORDER BY s.day_of_week, s.start_time
    `);
    const result = await stmt.all();
    return result.results as unknown as Schedule[];
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw new Error('Failed to fetch schedule');
  }
}

// Playlist Operations
export async function getPlaylistList(env: Env): Promise<Playlist[]> {
  try {
    const stmt = env.DB.prepare('SELECT * FROM playlists ORDER BY title');
    const result = await stmt.all();
    return result.results as unknown as Playlist[];
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw new Error('Failed to fetch playlists');
  }
}

export async function getPlaylistTracks(env: Env, playlistId: string): Promise<Track[]> {
  try {
    const stmt = env.DB.prepare(`
      SELECT t.* 
      FROM tracks t
      JOIN playlist_tracks pt ON t.id = pt.track_id
      WHERE pt.playlist_id = ?
      ORDER BY pt.position
    `);
    const result = await stmt.bind(playlistId).all();
    return result.results as unknown as Track[];
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    throw new Error('Failed to fetch playlist tracks');
  }
}

// Helper function to check if a table exists
export async function tableExists(env: Env, tableName: string): Promise<boolean> {
  try {
    const stmt = env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
    );
    const result = await stmt.bind(tableName).first();
    return result !== null;
  } catch (error) {
    console.error('Error checking if table exists:', error);
    return false;
  }
}
