/**
 * Main JavaScript for Soundmaster Admin Dashboard
 */

// Global state
let currentPage = 'dashboard';
let pageData = {};

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Set up navigation
  setupNavigation();
  
  // Set up sidebar toggle for mobile
  document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
  
  // Set up modals
  setupModals();
});

/**
 * Set up navigation between dashboard pages
 */
function setupNavigation() {
  // Add click event to all nav links
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get page name from data attribute
      const pageName = link.getAttribute('data-page');
      navigateTo(pageName);
    });
  });
  
  // Handle hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      navigateTo(hash);
    }
  });
  
  // Check initial hash
  const initialHash = window.location.hash.substring(1);
  if (initialHash) {
    navigateTo(initialHash);
  }
}

/**
 * Navigate to a specific page
 * @param {string} pageName - Name of the page to navigate to
 */
function navigateTo(pageName) {
  // Validate page name
  const validPages = ['dashboard', 'content', 'schedule', 'playlists', 'users', 'settings', 'analytics'];
  if (!validPages.includes(pageName)) {
    pageName = 'dashboard';
  }
  
  // Update current page
  currentPage = pageName;
  
  // Update URL hash without triggering hashchange event
  history.replaceState(null, null, `#${pageName}`);
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`.nav-link[data-page="${pageName}"]`).classList.add('active');
  
  // Update page title
  document.getElementById('pageTitle').textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  
  // Hide all pages
  document.querySelectorAll('.page-content').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show current page
  document.getElementById(`${pageName}-page`).classList.add('active');
  
  // Update action buttons
  updateActionButtons(pageName);
  
  // Load page data
  loadPageData(pageName);
}

/**
 * Toggle sidebar visibility on mobile
 */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('show');
}

/**
 * Update action buttons based on current page
 * @param {string} pageName - Current page name
 */
function updateActionButtons(pageName) {
  const actionButtons = document.getElementById('actionButtons');
  actionButtons.innerHTML = '';
  
  switch (pageName) {
    case 'content':
      actionButtons.innerHTML = `
        <button class="btn btn-primary btn-sm" id="newContentBtn">
          <i class="fas fa-plus me-1"></i> New Content
        </button>
      `;
      document.getElementById('newContentBtn').addEventListener('click', () => showContentForm());
      break;
      
    case 'schedule':
      actionButtons.innerHTML = `
        <button class="btn btn-primary btn-sm" id="saveScheduleBtn">
          <i class="fas fa-save me-1"></i> Save Schedule
        </button>
      `;
      document.getElementById('saveScheduleBtn').addEventListener('click', () => saveSchedule());
      break;
      
    case 'playlists':
      actionButtons.innerHTML = `
        <button class="btn btn-primary btn-sm" id="newPlaylistBtn">
          <i class="fas fa-plus me-1"></i> New Playlist
        </button>
      `;
      document.getElementById('newPlaylistBtn').addEventListener('click', () => showPlaylistForm());
      break;
      
    case 'users':
      if (window.auth.isAdmin()) {
        actionButtons.innerHTML = `
          <button class="btn btn-primary btn-sm" id="newUserBtn">
            <i class="fas fa-user-plus me-1"></i> New User
          </button>
        `;
        document.getElementById('newUserBtn').addEventListener('click', () => showUserForm());
      }
      break;
  }
}

/**
 * Load data for the current page
 * @param {string} pageName - Current page name
 */
async function loadPageData(pageName) {
  try {
    switch (pageName) {
      case 'dashboard':
        loadDashboard();
        break;
        
      case 'content':
        loadContent();
        break;
        
      case 'schedule':
        loadSchedule();
        break;
        
      case 'playlists':
        loadPlaylists();
        break;
        
      case 'users':
        loadUsers();
        break;
        
      case 'settings':
        loadSettings();
        break;
        
      case 'analytics':
        loadAnalytics();
        break;
    }
  } catch (error) {
    console.error(`Error loading ${pageName} data:`, error);
    showAlert('error', `Failed to load ${pageName} data: ${error.message}`);
  }
}

/**
 * Load dashboard data
 */
