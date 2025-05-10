// Media Library API for Soundmaster Admin Dashboard
import { Env } from '../types/env';
import { RequestWithParams } from '../types/request';
import { verifyToken } from './auth';
import { nanoid } from 'nanoid';

// Image optimization constants
const MAX_IMAGE_WIDTH = 1920;
const IMAGE_QUALITY = 0.85;
const THUMBNAIL_SIZE = 300;
const THUMBNAIL_QUALITY = 0.7;

/**
 * Helper function to optimize an image
 * @param imageBuffer Image buffer to optimize
 * @param maxWidth Maximum width of the image
 * @param quality Image quality (0-1)
 * @returns Optimized image buffer
 */
async function optimizeImage(imageBuffer: ArrayBuffer, maxWidth: number, quality: number): Promise<ArrayBuffer> {
  try {
    // Use the Workers Image API to resize and optimize the image
    const image = new Image();
    const blob = new Blob([imageBuffer]);
    const imageBitmap = await createImageBitmap(blob);
    
    // Calculate new dimensions while maintaining aspect ratio
    let width = imageBitmap.width;
    let height = imageBitmap.height;
    
    if (width > maxWidth) {
      const aspectRatio = width / height;
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    }
    
    // Create canvas for resizing
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Draw image to canvas
    ctx.drawImage(imageBitmap, 0, 0, width, height);
    
    // Convert to blob with specified quality
    const optimizedBlob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality
    });
    
    // Convert blob to array buffer
    return await optimizedBlob.arrayBuffer();
  } catch (error) {
    console.error('Error optimizing image:', error);
    // Return original image if optimization fails
    return imageBuffer;
  }
}

/**
 * Helper function to create a thumbnail from an image
 * @param imageBuffer Image buffer to create thumbnail from
 * @param size Thumbnail size (width and height)
 * @param quality Thumbnail quality (0-1)
 * @returns Thumbnail buffer
 */
async function createThumbnail(imageBuffer: ArrayBuffer, size: number, quality: number): Promise<ArrayBuffer> {
  try {
    // Use the Workers Image API to create a thumbnail
    const blob = new Blob([imageBuffer]);
    const imageBitmap = await createImageBitmap(blob);
    
    // Create square thumbnail
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Calculate dimensions to maintain aspect ratio and center the image
    const aspectRatio = imageBitmap.width / imageBitmap.height;
    let srcWidth, srcHeight, srcX, srcY;
    
    if (aspectRatio > 1) {
      // Landscape image
      srcHeight = imageBitmap.height;
      srcWidth = srcHeight * aspectRatio;
      srcY = 0;
      srcX = (imageBitmap.width - srcWidth) / 2;
    } else {
      // Portrait image
      srcWidth = imageBitmap.width;
      srcHeight = srcWidth / aspectRatio;
      srcX = 0;
      srcY = (imageBitmap.height - srcHeight) / 2;
    }
    
    // Draw image to canvas
    ctx.drawImage(imageBitmap, srcX, srcY, srcWidth, srcHeight, 0, 0, size, size);
    
    // Convert to blob with specified quality
    const thumbnailBlob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality
    });
    
    // Convert blob to array buffer
    return await thumbnailBlob.arrayBuffer();
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    // Return original image if thumbnail creation fails
    return imageBuffer;
  }
}

/**
 * Get all media items
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with media items
 */
