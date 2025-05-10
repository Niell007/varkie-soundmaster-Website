/**
 * settings.js - Handles functionality for the settings pages in the admin dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize sidebar toggle
  const sidebarCollapse = document.getElementById('sidebarCollapse');
  if (sidebarCollapse) {
    sidebarCollapse.addEventListener('click', function() {
      document.getElementById('sidebar').classList.toggle('active');
    });
  }

  // Initialize logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }

  // Check authentication
  checkAuth();

  // Initialize password toggle buttons
  initPasswordToggles();

  // Initialize settings forms based on the current page
  if (window.location.pathname.includes('general.html')) {
    initGeneralSettings();
  } else if (window.location.pathname.includes('api-keys.html')) {
    initApiKeySettings();
  } else if (window.location.pathname.includes('users.html')) {
    initUserSettings();
  }
});

/**
 * Initialize password toggle functionality
 */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      
      // Toggle password visibility
      if (input.type === 'password') {
        input.type = 'text';
        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        input.type = 'password';
        this.innerHTML = '<i class="fas fa-eye"></i>';
      }
    });
  });
}

/**
 * Initialize general settings page
 */
function initGeneralSettings() {
  const saveGeneralBtn = document.getElementById('saveGeneralBtn');
  if (saveGeneralBtn) {
    saveGeneralBtn.addEventListener('click', saveGeneralSettings);
  }
  
  // Load current settings
  loadGeneralSettings();
}

/**
 * Load general settings from the API
 */
async function loadGeneralSettings() {
  try {
    showLoader();
    const response = await api.getSettings('general');
    
    if (response.success) {
      const settings = response.data;
      
      // Site Information
      document.getElementById('siteName').value = settings.siteName || '';
      document.getElementById('siteTagline').value = settings.siteTagline || '';
      document.getElementById('siteDescription').value = settings.siteDescription || '';
      document.getElementById('siteKeywords').value = settings.siteKeywords || '';
      
      // Contact Information
      document.getElementById('contactEmail').value = settings.contactEmail || '';
      document.getElementById('contactPhone').value = settings.contactPhone || '';
      document.getElementById('contactAddress').value = settings.contactAddress || '';
      
      // Social Media
      document.getElementById('facebookUrl').value = settings.socialMedia?.facebook || '';
      document.getElementById('twitterUrl').value = settings.socialMedia?.twitter || '';
      document.getElementById('instagramUrl').value = settings.socialMedia?.instagram || '';
      document.getElementById('youtubeUrl').value = settings.socialMedia?.youtube || '';
      
      // Analytics
      document.getElementById('googleAnalyticsId').value = settings.analytics?.googleAnalyticsId || '';
      
      // Logo
      if (settings.logoUrl) {
        document.getElementById('currentLogo').src = settings.logoUrl;
        document.getElementById('currentLogoContainer').classList.remove('d-none');
      }
      
      // Favicon
      if (settings.faviconUrl) {
        document.getElementById('currentFavicon').src = settings.faviconUrl;
        document.getElementById('currentFaviconContainer').classList.remove('d-none');
      }
    } else {
      UI.showToast('Failed to load settings', 'error');
    }
  } catch (error) {
    console.error('Error loading general settings:', error);
    UI.showToast('Failed to load settings', 'error');
  } finally {
    hideLoader();
  }
}

/**
 * Save general settings to the API
 */
async function saveGeneralSettings() {
  try {
    showLoader();
    
    // Gather form data
    const formData = new FormData();
    
    // Site Information
    formData.append('siteName', document.getElementById('siteName').value);
    formData.append('siteTagline', document.getElementById('siteTagline').value);
    formData.append('siteDescription', document.getElementById('siteDescription').value);
    formData.append('siteKeywords', document.getElementById('siteKeywords').value);
    
    // Contact Information
    formData.append('contactEmail', document.getElementById('contactEmail').value);
    formData.append('contactPhone', document.getElementById('contactPhone').value);
    formData.append('contactAddress', document.getElementById('contactAddress').value);
    
    // Social Media
    formData.append('socialMedia[facebook]', document.getElementById('facebookUrl').value);
    formData.append('socialMedia[twitter]', document.getElementById('twitterUrl').value);
    formData.append('socialMedia[instagram]', document.getElementById('instagramUrl').value);
    formData.append('socialMedia[youtube]', document.getElementById('youtubeUrl').value);
    
    // Analytics
    formData.append('analytics[googleAnalyticsId]', document.getElementById('googleAnalyticsId').value);
    
    // Logo
    const logoFile = document.getElementById('logoFile').files[0];
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    
    // Favicon
    const faviconFile = document.getElementById('faviconFile').files[0];
    if (faviconFile) {
      formData.append('favicon', faviconFile);
    }
    
    const response = await api.updateSettings('general', formData, true);
    
    if (response.success) {
      UI.showToast('Settings saved successfully', 'success');
      // Reload settings to show updated values
      loadGeneralSettings();
    } else {
      UI.showToast('Failed to save settings', 'error');
    }
  } catch (error) {
    console.error('Error saving general settings:', error);
    UI.showToast('Failed to save settings', 'error');
  } finally {
    hideLoader();
  }
}