async function loadDashboard() {
  try {
    // Update dashboard stats
    updateDashboardStats();
    
    // Update stream status
    updateStreamStatus();
    
    // Set up stream controls
    setupStreamControls();
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

/**
 * Update dashboard statistics
 */
async function updateDashboardStats() {
  try {
    // Get users count
    const usersResponse = await window.auth.apiRequest('/api/users');
    const usersData = await usersResponse.json();
    document.getElementById('totalUsers').textContent = usersData.results.length;
    
    // Get content count (pages + posts)
    const pagesResponse = await window.auth.apiRequest('/api/content/pages');
    const postsResponse = await window.auth.apiRequest('/api/content/posts');
    const pagesData = await pagesResponse.json();
    const postsData = await postsResponse.json();
    document.getElementById('totalContent').textContent = pagesData.results.length + postsData.results.length;
    
    // Get playlists count
    const playlistsResponse = await window.auth.apiRequest('/api/playlists');
    const playlistsData = await playlistsResponse.json();
    document.getElementById('totalPlaylists').textContent = playlistsData.length;
    
    // Get shows count
    const showsResponse = await window.auth.apiRequest('/api/content/shows');
    const showsData = await showsResponse.json();
    document.getElementById('totalShows').textContent = showsData.results.length;
    
    // Update recent activity
    updateRecentActivity();
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
  }
}

/**
 * Update recent activity list
 */
async function updateRecentActivity() {
  const activityList = document.getElementById('recentActivity');
  activityList.innerHTML = '';
  
  try {
    // Get recent content updates
    const contentTypes = ['pages', 'posts', 'shows', 'events'];
    let recentItems = [];
    
    for (const type of contentTypes) {
      const response = await window.auth.apiRequest(`/api/content/${type}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Add content type to each item
        const items = data.results.map(item => ({ ...item, contentType: type }));
        recentItems = [...recentItems, ...items];
      }
    }
    
    // Sort by updated_at
    recentItems.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    
    // Take the 5 most recent items
    recentItems = recentItems.slice(0, 5);
    
    if (recentItems.length === 0) {
      activityList.innerHTML = '<li class="list-group-item text-center">No recent activity</li>';
      return;
    }
    
    // Create activity items
    recentItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      
      const date = new Date(item.updated_at);
      const timeAgo = getTimeAgo(date);
      
      li.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>${item.title}</strong>
            <div class="text-muted small">
              <span class="badge bg-secondary">${item.contentType}</span>
              Updated ${timeAgo}
            </div>
          </div>
          <a href="#content" class="btn btn-sm btn-outline-primary" data-content-id="${item.id}" data-content-type="${item.contentType}">
            <i class="fas fa-edit"></i>
          </a>
        </div>
      `;
      
      activityList.appendChild(li);
    });
    
    // Add click events to edit buttons
    activityList.querySelectorAll('[data-content-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const contentId = btn.getAttribute('data-content-id');
        const contentType = btn.getAttribute('data-content-type');
        navigateTo('content');
        // Set timeout to allow page to load
        setTimeout(() => {
          editContent(contentType, contentId);
        }, 100);
      });
    });
  } catch (error) {
    console.error('Error updating recent activity:', error);
    activityList.innerHTML = '<li class="list-group-item text-center text-danger">Failed to load recent activity</li>';
  }
}

/**
 * Update stream status display
 */
async function updateStreamStatus() {
  try {
    // Get stream settings
    const response = await window.auth.apiRequest('/api/settings/stream');
    const streamSettings = await response.json();
    
    // Update stream URL
    document.getElementById('streamUrl').value = streamSettings.stream_url || '';
    
    // Update stream status badge
    const isLive = streamSettings.is_live === 'true';
    const statusBadge = document.getElementById('streamStatusBadge');
    statusBadge.textContent = isLive ? 'Online' : 'Offline';
    statusBadge.className = isLive ? 'badge bg-success' : 'badge bg-danger';
    
    // Get current show from schedule
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0-6 (Sunday-Saturday)
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const scheduleResponse = await window.auth.apiRequest('/api/schedule');
    const scheduleData = await scheduleResponse.json();
    
    // Find current show
    const currentShow = scheduleData.results.find(slot => {
      return slot.day_of_week === dayOfWeek && 
             slot.start_time <= currentTime && 
             slot.end_time >= currentTime;
    });
    
    if (currentShow) {
      document.getElementById('currentShow').textContent = currentShow.show_name;
      document.getElementById('currentDJ').textContent = currentShow.dj_name || 'No DJ assigned';
    } else {
      document.getElementById('currentShow').textContent = 'No show currently scheduled';
      document.getElementById('currentDJ').textContent = '';
    }
  } catch (error) {
    console.error('Error updating stream status:', error);
  }
}

/**
 * Set up stream controls
 */
