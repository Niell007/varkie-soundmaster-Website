/**
 * Settings API for Cloudflare Workers
 * Handles site settings management
 */

import { AdminUser } from './auth';

// Settings interface
export interface Settings {
  id?: number;
  type: string;
  data: any;
  updated_at: string;
  updated_by?: string;
}

/**
 * Get settings by type
 * @param request - The incoming request
 * @param env - Environment variables
 * @param type - Settings type (optional)
 * @returns Response with settings
 */
export async function getSettings(
  request: Request, 
  env: any, 
  user: AdminUser,
  type?: string
): Promise<Response> {
  try {
    let query = 'SELECT * FROM settings';
    let params: any[] = [];
    
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY type ASC';
    
    const result = await env.SITE_DB.prepare(query)
      .bind(...params)
      .all();
    
    // Format response
    let response: any = {
      success: true
    };
    
    if (type) {
      // Return single settings object
      const settings = result.results[0];
      response.data = settings ? settings.data : {};
    } else {
      // Return all settings grouped by type
      response.data = {};
      for (const setting of result.results) {
        response.data[setting.type] = setting.data;
      }
    }
    
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get settings'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update settings
 * @param request - The incoming request
 * @param env - Environment variables
 * @param user - The authenticated user
 * @param type - Settings type
 * @returns Response with updated settings
 */
export async function updateSettings(
  request: Request, 
  env: any, 
  user: AdminUser,
  type: string
): Promise<Response> {
  try {
    // Check if settings exist
    const existing = await env.SITE_DB.prepare(
      'SELECT id FROM settings WHERE type = ?'
    ).bind(type).first();
    
    // Parse request body
    let data: any;
    
    // Handle FormData for file uploads
    const contentType = request.headers.get('Content-Type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = {};
      
      // Process form data
      for (const [key, value] of formData.entries()) {
        // Handle file uploads
        if (typeof value === 'object' && value !== null && 'name' in value) {
          // In a real implementation, you would upload the file to R2
          // and store the URL in the settings
          // For now, we'll just store the file name
          data[key] = (value as { name: string }).name;
          continue;
        }
        
        // Handle nested objects (e.g., socialMedia[facebook])
        if (key.includes('[') && key.includes(']')) {
          const match = key.match(/^([^\[]+)\[([^\]]+)\]/);
          if (match) {
            const parentKey = match[1];
            const childKey = match[2];
            
            if (!data[parentKey]) {
              data[parentKey] = {};
            }
            
            data[parentKey][childKey] = value;
            continue;
          }
        }
        
        // Handle regular form fields
        data[key] = value;
      }
    } else {
      // Handle JSON
      data = await request.json();
    }
    
    // Current timestamp
    const now = new Date().toISOString();
    
    if (existing) {
      // Update existing settings
      await env.SITE_DB.prepare(`
        UPDATE settings 
        SET data = ?, updated_at = ?, updated_by = ?
        WHERE type = ?
      `).bind(
        JSON.stringify(data),
        now,
        user.username,
        type
      ).run();
    } else {
      // Insert new settings
      await env.SITE_DB.prepare(`
        INSERT INTO settings (type, data, updated_at, updated_by)
        VALUES (?, ?, ?, ?)
      `).bind(
        type,
        JSON.stringify(data),
        now,
        user.username
      ).run();
    }
    
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update settings'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Delete settings
 * @param request - The incoming request
 * @param env - Environment variables
 * @param user - The authenticated user
 * @param type - Settings type
 * @returns Response with result
 */
export async function deleteSettings(
  request: Request, 
  env: any, 
  user: AdminUser,
  type: string
): Promise<Response> {
  try {
    // Delete settings
    await env.SITE_DB.prepare(
      'DELETE FROM settings WHERE type = ?'
    ).bind(type).run();
    
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting settings:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete settings'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
