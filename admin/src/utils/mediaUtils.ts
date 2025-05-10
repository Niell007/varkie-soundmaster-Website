import { MediaFile, MediaUpdate, SignedUrlResponse } from '../types/media';

/**
 * Utility functions for interacting with the media API
 */
export const mediaUtils = {
  /**
   * Fetch all media files with optional filtering
   * @param apiUrl Base API URL
   * @param token Authentication token
   * @param type Optional media type filter
   * @param search Optional search term
   */
  async fetchMedia(
    apiUrl: string,
    token: string,
    type?: string,
    search?: string | null
  ): Promise<MediaFile[]> {
    let url = `${apiUrl}/media`;
    const params = new URLSearchParams();
    
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Upload a media file with metadata
   * @param apiUrl Base API URL
   * @param token Authentication token
   * @param file File to upload
   * @param metadata File metadata
   */
  async uploadMedia(
    apiUrl: string,
    token: string,
    file: File,
    metadata: Record<string, string>
  ): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata as JSON
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await fetch(`${apiUrl}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload media: ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Get a single media file by key
   * @param apiUrl Base API URL
   * @param token Authentication token
   * @param key Media file key
   */
  async getMediaMetadata(
    apiUrl: string,
    token: string,
    key: string
  ): Promise<MediaFile> {
    const response = await fetch(`${apiUrl}/media/${encodeURIComponent(key)}/metadata`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get media metadata: ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Update media metadata
   * @param apiUrl Base API URL
   * @param token Authentication token
   * @param key Media file key
   * @param updates Metadata updates
   */
  async updateMediaMetadata(
    apiUrl: string,
    token: string,
    key: string,
    updates: MediaUpdate
  ): Promise<MediaFile> {
    const response = await fetch(`${apiUrl}/media/${encodeURIComponent(key)}/metadata`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update media metadata: ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Delete a media file
   * @param apiUrl Base API URL
   * @param token Authentication token
   * @param key Media file key
   */
  async deleteMedia(
    apiUrl: string,
    token: string,
    key: string
  ): Promise<void> {
    const response = await fetch(`${apiUrl}/media/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete media: ${response.statusText}`);
    }
  },
  
  /**
   * Generate a signed URL for a media file
   * @param apiUrl Base API URL
   * @param token Authentication token
   * @param key Media file key
   * @param expiresIn Expiration time in seconds (default: 3600)
   */
  async generateSignedUrl(
    apiUrl: string,
    token: string,
    key: string,
    expiresIn: number = 3600
  ): Promise<SignedUrlResponse> {
    const response = await fetch(`${apiUrl}/media/${encodeURIComponent(key)}/signedUrl`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expiresIn })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate signed URL: ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Get a direct URL for a media file
   * @param apiUrl Base API URL
   * @param key Media file key
   */
  getMediaUrl(apiUrl: string, key: string): string {
    return `${apiUrl}/media/${encodeURIComponent(key)}`;
  },
  
  /**
   * Format file size in a human-readable format
   * @param bytes File size in bytes
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  /**
   * Format a date string in a human-readable format
   * @param dateString ISO date string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};
