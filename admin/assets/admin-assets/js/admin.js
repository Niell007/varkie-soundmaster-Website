// Soundmaster Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/admin/login';
    return;
  }

  // Initialize dashboard
  initDashboard();
  
  // Setup navigation
  setupNavigation();
  
  // Setup logout
  setupLogout();
  
  // Load dashboard data
  loadDashboardData();
});

// Initialize dashboard
function initDashboard() {
  // Setup mobile sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelector('main');
  
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      main.classList.toggle('sidebar-open');
    });
  }
  
  // Setup tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Setup copy stream URL button
  const copyStreamUrlBtn = document.getElementById('copyStreamUrl');
  if (copyStreamUrlBtn) {
    copyStreamUrlBtn.addEventListener('click', () => {
      const streamUrl = document.getElementById('streamUrl');
      streamUrl.select();
      document.execCommand('copy');
      showToast('Stream URL copied to clipboard', 'success');
    });
  }
  
  // Setup stream toggle button
  const toggleStreamBtn = document.getElementById('toggleStreamBtn');
  if (toggleStreamBtn) {
    toggleStreamBtn.addEventListener('click', () => {
      const icon = toggleStreamBtn.querySelector('i');
      const isPlaying = icon.classList.contains('fa-stop');
      
      if (isPlaying) {
        icon.classList.replace('fa-stop', 'fa-play');
        toggleStreamBtn.innerHTML = '<i class="fas fa-play me-2"></i> Test Stream';
        showToast('Stream test stopped', 'info');
      } else {
        icon.classList.replace('fa-play', 'fa-stop');
        toggleStreamBtn.innerHTML = '<i class="fas fa-stop me-2"></i> Stop Stream';
        showToast('Stream test started', 'info');
      }
    });
  }
}

// Setup navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll('#sidebar .nav-link');
  const pageContents = document.querySelectorAll('.page-content');
  const pageTitle = document.getElementById('pageTitle');
  const actionButtons = document.getElementById('actionButtons');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active link
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Show corresponding page content
      const page = link.getAttribute('data-page');
      pageContents.forEach(content => content.classList.remove('active'));
      document.getElementById(`${page}-page`).classList.add('active');
      
      // Update page title
      pageTitle.textContent = link.textContent.trim();
      
      // Update action buttons based on page
      updateActionButtons(page);
      
      // Load page data
      loadPageData(page);
      
      // Update URL hash
      window.location.hash = page;
    });
  });
  
  // Handle initial page load based on URL hash
  const hash = window.location.hash.substring(1);
  if (hash) {
    const link = document.querySelector(`#sidebar .nav-link[data-page="${hash}"]`);
    if (link) {
      link.click();
    }
  }
}

// Update action buttons based on current page
function updateActionButtons(page) {
  const actionButtons = document.getElementById('actionButtons');
  actionButtons.innerHTML = '';
  
  switch (page) {
    case 'content':
      actionButtons.innerHTML = `
        <button class="btn btn-sm btn-primary" id="newContentBtn">
          <i class="fas fa-plus me-1"></i> New Content
        </button>
      `;
      document.getElementById('newContentBtn').addEventListener('click', () => {
        showContentModal();
      });
      break;
    case 'schedule':
      actionButtons.innerHTML = `
        <button class="btn btn-sm btn-primary" id="newScheduleBtn">
          <i class="fas fa-plus me-1"></i> New Schedule
        </button>
      `;
      document.getElementById('newScheduleBtn').addEventListener('click', () => {
        showScheduleModal();
      });
      break;
    case 'playlists':
      actionButtons.innerHTML = `
        <button class="btn btn-sm btn-primary" id="newPlaylistBtn">
          <i class="fas fa-plus me-1"></i> New Playlist
        </button>
      `;
      document.getElementById('newPlaylistBtn').addEventListener('click', () => {
        showPlaylistModal();
      });
      break;
    case 'users':
      actionButtons.innerHTML = `
        <button class="btn btn-sm btn-primary" id="newUserBtn">
          <i class="fas fa-plus me-1"></i> New User
        </button>
      `;
      document.getElementById('newUserBtn').addEventListener('click', () => {
        showUserModal();
      });
      break;
  }
}

