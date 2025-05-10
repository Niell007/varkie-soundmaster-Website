/**
 * Soundmaster Admin Dashboard
 * Playlists management functionality
 */

// Global variables
let currentPage = 1;
let totalPages = 1;
let pageSize = 12;
let selectedMedia = null;
let selectedMediaType = 'image';
let currentTracks = [];
let schedules = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Only run on the playlists page
  if (!window.location.pathname.includes('playlists.html')) {
    return;
  }

  // Set up event listeners
  setupEventListeners();

  // Check if we're editing an existing playlist
  const urlParams = new URLSearchParams(window.location.search);
  const playlistId = urlParams.get('id');
  const action = urlParams.get('action');

  if (playlistId) {
    // Load existing playlist
    await loadPlaylist(playlistId);
  } else if (action === 'new') {
    // Show new playlist form
    showPlaylistEditView();
  } else {
    // Load playlists list
    await loadPlaylists();
  }

  // Load schedules for the show select
  await loadSchedules();
});

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Create playlist button
  document.getElementById('createPlaylistBtn')?.addEventListener('click', () => {
    showPlaylistEditView();
  });

  // Back to list button
  document.getElementById('backToListBtn')?.addEventListener('click', () => {
    showPlaylistsListView();
  });

  // Playlist form submission
  document.getElementById('playlistForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await savePlaylist();
  });

  // Delete playlist button
  document.getElementById('deletePlaylistBtn')?.addEventListener('click', async () => {
    await deletePlaylist();
  });

  // Search button
  document.getElementById('searchBtn')?.addEventListener('click', () => {
    currentPage = 1;
    loadPlaylists();
  });

  // Search input (search on enter)
  document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      currentPage = 1;
      loadPlaylists();
    }
  });

  // Category filter
  document.getElementById('categoryFilter')?.addEventListener('change', () => {
    currentPage = 1;
    loadPlaylists();
  });

  // Select cover image button
  document.getElementById('selectImageBtn')?.addEventListener('click', () => {
    selectedMediaType = 'image';
    openMediaPicker();
  });

  // Add track button
  document.getElementById('addTrackBtn')?.addEventListener('click', () => {
    openAddTrackModal();
  });

  // Save track button
  document.getElementById('saveTrackBtn')?.addEventListener('click', () => {
    addTrackToPlaylist();
  });

  // Select audio button
  document.getElementById('selectAudioBtn')?.addEventListener('click', () => {
    selectedMediaType = 'audio';
    openMediaPicker();
  });

  // Select media button in modal
  document.getElementById('selectMediaBtn')?.addEventListener('click', () => {
    if (selectedMedia) {
      if (selectedMediaType === 'image') {
        document.getElementById('coverImage').value = selectedMedia.id;
      } else if (selectedMediaType === 'audio') {
        document.getElementById('trackAudio').value = selectedMedia.id;
      }
      
      // Close the modal
      const mediaPicker = document.getElementById('mediaPicker');
      const modal = bootstrap.Modal.getInstance(mediaPicker);
      modal.hide();
    } else {
      UI.showToast('Please select a media item first', 'warning');
    }
  });

  // Media type filter in picker
  document.getElementById('mediaTypeFilter')?.addEventListener('change', (e) => {
    selectedMediaType = e.target.value;
    loadMediaForPicker();
  });

  // Media search in modal
  document.getElementById('mediaSearch')?.addEventListener('input', debounce(() => {
    loadMediaForPicker();
  }, 500));
}

/**
 * Load schedules for the show select
 */
async function loadSchedules() {
  try {
    const response = await api.getContent('schedule', { limit: 100 });
    
    if (response.success && response.content) {
      schedules = response.content;
      
      // Populate show select
      const showSelect = document.getElementById('showId');
      if (!showSelect) return;
      
      let options = '<option value="">None</option>';
      
      schedules.forEach(schedule => {
        if (schedule.is_active !== false) {
          options += `<option value="${schedule.id}">${schedule.show_name}</option>`;
        }
      });
      
      showSelect.innerHTML = options;
    }
  } catch (error) {
    console.error('Error loading schedules:', error);
  }
}

/**
 * Load playlists list
 */
