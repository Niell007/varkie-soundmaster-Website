/**
 * User Management Component for Soundmaster Admin Dashboard
 * Handles CRUD operations for users and permission management
 */

class UserManager {
  constructor() {
    this.users = [];
    this.currentUser = null;
    this.permissions = {};
    this.userRoles = ['admin', 'editor', 'contributor', 'viewer'];
    this.roleDescriptions = {
      admin: 'Full access to all features and settings',
      editor: 'Can create and edit content, but cannot manage users or deploy the site',
      contributor: 'Can create content, but cannot publish or manage other users\' content',
      viewer: 'Read-only access to the dashboard'
    };
  }

  /**
   * Initialize the user manager component
   */
  async init() {
    // Get current user permissions
    await this.fetchPermissions();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load users
    await this.loadUsers();
    
    // Initialize UI components
    this.initializeUI();
  }

  /**
   * Set up event listeners for user management
   */
  setupEventListeners() {
    // User form submission
    document.getElementById('user-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleUserFormSubmit();
    });
    
    // User deletion confirmation
    document.getElementById('confirm-delete-user')?.addEventListener('click', () => {
      this.deleteUser(this.userToDelete);
    });
    
    // New user button
    document.getElementById('new-user-btn')?.addEventListener('click', () => {
      this.showUserForm();
    });
    