/**
 * Initialize API key settings page
 */
function initApiKeySettings() {
  const saveApiKeysBtn = document.getElementById('saveApiKeysBtn');
  if (saveApiKeysBtn) {
    saveApiKeysBtn.addEventListener('click', saveApiKeySettings);
  }
  
  // Load current API key settings
  loadApiKeySettings();
}

/**
 * Load API key settings from the API
 */
async function loadApiKeySettings() {
  try {
    showLoader();
    const response = await api.getSettings('api-keys');
    
    if (response.success) {
      const settings = response.data;
      
      // Streaming Services
      // Icecast
      document.getElementById('icecastHost').value = settings.streaming?.icecast?.host || '';
      document.getElementById('icecastPort').value = settings.streaming?.icecast?.port || '';
      document.getElementById('icecastMountpoint').value = settings.streaming?.icecast?.mountpoint || '';
      document.getElementById('icecastUsername').value = settings.streaming?.icecast?.username || '';
      document.getElementById('icecastPassword').value = settings.streaming?.icecast?.password || '';
      
      // SHOUTcast
      document.getElementById('shoutcastHost').value = settings.streaming?.shoutcast?.host || '';
      document.getElementById('shoutcastPort').value = settings.streaming?.shoutcast?.port || '';
      document.getElementById('shoutcastSid').value = settings.streaming?.shoutcast?.sid || '';
      document.getElementById('shoutcastAdminPassword').value = settings.streaming?.shoutcast?.adminPassword || '';
      
      // Music APIs
      document.getElementById('spotifyClientId').value = settings.music?.spotify?.clientId || '';
      document.getElementById('spotifyClientSecret').value = settings.music?.spotify?.clientSecret || '';
      document.getElementById('lastfmApiKey').value = settings.music?.lastfm?.apiKey || '';
      document.getElementById('lastfmSecret').value = settings.music?.lastfm?.secret || '';
      
      // Storage Services
      document.getElementById('r2AccountId').value = settings.storage?.r2?.accountId || '';
      document.getElementById('r2AccessKeyId').value = settings.storage?.r2?.accessKeyId || '';
      document.getElementById('r2SecretAccessKey').value = settings.storage?.r2?.secretAccessKey || '';
      document.getElementById('r2BucketName').value = settings.storage?.r2?.bucketName || '';
      document.getElementById('d1DatabaseId').value = settings.storage?.d1?.databaseId || '';
      
      // Other Services
      document.getElementById('mailchimpApiKey').value = settings.other?.mailchimp?.apiKey || '';
      document.getElementById('mailchimpListId').value = settings.other?.mailchimp?.listId || '';
      document.getElementById('recaptchaSiteKey').value = settings.other?.recaptcha?.siteKey || '';
      document.getElementById('recaptchaSecretKey').value = settings.other?.recaptcha?.secretKey || '';
      document.getElementById('openWeatherApiKey').value = settings.other?.openWeather?.apiKey || '';
    } else {
      UI.showToast('Failed to load API key settings', 'error');
    }
  } catch (error) {
    console.error('Error loading API key settings:', error);
    UI.showToast('Failed to load API key settings', 'error');
  } finally {
    hideLoader();
  }
}

/**
 * Save API key settings to the API
 */