// Load page data based on current page
function loadPageData(page) {
  showSpinner();
  
  switch (page) {
    case 'dashboard':
      loadDashboardData();
      break;
    case 'content':
      loadContentData();
      break;
    case 'schedule':
      loadScheduleData();
      break;
    case 'playlists':
      loadPlaylistsData();
      break;
    case 'users':
      loadUsersData();
      break;
    case 'settings':
      loadSettingsData();
      break;
    case 'analytics':
      loadAnalyticsData();
      break;
  }
}

// Load dashboard data
function loadDashboardData() {
  Promise.all([
    fetchWithAuth('/api/users/count'),
    fetchWithAuth('/api/content/count'),
    fetchWithAuth('/api/playlists/count'),
    fetchWithAuth('/api/schedule/count'),
    fetchWithAuth('/api/activity/recent'),
    fetchWithAuth('/api/stream/status')
  ]).then(([
    usersResponse,
    contentResponse,
    playlistsResponse,
    scheduleResponse,
    activityResponse,
    streamResponse
  ]) => {
    // Update dashboard stats
    document.getElementById('totalUsers').textContent = usersResponse.count;
    document.getElementById('totalContent').textContent = contentResponse.count;
    document.getElementById('totalPlaylists').textContent = playlistsResponse.count;
    document.getElementById('totalShows').textContent = scheduleResponse.count;
    
    // Update recent activity
    const recentActivity = document.getElementById('recentActivity');
    recentActivity.innerHTML = '';
    
    if (activityResponse.activities.length === 0) {
      recentActivity.innerHTML = '<li class="list-group-item text-center">No recent activity</li>';
    } else {
      activityResponse.activities.forEach(activity => {
        recentActivity.innerHTML += `
          <li class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>${activity.user}</strong> ${activity.action}
                <div><small class="text-muted">${formatDate(activity.timestamp)}</small></div>
              </div>
              <span class="badge bg-${activity.type === 'create' ? 'success' : activity.type === 'update' ? 'warning' : 'danger'} rounded-pill">
                ${activity.type}
              </span>
            </div>
          </li>
        `;
      });
    }
    
    // Update stream status
    const streamStatusBadge = document.getElementById('streamStatusBadge');
    const currentShow = document.getElementById('currentShow');
    const currentDJ = document.getElementById('currentDJ');
    const streamUrl = document.getElementById('streamUrl');
    
    streamStatusBadge.textContent = streamResponse.online ? 'Online' : 'Offline';
    streamStatusBadge.className = `badge ${streamResponse.online ? 'bg-success' : 'bg-danger'}`;
    
    currentShow.textContent = streamResponse.currentShow || 'No show currently playing';
    currentDJ.textContent = streamResponse.currentDJ || 'No DJ currently scheduled';
    streamUrl.value = streamResponse.streamUrl || 'https://stream.soundmaster.com/listen';
    
    hideSpinner();
  }).catch(error => {
    console.error('Error loading dashboard data:', error);
    showToast('Error loading dashboard data', 'error');
    hideSpinner();
  });
}

// Setup logout
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Clear authentication token
      localStorage.removeItem('authToken');
      
      // Redirect to login page
      window.location.href = '/admin/login';
    });
  }
}

// Helper function to make authenticated API requests
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    window.location.href = '/admin/login';
    throw new Error('No authentication token found');
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/admin/login';
      throw new Error('Authentication token expired');
    }
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    showToast(error.message, 'error');
    throw error;
  }
}

