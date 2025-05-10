/**
 * Soundmaster Admin Dashboard
 * Team management functionality
 */

// Global variables
let currentPage = 1;
let totalPages = 1;
let pageSize = 12;
let selectedMedia = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Only run on the team page
  if (!window.location.pathname.includes('team.html')) {
    return;
  }

  // Set up event listeners
  setupEventListeners();

  // Check if we're editing an existing team member
  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('id');
  const action = urlParams.get('action');

  if (teamId) {
    // Load existing team member
    await loadTeamMember(teamId);
  } else if (action === 'new') {
    // Show new team member form
    showTeamEditView();
  } else {
    // Load team list
    await loadTeamList();
  }
});

/**
 * Set up event listeners for the team page
 */
function setupEventListeners() {
  // Create team button
  const createTeamBtn = document.getElementById('createTeamBtn');
  if (createTeamBtn) {
    createTeamBtn.addEventListener('click', () => {
      showTeamEditView();
    });
  }

  // Back to list button
  const backToListBtn = document.getElementById('backToListBtn');
  if (backToListBtn) {
    backToListBtn.addEventListener('click', () => {
      showTeamListView();
    });
  }

  // Team form submission
  const teamForm = document.getElementById('teamForm');
  if (teamForm) {
    teamForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveTeamMember();
    });
  }

  // Delete team button
  const deleteTeamBtn = document.getElementById('deleteTeamBtn');
  if (deleteTeamBtn) {
    deleteTeamBtn.addEventListener('click', async () => {
      await deleteTeamMember();
    });
  }

  // Search button
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      currentPage = 1;
      loadTeamList();
    });
  }

  // Search input (search on enter)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        currentPage = 1;
        loadTeamList();
      }
    });
  }

  // Role filter
  const roleFilter = document.getElementById('roleFilter');
  if (roleFilter) {
    roleFilter.addEventListener('change', () => {
      currentPage = 1;
      loadTeamList();
    });
  }

  // Select image button
  const selectImageBtn = document.getElementById('selectImageBtn');
  if (selectImageBtn) {
    selectImageBtn.addEventListener('click', () => {
      openMediaPicker();
    });
  }

  // Select media button in modal
  const selectMediaBtn = document.getElementById('selectMediaBtn');
  if (selectMediaBtn) {
    selectMediaBtn.addEventListener('click', () => {
      if (selectedMedia) {
        document.getElementById('profileImage').value = selectedMedia.id;
        
        // Close the modal
        const mediaPicker = document.getElementById('mediaPicker');
        const modal = bootstrap.Modal.getInstance(mediaPicker);
        modal.hide();
      } else {
        UI.showToast('Please select an image first', 'warning');
      }
    });
  }

  // Media search in modal
  const mediaSearch = document.getElementById('mediaSearch');
  if (mediaSearch) {
    mediaSearch.addEventListener('input', debounce(() => {
      loadMediaForPicker();
    }, 500));
  }
}

/**
 * Load the list of team members
 */
