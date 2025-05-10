// Media storage service for Soundmaster Admin Dashboard
import type { Env } from '../index';

// Media file types
export type MediaType = 'audio' | 'image' | 'document';

// Media file interface
export interface MediaFile {
  key: string;
  filename: string;
  contentType: string;
  size: number;
  type: MediaType;
  uploadedAt: string;
  metadata?: Record<string, string>;
}

// Media service for handling file uploads and retrievals
export class MediaService {
  constructor(private env: Env) {}

  /**
   * Upload a file to R2 storage
   * @param file The file to upload
   * @param type The type of media (audio, image, document)
   * @param customKey Optional custom key for the file
   * @param metadata Optional metadata for the file
   * @returns The uploaded file information
   */
  async uploadFile(
    file: File,
    type: MediaType,
    customKey?: string,
    metadata?: Record<string, string>
  ): Promise<MediaFile> {
    // Generate a unique key if not provided
    const key = customKey || `${type}/${crypto.randomUUID()}/${file.name}`;
    
    // Add media type to metadata
    const fileMetadata = {
      mediaType: type,
      originalFilename: file.name,
      ...metadata
    };
    
    // Upload the file to R2
    await this.env.MEDIA_BUCKET.put(key, file, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: fileMetadata,
    });
    
    // Return the file information
    return {
      key,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      type,
      uploadedAt: new Date().toISOString(),
      metadata: fileMetadata,
    };
  }

  /**
   * Get a file from R2 storage
   * @param key The key of the file to retrieve
   * @returns The file object or null if not found
   */
  async getFile(key: string): Promise<{ file: ReadableStream; metadata: MediaFile } | null> {
    // Get the file from R2
    const object = await this.env.MEDIA_BUCKET.get(key);
    
    if (!object) {
      return null;
    }
    
    // Extract metadata
    const customMetadata = object.customMetadata || {};
    
    // Create media file metadata
    const metadata: MediaFile = {
      key,
      filename: customMetadata.originalFilename || key.split('/').pop() || key,
      contentType: object.httpMetadata?.contentType || 'application/octet-stream',
      size: object.size,
      type: (customMetadata.mediaType as MediaType) || 'audio',
      uploadedAt: object.uploaded?.toISOString() || new Date().toISOString(),
      metadata: customMetadata,
    };
    
    return {
      file: object.body,
      metadata,
    };
  }

  /**
   * Delete a file from R2 storage
   * @param key The key of the file to delete
   * @returns True if the file was deleted, false otherwise
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.env.MEDIA_BUCKET.delete(key);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * List files in R2 storage
   * @param prefix Optional prefix to filter files
   * @param limit Optional limit of files to return
   * @returns List of file metadata
   */
  async listFiles(prefix?: string, limit = 100): Promise<MediaFile[]> {
    // List objects in the bucket
    const listed = await this.env.MEDIA_BUCKET.list({
      prefix,
      limit,
    });
    
    // Map objects to media files
    return Promise.all(
      listed.objects.map(async (object) => {
        const customMetadata = object.customMetadata || {};
        
        return {
          key: object.key,
          filename: customMetadata.originalFilename || object.key.split('/').pop() || object.key,
          contentType: object.httpMetadata?.contentType || 'application/octet-stream',
          size: object.size,
          type: (customMetadata.mediaType as MediaType) || 'audio',
          uploadedAt: object.uploaded.toISOString(),
          metadata: customMetadata,
        };
      })
    );
  }

  /**
   * Get a signed URL for a file
   * @param key The key of the file
   * @param expirationSeconds The expiration time in seconds
   * @returns The signed URL or null if the file doesn't exist
   */
  async getSignedUrl(key: string, expirationSeconds = 3600): Promise<string | null> {
    try {
      // Check if the file exists
      const exists = await this.env.MEDIA_BUCKET.head(key);
      
      if (!exists) {
        return null;
      }
      
      // Create a signed URL
      const url = new URL(`/media/${key}`, 'https://soundmaster-admin.wde-host.workers.dev');
      
      // Add expiration timestamp
      const expiresAt = Math.floor(Date.now() / 1000) + expirationSeconds;
      url.searchParams.set('expires', expiresAt.toString());
      
      // Add signature
      const signature = await this.generateSignature(key, expiresAt);
      url.searchParams.set('signature', signature);
      
      return url.toString();
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }
  }

  /**
   * Generate a signature for a signed URL
   * @param key The key of the file
   * @param expiresAt The expiration timestamp
   * @returns The signature
   */
  private async generateSignature(key: string, expiresAt: number): Promise<string> {
    // Create a string to sign
    const stringToSign = `${key}:${expiresAt}`;
    
    // Convert the string to an ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    
    // Convert the secret to an ArrayBuffer
    const secret = encoder.encode(this.env.JWT_SECRET);
    
    // Create a key from the secret
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secret,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Sign the data
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    
    // Convert the signature to a base64 string
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  /**
   * Verify a signed URL
   * @param key The key of the file
   * @param expiresAt The expiration timestamp
   * @param signature The signature to verify
   * @returns True if the signature is valid and not expired
   */
  async verifySignedUrl(key: string, expiresAt: number, signature: string): Promise<boolean> {
    try {
      // Check if the URL has expired
      const now = Math.floor(Date.now() / 1000);
      if (now > expiresAt) {
        return false;
      }
      
      // Generate a signature for comparison
      const expectedSignature = await this.generateSignature(key, expiresAt);
      
      // Compare the signatures
      return signature === expectedSignature;
    } catch (error) {
      console.error('Error verifying signed URL:', error);
      return false;
    }
  }
}