async function loadPlaylists() {
  UI.showSpinner();
  
  try {
    const searchQuery = document.getElementById('searchInput').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    // Show the list view
    showPlaylistsListView();
    
    // Set loading state
    document.getElementById('playlistsGrid').innerHTML = `
      <div class="col-12 text-center py-5">
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
    
    if (categoryFilter !== 'all') {
      options.category = categoryFilter;
    }
    
    // Fetch playlists
    const response = await api.getContent('playlist', options);
    
    if (response.success) {
      const { content, pagination } = response;
      
      // Update pagination
      totalPages = pagination.totalPages || 1;
      updatePagination();
      
      // Update playlists count
      document.getElementById('playlistsCount').textContent = pagination.totalItems || 0;
      
      // Render playlists grid
      renderPlaylistsGrid(content);
    } else {
      throw new Error(response.error || 'Failed to load playlists');
    }
  } catch (error) {
    console.error('Error loading playlists:', error);
    document.getElementById('playlistsGrid').innerHTML = `
      <div class="col-12 text-center py-5 text-danger">
        <i class="fas fa-exclamation-circle fa-3x mb-3"></i>
        <h5>Failed to load playlists</h5>
        <p>Please try again later</p>
      </div>
    `;
    UI.showToast('Failed to load playlists', 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Render playlists grid
 * @param {Array} playlists - List of playlists
 */
function renderPlaylistsGrid(playlists) {
  const playlistsGrid = document.getElementById('playlistsGrid');
  
  if (!playlists || playlists.length === 0) {
    playlistsGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-music fa-3x mb-3 text-muted"></i>
        <h5>No playlists found</h5>
        <p>Create a playlist to get started</p>
      </div>
    `;
    return;
  }
  
  // Create HTML for playlists grid
  const gridHTML = playlists.map(playlist => `
    <div class="col-md-4 col-lg-3 mb-4">
      <div class="card shadow h-100">
        <div class="card-img-top" style="height: 180px; background-color: #f8f9fa; overflow: hidden;">
          ${playlist.cover_image ? 
            `<img src="/api/media/${playlist.cover_image}/url" alt="${playlist.title}" class="img-fluid" style="width: 100%; height: 100%; object-fit: cover;">` : 
            `<div class="d-flex justify-content-center align-items-center h-100">
              <i class="fas fa-music fa-4x text-secondary"></i>
            </div>`
          }
        </div>
        <div class="card-body">
          <h5 class="card-title">${playlist.title}</h5>
          <p class="card-text text-muted">
            ${formatCategory(playlist.category)} • ${playlist.tracks?.length || 0} tracks
          </p>
          <div class="d-grid">
            <a href="playlists.html?id=${playlist.id}" class="btn btn-primary btn-sm">
              <i class="fas fa-edit"></i> Edit
            </a>
          </div>
        </div>
        <div class="card-footer bg-transparent">
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">${playlist.is_public !== false ? 'Public' : 'Private'}</small>
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-danger delete-playlist" data-id="${playlist.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  playlistsGrid.innerHTML = gridHTML;
  
  // Add event listeners to delete buttons
  const deleteButtons = document.querySelectorAll('.delete-playlist');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = button.getAttribute('data-id');
      await deletePlaylistFromList(id);
    });
  });
}

/**
 * Format category for display
 * @param {string} category - Category identifier
 * @returns {string} Formatted category
 */
function formatCategory(category) {
  if (!category) return 'General';
  
  const categories = {
    featured: 'Featured',
    show: 'Show Playlist',
    genre: 'Genre Playlist',
    mood: 'Mood Playlist',
    seasonal: 'Seasonal'
  };
  
  return categories[category.toLowerCase()] || category;
}

/**
 * Update pagination controls
 */
function updatePagination() {
  const pagination = document.getElementById('playlistsPagination');
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
        loadPlaylists();
      }
    });
  });
}

/**
 * Load a single playlist for editing
 * @param {string} id - Playlist ID
 */
async function loadPlaylist(id) {
  UI.showSpinner();
  
  try {
    const response = await api.getContentItem(id);
    
    if (response.success && response.content) {
      const playlist = response.content;
      
      // Show edit view
      showPlaylistEditView(true);
      
      // Set form values
      document.getElementById('playlistId').value = playlist.id;
      document.getElementById('title').value = playlist.title || '';
      document.getElementById('description').value = playlist.description || '';
      document.getElementById('category').value = playlist.category || '';
      document.getElementById('showId').value = playlist.show_id || '';
      document.getElementById('coverImage').value = playlist.cover_image || '';
      document.getElementById('isPublic').checked = playlist.is_public !== false;
      
      // Set tracks
      currentTracks = playlist.tracks || [];
      renderTracks();
      
      // Show delete button
      document.getElementById('deletePlaylistBtn').style.display = 'block';
      
      // Update page title
      document.getElementById('playlistEditTitle').textContent = 'Edit Playlist';
    } else {
      throw new Error(response.error || 'Failed to load playlist');
    }
  } catch (error) {
    console.error('Error loading playlist:', error);
    UI.showToast('Failed to load playlist', 'error');
    showPlaylistsListView();
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Render tracks table
 */
function renderTracks() {
  const tracksTableBody = document.getElementById('tracksTableBody');
  
  if (!currentTracks || currentTracks.length === 0) {
    tracksTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">
          No tracks added yet.
        </td>
      </tr>
    `;
    return;
  }
  
  // Create table rows
  const rows = currentTracks.map((track, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${track.title}</td>
      <td>${track.artist}</td>
      <td>${track.duration || '--'}</td>
      <td>
        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-outline-secondary move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>
            <i class="fas fa-arrow-up"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-secondary move-down" data-index="${index}" ${index === currentTracks.length - 1 ? 'disabled' : ''}>
            <i class="fas fa-arrow-down"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger remove-track" data-index="${index}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  tracksTableBody.innerHTML = rows;
  
  // Add event listeners to track action buttons
  const moveUpButtons = tracksTableBody.querySelectorAll('.move-up');
  moveUpButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.getAttribute('data-index'));
      moveTrackUp(index);
    });
  });
  
  const moveDownButtons = tracksTableBody.querySelectorAll('.move-down');
  moveDownButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.getAttribute('data-index'));
      moveTrackDown(index);
    });
  });
  
  const removeButtons = tracksTableBody.querySelectorAll('.remove-track');
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.getAttribute('data-index'));
      removeTrack(index);
    });
  });
}