function setupStreamControls() {
  // Copy stream URL button
  document.getElementById('copyStreamUrl').addEventListener('click', () => {
    const streamUrl = document.getElementById('streamUrl');
    streamUrl.select();
    document.execCommand('copy');
    showToast('Stream URL copied to clipboard');
  });
  
  // Toggle stream button
  document.getElementById('toggleStreamBtn').addEventListener('click', () => {
    const audio = document.querySelector('#streamAudio') || document.createElement('audio');
    audio.id = 'streamAudio';
    audio.style.display = 'none';
    
    if (!audio.paused) {
      // Stop stream
      audio.pause();
      audio.src = '';
      document.getElementById('toggleStreamBtn').innerHTML = '<i class="fas fa-play me-2"></i> Test Stream';
    } else {
      // Start stream
      const streamUrl = document.getElementById('streamUrl').value;
      if (!streamUrl) {
        showAlert('error', 'No stream URL configured');
        return;
      }
      
      audio.src = streamUrl;
      audio.play().then(() => {
        document.getElementById('toggleStreamBtn').innerHTML = '<i class="fas fa-stop me-2"></i> Stop Stream';
      }).catch(error => {
        console.error('Error playing stream:', error);
        showAlert('error', 'Failed to play stream: ' + error.message);
      });
    }
    
    if (!audio.parentNode) {
      document.body.appendChild(audio);
    }
  });
}

/**
 * Set up modal functionality
 */
function setupModals() {
  // Form modal submit button
  document.getElementById('formSubmitBtn').addEventListener('click', () => {
    const form = document.querySelector('#formModalBody form');
    if (form) {
      // Trigger form submission
      const submitEvent = new Event('submit', { cancelable: true });
      form.dispatchEvent(submitEvent);
    }
  });
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast
  const toastId = 'toast-' + Date.now();
  const toastEl = document.createElement('div');
  toastEl.className = 'toast';
  toastEl.id = toastId;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  
  toastEl.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">Soundmaster Admin</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  
  toastContainer.appendChild(toastEl);
  
  // Show toast
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
  
  // Remove toast after it's hidden
  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

/**
 * Show an alert message
 * @param {string} type - Alert type (success, error, warning, info)
 * @param {string} message - Message to display
 */
function showAlert(type, message) {
  // Map type to Bootstrap alert class
  const alertClass = {
    success: 'alert-success',
    error: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info'
  }[type] || 'alert-info';
  
  // Create alert container if it doesn't exist
  let alertContainer = document.querySelector('.alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.className = 'alert-container position-fixed top-0 start-50 translate-middle-x p-3';
    alertContainer.style.zIndex = '1050';
    document.body.appendChild(alertContainer);
  }
  
  // Create alert
  const alertId = 'alert-' + Date.now();
  const alertEl = document.createElement('div');
  alertEl.className = `alert ${alertClass} alert-dismissible fade show`;
  alertEl.id = alertId;
  alertEl.setAttribute('role', 'alert');
  
  alertEl.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  alertContainer.appendChild(alertEl);
  
  // Remove alert after 5 seconds
  setTimeout(() => {
    const alert = bootstrap.Alert.getInstance(alertEl);
    if (alert) {
      alert.close();
    } else {
      alertEl.remove();
    }
  }, 5000);
}

/**
 * Get time ago string from date
 * @param {Date} date - Date to format
 * @returns {string} Time ago string
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return seconds < 10 ? 'just now' : `${seconds} seconds ago`;
}

// Placeholder functions for other pages - these will be implemented in separate files
function loadContent() {
  const contentPage = document.getElementById('content-page');
  contentPage.innerHTML = '<div class="alert alert-info">Content management will be implemented in the next phase.</div>';
}

function loadSchedule() {
  const schedulePage = document.getElementById('schedule-page');
  schedulePage.innerHTML = '<div class="alert alert-info">Schedule management will be implemented in the next phase.</div>';
}

function loadPlaylists() {
  const playlistsPage = document.getElementById('playlists-page');
  playlistsPage.innerHTML = '<div class="alert alert-info">Playlist management will be implemented in the next phase.</div>';
}

function loadUsers() {
  const usersPage = document.getElementById('users-page');
  usersPage.innerHTML = '<div class="alert alert-info">User management will be implemented in the next phase.</div>';
}

function loadSettings() {
  const settingsPage = document.getElementById('settings-page');
  settingsPage.innerHTML = '<div class="alert alert-info">Settings management will be implemented in the next phase.</div>';
}

function loadAnalytics() {
  const analyticsPage = document.getElementById('analytics-page');
  analyticsPage.innerHTML = '<div class="alert alert-info">Analytics will be implemented in the next phase.</div>';
}