async function loadTeamList() {
  UI.showSpinner();
  
  try {
    const searchQuery = document.getElementById('searchInput').value;
    const roleFilter = document.getElementById('roleFilter').value;
    
    // Show the list view
    showTeamListView();
    
    // Set loading state
    document.getElementById('teamGrid').innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
    
    // Prepare filter options
    const options = {
      page: currentPage,
      limit: pageSize,
      search: searchQuery
    };
    
    if (roleFilter !== 'all') {
      options.role = roleFilter;
    }
    
    // Fetch team members
    const response = await api.getContent('team', options);
    
    if (response.success) {
      const { content, pagination } = response;
      
      // Update pagination
      totalPages = pagination.totalPages || 1;
      updatePagination();
      
      // Update team count
      document.getElementById('teamCount').textContent = pagination.totalItems || 0;
      
      // Render team grid
      renderTeamGrid(content);
    } else {
      throw new Error(response.error || 'Failed to load team members');
    }
  } catch (error) {
    console.error('Error loading team list:', error);
    document.getElementById('teamGrid').innerHTML = `
      <div class="col-12 text-center py-5 text-danger">
        <i class="fas fa-exclamation-circle fa-3x mb-3"></i>
        <h5>Failed to load team members</h5>
        <p>Please try again later</p>
      </div>
    `;
    UI.showToast('Failed to load team members', 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Render the team grid with data
 * @param {Array} teamMembers - List of team members
 */
function renderTeamGrid(teamMembers) {
  const teamGrid = document.getElementById('teamGrid');
  
  if (!teamMembers || teamMembers.length === 0) {
    teamGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-users fa-3x mb-3 text-muted"></i>
        <h5>No team members found</h5>
        <p>Add team members to get started</p>
      </div>
    `;
    return;
  }
  
  // Create HTML for team grid
  const gridHTML = teamMembers.map(member => `
    <div class="col-md-4 col-lg-3 mb-4">
      <div class="card shadow h-100">
        <div class="card-img-top" style="height: 200px; background-color: #f8f9fa; overflow: hidden;">
          ${member.profile_image ? 
            `<img src="/api/media/${member.profile_image}/url" alt="${member.name}" class="img-fluid" style="width: 100%; height: 100%; object-fit: cover;">` : 
            `<div class="d-flex justify-content-center align-items-center h-100">
              <i class="fas fa-user fa-4x text-secondary"></i>
            </div>`
          }
        </div>
        <div class="card-body">
          <h5 class="card-title">${member.name}</h5>
          <p class="card-text text-muted">${formatRole(member.role)}</p>
          <div class="d-grid">
            <a href="team.html?id=${member.id}" class="btn btn-primary btn-sm">
              <i class="fas fa-edit"></i> Edit
            </a>
          </div>
        </div>
        <div class="card-footer bg-transparent">
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">${member.is_active ? 'Active' : 'Inactive'}</small>
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-danger delete-team" data-id="${member.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  teamGrid.innerHTML = gridHTML;
  
  // Add event listeners to delete buttons
  const deleteButtons = document.querySelectorAll('.delete-team');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = button.getAttribute('data-id');
      await deleteTeamMemberFromList(id);
    });
  });
}

/**
 * Format role for display
 * @param {string} role - Role identifier
 * @returns {string} Formatted role
 */
function formatRole(role) {
  if (!role) return 'Team Member';
  
  const roles = {
    host: 'Host',
    producer: 'Producer',
    dj: 'DJ',
    reporter: 'Reporter',
    technician: 'Technician',
    management: 'Management'
  };
  
  return roles[role.toLowerCase()] || role;
}

/**
 * Update pagination controls
 */
function updatePagination() {
  const pagination = document.getElementById('teamPagination');
  if (!pagination) return;
  
  const paginationNav = pagination.querySelector('nav');
  if (!paginationNav) return;
  
  const paginationList = paginationNav.querySelector('ul');
  if (!paginationList) return;
  
  // Generate pagination links
  let paginationHTML = `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `;
  
  // Calculate page range to display
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  if (endPage - startPage < 4 && totalPages > 5) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }
  
  paginationHTML += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  `;
  
  paginationList.innerHTML = paginationHTML;
  
  // Add event listeners to pagination links
  const pageLinks = paginationList.querySelectorAll('.page-link');
  pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const page = parseInt(link.getAttribute('data-page'));
      if (page && page !== currentPage && page >= 1 && page <= totalPages) {
        currentPage = page;
        loadTeamList();
      }
    });
  });
}

/**
 * Load a single team member for editing
 * @param {string} id - Team member ID
 */
async function loadTeamMember(id) {
  UI.showSpinner();
  
  try {
    const response = await api.getContentItem(id);
    
    if (response.success && response.content) {
      const teamMember = response.content;
      
      // Show edit view
      showTeamEditView(true);
      
      // Set form values
      document.getElementById('teamId').value = teamMember.id;
      document.getElementById('name').value = teamMember.name || '';
      document.getElementById('role').value = teamMember.role || '';
      document.getElementById('bio').value = teamMember.bio || '';
      document.getElementById('email').value = teamMember.email || '';
      document.getElementById('phone').value = teamMember.phone || '';
      document.getElementById('profileImage').value = teamMember.profile_image || '';
      document.getElementById('sortOrder').value = teamMember.sort_order || 1;
      document.getElementById('isActive').checked = teamMember.is_active !== false;
      
      // Set social media values
      if (teamMember.social_media) {
        document.getElementById('facebook').value = teamMember.social_media.facebook || '';
        document.getElementById('twitter').value = teamMember.social_media.twitter || '';
        document.getElementById('instagram').value = teamMember.social_media.instagram || '';
        document.getElementById('linkedin').value = teamMember.social_media.linkedin || '';
        document.getElementById('youtube').value = teamMember.social_media.youtube || '';
        document.getElementById('tiktok').value = teamMember.social_media.tiktok || '';
      }
      
      // Show delete button
      document.getElementById('deleteTeamBtn').style.display = 'block';
      
      // Update page title
      document.getElementById('teamEditTitle').textContent = 'Edit Team Member';
    } else {
      throw new Error(response.error || 'Failed to load team member');
    }
  } catch (error) {
    console.error('Error loading team member:', error);
    UI.showToast('Failed to load team member', 'error');
    showTeamListView();
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Save a team member
 */
async function saveTeamMember() {
  UI.showSpinner();
  
  try {
    // Get form values
    const id = document.getElementById('teamId').value;
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;
    const bio = document.getElementById('bio').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const profileImage = document.getElementById('profileImage').value;
    const sortOrder = parseInt(document.getElementById('sortOrder').value) || 1;
    const isActive = document.getElementById('isActive').checked;
    
    // Get social media values
    const socialMedia = {
      facebook: document.getElementById('facebook').value,
      twitter: document.getElementById('twitter').value,
      instagram: document.getElementById('instagram').value,
      linkedin: document.getElementById('linkedin').value,
      youtube: document.getElementById('youtube').value,
      tiktok: document.getElementById('tiktok').value
    };
    
    // Validate required fields
    if (!name) {
      UI.showToast('Name is required', 'warning');
      return;
    }
    
    if (!role) {
      UI.showToast('Role is required', 'warning');
      return;
    }
    
    // Create data object
    const data = {
      type: 'team',
      name,
      role,
      bio,
      email,
      phone,
      profile_image: profileImage,
      sort_order: sortOrder,
      is_active: isActive,
      social_media: socialMedia
    };
    
    let response;
    
    if (id) {
      // Update existing team member
      response = await api.updateContent(id, data);
    } else {
      // Create new team member
      response = await api.createContent(data);
    }
    
    if (response.success) {
      UI.showToast(`Team member ${id ? 'updated' : 'created'} successfully`, 'success');
      
      // Redirect to list view or reload the current item
      if (id) {
        await loadTeamMember(id);
      } else {
        showTeamListView();
        await loadTeamList();
      }
    } else {
      throw new Error(response.error || `Failed to ${id ? 'update' : 'create'} team member`);
    }
  } catch (error) {
    console.error('Error saving team member:', error);
    UI.showToast(`Failed to save team member: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Delete a team member from the edit view
 */
async function deleteTeamMember() {
  const id = document.getElementById('teamId').value;
  
  if (!id) {
    UI.showToast('No team member selected', 'warning');
    return;
  }
  
  // Confirm deletion
  const confirmed = await UI.confirm('Are you sure you want to delete this team member? This action cannot be undone.');
  
  if (!confirmed) {
    return;
  }
  
  UI.showSpinner();
  
  try {
    const response = await api.deleteContent(id);
    
    if (response.success) {
      UI.showToast('Team member deleted successfully', 'success');
      showTeamListView();
      await loadTeamList();
    } else {
      throw new Error(response.error || 'Failed to delete team member');
    }
  } catch (error) {
    console.error('Error deleting team member:', error);
    UI.showToast(`Failed to delete team member: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Delete a team member from the list view
 * @param {string} id - Team member ID
 */
async function deleteTeamMemberFromList(id) {
  if (!id) return;
  
  // Confirm deletion
  const confirmed = await UI.confirm('Are you sure you want to delete this team member? This action cannot be undone.');
  
  if (!confirmed) {
    return;
  }
  
  UI.showSpinner();
  
  try {
    const response = await api.deleteContent(id);
    
    if (response.success) {
      UI.showToast('Team member deleted successfully', 'success');
      await loadTeamList();
    } else {
      throw new Error(response.error || 'Failed to delete team member');
    }
  } catch (error) {
    console.error('Error deleting team member:', error);
    UI.showToast(`Failed to delete team member: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Show the team list view
 */
function showTeamListView() {
  document.getElementById('teamList').style.display = 'block';
  document.getElementById('teamEdit').style.display = 'none';
  
  // Clear URL parameters
  window.history.replaceState({}, document.title, window.location.pathname);
}

/**
 * Show the team edit view
 * @param {boolean} isEditing - Whether we're editing an existing team member
 */
function showTeamEditView(isEditing = false) {
  document.getElementById('teamList').style.display = 'none';
  document.getElementById('teamEdit').style.display = 'block';
  
  if (!isEditing) {
    // Reset form for new team member
    document.getElementById('teamForm').reset();
    document.getElementById('teamId').value = '';
    document.getElementById('deleteTeamBtn').style.display = 'none';
    document.getElementById('teamEditTitle').textContent = 'Add Team Member';
  }
}

/**
 * Open the media picker modal
 */
function openMediaPicker() {
  // Reset selected media
  selectedMedia = null;
  
  // Initialize the modal
  const mediaPicker = document.getElementById('mediaPicker');
  const modal = new bootstrap.Modal(mediaPicker);
  
  // Load media
  loadMediaForPicker();
  
  // Show the modal
  modal.show();
}

/**
 * Load media items for the media picker
 */
async function loadMediaForPicker() {
  const mediaGrid = document.getElementById('mediaGrid');
  const mediaLoading = document.getElementById('mediaLoading');
  
  // Show loading indicator
  mediaGrid.innerHTML = '';
  mediaLoading.style.display = 'block';
  
  try {
    const searchQuery = document.getElementById('mediaSearch').value;
    
    const response = await api.getMedia({
      type: 'image',
      search: searchQuery,
      page: 1,
      limit: 12
    });
    
    if (response.success && response.media) {
      const mediaItems = response.media;
      
      if (mediaItems.length === 0) {
        mediaGrid.innerHTML = '<p class="text-center">No media found</p>';
      } else {
        // Render media grid
        const mediaHTML = mediaItems.map(item => `
          <div class="media-item" data-id="${item.id}">
            <img src="/api/media/${item.id}/url" alt="${item.title || item.filename}" loading="lazy">
            <div class="media-overlay">
              <div class="media-title">${item.title || item.filename}</div>
            </div>
          </div>
        `).join('');
        
        mediaGrid.innerHTML = mediaHTML;
        
        // Add click event to media items
        const items = mediaGrid.querySelectorAll('.media-item');
        items.forEach(item => {
          item.addEventListener('click', () => {
            // Remove selected class from all items
            items.forEach(i => i.classList.remove('selected'));
            
            // Add selected class to clicked item
            item.classList.add('selected');
            
            // Set selected media
            const id = item.getAttribute('data-id');
            selectedMedia = { id };
          });
        });
      }
    } else {
      throw new Error(response.error || 'Failed to load media');
    }
  } catch (error) {
    console.error('Error loading media:', error);
    mediaGrid.innerHTML = '<p class="text-center text-danger">Failed to load media</p>';
  } finally {
    mediaLoading.style.display = 'none';
  }
}

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
