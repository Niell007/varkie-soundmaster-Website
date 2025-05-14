// Database utility functions for Cloudflare D1

import { D1Database } from '@cloudflare/workers-types';

// Type definitions for database models
export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export interface KaraokeSong {
  id: number;
  artist: string;
  title: string;
  created_at: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  published_at: string;
  author_id: number;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image_url?: string;
  social_links?: string; // JSON string
}

export interface Schedule {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  host_id: number;
}

export interface Playlist {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  created_at: string;
  created_by: number;
}

export interface Media {
  id: number;
  title: string;
  description: string;
  media_type: string; // audio, video
  url: string;
  duration: number; // in seconds
  uploaded_at: string;
  uploaded_by: number;
}

// Database context type
export interface DbContext {
  db: D1Database | null;
  isConnected: boolean;
}

// Mock data for local development
const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    password_hash: 'Soundmaster2025!', // In a real app, this would be hashed
    role: 'admin',
    created_at: new Date().toISOString()
  }
];

// Mock karaoke songs data
const MOCK_KARAOKE_SONGS: KaraokeSong[] = [
  { id: 1, artist: 'Garbage', title: '# 1 Crush [SC Karaoke]', created_at: new Date().toISOString() },
  { id: 2, artist: 'Chainsmokers', title: '# S E L F I E [AS Karaoke]', created_at: new Date().toISOString() },
  { id: 3, artist: 'Nelly', title: '#1 [SM Karaoke]', created_at: new Date().toISOString() },
  { id: 4, artist: 'Mariah Carey & Miguel', title: '#Beautiful [BH Karaoke]', created_at: new Date().toISOString() },
  { id: 5, artist: 'Queen', title: "'39 [ME Karaoke]", created_at: new Date().toISOString() }
];

const MOCK_NEWS: NewsArticle[] = [
  {
    id: 1,
    title: 'New Studio Equipment Arrives',
    content: 'We have upgraded our studio with state-of-the-art equipment...',
    image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
    published_at: new Date().toISOString(),
    author_id: 1
  },
  {
    id: 2,
    title: 'Summer Music Festival Announced',
    content: 'Join us for our annual summer music festival...',
    image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
    published_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    author_id: 1
  }
];

const MOCK_TEAM: TeamMember[] = [
  {
    id: 1,
    name: 'Jane Smith',
    role: 'Station Manager',
    bio: 'Jane has been with Soundmaster for over 10 years...',
    image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    social_links: JSON.stringify({
      twitter: 'https://twitter.com/janesmith',
      instagram: 'https://instagram.com/janesmith'
    })
  },
  {
    id: 2,
    name: 'John Doe',
    role: 'Lead DJ',
    bio: 'John is our resident electronic music expert...',
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    social_links: JSON.stringify({
      twitter: 'https://twitter.com/johndoe',
      instagram: 'https://instagram.com/johndoe'
    })
  }
];

// Database class for handling all database operations
export class Database {
  private static instance: Database | null = null;
  private context: DbContext = { db: null, isConnected: false };
  private isProduction: boolean = process.env.NODE_ENV === 'production';

  private constructor() {}

  // Get singleton instance
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Initialize database connection
  public async connect(db: D1Database | null): Promise<boolean> {
    if (db) {
      this.context.db = db;
      this.context.isConnected = true;
      return true;
    }
    
    // In development, we'll use mock data
    if (!this.isProduction) {
      this.context.isConnected = true;
      return true;
    }
    
    return false;
  }

  // Check if database is initialized
  public async isInitialized(): Promise<boolean> {
    if (!this.context.isConnected) return false;
    if (!this.isProduction) return true;
    
    if (this.context.db) {
      try {
        const result = await this.context.db.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
        ).all();
        return result.results.length > 0;
      } catch (error) {
        console.error('Error checking database initialization:', error);
        return false;
      }
    }
    
