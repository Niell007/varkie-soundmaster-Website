// Media API handlers for Soundmaster Admin Dashboard
import { MediaService, MediaType } from '../services/media';
import type { Env } from '../index';
import { saveMediaMetadata, getMediaMetadataByKey, deleteMediaMetadata, listMediaMetadata, searchMediaMetadata, updateMediaMetadata as updateMediaMetadataInDb, UpdateMediaMetadata } from './db-media';
import { verifyToken, verifyJWT } from '../auth';

// Interface for request with params
interface RequestWithParams extends Request {
  params?: Record<string, string>;
}

/**
 * Upload a media file
 */
export async function uploadMedia(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Request must be multipart/form-data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the form data
    const formData = await request.formData();
    
    // Get the file from the form data
    const fileData = formData.get('file');
    if (!fileData || typeof fileData === 'string') {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get the media type from the form data or params
    const type = (formData.get('type') as MediaType) || (request.params?.type as MediaType) || 'audio';
    
    // Get optional custom key
    const customKey = formData.get('key') as string || undefined;
    
    // Extract metadata from form data
    const metadata: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'file' && key !== 'type' && key !== 'key' && typeof value === 'string') {
        metadata[key] = value;
      }
    }
    
    // Create media service
    const mediaService = new MediaService(env);
    
    // Upload the file to R2
    const mediaFile = await mediaService.uploadFile(fileData as File, type, customKey, metadata);
    
    // Get user ID from JWT token
    let userId: string | undefined;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (payload) {
          userId = payload.sub; // User ID is stored in the 'sub' claim
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
    
    // Save media metadata to D1 database
    try {
      await saveMediaMetadata(env, mediaFile, userId);
    } catch (error) {
      console.error('Error saving media metadata to database:', error);
      // Continue even if database save fails - we still have the file in R2
    }
    
    // Return the media file information
    return new Response(JSON.stringify(mediaFile), {
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
 * Get a media file
 */
export async function getMedia(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Get the key from the params
    const key = request.params?.key;
    if (!key) {
      return new Response(JSON.stringify({ error: 'Media key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create media service
    const mediaService = new MediaService(env);
    
    // Check for signed URL parameters
    const url = new URL(request.url);
    const expires = url.searchParams.get('expires');
    const signature = url.searchParams.get('signature');
    
    // If signed URL parameters are provided, verify them
    if (expires && signature) {
      const expiresAt = parseInt(expires, 10);
      const isValid = await mediaService.verifySignedUrl(key, expiresAt, signature);
      
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid or expired signature' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Try to get metadata from database first
    let dbMetadata = null;
    try {
      dbMetadata = await getMediaMetadataByKey(env, key);
    } catch (error) {
      console.error('Error getting media metadata from database:', error);
      // Continue even if database retrieval fails - we can still try R2
    }
    
    // Get the file from R2
    const result = await mediaService.getFile(key);
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Media not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Merge metadata from database if available
    if (dbMetadata) {
      // Use database metadata but keep the file from R2
      result.metadata = dbMetadata;
    }
    
    // Return the file with appropriate headers
    return new Response(result.file, {
      headers: {
        'Content-Type': result.metadata.contentType,
        'Content-Disposition': `inline; filename="${result.metadata.filename}"`,
        'Cache-Control': 'public, max-age=31536000',
        'ETag': `"${key}"`,
      }
    });
  } catch (error) {
    console.error('Error getting media:', error);
    return new Response(JSON.stringify({ error: 'Failed to get media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get media file metadata
 */
export async function getMediaMetadata(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Get the key from the params
    const key = request.params?.key;
    if (!key) {
      return new Response(JSON.stringify({ error: 'Media key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create media service
    const mediaService = new MediaService(env);
    
    // Get the file
    const result = await mediaService.getFile(key);
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Media not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return the metadata
    return new Response(JSON.stringify(result.metadata), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting media metadata:', error);
    return new Response(JSON.stringify({ error: 'Failed to get media metadata' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * List media files
 */
export async function listMedia(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const typeParam = url.searchParams.get('type') as MediaType | null;
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');
    const limit = limitParam ? parseInt(limitParam, 10) : 100;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    const searchQuery = url.searchParams.get('q');
    
    // Use database for listing files with more metadata
    let files;
    
    if (searchQuery && searchQuery.trim().length > 0) {
      // Search media files
      files = await searchMediaMetadata(env, searchQuery, limit);
    } else {
      // List media files
      files = await listMediaMetadata(env, typeParam || undefined, limit, offset);
    }
    
    // If no files found in database, try R2 directly
    if (files.length === 0) {
      // Create media service
      const mediaService = new MediaService(env);
      
      // List files from R2
      const prefix = typeParam ? `${typeParam}/` : undefined;
      files = await mediaService.listFiles(prefix, limit);
    }
    
    // Return the files
    return new Response(JSON.stringify(files), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error listing media:', error);
    return new Response(JSON.stringify({ error: 'Failed to list media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Delete a media file
 */
export async function deleteMedia(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Get the key from the params
    const key = request.params?.key;
    if (!key) {
      return new Response(JSON.stringify({ error: 'Media key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create media service
    const mediaService = new MediaService(env);
    
    // Delete from both R2 and database in parallel
    const [r2Success, dbSuccess] = await Promise.allSettled([
      mediaService.deleteFile(key),
      deleteMediaMetadata(env, key)
    ]);
    
    // Check if both operations succeeded
    const r2Result = r2Success.status === 'fulfilled' ? r2Success.value : false;
    
    // If R2 deletion failed, return error
    if (!r2Result) {
      return new Response(JSON.stringify({ error: 'Failed to delete media from storage' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return success (even if database deletion failed, the file is gone from R2)
    return new Response(JSON.stringify({ 
      success: true,
      databaseSuccess: dbSuccess.status === 'fulfilled'
    }), {
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
 * Generate a signed URL for a media file
 */
/**
 * Update media metadata
 */
export async function updateMediaMetadata(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Get the key from the params
    const key = request.params?.key;
    if (!key) {
      return new Response(JSON.stringify({ error: 'Media key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get update data from request body
    const updateData = await request.json() as UpdateMediaMetadata;
    
    // Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ error: 'No update data provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update metadata in database
    const updatedMedia = await updateMediaMetadataInDb(env, key, updateData);
    
    if (!updatedMedia) {
      return new Response(JSON.stringify({ error: 'Media not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return updated media metadata
    return new Response(JSON.stringify(updatedMedia), {
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
 * Generate a signed URL for a media file
 */
export async function getSignedUrl(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Get the key from the params
    const key = request.params?.key;
    if (!key) {
      return new Response(JSON.stringify({ error: 'Media key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const expirationParam = url.searchParams.get('expiration');
    const expiration = expirationParam ? parseInt(expirationParam, 10) : 3600;
    
    // Check if media exists in database first
    let mediaExists = false;
    try {
      const dbMetadata = await getMediaMetadataByKey(env, key);
      mediaExists = !!dbMetadata;
    } catch (error) {
      console.error('Error checking media in database:', error);
      // Continue even if database check fails - we can still try R2
    }
    
    // If not in database, check R2 directly
    if (!mediaExists) {
      const r2Exists = await env.MEDIA_BUCKET.head(key);
      if (!r2Exists) {
        return new Response(JSON.stringify({ error: 'Media not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Create media service
    const mediaService = new MediaService(env);
    
    // Generate signed URL
    const signedUrl = await mediaService.getSignedUrl(key, expiration);
    
    if (!signedUrl) {
      return new Response(JSON.stringify({ error: 'Failed to generate signed URL' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return the signed URL with expiration information
    return new Response(JSON.stringify({ 
      url: signedUrl,
      expires_in: expiration,
      expires_at: Math.floor(Date.now() / 1000) + expiration
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate signed URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