/**
 * Move a track up in the playlist
 * @param {number} index - Track index
 */
function moveTrackUp(index) {
  if (index <= 0 || index >= currentTracks.length) return;
  
  // Swap with previous track
  const temp = currentTracks[index];
  currentTracks[index] = currentTracks[index - 1];
  currentTracks[index - 1] = temp;
  
  // Re-render tracks
  renderTracks();
}

/**
 * Move a track down in the playlist
 * @param {number} index - Track index
 */
function moveTrackDown(index) {
  if (index < 0 || index >= currentTracks.length - 1) return;
  
  // Swap with next track
  const temp = currentTracks[index];
  currentTracks[index] = currentTracks[index + 1];
  currentTracks[index + 1] = temp;
  
  // Re-render tracks
  renderTracks();
}

/**
 * Remove a track from the playlist
 * @param {number} index - Track index
 */
function removeTrack(index) {
  if (index < 0 || index >= currentTracks.length) return;
  
  // Remove track
  currentTracks.splice(index, 1);
  
  // Re-render tracks
  renderTracks();
}

/**
 * Open the add track modal
 */
function openAddTrackModal() {
  // Reset form
  document.getElementById('trackForm').reset();
  
  // Set modal title
  document.getElementById('addTrackModalLabel').textContent = 'Add Track';
  document.getElementById('saveTrackBtn').textContent = 'Add Track';
  
  // Open the modal
  const modal = new bootstrap.Modal(document.getElementById('addTrackModal'));
  modal.show();
}

/**
 * Add a track to the playlist
 */
function addTrackToPlaylist() {
  // Get form values
  const title = document.getElementById('trackTitle').value;
  const artist = document.getElementById('trackArtist').value;
  const album = document.getElementById('trackAlbum').value;
  const duration = document.getElementById('trackDuration').value;
  const year = document.getElementById('trackYear').value;
  const audio = document.getElementById('trackAudio').value;
  
  // Validate required fields
  if (!title) {
    UI.showToast('Title is required', 'warning');
    return;
  }
  
  if (!artist) {
    UI.showToast('Artist is required', 'warning');
    return;
  }
  
  // Create track object
  const track = {
    title,
    artist,
    album,
    duration,
    year: year ? parseInt(year) : null,
    audio_id: audio || null
  };
  
  // Add to tracks array
  currentTracks.push(track);
  
  // Re-render tracks
  renderTracks();
  
  // Close the modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('addTrackModal'));
  modal.hide();
  
  // Show success message
  UI.showToast('Track added to playlist', 'success');
}

/**
 * Save the playlist
 */
