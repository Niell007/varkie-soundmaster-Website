// Soundmaster Admin Dashboard Authentication
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the login page
  if (window.location.pathname.includes('/admin/login')) {
    setupLoginForm();
  } else {
    validateSession();
  }
});

// Setup login form
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginButton = document.getElementById('loginButton');
    const loginError = document.getElementById('loginError');
    
    // Reset error message
    loginError.classList.add('d-none');
    
    // Disable form
    loginButton.disabled = true;
    loginButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
    
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
      
      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      
      // Redirect to admin dashboard
      window.location.href = '/admin';
    } catch (error) {
      // Show error message
      loginError.textContent = error.message;
      loginError.classList.remove('d-none');
      
      // Re-enable form
      loginButton.disabled = false;
      loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i> Login';
    }
  });
}

// Validate user session
function validateSession() {
  const token = localStorage.getItem('authToken');
  
  // If no token, redirect to login page
  if (!token) {
    window.location.href = '/admin/login';
    return;
  }
  
  // Verify token validity
  fetch('/api/auth/verify', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    return response.json();
  })
  .then(data => {
    // Token is valid, set user info
    setUserInfo(data.user);
  })
  .catch(error => {
    console.error('Session validation error:', error);
    // Clear token and redirect to login
    localStorage.removeItem('authToken');
    window.location.href = '/admin/login';
  });
}

// Set user info in the UI
function setUserInfo(user) {
  const userNameElement = document.getElementById('userName');
  const userRoleElement = document.getElementById('userRole');
  
  if (userNameElement) {
    userNameElement.textContent = user.name;
  }
  
  if (userRoleElement) {
    userRoleElement.textContent = user.role;
  }
}

// Get current user from token
function getCurrentUser() {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    // Decode token (JWT format: header.payload.signature)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

// Check if user has specific role
function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

// Check if user has permission for specific action
function hasPermission(permission) {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check specific permissions
  switch (permission) {
    case 'manage_users':
      return user.role === 'admin';
    case 'manage_content':
      return ['admin', 'editor'].includes(user.role);
    case 'view_analytics':
      return ['admin', 'editor'].includes(user.role);
    default:
      return false;
  }
}
