// Media database operations for Soundmaster Admin Dashboard
import type { Env } from '../index';
import { MediaFile, MediaType } from '../services/media';

// Update media metadata interface
export interface UpdateMediaMetadata {
  filename?: string;
  contentType?: string;
  type?: MediaType;
  metadata?: Record<string, string>;
}

// Media metadata interface
export interface MediaMetadata {
  key: string;
  meta_key: string;
  meta_value: string;
}

/**
 * Save media metadata to the database
 * @param env Cloudflare environment
 * @param mediaFile Media file information
 * @param userId Optional user ID of the uploader
 * @returns The ID of the created media record
 */
export async function saveMediaMetadata(
  env: Env, 
  mediaFile: MediaFile, 
  userId?: string
): Promise<string> {
  try {
    const id = crypto.randomUUID();
    
    // Insert media record
    const stmt = env.DB.prepare(`
      INSERT INTO media (
        id, key, filename, content_type, size, type, uploaded_at, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      id,
      mediaFile.key,
      mediaFile.filename,
      mediaFile.contentType,
      mediaFile.size,
      mediaFile.type,
      mediaFile.uploadedAt,
      userId || null
    ).run();
    
    // Insert media metadata if available
    if (mediaFile.metadata) {
      const metaStmt = env.DB.prepare(`
        INSERT INTO media_meta (
          id, media_id, meta_key, meta_value
        ) VALUES (?, ?, ?, ?)
      `);
      
      const batch = [];
      
      for (const [key, value] of Object.entries(mediaFile.metadata)) {
        if (key !== 'mediaType' && key !== 'originalFilename') {
          batch.push(metaStmt.bind(
            crypto.randomUUID(),
            id,
            key,
            value
          ));
        }
      }
      
      if (batch.length > 0) {
        await env.DB.batch(batch);
      }
    }
    
    return id;
  } catch (error) {
    console.error('Error saving media metadata:', error);
    throw new Error('Failed to save media metadata');
  }
}

/**
 * Get media metadata from the database by key
 * @param env Cloudflare environment
 * @param key Media key
 * @returns Media metadata or null if not found
 */
export async function getMediaMetadataByKey(env: Env, key: string): Promise<MediaFile | null> {
  try {
    // Get media record
    const stmt = env.DB.prepare(`
      SELECT * FROM media WHERE key = ?
    `);
    
    const media = await stmt.bind(key).first();
    
    if (!media) {
      return null;
    }
    
    // Get media metadata
    const metaStmt = env.DB.prepare(`
      SELECT meta_key, meta_value FROM media_meta WHERE media_id = ?
    `);
    
    const metaResult = await metaStmt.bind(media.id).all();
    const metadata: Record<string, string> = {};
    
    for (const meta of metaResult.results as unknown as Array<{meta_key: string, meta_value: string}>) {
      metadata[meta.meta_key] = meta.meta_value;
    }
    
    // Create media file object
    return {
      key: String(media.key),
      filename: String(media.filename),
      contentType: String(media.content_type),
      size: Number(media.size),
      type: String(media.type) as MediaType,
      uploadedAt: String(media.uploaded_at),
      metadata
    };
  } catch (error) {
    console.error('Error getting media metadata:', error);
    throw new Error('Failed to get media metadata');
  }
}

/**
 * Delete media metadata from the database
 * @param env Cloudflare environment
 * @param key Media key
 * @returns True if the media was deleted, false if not found
 */
export async function deleteMediaMetadata(env: Env, key: string): Promise<boolean> {
  try {
    // Get media ID
    const getStmt = env.DB.prepare(`
      SELECT id FROM media WHERE key = ?
    `);
    
    const media = await getStmt.bind(key).first();
    
    if (!media) {
      return false;
    }
    
    // Delete media metadata
    const metaStmt = env.DB.prepare(`
      DELETE FROM media_meta WHERE media_id = ?
    `);
    
    await metaStmt.bind(media.id).run();
    
    // Delete media record
    const mediaStmt = env.DB.prepare(`
      DELETE FROM media WHERE id = ?
    `);
    
    await mediaStmt.bind(media.id).run();
    
    return true;
  } catch (error) {
    console.error('Error deleting media metadata:', error);
    throw new Error('Failed to delete media metadata');
  }
}

/**
 * List media metadata from the database
 * @param env Cloudflare environment
 * @param type Optional media type filter
 * @param limit Optional limit of records to return
 * @param offset Optional offset for pagination
 * @returns List of media metadata
 */
export async function listMediaMetadata(
  env: Env,
  type?: MediaType,
  limit = 100,
  offset = 0
): Promise<MediaFile[]> {
  try {
    // Build query
    let query = `
      SELECT m.*, u.name as uploader_name
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
    `;
    
    const params = [];
    
    if (type) {
      query += ` WHERE m.type = ?`;
      params.push(type);
    }
    
    query += ` ORDER BY m.uploaded_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    // Get media records
    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...params).all();
    
    // Get media metadata for each record
    const mediaFiles: MediaFile[] = [];
    
    for (const media of result.results as any[]) {
      const metaStmt = env.DB.prepare(`
        SELECT meta_key, meta_value FROM media_meta WHERE media_id = ?
      `);
      
      const metaResult = await metaStmt.bind(media.id).all();
      const metadata: Record<string, string> = {};
      
      for (const meta of metaResult.results as MediaMetadata[]) {
        metadata[meta.meta_key] = meta.meta_value;
      }
      
      // Add uploader name to metadata if available
      if (media.uploader_name) {
        metadata.uploaderName = media.uploader_name;
      }
      
      // Create media file object
      mediaFiles.push({
        key: media.key,
        filename: media.filename,
        contentType: media.content_type,
        size: media.size,
        type: media.type as MediaType,
        uploadedAt: media.uploaded_at,
        metadata
      });
    }
    
    return mediaFiles;
  } catch (error) {
    console.error('Error listing media metadata:', error);
    throw new Error('Failed to list media metadata');
  }
}

