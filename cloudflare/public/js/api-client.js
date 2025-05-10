/**
 * Soundmaster API Client
 * Handles communication with the backend API
 */

class SoundmasterAPI {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl || '';
  }

  /**
   * Fetch media items from the API
   * @param {Object} options - Query options
   * @param {string} options.type - Media type filter (image, audio, video, document)
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @returns {Promise<Object>} Media items and pagination info
   */
  async getMedia(options = {}) {
    const { type = 'all', page = 1, limit = 20 } = options;
    const params = new URLSearchParams({ type, page, limit });
    
    try {
      const response = await fetch(`${this.baseUrl}/api/media?${params}`);
      if (!response.ok) throw new Error('Failed to fetch media');
      return await response.json();
    } catch (error) {
      console.error('Error fetching media:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch a single media item by ID
   * @param {number} id - Media item ID
   * @returns {Promise<Object>} Media item data
   */
  async getMediaItem(id) {
    try {
      const response = await fetch(`${this.baseUrl}/api/media/${id}`);
      if (!response.ok) throw new Error('Failed to fetch media item');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching media item ${id}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get the URL for a media file
   * @param {number} id - Media item ID
   * @returns {string} Media file URL
   */
  getMediaUrl(id) {
    return `${this.baseUrl}/api/media/${id}/url`;
  }

  /**
   * Fetch content from the API
   * @param {Object} options - Query options
   * @param {string} options.type - Content type (page, news, etc.)
   * @param {string} options.slug - Content slug
   * @returns {Promise<Object>} Content items
   */
  async getContent(options = {}) {
    const { type = 'page', slug } = options;
    const params = new URLSearchParams();
    
    if (type) params.append('type', type);
    if (slug) params.append('slug', slug);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/content?${params}`);
      if (!response.ok) throw new Error('Failed to fetch content');
      return await response.json();
    } catch (error) {
      console.error('Error fetching content:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch a single content item by ID
   * @param {number} id - Content item ID
   * @returns {Promise<Object>} Content item data
   */
  async getContentItem(id) {
    try {
      const response = await fetch(`${this.baseUrl}/api/content/${id}`);
      if (!response.ok) throw new Error('Failed to fetch content item');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching content item ${id}:`, error);
      return { success: false, error: error.message };
    }
  }
}

// Create a global instance
const api = new SoundmasterAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SoundmasterAPI };
}
