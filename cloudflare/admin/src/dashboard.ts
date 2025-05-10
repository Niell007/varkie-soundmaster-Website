/**
 * Dashboard API for Cloudflare Workers
 * Handles dashboard statistics and recent content
 */

import { AdminUser } from './auth';

/**
 * Get dashboard statistics
 * @param request - The incoming request
 * @param env - Environment variables
 * @param user - The authenticated user
 * @returns Response with dashboard statistics
 */
export async function getDashboardStats(
  request: Request, 
  env: any, 
  user: AdminUser
): Promise<Response> {
  try {
    try {
      // Get counts from database
      const [
        newsCount,
        mediaCount,
        teamCount,
        scheduleCount,
        playlistCount
      ] = await Promise.all([
        getContentCount(env, 'news'),
        getMediaCount(env),
        getContentCount(env, 'team'),
        getContentCount(env, 'schedule'),
        getContentCount(env, 'playlist')
      ]);
      
      // Return statistics in the format expected by the frontend
      return new Response(JSON.stringify({
        success: true,
        data: {
          newsCount: newsCount,
          mediaCount: mediaCount,
          teamCount: teamCount,
          scheduleCount: scheduleCount,
          playlistCount: playlistCount,
          lastUpdated: new Date().toISOString()
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Return default values if database is not initialized
      return new Response(JSON.stringify({
        success: true,
        data: {
          newsCount: 0,
          mediaCount: 0,
          teamCount: 0,
          scheduleCount: 0,
          playlistCount: 0,
          lastUpdated: new Date().toISOString()
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get dashboard statistics'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get content count by type
 * @param env - Environment variables
 * @param type - Content type
 * @returns Content count
 */
async function getContentCount(env: any, type: string): Promise<number> {
  try {
    const result = await env.SITE_DB.prepare(
      `SELECT COUNT(*) as count FROM content WHERE type = ?`
    ).bind(type).first();
    
    return result?.count || 0;
  } catch (error) {
    console.error(`Error getting ${type} count:`, error);
    return 0;
  }
}

/**
 * Get media count
 * @param env - Environment variables
 * @returns Media count
 */
async function getMediaCount(env: any): Promise<number> {
  try {
    const result = await env.SITE_DB.prepare(
      `SELECT COUNT(*) as count FROM media`
    ).first();
    
    return result?.count || 0;
  } catch (error) {
    console.error('Error getting media count:', error);
    return 0;
  }
}

/**
 * Get recent content
 * @param request - The incoming request
 * @param env - Environment variables
 * @param user - The authenticated user
 * @param type - Content type
 * @param limit - Number of items to retrieve
 * @returns Response with recent content
 */
export async function getRecentContent(
  request: Request, 
  env: any, 
  user: AdminUser,
  type: string,
  limit: number = 5
): Promise<Response> {
  try {
    // Get recent content from database
    const result = await env.SITE_DB.prepare(`
      SELECT * FROM content 
      WHERE type = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(type, limit).all();
    
    // Return content
    return new Response(JSON.stringify({
      success: true,
      items: result.results || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error getting recent ${type}:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: `Failed to get recent ${type}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