    // Role selection change - update description
    document.getElementById('user-role')?.addEventListener('change', (e) => {
      const roleDescription = document.getElementById('role-description');
      if (roleDescription) {
        roleDescription.textContent = this.roleDescriptions[e.target.value] || '';
      }
    });
  }

  /**
   * Initialize UI components
   */
  initializeUI() {
    // Initialize role select options
    const roleSelect = document.getElementById('user-role');
    if (roleSelect) {
      roleSelect.innerHTML = '';
      this.userRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role.charAt(0).toUpperCase() + role.slice(1);
        roleSelect.appendChild(option);
      });
    }
    
    // Check permissions and disable elements if needed
    this.updateUIBasedOnPermissions();
  }

  /**
   * Update UI based on user permissions
   */
  updateUIBasedOnPermissions() {
    const newUserBtn = document.getElementById('new-user-btn');
    
    // Check if user can create users
    if (newUserBtn) {
      if (!this.permissions?.users?.includes('create')) {
        newUserBtn.style.display = 'none';
      } else {
        newUserBtn.style.display = 'block';
      }
    }
  }

  /**
   * Fetch current user permissions
   */
  async fetchPermissions() {
    try {
      const response = await fetch('/api/users/permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.permissions = data.permissions || {};
        console.log('Permissions loaded:', this.permissions);
      } else {
        console.error('Failed to load permissions');
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  }

  /**
   * Load users from the API
   */
  async loadUsers() {
    try {
      // Show loading indicator
      document.getElementById('users-container').innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
      
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.users = data.users || [];
        this.renderUsersList();
      } else {
        const error = await response.json();
        document.getElementById('users-container').innerHTML = `<div class="alert alert-danger">${error.error || 'Failed to load users'}</div>`;
      }
    } catch (error) {
      console.error('Error loading users:', error);
      document.getElementById('users-container').innerHTML = '<div class="alert alert-danger">Failed to load users. Please try again later.</div>';
    }
  }

  /**
   * Render the users list
   */
  renderUsersList() {
    const container = document.getElementById('users-container');
    if (!container) return;
    
    if (this.users.length === 0) {
      container.innerHTML = '<div class="alert alert-info">No users found.</div>';
      return;
    }
    
    // Create table
    let html = `
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add user rows
    this.users.forEach(user => {
      const createdDate = new Date(user.created_at).toLocaleDateString();
      
      html += `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td><span class="badge bg-${this.getRoleBadgeColor(user.role)}">${user.role}</span></td>
          <td>${createdDate}</td>
          <td>
            <div class="btn-group btn-group-sm" role="group">
              <button type="button" class="btn btn-outline-primary edit-user-btn" data-user-id="${user.id}">
                <i class="bi bi-pencil"></i>
              </button>
              <button type="button" class="btn btn-outline-danger delete-user-btn" data-user-id="${user.id}" ${!this.permissions?.users?.includes('delete') ? 'disabled' : ''}>
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.getAttribute('data-user-id');
        this.editUser(userId);
      });
    });
    
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.getAttribute('data-user-id');
        this.confirmDeleteUser(userId);
      });
    });
  }

  /**
   * Get badge color for user role
   * @param {string} role User role
   * @returns {string} Bootstrap color class
   */
  getRoleBadgeColor(role) {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'editor':
        return 'success';
      case 'contributor':
        return 'warning';
      case 'viewer':
        return 'info';
      default:
        return 'secondary';
    }
  }

  /**
   * Show user form for creating or editing
   * @param {string|null} userId User ID to edit, or null for new user
   */
  async showUserForm(userId = null) {
    const form = document.getElementById('user-form');
    const formTitle = document.getElementById('user-form-title');
    const passwordGroup = document.getElementById('password-group');
    const submitBtn = document.getElementById('user-form-submit');
    
    // Reset form
    form.reset();
    
    if (userId) {
      // Editing existing user
      formTitle.textContent = 'Edit User';
      submitBtn.textContent = 'Update User';
      
      // Password is optional when editing
      passwordGroup.classList.remove('required');
      document.getElementById('user-password-label').textContent = 'Password (leave blank to keep current)';
      
      // Get user data
      try {
        const response = await fetch(`/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          // Populate form
          document.getElementById('user-id').value = user.id;
          document.getElementById('user-name').value = user.name;
          document.getElementById('user-email').value = user.email;
          document.getElementById('user-role').value = user.role;
          
          // Update role description
          document.getElementById('role-description').textContent = this.roleDescriptions[user.role] || '';
          
          // Show form
          const userModal = new bootstrap.Modal(document.getElementById('user-modal'));
          userModal.show();
        } else {
          const error = await response.json();
          this.showAlert('danger', error.error || 'Failed to load user data');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        this.showAlert('danger', 'Failed to load user data. Please try again later.');
      }
    } else {
      // Creating new user
      formTitle.textContent = 'New User';
      submitBtn.textContent = 'Create User';
      
      // Password is required for new users
      passwordGroup.classList.add('required');
      document.getElementById('user-password-label').textContent = 'Password';
      document.getElementById('user-id').value = '';
      
      // Set default role description
      document.getElementById('role-description').textContent = this.roleDescriptions['viewer'] || '';
      
      // Show form
      const userModal = new bootstrap.Modal(document.getElementById('user-modal'));
      userModal.show();
    }
  }

  /**
   * Handle user form submission
   */
  async handleUserFormSubmit() {
    const userId = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    
    // Validate form
    if (!name || !email || (!userId && !password)) {
      this.showAlert('danger', 'Please fill in all required fields', 'user-form-alert');
      return;
    }
    
    // Prepare user data
    const userData = {
      name,
      email,
      role
    };
    
    // Only include password if it's provided
    if (password) {
      userData.password = password;
    }
    
    try {
      let response;
      
      if (userId) {
        // Update existing user
        response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(userData)
        });
      } else {
        // Create new user
        response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(userData)
        });
      }
      
      if (response.ok) {
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('user-modal')).hide();
        
        // Show success message
        this.showAlert('success', userId ? 'User updated successfully' : 'User created successfully');
        
        // Reload users
        await this.loadUsers();
      } else {
        const error = await response.json();
        this.showAlert('danger', error.error || 'Failed to save user', 'user-form-alert');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      this.showAlert('danger', 'Failed to save user. Please try again later.', 'user-form-alert');
    }
  }

  /**
   * Confirm user deletion
   * @param {string} userId User ID to delete
   */
  confirmDeleteUser(userId) {
    this.userToDelete = userId;
    
    // Find user name
    const user = this.users.find(u => u.id === userId);
    if (user) {
      document.getElementById('delete-user-name').textContent = user.name;
    }
    
    // Show confirmation modal
    const deleteModal = new bootstrap.Modal(document.getElementById('delete-user-modal'));
    deleteModal.show();
  }

  /**
   * Delete a user
   * @param {string} userId User ID to delete
   */
  async deleteUser(userId) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Close modal
      bootstrap.Modal.getInstance(document.getElementById('delete-user-modal')).hide();
      
      if (response.ok) {
        // Show success message
        this.showAlert('success', 'User deleted successfully');
        
        // Reload users
        await this.loadUsers();
      } else {
        const error = await response.json();
        this.showAlert('danger', error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      this.showAlert('danger', 'Failed to delete user. Please try again later.');
    }
  }

  /**
   * Edit a user
   * @param {string} userId User ID to edit
   */
  editUser(userId) {
    this.showUserForm(userId);
  }

  /**
   * Show an alert message
   * @param {string} type Alert type (success, danger, etc.)
   * @param {string} message Alert message
   * @param {string} containerId Container ID to show alert in
   */
  showAlert(type, message, containerId = 'alert-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    container.innerHTML = '';
    container.appendChild(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => {
        container.removeChild(alert);
      }, 150);
    }, 5000);
  }
}

// Initialize the user manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the users page and not already initialized
  if (document.getElementById('users-container') && !window.userManager) {
    initUserManager();
  }
});

/**
 * Initialize the user manager
 * This function is exported for use by the dashboard
 */
export function initUserManager() {
  const userManager = new UserManager();
  userManager.init();
  
  // Make userManager globally accessible
  window.userManager = userManager;
  
  return userManager;
}
