/**
 * Media Library API for Cloudflare Workers
 * Handles media file management and optimization
 */

// Media item interface
export interface MediaItem {
  id: number;
  key: string;
  filename: string;
  content_type: string;
  size: number;
  type: string;
  title: string;
  alt_text?: string;
  description?: string;
  is_public: boolean;
  uploaded_at: string;
  uploaded_by?: number;
}

/**
 * Get all media items with optional filtering
 */
export async function getMediaItems(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  const { searchParams } = url;
  
  const type = searchParams.get('type') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  
  // Query media from database
  const offset = (page - 1) * limit;
  let query = `SELECT * FROM media`;
  let params: any[] = [];
  
  if (type !== 'all') {
    query += ` WHERE type = ?`;
    params.push(type);
  }
  
  if (search) {
    query += type !== 'all' ? ` AND` : ` WHERE`;
    query += ` (title LIKE ? OR filename LIKE ? OR description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  query += ` ORDER BY uploaded_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  const result = await env.SITE_DB.prepare(query).bind(...params).all();
  
  // Get total count for pagination
  let countQuery = `SELECT COUNT(*) as total FROM media`;
  let countParams: any[] = [];
  
  if (type !== 'all') {
    countQuery += ` WHERE type = ?`;
    countParams.push(type);
  }
  
  if (search) {
    countQuery += type !== 'all' ? ` AND` : ` WHERE`;
    countQuery += ` (title LIKE ? OR filename LIKE ? OR description LIKE ?)`;
    countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  const countResult = await env.SITE_DB.prepare(countQuery)
    .bind(...countParams)
    .first();
  
  // Check if the database has been initialized
  if (!result || !result.results) {
    // Return empty array if database is not initialized
    return new Response(JSON.stringify({
      success: true,
      media: [],
      total: 0,
      page,
      limit
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    media: result.results,
    total: countResult?.total || 0,
    page,
    limit
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Get media item by ID
 */
export async function getMediaItem(request: Request, env: any, id: number): Promise<Response> {
  const media = await env.SITE_DB.prepare(
    `SELECT * FROM media WHERE id = ?`
  ).bind(id).first();
  
  if (!media) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Media not found' 
    }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    success: true,
    media
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Upload media file
 */
export async function uploadMedia(request: Request, env: any, userId?: number): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as unknown as File;
    
    if (!file) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No file provided' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate a unique key for the file
    const key = crypto.randomUUID();
    
    // Get file buffer
    const fileBuffer = await file.arrayBuffer();
    
    // Optimize image if it's an image type
    let contentType = file.type;
    let fileSize = file.size;
    
    if (file.type.startsWith('image/')) {
      // In a real implementation, you would use image processing libraries
      // For Cloudflare Workers, we could use the built-in image optimization
      // This is a placeholder for the actual optimization code
      
      // For now, we'll just use the original image
      // In a production environment, you'd want to use Cloudflare's Image Resizing API
      // or another image optimization service
    }
    
    // Store file in R2
    await env.MEDIA_BUCKET.put(key, fileBuffer, {
      httpMetadata: {
        contentType: contentType,
      }
    });
    
    // Store metadata in database
    const title = formData.get('title')?.toString() || file.name.split('.')[0];
    const type = formData.get('type')?.toString() || 'document';
    const description = formData.get('description')?.toString() || '';
    const altText = formData.get('alt_text')?.toString() || '';
    const isPublic = formData.get('is_public') === 'true';
    
    const result = await env.SITE_DB.prepare(`
      INSERT INTO media (key, filename, content_type, size, type, title, description, alt_text, is_public, uploaded_by, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      key, 
      file.name, 
      contentType, 
      fileSize, 
      type, 
      title, 
      description, 
      altText, 
      isPublic ? 1 : 0, 
      userId || null
    ).run();
    
    return new Response(JSON.stringify({
      success: true,
      media: {
        id: result.meta.last_row_id,
        key,
        filename: file.name,
        content_type: contentType,
        size: fileSize,
        type,
        title,
        description,
        alt_text: altText,
        is_public: isPublic,
        uploaded_by: userId,
        uploaded_at: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update media metadata
 */
export async function updateMediaMetadata(request: Request, env: any, id: number): Promise<Response> {
  try {
    const data = await request.json() as { 
      title: string; 
      description?: string; 
      alt_text?: string; 
      is_public?: boolean 
    };
    const { title, description, alt_text, is_public } = data;
    
    // Check if media exists
    const media = await env.SITE_DB.prepare(
      `SELECT * FROM media WHERE id = ?`
    ).bind(id).first();
    
    if (!media) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Media not found' 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update media metadata
    await env.SITE_DB.prepare(`
      UPDATE media 
      SET title = ?, description = ?, alt_text = ?, is_public = ?
      WHERE id = ?
    `).bind(
      title, 
      description || null, 
      alt_text || null, 
      is_public ? 1 : 0, 
      id
    ).run();
    
    return new Response(JSON.stringify({
      success: true,
      media: {
        ...media,
        title,
        description,
        alt_text,
        is_public
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Update failed: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Delete media
 */
export async function deleteMedia(request: Request, env: any, id: number): Promise<Response> {
  try {
    // Get media key
    const media = await env.SITE_DB.prepare(
      `SELECT * FROM media WHERE id = ?`
    ).bind(id).first() as { key: string } | null;
    
    if (!media) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Media not found' 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete from R2
    await env.MEDIA_BUCKET.delete(media.key);
    
    // Delete from database
    await env.SITE_DB.prepare(
      `DELETE FROM media WHERE id = ?`
    ).bind(id).run();
    
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Delete failed: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get media file URL
 */
export async function getMediaUrl(request: Request, env: any, id: number): Promise<Response> {
  // Get media key
  const media = await env.SITE_DB.prepare(
    `SELECT key, content_type FROM media WHERE id = ?`
  ).bind(id).first() as { key: string, content_type: string } | null;
  
  if (!media) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Media not found' 
    }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Get object from R2
  const object = await env.MEDIA_BUCKET.get(media.key);
  
  if (!object) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Media file not found' 
    }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Return file content
  return new Response(object.body, {
    headers: {
      'Content-Type': media.content_type,
      'Cache-Control': 'public, max-age=31536000'
    }
  });
}

/**
 * Get media types
 */
export async function getMediaTypes(request: Request, env: any): Promise<Response> {
  const types = await env.SITE_DB.prepare(
    `SELECT DISTINCT type FROM media`
  ).all();
  
  return new Response(JSON.stringify({
    success: true,
    types: types.results.map((row: any) => row.type)
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