export async function getMediaItems(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    
    // Build query
    let query = `
      SELECT id, key, filename, content_type, size, type, uploaded_at, uploaded_by
      FROM media
    `;
    
    const params: any[] = [];
    
    if (type !== 'all') {
      query += ' WHERE type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY uploaded_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Get media items
    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...params).all();
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM media';
    if (type !== 'all') {
      countQuery += ' WHERE type = ?';
    }
    
    const countStmt = env.DB.prepare(countQuery);
    const countResult = type !== 'all' 
      ? await countStmt.bind(type).first<{count: number}>()
      : await countStmt.first<{count: number}>();
    const totalItems = countResult?.count || 0;
    
    // Create response with pagination metadata
    const paginationMeta = {
      total: totalItems,
      page: Math.floor(offset / limit) + 1,
      perPage: limit,
      totalPages: Math.ceil(totalItems / limit)
    };
    
    return new Response(JSON.stringify({
      items: result.results || [],
      meta: paginationMeta
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting media items:', error);
    return new Response(JSON.stringify({ error: 'Failed to get media items' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get a single media item
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with media item
 */
export async function getMediaItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get media ID from request parameters
    const mediaId = request.params.id;
    
    // Get media item
    const stmt = env.DB.prepare(`
      });
    }
    
    // Get media metadata
    const metaStmt = env.DB.prepare(`
      SELECT meta_key, meta_value
      FROM media_meta
      WHERE media_id = ?
    `);
    
    const metaResult = await metaStmt.bind(mediaId).all();
    const metadata: Record<string, string> = {};
    
    // Safely process metadata results
    const metaResults = metaResult?.results || [];
    for (const meta of metaResults) {
      if (typeof meta === 'object' && 'meta_key' in meta && 'meta_value' in meta) {
        metadata[meta.meta_key as string] = meta.meta_value as string;
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      mediaItem: {
        ...mediaItem,
        metadata
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting media item:', error);
    return new Response(JSON.stringify({ error: 'Failed to get media item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Upload a media item
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with uploaded media item
 */
export async function uploadMedia(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if request is multipart/form-data
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Request must be multipart/form-data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get file metadata
    const title = formData.get('title') as string || file.name.split('.')[0];
    const description = formData.get('description') as string || '';
    const altText = formData.get('alt_text') as string || '';
    const type = formData.get('type') as string || 'document';
    
    // Generate unique key for R2
    const fileId = nanoid();
    const fileExtension = file.name.split('.').pop() || '';
    const key = `${fileId}.${fileExtension}`;
    const thumbnailKey = `${fileId}_thumb.jpg`;
    
    // Get file buffer
    let arrayBuffer = await file.arrayBuffer();
    let thumbnailBuffer: ArrayBuffer | null = null;
    
    // Process image files for optimization
    if (file.type.startsWith('image/')) {
      // Optimize image
      arrayBuffer = await optimizeImage(arrayBuffer, MAX_IMAGE_WIDTH, IMAGE_QUALITY);
      
      // Create thumbnail
      thumbnailBuffer = await createThumbnail(arrayBuffer, THUMBNAIL_SIZE, THUMBNAIL_QUALITY);
    }
    
    // Upload file to R2
    const r2Object = await env.MEDIA_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      }
    });
    
    // Upload thumbnail if available
    if (thumbnailBuffer && file.type.startsWith('image/')) {
      await env.MEDIA_BUCKET.put(thumbnailKey, thumbnailBuffer, {
        httpMetadata: {
          contentType: 'image/jpeg',
        }
      });
    }
    
    // Insert media record into database
    const mediaId = nanoid();
    const insertStmt = env.DB.prepare(`
      INSERT INTO media (id, key, filename, content_type, size, type, uploaded_at, uploaded_by, thumbnail_key)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)
    `);
    
    await insertStmt.bind(
      mediaId,
      key,
      file.name,
      file.type,
      arrayBuffer.byteLength, // Use optimized size
      type,
      user.id,
      file.type.startsWith('image/') ? thumbnailKey : null
    ).run();
    
    // Insert metadata
    if (title || description || altText) {
      const metaStmts = [];
      
      if (title) {
        metaStmts.push(
          env.DB.prepare(`
            INSERT INTO media_meta (media_id, meta_key, meta_value)
            VALUES (?, 'title', ?)
          `).bind(mediaId, title)
        );
      }
      
      if (description) {
        metaStmts.push(
          env.DB.prepare(`
            INSERT INTO media_meta (media_id, meta_key, meta_value)
            VALUES (?, 'description', ?)
          `).bind(mediaId, description)
        );
      }
      
      if (altText) {
        metaStmts.push(
          env.DB.prepare(`
            INSERT INTO media_meta (media_id, meta_key, meta_value)
            VALUES (?, 'alt_text', ?)
          `).bind(mediaId, altText)
        );
      }
      
      if (metaStmts.length > 0) {
        // Execute each statement individually instead of using batch
        for (const stmt of metaStmts) {
          await stmt.run();
        }
      }
    }
    
    // Create metadata object
    const metadata: Record<string, string> = {};
    if (title) metadata.title = title;
    if (description) metadata.description = description;
    if (altText) metadata.alt_text = altText;
    
    return new Response(JSON.stringify({
      success: true,
      mediaItem: {
        id: mediaId,
        key,
        filename: file.name,
        content_type: file.type,
        size: arrayBuffer.byteLength,
        type,
        uploaded_at: new Date().toISOString(),
        uploaded_by: user.id,
        thumbnail_key: file.type.startsWith('image/') ? thumbnailKey : null,
        metadata
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update media metadata
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with updated media item
 */
export async function updateMediaMetadata(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get media ID from request parameters
    const mediaId = request.params.id;
    
    // Check if media exists
    const checkStmt = env.DB.prepare(`
      SELECT id FROM media WHERE id = ?
    `);
    
    const mediaExists = await checkStmt.bind(mediaId).first();
    
    if (!mediaExists) {
      return new Response(JSON.stringify({ error: 'Media item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get metadata from request body
    const metadata = await request.json<Record<string, string>>();
    
    if (!metadata || Object.keys(metadata).length === 0) {
      return new Response(JSON.stringify({ error: 'No metadata provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update metadata
    for (const [key, value] of Object.entries(metadata)) {
      // Check if metadata exists
      const checkMetaStmt = env.DB.prepare(`
        SELECT id FROM media_meta WHERE media_id = ? AND meta_key = ?
      `);
      
      const metaExists = await checkMetaStmt.bind(mediaId, key).first();
      
      if (metaExists) {
        // Update existing metadata
        const updateMetaStmt = env.DB.prepare(`
          UPDATE media_meta
          SET meta_value = ?, updated_at = datetime('now')
          WHERE media_id = ? AND meta_key = ?
        `);
        
        await updateMetaStmt.bind(value, mediaId, key).run();
      } else {
        // Insert new metadata
        const insertMetaStmt = env.DB.prepare(`
          INSERT INTO media_meta (id, media_id, meta_key, meta_value, created_at, updated_at)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `);
        
        await insertMetaStmt.bind(nanoid(), mediaId, key, value).run();
      }
    }
    
    // Get updated media item
    const getStmt = env.DB.prepare(`
      SELECT id, key, filename, content_type, size, type, uploaded_at, uploaded_by
      FROM media
      WHERE id = ?
    `);
    
    const mediaItem = await getStmt.bind(mediaId).first();
    
    // Get updated metadata
    const metaStmt = env.DB.prepare(`
      SELECT meta_key, meta_value
      FROM media_meta
      WHERE media_id = ?
    `);
    
    const metaResult = await metaStmt.bind(mediaId).all();
    const updatedMetadata: Record<string, string> = {};
    
    // Safely process metadata results
    const metaResults = metaResult?.results || [];
    for (const meta of metaResults) {
      if (typeof meta === 'object' && 'meta_key' in meta && 'meta_value' in meta) {
        updatedMetadata[meta.meta_key as string] = meta.meta_value as string;
      }
    }
    
    // Create the response with the media item and metadata
    const responseItem = {
      id: mediaItem.id,
      key: mediaItem.key,
      filename: mediaItem.filename,
      content_type: mediaItem.content_type,
      size: mediaItem.size,
      type: mediaItem.type,
      uploaded_at: mediaItem.uploaded_at,
      uploaded_by: mediaItem.uploaded_by,
      metadata: updatedMetadata
    };
    
    return new Response(JSON.stringify({
      success: true,
      mediaItem: responseItem
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating media metadata:', error);
    return new Response(JSON.stringify({ error: 'Failed to update media metadata' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Delete a media item
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with success status
 */
export async function deleteMedia(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user has permission to delete media
    if (user.role !== 'admin' && user.role !== 'editor') {
      return new Response(JSON.stringify({ error: 'You do not have permission to delete media' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get media ID from request parameters
    const mediaId = request.params.id;
    
    // Get media key
    const getKeyStmt = env.DB.prepare(`
      SELECT key FROM media WHERE id = ?
    `);
    
    const mediaKey = await getKeyStmt.bind(mediaId).first();
    
    if (!mediaKey || typeof mediaKey !== 'object' || !('key' in mediaKey)) {
      return new Response(JSON.stringify({ error: 'Media item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete from R2
    await env.MEDIA_BUCKET.delete(mediaKey.key as string);
    
    // Delete metadata
    const deleteMetaStmt = env.DB.prepare(`
      DELETE FROM media_meta WHERE media_id = ?
    `);
    
    await deleteMetaStmt.bind(mediaId).run();
    
    // Delete media record
    const deleteMediaStmt = env.DB.prepare(`
      DELETE FROM media WHERE id = ?
    `);
    
    await deleteMediaStmt.bind(mediaId).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Media item deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get media types
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with media types
 */
export async function getMediaTypes(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get media types
    const stmt = env.DB.prepare(`
      SELECT DISTINCT type, COUNT(*) as count
      FROM media
      GROUP BY type
      ORDER BY count DESC
    `);
    
    const result = await stmt.all();
    
    return new Response(JSON.stringify({
      success: true,
      types: result.results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting media types:', error);
    return new Response(JSON.stringify({ error: 'Failed to get media types' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get a signed URL for a media item
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with signed URL
 */
export async function getSignedUrl(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get media ID from request parameters
    const mediaId = request.params.id;
    
    // Get media key
    const getKeyStmt = env.DB.prepare(`
      SELECT key, content_type FROM media WHERE id = ?
    `);
    
    const mediaInfo = await getKeyStmt.bind(mediaId).first();
    
    if (!mediaInfo || typeof mediaInfo !== 'object' || !('key' in mediaInfo)) {
      return new Response(JSON.stringify({ error: 'Media item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get media object
    const mediaObject = await env.MEDIA_BUCKET.get(mediaInfo.key as string);
    
    if (!mediaObject) {
      return new Response(JSON.stringify({ error: 'Media file not found in storage' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get content type from media info
    const contentType = typeof mediaInfo === 'object' && 'content_type' in mediaInfo 
      ? String(mediaInfo.content_type) 
      : 'application/octet-stream';
    
    // Return media data with appropriate content type
    return new Response(mediaObject.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return new Response(JSON.stringify({ error: 'Failed to get signed URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