async function saveApiKeySettings() {
  try {
    showLoader();
    
    // Create settings object
    const settings = {
      streaming: {
        icecast: {
          host: document.getElementById('icecastHost').value,
          port: document.getElementById('icecastPort').value,
          mountpoint: document.getElementById('icecastMountpoint').value,
          username: document.getElementById('icecastUsername').value,
          password: document.getElementById('icecastPassword').value
        },
        shoutcast: {
          host: document.getElementById('shoutcastHost').value,
          port: document.getElementById('shoutcastPort').value,
          sid: document.getElementById('shoutcastSid').value,
          adminPassword: document.getElementById('shoutcastAdminPassword').value
        }
      },
      music: {
        spotify: {
          clientId: document.getElementById('spotifyClientId').value,
          clientSecret: document.getElementById('spotifyClientSecret').value
        },
        lastfm: {
          apiKey: document.getElementById('lastfmApiKey').value,
          secret: document.getElementById('lastfmSecret').value
        }
      },
      storage: {
        r2: {
          accountId: document.getElementById('r2AccountId').value,
          accessKeyId: document.getElementById('r2AccessKeyId').value,
          secretAccessKey: document.getElementById('r2SecretAccessKey').value,
          bucketName: document.getElementById('r2BucketName').value
        },
        d1: {
          databaseId: document.getElementById('d1DatabaseId').value
        }
      },
      other: {
        mailchimp: {
          apiKey: document.getElementById('mailchimpApiKey').value,
          listId: document.getElementById('mailchimpListId').value
        },
        recaptcha: {
          siteKey: document.getElementById('recaptchaSiteKey').value,
          secretKey: document.getElementById('recaptchaSecretKey').value
        },
        openWeather: {
          apiKey: document.getElementById('openWeatherApiKey').value
        }
      }
    };
    
    const response = await api.updateSettings('api-keys', settings);
    
    if (response.success) {
      UI.showToast('API key settings saved successfully', 'success');
    } else {
      UI.showToast('Failed to save API key settings', 'error');
    }
  } catch (error) {
    console.error('Error saving API key settings:', error);
    UI.showToast('Failed to save API key settings', 'error');
  } finally {
    hideLoader();
  }
}

/**
 * Initialize user settings page
 */
function initUserSettings() {
  const saveUserBtn = document.getElementById('saveUserBtn');
  if (saveUserBtn) {
    saveUserBtn.addEventListener('click', saveUserSettings);
  }
  
  const addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', showAddUserModal);
  }
  
  // Load current user settings
  loadUserSettings();
}

/**
 * Load user settings from the API
 */
async function loadUserSettings() {
  try {
    showLoader();
    const response = await api.getSettings('users');
    
    if (response.success) {
      const users = response.data;
      renderUsersList(users);
    } else {
      UI.showToast('Failed to load user settings', 'error');
    }
  } catch (error) {
    console.error('Error loading user settings:', error);
    UI.showToast('Failed to load user settings', 'error');
  } finally {
    hideLoader();
  }
}

/**
 * Render the users list in the UI
 * @param {Array} users - Array of user objects
 */
function renderUsersList(users) {
  const usersTableBody = document.getElementById('usersTableBody');
  if (!usersTableBody) return;
  
  usersTableBody.innerHTML = '';
  
  if (users && users.length > 0) {
    users.forEach(user => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-user" data-user-id="${user.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-user" data-user-id="${user.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      usersTableBody.appendChild(row);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-user').forEach(button => {
      button.addEventListener('click', function() {
        const userId = this.getAttribute('data-user-id');
        showEditUserModal(userId);
      });
    });
    
    document.querySelectorAll('.delete-user').forEach(button => {
      button.addEventListener('click', function() {
        const userId = this.getAttribute('data-user-id');
        confirmDeleteUser(userId);
      });
    });
  } else {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No users found</td>
      </tr>
    `;
  }
}

/**
 * Show the add user modal
 */
function showAddUserModal() {
  // Implementation will depend on the modal structure in users.html
  // This will be implemented when creating the users.html page
}

/**
 * Show the edit user modal
 * @param {string} userId - ID of the user to edit
 */
function showEditUserModal(userId) {
  // Implementation will depend on the modal structure in users.html
  // This will be implemented when creating the users.html page
}

/**
 * Confirm deletion of a user
 * @param {string} userId - ID of the user to delete
 */
function confirmDeleteUser(userId) {
  // Implementation will depend on the confirmation modal structure in users.html
  // This will be implemented when creating the users.html page
}

/**
 * Save user settings to the API
 */
function saveUserSettings() {
  // Implementation will depend on the form structure in users.html
  // This will be implemented when creating the users.html page
}

/**
 * Show the loading spinner
 */
function showLoader() {
  // Create loader if it doesn't exist
  if (!document.getElementById('pageLoader')) {
    const loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
    document.body.appendChild(loader);
  }
  
  document.getElementById('pageLoader').style.display = 'flex';
}

/**
 * Hide the loading spinner
 */
function hideLoader() {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    loader.style.display = 'none';
  }
}
