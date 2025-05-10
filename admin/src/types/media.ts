/**
 * Media types supported by the application
 */
export type MediaType = 'audio' | 'image' | 'document';

/**
 * Interface for media file metadata
 */
export interface MediaFile {
  /**
   * Unique key/path for the media file in R2 storage
   */
  key: string;
  
  /**
   * Original filename of the uploaded file
   */
  filename: string;
  
  /**
   * MIME type of the file
   */
  contentType: string;
  
  /**
   * File size in bytes
   */
  size: number;
  
  /**
   * Type of media (audio, image, document)
   */
  type: MediaType;
  
  /**
   * ISO timestamp when the file was uploaded
   */
  uploadedAt: string;
  
  /**
   * Additional metadata for the file
   */
  metadata?: Record<string, string>;
}

/**
 * Interface for media update operations
 */
export interface MediaUpdate {
  /**
   * Updated filename
   */
  filename?: string;
  
  /**
   * Updated content type
   */
  contentType?: string;
  
  /**
   * Updated media type
   */
  type?: MediaType;
  
  /**
   * Updated metadata
   */
  metadata?: Record<string, string>;
}

/**
 * Interface for signed URL response
 */
export interface SignedUrlResponse {
  /**
   * The signed URL
   */
  url: string;
  
  /**
   * Expiration time in seconds
   */
  expires_in: number;
  
  /**
   * Unix timestamp when the URL expires
   */
  expires_at: number;
}
