/**
 * Soundmaster Admin Dashboard
 * Main JavaScript file for admin functionality
 */

// API Client for interacting with the backend
class AdminAPI {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl || '';
    this.token = localStorage.getItem('adminToken') || '';
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('adminToken', token);
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = '';
    localStorage.removeItem('adminToken');
  }

  /**
   * Get request headers with authentication
   * @returns {Object} Headers object
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    };
  }

  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    // Don't override headers if they're already set (for FormData uploads)
    const fetchOptions = {
      ...options,
      headers: options.headers || this.getHeaders()
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      
      // Handle unauthorized responses
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login.html';
        return { success: false, error: 'Authentication required' };
      }
      
      // Check if response is empty
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Handle non-JSON responses (like file downloads or empty responses)
        if (response.ok) {
          return { success: true };
        } else {
          return { success: false, error: `HTTP error: ${response.status}` };
        }
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Login to the admin dashboard
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Promise<Object>} Login response
   */
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  /**
   * Logout from the admin dashboard
   */
  logout() {
    this.clearToken();
    window.location.href = '/login.html';
  }

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  /**
   * Get recent news articles
   * @param {number} limit - Number of articles to retrieve
   * @returns {Promise<Object>} Recent news
   */
  async getRecentNews(limit = 5) {
    return this.request(`/content?type=news&limit=${limit}`);
  }

  /**
   * Get recent media items
   * @param {number} limit - Number of items to retrieve
   * @returns {Promise<Object>} Recent media
   */
  async getRecentMedia(limit = 5) {
    return this.request(`/media?limit=${limit}`);
  }

  /**
   * Get content items by type
   * @param {string} type - Content type (news, page, team, etc.)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Content items
   */
  async getContent(type, options = {}) {
    const { page = 1, limit = 20, search = '' } = options;
    let url = `/content?type=${type}&page=${page}&limit=${limit}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    return this.request(url);
  }

  /**
   * Get a single content item
   * @param {number} id - Content ID
   * @returns {Promise<Object>} Content item
   */
  async getContentItem(id) {
    return this.request(`/content/${id}`);
  }

  /**
   * Create a new content item
   * @param {Object} data - Content data
   * @returns {Promise<Object>} Created content
   */
  async createContent(data) {
    return this.request('/content', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Update an existing content item
   * @param {number} id - Content ID
   * @param {Object} data - Updated content data
   * @returns {Promise<Object>} Updated content
   */
  async updateContent(id, data) {
    return this.request(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Delete a content item
   * @param {number} id - Content ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteContent(id) {
    return this.request(`/content/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get media items
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Media items
   */
  async getMedia(options = {}) {
    const { page = 1, limit = 20, type = '', search = '' } = options;
    let url = `/media?page=${page}&limit=${limit}`;
    
    if (type) {
      url += `&type=${type}`;
    }
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    return this.request(url);
  }

  /**
   * Upload a media file
   * @param {FormData} formData - Form data with file and metadata
   * @returns {Promise<Object>} Upload response
   */
  async uploadMedia(formData) {
    return this.request('/media', {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : ''
        // Note: Content-Type is automatically set by browser for FormData
      },
      body: formData
    });
  }

  /**
   * Update media metadata
   * @param {number} id - Media ID
   * @param {Object} data - Updated metadata
   * @returns {Promise<Object>} Update response
   */
  async updateMediaMetadata(id, data) {
    return this.request(`/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Delete a media item
   * @param {number} id - Media ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteMedia(id) {
    return this.request(`/media/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get settings by type
   * @param {string} type - Settings type (general, api-keys, etc.)
   * @returns {Promise<Object>} Settings
   */
  async getSettings(type = '') {
    let endpoint = '/settings';
    if (type) {
      endpoint += `/${type}`;
    }
    return this.request(endpoint);
  }

  /**
   * Update settings
   * @param {string} type - Settings type (general, api-keys, etc.)
   * @param {Object|FormData} data - Updated settings
   * @param {boolean} isFormData - Whether data is FormData
   * @returns {Promise<Object>} Update response
   */
  async updateSettings(type, data, isFormData = false) {
    let endpoint = '/settings';
    if (type) {
      endpoint += `/${type}`;
    }
    
    let options = {
      method: 'PUT'
    };
    
    if (isFormData) {
      // Don't set Content-Type for FormData, browser will set it with boundary
      options.headers = {
        'Authorization': this.token ? `Bearer ${this.token}` : ''
      };
      options.body = data;
    } else {
      options.headers = this.getHeaders();
      options.body = JSON.stringify(data);
    }
    
    return this.request(endpoint, options);
  }

  /**
   * Get users
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users
   */
  async getUsers(options = {}) {
    const { page = 1, limit = 20, role = '' } = options;
    let url = `/users?page=${page}&limit=${limit}`;
    
    if (role) {
      url += `&role=${encodeURIComponent(role)}`;
    }
    
    return this.request(url);
  }
  
  /**
   * Get a single user
   * @param {string} id - User ID
   * @returns {Promise<Object>} User data
   */
  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  /**
   * Create a new user
   * @param {Object} data - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(data) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} data - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }
  
  /**
   * Change user password
   * @param {string} id - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response
   */
  async changePassword(id, currentPassword, newPassword) {
    return this.request(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
  }
}

// Create a global API instance
const api = new AdminAPI();

// UI Helper functions
const UI = {
  /**
   * Show a toast notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   */
  showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast show bg-${type} text-white`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    toast.innerHTML = `
      <div class="toast-header bg-${type} text-white">
        <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 5000);
    
    // Add click event to close button
    const closeButton = toast.querySelector('.btn-close');
    closeButton.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    });
  },
  
  /**
   * Show a loading spinner
   */
  showSpinner() {
    // Create spinner overlay if it doesn't exist
    let spinnerOverlay = document.querySelector('.spinner-overlay');
    if (!spinnerOverlay) {
      spinnerOverlay = document.createElement('div');
      spinnerOverlay.className = 'spinner-overlay';
      spinnerOverlay.innerHTML = `
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      `;
      document.body.appendChild(spinnerOverlay);
    }
    
    // Show spinner
    spinnerOverlay.style.display = 'flex';
  },
  
  /**
   * Hide the loading spinner
   */
  hideSpinner() {
    const spinnerOverlay = document.querySelector('.spinner-overlay');
    if (spinnerOverlay) {
      spinnerOverlay.style.display = 'none';
    }
  },
  
  /**
   * Confirm an action with a modal dialog
   * @param {string} message - Confirmation message
   * @returns {Promise<boolean>} User confirmation
   */
  async confirm(message) {
    return new Promise((resolve) => {
      // Create modal if it doesn't exist
      let confirmModal = document.getElementById('confirmModal');
      if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.className = 'modal fade';
        confirmModal.id = 'confirmModal';
        confirmModal.setAttribute('tabindex', '-1');
        confirmModal.setAttribute('aria-labelledby', 'confirmModalLabel');
        confirmModal.setAttribute('aria-hidden', 'true');
        
        confirmModal.innerHTML = `
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="confirmModalLabel">Confirm Action</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p id="confirmMessage"></p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="confirmButton">Confirm</button>
              </div>
            </div>
          </div>
        `;
        
        document.body.appendChild(confirmModal);
      }
      
      // Set confirmation message
      const confirmMessage = document.getElementById('confirmMessage');
      confirmMessage.textContent = message;
      
      // Initialize Bootstrap modal
      const modal = new bootstrap.Modal(confirmModal);
      
      // Add event listeners
      const confirmButton = document.getElementById('confirmButton');
      
      const handleConfirm = () => {
        modal.hide();
        confirmButton.removeEventListener('click', handleConfirm);
        resolve(true);
      };
      
      const handleCancel = () => {
        confirmButton.removeEventListener('click', handleConfirm);
        resolve(false);
      };
      
      confirmButton.addEventListener('click', handleConfirm);
      confirmModal.addEventListener('hidden.bs.modal', handleCancel);
      
      // Show modal
      modal.show();
    });
  },
  
  /**
   * Format a date string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Document ready function
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const token = localStorage.getItem('adminToken');
  const isLoginPage = window.location.pathname.includes('login.html');
  
  if (!token && !isLoginPage) {
    window.location.href = '/login.html';
    return;
  }
  
  // Initialize sidebar toggle
  const sidebarCollapse = document.getElementById('sidebarCollapse');
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  
  if (sidebarCollapse && sidebar && content) {
    sidebarCollapse.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      content.classList.toggle('active');
    });
  }
  
  // Initialize logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      api.logout();
    });
  }
  
  // Handle responsive sidebar
  function handleResize() {
    if (window.innerWidth < 768) {
      if (sidebar) sidebar.classList.add('active');
      if (content) content.classList.add('active');
    } else {
      if (sidebar) sidebar.classList.remove('active');
      if (content) content.classList.remove('active');
    }
  }
  
  // Initial call and event listener
  handleResize();
  window.addEventListener('resize', handleResize);
});