    return false;
  }

  // Generic query execution
  private async executeQuery<T>(
    query: string,
    params: (string | number | boolean)[] = []
  ): Promise<T[]> {
    if (!this.context.isConnected) {
      throw new Error('Database not connected');
    }
    
    // If we have a real database connection, use it
    if (this.context.db) {
      try {
        const stmt = this.context.db.prepare(query);
        
        // Bind parameters if provided
        if (params.length > 0) {
          params.forEach((param, index) => {
            stmt.bind(index + 1, param);
          });
        }

        const result = await stmt.all();
        return result.results as T[];
      } catch (error) {
        console.error('Error executing query:', error);
        throw error;
      }
    }
    
    // If we're in development mode, use mock data
    if (!this.isProduction) {
      return this.getMockData<T>(query, params);
    }
    
    return [];
  }

  // Execute a query and return a single result
  private async executeQuerySingle<T>(
    query: string,
    params: (string | number | boolean)[] = []
  ): Promise<T | null> {
    const results = await this.executeQuery<T>(query, params);
    return results.length > 0 ? results[0] : null;
  }

  // Execute a non-query (insert, update, delete)
  private async executeNonQuery(
    query: string,
    params: (string | number | boolean)[] = []
  ): Promise<number> {
    if (!this.context.isConnected) {
      throw new Error('Database not connected');
    }
    
    // If we have a real database connection, use it
    if (this.context.db) {
      try {
        const stmt = this.context.db.prepare(query);
        
        // Bind parameters if provided
        if (params.length > 0) {
          params.forEach((param, index) => {
            stmt.bind(index + 1, param);
          });
        }

        const result = await stmt.run();
        return result.meta.changes || 0;
      } catch (error) {
        console.error('Error executing non-query:', error);
        throw error;
      }
    }
    
    // If we're in development mode, simulate success
    if (!this.isProduction) {
      return 1; // Simulate one row affected
    }
    
    return 0;
  }

  // Get mock data for development
  private getMockData<T>(query: string, params: (string | number | boolean)[]): T[] {
    // Simple mock data provider based on the query
    if (query.toLowerCase().includes('from users')) {
      // Handle user queries
      if (query.toLowerCase().includes('where username =')) {
        const username = params[0] as string;
        return MOCK_USERS.filter(u => u.username === username) as unknown as T[];
      }
      return MOCK_USERS as unknown as T[];
    }
    
    if (query.toLowerCase().includes('from news')) {
      // Handle news queries
      if (query.toLowerCase().includes('where id =')) {
        const id = params[0] as number;
        return MOCK_NEWS.filter(n => n.id === id) as unknown as T[];
      }
      return MOCK_NEWS as unknown as T[];
    }
    
    if (query.toLowerCase().includes('from team')) {
      // Handle team queries
      if (query.toLowerCase().includes('where id =')) {
        const id = params[0] as number;
        return MOCK_TEAM.filter(t => t.id === id) as unknown as T[];
      }
      return MOCK_TEAM as unknown as T[];
    }
    
    return [];
  }

  // User-related methods
  public async getUserByUsername(username: string): Promise<User | null> {
    return this.executeQuerySingle<User>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
  }

  // News-related methods
  public async getNewsArticles(limit: number = 10, offset: number = 0): Promise<NewsArticle[]> {
    return this.executeQuery<NewsArticle>(
      'SELECT * FROM news ORDER BY published_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
  }

  public async getNewsArticleById(id: number): Promise<NewsArticle | null> {
    return this.executeQuerySingle<NewsArticle>(
      'SELECT * FROM news WHERE id = ?',
      [id]
    );
  }

  public async createNewsArticle(article: Omit<NewsArticle, 'id'>): Promise<number> {
    return this.executeNonQuery(
      'INSERT INTO news (title, content, image_url, published_at, author_id) VALUES (?, ?, ?, ?, ?)',
      [article.title, article.content, article.image_url || '', article.published_at, article.author_id]
    );
  }

  public async updateNewsArticle(id: number, article: Partial<NewsArticle>): Promise<number> {
    const existingArticle = await this.getNewsArticleById(id);
    if (!existingArticle) return 0;

    return this.executeNonQuery(
      'UPDATE news SET title = ?, content = ?, image_url = ?, published_at = ?, author_id = ? WHERE id = ?',
      [
        article.title || existingArticle.title,
        article.content || existingArticle.content,
        article.image_url || existingArticle.image_url || '',
        article.published_at || existingArticle.published_at,
        article.author_id || existingArticle.author_id,
        id
      ]
    );
  }

  public async deleteNewsArticle(id: number): Promise<number> {
    return this.executeNonQuery('DELETE FROM news WHERE id = ?', [id]);
  }

  // Team-related methods
  public async getTeamMembers(): Promise<TeamMember[]> {
    return this.executeQuery<TeamMember>('SELECT * FROM team ORDER BY name');
  }

  public async getTeamMemberById(id: number): Promise<TeamMember | null> {
    return this.executeQuerySingle<TeamMember>(
      'SELECT * FROM team WHERE id = ?',
      [id]
    );
  }

  public async createTeamMember(member: Omit<TeamMember, 'id'>): Promise<number> {
    return this.executeNonQuery(
      'INSERT INTO team (name, role, bio, image_url, social_links) VALUES (?, ?, ?, ?, ?)',
      [member.name, member.role, member.bio, member.image_url || '', member.social_links || '']
    );
  }

  public async updateTeamMember(id: number, member: Partial<TeamMember>): Promise<number> {
    const existingMember = await this.getTeamMemberById(id);
    if (!existingMember) return 0;

    return this.executeNonQuery(
      'UPDATE team SET name = ?, role = ?, bio = ?, image_url = ?, social_links = ? WHERE id = ?',
      [
        member.name || existingMember.name,
        member.role || existingMember.role,
        member.bio || existingMember.bio,
        member.image_url || existingMember.image_url || '',
        member.social_links || existingMember.social_links || '',
        id
      ]
    );
  }

  public async deleteTeamMember(id: number): Promise<number> {
    return this.executeNonQuery('DELETE FROM team WHERE id = ?', [id]);
  }

  // Karaoke-related methods
  public async getKaraokeSongs(limit: number = 20, offset: number = 0): Promise<KaraokeSong[]> {
    if (!this.isProduction) {
      // Use mock data for development
      return MOCK_KARAOKE_SONGS.slice(offset, offset + limit);
    }
    
    return this.executeQuery(
      'SELECT * FROM karaoke_songs ORDER BY artist, title LIMIT ? OFFSET ?',
      [limit, offset]
    );
  }

  public async searchKaraokeSongs(query: string, limit: number = 20, offset: number = 0): Promise<KaraokeSong[]> {
    if (!this.isProduction) {
      // Filter mock data for development
      const lowerQuery = query.toLowerCase();
      return MOCK_KARAOKE_SONGS
        .filter(song => 
          song.artist.toLowerCase().includes(lowerQuery) || 
          song.title.toLowerCase().includes(lowerQuery)
        )
        .slice(offset, offset + limit);
    }
    
    return this.executeQuery(
      'SELECT * FROM karaoke_songs WHERE artist LIKE ? OR title LIKE ? ORDER BY artist, title LIMIT ? OFFSET ?',
      [`%${query}%`, `%${query}%`, limit, offset]
    );
  }

  public async countKaraokeSongs(query?: string): Promise<number> {
    if (!this.isProduction) {
      // Count mock data for development
      if (query) {
        const lowerQuery = query.toLowerCase();
        return MOCK_KARAOKE_SONGS.filter(song => 
          song.artist.toLowerCase().includes(lowerQuery) || 
          song.title.toLowerCase().includes(lowerQuery)
        ).length;
      }
      return MOCK_KARAOKE_SONGS.length;
    }
    
    if (query) {
      const result = await this.executeQuerySingle<{ count: number }>(
        'SELECT COUNT(*) as count FROM karaoke_songs WHERE artist LIKE ? OR title LIKE ?',
        [`%${query}%`, `%${query}%`]
      );
      return result?.count || 0;
    }
    
    const result = await this.executeQuerySingle<{ count: number }>(
      'SELECT COUNT(*) as count FROM karaoke_songs'
    );
    return result?.count || 0;
  }

  public async addKaraokeSong(artist: string, title: string): Promise<number> {
    if (!this.isProduction) {
      // Add to mock data for development
      const newId = MOCK_KARAOKE_SONGS.length + 1;
      MOCK_KARAOKE_SONGS.push({
        id: newId,
        artist,
        title,
        created_at: new Date().toISOString()
      });
      return newId;
    }
    
    return this.executeNonQuery(
      'INSERT INTO karaoke_songs (artist, title) VALUES (?, ?)',
      [artist, title]
    );
  }

  // Helper methods for counting records
  private async countNews(): Promise<number> {
    if (!this.isProduction) {
      return MOCK_NEWS.length;
    }
    const result = await this.executeQuerySingle<{count: number}>('SELECT COUNT(*) as count FROM news');
    return result?.count || 0;
  }

  private async countTeamMembers(): Promise<number> {
    if (!this.isProduction) {
      return MOCK_TEAM.length;
    }
    const result = await this.executeQuerySingle<{count: number}>('SELECT COUNT(*) as count FROM team');
    return result?.count || 0;
  }

  // Dashboard stats
  public async getDashboardStats(): Promise<{
    newsCount: number;
    teamCount: number;
    scheduleCount: number;
    playlistCount: number;
    mediaCount: number;
    karaokeCount: number;
  }> {
    if (!this.isProduction) {
      // Mock data for development
      return {
        newsCount: MOCK_NEWS.length,
        teamCount: MOCK_TEAM.length,
        scheduleCount: 5,
        playlistCount: 8,
        mediaCount: 12,
        karaokeCount: MOCK_KARAOKE_SONGS.length
      };
    }
    
    // In production, query the database
    const newsCount = await this.countNews();
    const teamCount = await this.countTeamMembers();
    
    // Get counts for other tables
    const scheduleResult = await this.executeQuerySingle<{count: number}>('SELECT COUNT(*) as count FROM schedule');
    const playlistResult = await this.executeQuerySingle<{count: number}>('SELECT COUNT(*) as count FROM playlists');
    const mediaResult = await this.executeQuerySingle<{count: number}>('SELECT COUNT(*) as count FROM media');
    
    const karaokeCount = await this.countKaraokeSongs();
    
    return {
      newsCount,
      teamCount,
      scheduleCount: scheduleResult?.count || 0,
      playlistCount: playlistResult?.count || 0,
      mediaCount: mediaResult?.count || 0,
      karaokeCount
    };
  }
}
