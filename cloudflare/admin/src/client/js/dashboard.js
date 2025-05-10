/**
 * Soundmaster Admin Dashboard
 * Dashboard-specific JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Only run on the dashboard page
  if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/' && !window.location.pathname.endsWith('/')) {
    return;
  }

  try {
    // Load dashboard statistics
    await loadDashboardStats();
    
    // Load recent content
    await Promise.all([
      loadRecentNews(),
      loadRecentMedia()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    UI.showToast('Failed to load dashboard data', 'error');
  }
});

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
  UI.showSpinner();
  
  try {
    const stats = await api.getDashboardStats();
    
    if (stats.success) {
      // Update statistics counters
      document.getElementById('mediaCount').textContent = stats.data.mediaCount || 0;
      document.getElementById('newsCount').textContent = stats.data.newsCount || 0;
      document.getElementById('teamCount').textContent = stats.data.teamCount || 0;
      document.getElementById('playlistCount').textContent = stats.data.playlistCount || 0;
    } else {
      throw new Error(stats.error || 'Failed to load statistics');
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
    UI.showToast('Failed to load statistics', 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Load recent news articles
 */
async function loadRecentNews() {
  const recentNewsContainer = document.getElementById('recentNews');
  if (!recentNewsContainer) return;
  
  try {
    const response = await api.getRecentNews(5);
    
    if (response.success && response.content && response.content.length > 0) {
      const newsItems = response.content;
      
      // Create HTML for news items
      const newsHTML = newsItems.map(item => `
        <div class="news-item mb-3">
          <div class="d-flex justify-content-between">
            <h6 class="mb-1">${item.title}</h6>
            <small class="text-muted">${UI.formatDate(item.published_at || item.created_at)}</small>
          </div>
          <p class="mb-1 text-truncate">${item.excerpt || truncateText(item.content, 100)}</p>
          <div class="d-flex justify-content-end">
            <a href="pages/news.html?id=${item.id}" class="btn btn-sm btn-outline-primary">Edit</a>
          </div>
          <hr>
        </div>
      `).join('');
      
      // Display news items
      recentNewsContainer.innerHTML = newsHTML;
    } else {
      recentNewsContainer.innerHTML = '<p class="text-center">No recent news available.</p>';
    }
  } catch (error) {
    console.error('Error loading recent news:', error);
    recentNewsContainer.innerHTML = '<p class="text-center text-danger">Failed to load recent news.</p>';
  }
}

/**
 * Load recent media items
 */
async function loadRecentMedia() {
  const recentMediaContainer = document.getElementById('recentMedia');
  if (!recentMediaContainer) return;
  
  try {
    const response = await api.getRecentMedia(6);
    
    if (response.success && response.media && response.media.length > 0) {
      const mediaItems = response.media;
      
      // Create HTML for media grid
      const mediaHTML = `
        <div class="media-grid">
          ${mediaItems.map(item => `
            <div class="media-item">
              ${getMediaThumbnail(item)}
              <div class="media-overlay">
                <div class="media-title">${item.title || item.filename}</div>
              </div>
              <a href="pages/media-library.html?id=${item.id}" class="stretched-link"></a>
            </div>
          `).join('')}
        </div>
      `;
      
      // Display media items
      recentMediaContainer.innerHTML = mediaHTML;
    } else {
      recentMediaContainer.innerHTML = '<p class="text-center">No recent media available.</p>';
    }
  } catch (error) {
    console.error('Error loading recent media:', error);
    recentMediaContainer.innerHTML = '<p class="text-center text-danger">Failed to load recent media.</p>';
  }
}

/**
 * Get media thumbnail based on media type
 * @param {Object} media - Media item
 * @returns {string} HTML for media thumbnail
 */
function getMediaThumbnail(media) {
  const type = media.type || 'unknown';
  const url = `/api/media/${media.id}/url`;
  
  switch (type) {
    case 'image':
      return `<img src="${url}" alt="${media.title || media.filename}" loading="lazy">`;
    case 'audio':
      return `<div class="media-icon"><i class="fas fa-music"></i></div>`;
    case 'video':
      return `<div class="media-icon"><i class="fas fa-video"></i></div>`;
    case 'document':
      return `<div class="media-icon"><i class="fas fa-file-alt"></i></div>`;
    default:
      return `<div class="media-icon"><i class="fas fa-file"></i></div>`;
  }
}

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, length = 100) {
  if (!text) return '';
  
  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= length) {
    return plainText;
  }
  
  return plainText.substring(0, length) + '...';
}