async function savePlaylist() {
  UI.showSpinner();
  
  try {
    // Get form values
    const id = document.getElementById('playlistId').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const showId = document.getElementById('showId').value;
    const coverImage = document.getElementById('coverImage').value;
    const isPublic = document.getElementById('isPublic').checked;
    
    // Validate required fields
    if (!title) {
      UI.showToast('Title is required', 'warning');
      return;
    }
    
    if (!category) {
      UI.showToast('Category is required', 'warning');
      return;
    }
    
    // Create data object
    const data = {
      type: 'playlist',
      title,
      description,
      category,
      show_id: showId || null,
      cover_image: coverImage || null,
      is_public: isPublic,
      tracks: currentTracks
    };
    
    let response;
    
    if (id) {
      // Update existing playlist
      response = await api.updateContent(id, data);
    } else {
      // Create new playlist
      response = await api.createContent(data);
    }
    
    if (response.success) {
      UI.showToast(`Playlist ${id ? 'updated' : 'created'} successfully`, 'success');
      
      // Redirect to list view or reload the current item
      if (id) {
        await loadPlaylist(id);
      } else {
        showPlaylistsListView();
        await loadPlaylists();
      }
    } else {
      throw new Error(response.error || `Failed to ${id ? 'update' : 'create'} playlist`);
    }
  } catch (error) {
    console.error('Error saving playlist:', error);
    UI.showToast(`Failed to save playlist: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Delete a playlist
 */
async function deletePlaylist() {
  const id = document.getElementById('playlistId').value;
  
  if (!id) {
    UI.showToast('No playlist selected', 'warning');
    return;
  }
  
  // Confirm deletion
  const confirmed = await UI.confirm('Are you sure you want to delete this playlist? This action cannot be undone.');
  
  if (!confirmed) {
    return;
  }
  
  UI.showSpinner();
  
  try {
    const response = await api.deleteContent(id);
    
    if (response.success) {
      UI.showToast('Playlist deleted successfully', 'success');
      showPlaylistsListView();
      await loadPlaylists();
    } else {
      throw new Error(response.error || 'Failed to delete playlist');
    }
  } catch (error) {
    console.error('Error deleting playlist:', error);
    UI.showToast(`Failed to delete playlist: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Delete a playlist from the list view
 * @param {string} id - Playlist ID
 */
async function deletePlaylistFromList(id) {
  if (!id) return;
  
  // Confirm deletion
  const confirmed = await UI.confirm('Are you sure you want to delete this playlist? This action cannot be undone.');
  
  if (!confirmed) {
    return;
  }
  
  UI.showSpinner();
  
  try {
    const response = await api.deleteContent(id);
    
    if (response.success) {
      UI.showToast('Playlist deleted successfully', 'success');
      await loadPlaylists();
    } else {
      throw new Error(response.error || 'Failed to delete playlist');
    }
  } catch (error) {
    console.error('Error deleting playlist:', error);
    UI.showToast(`Failed to delete playlist: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Show the playlists list view
 */
function showPlaylistsListView() {
  document.getElementById('playlistsList').style.display = 'block';
  document.getElementById('playlistEdit').style.display = 'none';
  
  // Clear URL parameters
  window.history.replaceState({}, document.title, window.location.pathname);
}

/**
 * Show the playlist edit view
 * @param {boolean} isEditing - Whether we're editing an existing playlist
 */
function showPlaylistEditView(isEditing = false) {
  document.getElementById('playlistsList').style.display = 'none';
  document.getElementById('playlistEdit').style.display = 'block';
  
  if (!isEditing) {
    // Reset form for new playlist
    document.getElementById('playlistForm').reset();
    document.getElementById('playlistId').value = '';
    currentTracks = [];
    renderTracks();
    document.getElementById('deletePlaylistBtn').style.display = 'none';
    document.getElementById('playlistEditTitle').textContent = 'Create Playlist';
  }
}

/**
 * Open the media picker modal
 */
function openMediaPicker() {
  // Reset selected media
  selectedMedia = null;
  
  // Set media type filter
  document.getElementById('mediaTypeFilter').value = selectedMediaType;
  
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
    const mediaType = document.getElementById('mediaTypeFilter').value;
    
    const response = await api.getMedia({
      type: mediaType,
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
        const mediaHTML = mediaItems.map(item => {
          if (mediaType === 'image') {
            return `
              <div class="media-item" data-id="${item.id}">
                <img src="/api/media/${item.id}/url" alt="${item.title || item.filename}" loading="lazy">
                <div class="media-overlay">
                  <div class="media-title">${item.title || item.filename}</div>
                </div>
              </div>
            `;
          } else {
            return `
              <div class="media-item" data-id="${item.id}">
                <div class="media-icon">
                  <i class="fas fa-music fa-3x"></i>
                </div>
                <div class="media-overlay">
                  <div class="media-title">${item.title || item.filename}</div>
                </div>
              </div>
            `;
          }
        }).join('');
        
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
