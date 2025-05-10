/**
 * Authentication module for Soundmaster Admin Dashboard
 */

// Auth state
let authToken = null;
let currentUser = null;

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check for token in localStorage
  authToken = localStorage.getItem('authToken');
  
  if (authToken) {
    // Verify token validity
    verifyToken()
      .then(user => {
        // Token is valid, user is authenticated
        currentUser = user;
        initializeApp();
      })
      .catch(() => {
        // Token is invalid or expired
        logout(false);
        showLoginModal();
      });
  } else {
    // No token found, show login modal
    showLoginModal();
  }
  
  // Set up login form submission
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Set up logout button
  document.getElementById('logoutBtn').addEventListener('click', () => logout(true));
});

/**
 * Show the login modal
 */
function showLoginModal() {
  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  loginModal.show();
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorElement = document.getElementById('loginError');
  
  // Reset error message
  errorElement.classList.add('d-none');
  
  // Disable form
  const submitButton = event.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
  
  try {
    // Send login request
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Store token and user data
    authToken = data.token;
    currentUser = data.user;
    
    // Save token to localStorage
    localStorage.setItem('authToken', authToken);
    
    // Close login modal
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();
    
    // Initialize app
    initializeApp();
  } catch (error) {
    // Show error message
    errorElement.textContent = error.message;
    errorElement.classList.remove('d-none');
  } finally {
    // Re-enable form
    submitButton.disabled = false;
    submitButton.textContent = 'Login';
  }
}

/**
 * Verify the current token
 * @returns {Promise<Object>} User data if token is valid
 */
async function verifyToken() {
  try {
    // Send request to a protected endpoint to verify token
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    
    // Get user data from token
    const payload = JSON.parse(atob(authToken.split('.')[1]));
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
}

/**
 * Logout the current user
 * @param {boolean} callApi - Whether to call the logout API
 */
async function logout(callApi = true) {
  if (callApi && authToken) {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }
  
  // Clear auth data
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  
  // Reload page to reset state
  window.location.reload();
}

/**
 * Initialize the app after successful authentication
 */
function initializeApp() {
  console.log('User authenticated:', currentUser);
  
  // Update UI based on user role
  if (currentUser.role !== 'admin') {
    // Hide admin-only elements
    document.querySelectorAll('.admin-only').forEach(el => {
      el.classList.add('d-none');
    });
  }
  
  // Load dashboard data
  loadDashboard();
}

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function apiRequest(url, options = {}) {
  if (!authToken) {
    throw new Error('Not authenticated');
  }
  
  // Add authorization header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${authToken}`
  };
  
  // Make request
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle 401 Unauthorized (token expired)
  if (response.status === 401) {
    logout(false);
    showLoginModal();
    throw new Error('Session expired. Please login again.');
  }
  
  return response;
}

// Export auth functions for use in other modules
window.auth = {
  getCurrentUser: () => currentUser,
  isAdmin: () => currentUser && currentUser.role === 'admin',
  apiRequest,
  logout
};