// Show spinner
function showSpinner() {
  // Remove existing spinner if any
  const existingSpinner = document.querySelector('.spinner-overlay');
  if (existingSpinner) {
    existingSpinner.remove();
  }
  
  // Create spinner element
  const spinner = document.createElement('div');
  spinner.className = 'spinner-overlay';
  spinner.innerHTML = `
    <div class="spinner-container">
      <div class="spinner-border" role="status"></div>
      <div class="mt-2">Loading...</div>
    </div>
  `;
  
  // Add spinner to body
  document.body.appendChild(spinner);
}

// Hide spinner
function hideSpinner() {
  const spinner = document.querySelector('.spinner-overlay');
  if (spinner) {
    spinner.remove();
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  // Remove existing toast container if any
  const existingContainer = document.querySelector('.toast-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  
  // Create toast container
  const container = document.createElement('div');
  container.className = 'toast-container';
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast show toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  
  // Add toast to container
  container.appendChild(toast);
  
  // Add container to body
  document.body.appendChild(container);
  
  // Setup close button
  const closeButton = toast.querySelector('.btn-close');
  closeButton.addEventListener('click', () => {
    container.remove();
  });
  
  // Auto-hide toast after 5 seconds
  setTimeout(() => {
    container.remove();
  }, 5000);
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Placeholder functions for loading different page data
function loadContentData() {
  fetchWithAuth('/api/content')
    .then(response => {
      const contentPage = document.getElementById('content-page');
      
      if (response.content.length === 0) {
        contentPage.innerHTML = `
          <div class="alert alert-info">
            No content found. Click the "New Content" button to create your first content.
          </div>
        `;
      } else {
        contentPage.innerHTML = `
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Author</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="contentTableBody">
              </tbody>
            </table>
          </div>
        `;
        
        const contentTableBody = document.getElementById('contentTableBody');
        response.content.forEach(item => {
          contentTableBody.innerHTML += `
            <tr>
              <td>${item.title}</td>
              <td>${item.type}</td>
              <td>${item.author}</td>
              <td>${formatDate(item.created_at)}</td>
              <td>${formatDate(item.updated_at)}</td>
              <td><span class="badge bg-${item.status === 'published' ? 'success' : 'warning'}">${item.status}</span></td>
              <td>
                <button class="btn btn-sm btn-outline-primary edit-content" data-id="${item.id}">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-content" data-id="${item.id}">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          `;
        });
        
        // Setup edit and delete buttons
        document.querySelectorAll('.edit-content').forEach(button => {
          button.addEventListener('click', () => {
            const contentId = button.getAttribute('data-id');
            editContent(contentId);
          });
        });
        
        document.querySelectorAll('.delete-content').forEach(button => {
          button.addEventListener('click', () => {
            const contentId = button.getAttribute('data-id');
            deleteContent(contentId);
          });
        });
      }
      
      hideSpinner();
    })
    .catch(error => {
      console.error('Error loading content data:', error);
      hideSpinner();
    });
}

function loadScheduleData() {
  // Similar implementation as loadContentData
  hideSpinner();
}

function loadPlaylistsData() {
  // Similar implementation as loadContentData
  hideSpinner();
}

function loadUsersData() {
  // Similar implementation as loadContentData
  hideSpinner();
}

function loadSettingsData() {
  // Similar implementation as loadContentData
  hideSpinner();
}

function loadAnalyticsData() {
  // Similar implementation as loadContentData
  hideSpinner();
}

// Placeholder functions for modals
function showContentModal(contentId = null) {
  // Implementation for content modal
}

function showScheduleModal(scheduleId = null) {
  // Implementation for schedule modal
}

function showPlaylistModal(playlistId = null) {
  // Implementation for playlist modal
}

function showUserModal(userId = null) {
  // Implementation for user modal
}

// Placeholder functions for edit and delete operations
function editContent(contentId) {
  // Implementation for editing content
}

function deleteContent(contentId) {
  // Implementation for deleting content
}
