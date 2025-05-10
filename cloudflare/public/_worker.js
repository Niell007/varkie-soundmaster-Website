/**
 * Soundmaster Public Website Worker
 * Handles dynamic content for the public-facing website
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle API requests
    if (path.startsWith('/api/')) {
      return handlePublicApi(request, env);
    }
    
    // For all other requests, serve static content
    return env.ASSETS.fetch(request);
  }
};

/**
 * Handle public API requests
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables and bindings
 * @returns {Response} The API response
 */
async function handlePublicApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Media endpoints
  if (path.startsWith('/api/media')) {
    return handleMediaApi(request, env);
  }
  
  // Content endpoints
  if (path.startsWith('/api/content')) {
    return handleContentApi(request, env);
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: 'API endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle media API requests
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables and bindings
 * @returns {Response} The API response
 */
async function handleMediaApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // GET /api/media - List public media items
  if (path === '/api/media' && request.method === 'GET') {
    const { searchParams } = url;
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Only return published media items
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM media WHERE is_public = 1`;
    
    if (type !== 'all') {
      query += ` AND type = '${type}'`;
    }
    
    query += ` ORDER BY uploaded_at DESC LIMIT ${limit} OFFSET ${offset}`;
    
    const result = await env.SITE_DB.prepare(query).all();
    const countResult = await env.SITE_DB.prepare(
      `SELECT COUNT(*) as total FROM media WHERE is_public = 1`
    ).first();
    
    return new Response(JSON.stringify({
      success: true,
      media: result.results,
      total: countResult.total,
      page,
      limit
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /api/media/:id - Get public media item
  if (path.match(/^\/api\/media\/\d+$/) && request.method === 'GET') {
    const id = parseInt(path.split('/').pop());
    
    const media = await env.SITE_DB.prepare(
      `SELECT * FROM media WHERE id = ? AND is_public = 1`
    ).bind(id).first();
    
    if (!media) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Media not found or not public'
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
  
  // GET /api/media/:id/url - Get media file
  if (path.match(/^\/api\/media\/\d+\/url$/) && request.method === 'GET') {
    const id = parseInt(path.split('/')[3]);
    
    const media = await env.SITE_DB.prepare(
      `SELECT key, content_type FROM media WHERE id = ? AND is_public = 1`
    ).bind(id).first();
    
    if (!media) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Media not found or not public'
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
  
  return new Response(JSON.stringify({
    success: false,
    error: 'Media endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle content API requests
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables and bindings
 * @returns {Response} The API response
 */
async function handleContentApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // GET /api/content - List published content
  if (path === '/api/content' && request.method === 'GET') {
    const { searchParams } = url;
    const type = searchParams.get('type') || 'page';
    const slug = searchParams.get('slug');
    
    let query = `SELECT * FROM content WHERE is_published = 1`;
    let params = [];
    
    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }
    
    if (slug) {
      query += ` AND slug = ?`;
      params.push(slug);
    }
    
    const result = await env.SITE_DB.prepare(query).bind(...params).all();
    
    return new Response(JSON.stringify({
      success: true,
      content: result.results
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /api/content/:id - Get published content by ID
  if (path.match(/^\/api\/content\/\d+$/) && request.method === 'GET') {
    const id = parseInt(path.split('/').pop());
    
    const content = await env.SITE_DB.prepare(
      `SELECT * FROM content WHERE id = ? AND is_published = 1`
    ).bind(id).first();
    
    if (!content) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content not found or not published'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      content
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: 'Content endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
