/**
 * Content API for Cloudflare Workers
 * Handles content management for news, team, schedules, etc.
 */

import { AdminUser } from './auth';

// Content item interface
export interface ContentItem {
  id?: number;
  type: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  status: string;
  author?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  meta_data?: any;
}

/**
 * Get content items by type
 * @param request - The incoming request
 * @param env - Environment variables
 * @param user - The authenticated user
 * @returns Response with content items
 */
export async function getContent(
  request: Request, 
  env: any, 
  user: AdminUser
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    
    const type = searchParams.get('type') || 'news';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    
    // Query content from database
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM content WHERE type = ?`;
    let params: any[] = [type];
    
    if (search) {
      query += ` AND (title LIKE ? OR content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    try {
      const result = await env.SITE_DB.prepare(query)
        .bind(...params)
        .all();
      
      // Get total count for pagination
      const countResult = await env.SITE_DB.prepare(
        `SELECT COUNT(*) as total FROM content WHERE type = ?`
      ).bind(type).first();
      
      // Check if the database has been initialized
      if (!result || !result.results) {
        // Return empty array if database is not initialized
        return new Response(JSON.stringify({
          success: true,
          content: [],
          total: 0,
          page,
          limit
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        content: result.results || [],
        total: countResult?.total || 0,
        page,
        limit
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Database error:', error);
      
      // Return empty results on error
      return new Response(JSON.stringify({
        success: true,
        content: [],
        total: 0,
        page,
        limit,
        error: 'Database not initialized or unavailable'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error getting content:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get content'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get a single content item
 * @param request - The incoming request
 * @param env - Environment variables
 * @param user - The authenticated user
 * @param id - Content ID
 * @returns Response with content item
 */
export async function getContentItem(
  request: Request, 
  env: any, 
  user: AdminUser,
  id: number
): Promise<Response> {
  try {
    const content = await env.SITE_DB.prepare(
      `SELECT * FROM content WHERE id = ?`
    ).bind(id).first();
    
    if (!content) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      item: content
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting content item:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get content item'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Create a new content item
 * @param request - The incoming request
 * @param env - Environment variables
 * @param user - The authenticated user
 * @returns Response with created content
 */
export async function createContent(
  request: Request, 
  env: any, 
  user: AdminUser
): Promise<Response> {
  try {
    const data = await request.json() as ContentItem;
    
    // Validate required fields
    if (!data.type || !data.title || !data.content) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Type, title, and content are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
    }
    
    // Set timestamps
    const now = new Date().toISOString();
    data.created_at = now;
    data.updated_at = now;
    
    // Set status if not provided
    if (!data.status) {
      data.status = 'draft';
    }
    
    // Set author if not provided
    if (!data.author && user) {
      data.author = user.username;
    }
    
    // Insert into database
    const result = await env.SITE_DB.prepare(`
      INSERT INTO content (
        type, title, slug, content, excerpt, featured_image, 
        status, author, created_at, updated_at, published_at, meta_data
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.type,
      data.title,
      data.slug,
      data.content,
      data.excerpt || null,
      data.featured_image || null,
      data.status,
      data.author || null,
      data.created_at,
      data.updated_at,
      data.published_at || null,
      data.meta_data ? JSON.stringify(data.meta_data) : null
    ).run();
    
    // Get the inserted ID
    const id = result.meta?.last_row_id;
    
    return new Response(JSON.stringify({
      success: true,
      item: {
        id,
        ...data
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating content:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create content'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update an existing content item
 * @param request - The incoming request
 * @param env - Environment variables
 * @param user - The authenticated user
 * @param id - Content ID
 * @returns Response with updated content
 */
export async function updateContent(
  request: Request, 
  env: any, 
  user: AdminUser,
  id: number
): Promise<Response> {
  try {
    // Check if content exists
    const existing = await env.SITE_DB.prepare(
      `SELECT * FROM content WHERE id = ?`
    ).bind(id).first();
    
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await request.json() as Partial<ContentItem>;
    
    // Update timestamp
    data.updated_at = new Date().toISOString();
    
    // If status changed to published, set published_at
    if (data.status === 'published' && existing.status !== 'published') {
      data.published_at = data.updated_at;
    }
    
    // Build update query
    const fields: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        
        if (key === 'meta_data' && value) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }
    
    // Add ID to values
    values.push(id);
    
    // Update database
    await env.SITE_DB.prepare(`
      UPDATE content 
      SET ${fields.join(', ')}
      WHERE id = ?
    `).bind(...values).run();
    
    return new Response(JSON.stringify({
      success: true,
      item: {
        ...existing,
        ...data
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating content:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update content'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Delete a content item
 * @param request - The incoming request
 * @param env - Environment variables
 * @param user - The authenticated user
 * @param id - Content ID
 * @returns Response with result
 */
export async function deleteContent(
  request: Request, 
  env: any, 
  user: AdminUser,
  id: number
): Promise<Response> {
  try {
    // Check if content exists
    const existing = await env.SITE_DB.prepare(
      `SELECT id FROM content WHERE id = ?`
    ).bind(id).first();
    
    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete from database
    await env.SITE_DB.prepare(
      `DELETE FROM content WHERE id = ?`
    ).bind(id).run();
    
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete content'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