/**
 * Search media metadata in the database
 * @param env Cloudflare environment
 * @param query Search query
 * @param limit Optional limit of records to return
 * @returns List of media metadata matching the search query
 */
export async function searchMediaMetadata(
  env: Env,
  query: string,
  limit = 100
): Promise<MediaFile[]> {
  try {
    // Build search query
    const searchQuery = `%${query}%`;
    
    const stmt = env.DB.prepare(`
      SELECT m.*, u.name as uploader_name
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      LEFT JOIN media_meta mm ON m.id = mm.media_id
      WHERE 
        m.filename LIKE ? OR
        mm.meta_value LIKE ?
      GROUP BY m.id
      ORDER BY m.uploaded_at DESC
      LIMIT ?
    `);
    
    const result = await stmt.bind(searchQuery, searchQuery, limit).all();
    
    // Get media metadata for each record
    const mediaFiles: MediaFile[] = [];
    
    for (const media of result.results as any[]) {
      const metaStmt = env.DB.prepare(`
        SELECT meta_key, meta_value FROM media_meta WHERE media_id = ?
      `);
      
      const metaResult = await metaStmt.bind(media.id).all();
      const metadata: Record<string, string> = {};
      
      for (const meta of metaResult.results as MediaMetadata[]) {
        metadata[meta.meta_key] = meta.meta_value;
      }
      
      // Add uploader name to metadata if available
      if (media.uploader_name) {
        metadata.uploaderName = media.uploader_name;
      }
      
      // Create media file object
      mediaFiles.push({
        key: media.key,
        filename: media.filename,
        contentType: media.content_type,
        size: media.size,
        type: media.type as MediaType,
        uploadedAt: media.uploaded_at,
        metadata
      });
    }
    
    return mediaFiles;
  } catch (error) {
    console.error('Error searching media metadata:', error);
    throw new Error('Failed to search media metadata');
  }
}

/**
 * Update media metadata in the database
 * @param env Cloudflare environment
 * @param key Media key
 * @param updates Updates to apply to the media metadata
 * @returns Updated media metadata or null if not found
 */
export async function updateMediaMetadata(
  env: Env,
  key: string,
  updates: UpdateMediaMetadata
): Promise<MediaFile | null> {
  try {
    // Check if media exists
    const getStmt = env.DB.prepare(`
      SELECT id FROM media WHERE key = ?
    `);
    
    const media = await getStmt.bind(key).first();
    
    if (!media) {
      return null;
    }
    
    const mediaId = String(media.id);
    const updateFields = [];
    const updateValues = [];
    
    // Update basic fields if provided
    if (updates.filename) {
      updateFields.push('filename = ?');
      updateValues.push(updates.filename);
    }
    
    if (updates.contentType) {
      updateFields.push('content_type = ?');
      updateValues.push(updates.contentType);
    }
    
    if (updates.type) {
      updateFields.push('type = ?');
      updateValues.push(updates.type);
    }
    
    // Add updated_at timestamp
    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    
    // Add key for WHERE clause
    updateValues.push(key);
    
    // Update media record if there are fields to update
    if (updateFields.length > 0) {
      const updateStmt = env.DB.prepare(`
        UPDATE media SET ${updateFields.join(', ')} WHERE key = ?
      `);
      
      await updateStmt.bind(...updateValues).run();
    }
    
    // Update metadata if provided
    if (updates.metadata && Object.keys(updates.metadata).length > 0) {
      // First, get existing metadata
      const getMetaStmt = env.DB.prepare(`
        SELECT meta_key FROM media_meta WHERE media_id = ?
      `);
      
      const existingMetaResult = await getMetaStmt.bind(mediaId).all();
      const existingMetaKeys = new Set(
        (existingMetaResult.results as unknown as Array<{meta_key: string}>).map(m => m.meta_key)
      );
      
      const batch = [];
      
      // Prepare statements for each metadata key
      for (const [key, value] of Object.entries(updates.metadata)) {
        if (existingMetaKeys.has(key)) {
          // Update existing metadata
          const updateMetaStmt = env.DB.prepare(`
            UPDATE media_meta SET meta_value = ? WHERE media_id = ? AND meta_key = ?
          `);
          
          batch.push(updateMetaStmt.bind(value, mediaId, key));
        } else {
          // Insert new metadata
          const insertMetaStmt = env.DB.prepare(`
            INSERT INTO media_meta (id, media_id, meta_key, meta_value) VALUES (?, ?, ?, ?)
          `);
          
          batch.push(insertMetaStmt.bind(crypto.randomUUID(), mediaId, key, value));
        }
      }
      
      // Execute batch if there are statements
      if (batch.length > 0) {
        await env.DB.batch(batch);
      }
    }
    
    // Get updated media metadata
    return await getMediaMetadataByKey(env, key);
  } catch (error) {
    console.error('Error updating media metadata:', error);
    throw new Error('Failed to update media metadata');
  }
}
