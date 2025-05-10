/**
 * Main JavaScript file for Soundmaster Admin Dashboard
 * Loads all components and initializes the application
 */

// Import components
import { initPlaylistManager } from './playlist-manager.js';
import { initScheduleManager } from './schedule-manager.js';
import { initNewsManager } from './news-manager.js';
import { initDeployManager } from './deploy-manager.js';

/**
 * Initialize the admin dashboard
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Soundmaster Admin Dashboard');
  
  // Initialize components based on the current page
  const currentPath = window.location.pathname;
  
  // Initialize components based on the current path
  if (currentPath === '/playlists' || currentPath === '/') {
    const playlistsContainer = document.getElementById('playlists-container');
    if (playlistsContainer) {
      initPlaylistManager();
    }
  } else if (currentPath === '/schedule') {
    const scheduleContainer = document.getElementById('schedule-container');
    if (scheduleContainer) {
      initScheduleManager();
    }
  } else if (currentPath === '/news') {
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
      initNewsManager();
    }
  } else if (currentPath === '/deploy') {
    const deployBtn = document.getElementById('deploy-website-btn');
    if (deployBtn) {
      initDeployManager();
    }
  }
  
  // Add navigation event listeners
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Handle navigation
      const targetId = e.target.id.replace('nav-', '');
      navigateTo(targetId);
    });
  });
  
  /**
   * Navigate to a specific section
   * @param {string} section - Section to navigate to
   */
  function navigateTo(section) {
    // Hide all pages
    document.querySelectorAll('.dashboard-page, .media-page, .users-page, .settings-page, .playlists-page, .schedule-page').forEach(page => {
      page.style.display = 'none';
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Show selected page and activate nav button
    const targetPage = document.querySelector(`.${section}-page`);
    const targetNav = document.getElementById(`nav-${section}`);
    
    if (targetPage) {
      targetPage.style.display = 'block';
      
      // Initialize components based on the section
      if (section === 'playlists') {
        // Load playlist template if not already loaded
        if (targetPage.children.length === 0) {
          loadTemplate('templates/playlists.html', targetPage)
            .then(() => {
              initPlaylistManager();
            })
            .catch(error => {
              console.error('Error loading playlist template:', error);
            });
        }
      } else if (section === 'schedule') {
        // Load schedule template if not already loaded
        if (targetPage.children.length === 0) {
          loadTemplate('templates/schedule.html', targetPage)
            .then(() => {
              initScheduleManager();
            })
            .catch(error => {
              console.error('Error loading schedule template:', error);
            });
        }
      } else if (section === 'news') {
        // Load news template if not already loaded
        if (targetPage.children.length === 0) {
          loadTemplate('templates/news.html', targetPage)
            .then(() => {
              initNewsManager();
            })
            .catch(error => {
              console.error('Error loading news template:', error);
            });
        }
      } else if (section === 'deploy') {
        // Load deploy template if not already loaded
        if (targetPage.children.length === 0) {
          loadTemplate('templates/deploy.html', targetPage)
            .then(() => {
              initDeployManager();
            })
            .catch(error => {
              console.error('Error loading deploy template:', error);
            });
        }
      }
    }
    
    if (targetNav) {
      targetNav.classList.add('active');
    }
  }
  
  /**
   * Load an HTML template into a container
   * @param {string} templatePath - Path to the template
   * @param {HTMLElement} container - Container to load the template into
   * @returns {Promise<void>}
   */
  async function loadTemplate(templatePath, container) {
    try {
      const response = await fetch(`/assets/${templatePath}`);
      if (response.ok) {
        const html = await response.text();
        container.innerHTML = html;
        return;
      }
      throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  }
});
