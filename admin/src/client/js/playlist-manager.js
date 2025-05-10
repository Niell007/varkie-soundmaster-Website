/**
 * Playlist Manager Component for Soundmaster Admin Dashboard
 * Handles CRUD operations for playlists and tracks
 */

// State management
let playlists = [];
let currentPlaylist = null;
let tracks = [];

// DOM Elements
const playlistsContainer = document.getElementById('playlists-container');
const playlistForm = document.getElementById('playlist-form');
const trackForm = document.getElementById('track-form');
const playlistModal = document.getElementById('playlist-modal');
const trackModal = document.getElementById('track-modal');
const playlistTitleInput = document.getElementById('playlist-title');
const playlistDescriptionInput = document.getElementById('playlist-description');
const playlistCoverInput = document.getElementById('playlist-cover');
const playlistFeaturedInput = document.getElementById('playlist-featured');
const trackTitleInput = document.getElementById('track-title');
const trackArtistInput = document.getElementById('track-artist');
const trackDurationInput = document.getElementById('track-duration');
const trackMediaInput = document.getElementById('track-media');
const tracksContainer = document.getElementById('tracks-container');
const savePlaylistBtn = document.getElementById('save-playlist');
const addTrackBtn = document.getElementById('add-track');
const closePlaylistModalBtn = document.getElementById('close-playlist-modal');
const closeTrackModalBtn = document.getElementById('close-track-modal');
const saveTrackBtn = document.getElementById('save-track');
const newPlaylistBtn = document.getElementById('new-playlist-btn');

/**
 * Initialize the playlist manager
 */
export function initPlaylistManager() {
  // Fetch playlists
  fetchPlaylists();
  
  // Event listeners
  if (newPlaylistBtn) {
    newPlaylistBtn.addEventListener('click', openNewPlaylistModal);
  }
  
  if (playlistForm) {
    playlistForm.addEventListener('submit', handlePlaylistSubmit);
  }
  
  if (trackForm) {
    trackForm.addEventListener('submit', handleTrackSubmit);
  }
  
  if (closePlaylistModalBtn) {
    closePlaylistModalBtn.addEventListener('click', closePlaylistModal);
  }
  
  if (closeTrackModalBtn) {
    closeTrackModalBtn.addEventListener('click', closeTrackModal);
  }
  
  if (addTrackBtn) {
    addTrackBtn.addEventListener('click', openNewTrackModal);
  }
}

/**
 * Fetch all playlists from the API
 */
async function fetchPlaylists() {
  try {
    const response = await fetch('/api/playlists');
    const data = await response.json();
    
    if (data.playlists) {
      playlists = data.playlists;
      renderPlaylists();
    }
  } catch (error) {
    console.error('Error fetching playlists:', error);
    showNotification('Error loading playlists', 'error');
  }
}

/**
 * Render playlists in the container
 */
function renderPlaylists() {
  if (!playlistsContainer) return;
  
  playlistsContainer.innerHTML = '';
  
  if (playlists.length === 0) {
    playlistsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-music fa-3x mb-3"></i>
        <h3>No Playlists Yet</h3>
        <p>Create your first playlist to get started</p>
        <button id="empty-new-playlist-btn" class="btn btn-primary">
          <i class="fas fa-plus"></i> Create Playlist
        </button>
      </div>
    `;
    
    const emptyNewPlaylistBtn = document.getElementById('empty-new-playlist-btn');
    if (emptyNewPlaylistBtn) {
      emptyNewPlaylistBtn.addEventListener('click', openNewPlaylistModal);
    }
    
    return;
  }
  
  // Create a table for playlists
  const table = document.createElement('table');
  table.className = 'table table-hover';
  
  // Create table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Title</th>
      <th>Tracks</th>
      <th>Duration</th>
      <th>Featured</th>
      <th>Actions</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  playlists.forEach(playlist => {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>${playlist.title}</td>
      <td>${playlist.trackCount}</td>
      <td>${playlist.duration}</td>
      <td>${playlist.featured ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>'}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-playlist" data-id="${playlist.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-playlist" data-id="${playlist.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  playlistsContainer.appendChild(table);
  
  // Add event listeners to edit and delete buttons
  const editButtons = document.querySelectorAll('.edit-playlist');
  const deleteButtons = document.querySelectorAll('.delete-playlist');
  
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      const playlistId = button.getAttribute('data-id');
      editPlaylist(playlistId);
    });
  });
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const playlistId = button.getAttribute('data-id');
      deletePlaylist(playlistId);
    });
  });
}

/**
 * Open modal for creating a new playlist
 */
function openNewPlaylistModal() {
  currentPlaylist = null;
  tracks = [];
  
  // Reset form
  if (playlistForm) playlistForm.reset();
  
  // Update modal title
  const modalTitle = document.querySelector('#playlist-modal .modal-title');
  if (modalTitle) modalTitle.textContent = 'Create New Playlist';
  
  // Clear tracks container
  if (tracksContainer) tracksContainer.innerHTML = '';
  
  // Show modal
  if (playlistModal) {
    const bsModal = new bootstrap.Modal(playlistModal);
    bsModal.show();
  }
}

/**
 * Open modal for editing an existing playlist
 * @param {string} playlistId - ID of the playlist to edit
 */
async function editPlaylist(playlistId) {
  try {
    const response = await fetch(`/api/playlists/${playlistId}`);
    const playlist = await response.json();
    
    if (!playlist || playlist.error) {
      showNotification('Error loading playlist', 'error');
      return;
    }
    
    currentPlaylist = playlist;
    tracks = [...playlist.tracks];
    
    // Fill form with playlist data
    if (playlistTitleInput) playlistTitleInput.value = playlist.title;
    if (playlistDescriptionInput) playlistDescriptionInput.value = playlist.description;
    if (playlistFeaturedInput) playlistFeaturedInput.checked = playlist.featured;
    
    // Update modal title
    const modalTitle = document.querySelector('#playlist-modal .modal-title');
    if (modalTitle) modalTitle.textContent = 'Edit Playlist';
    
    // Render tracks
    renderTracks();
    
    // Show modal
    if (playlistModal) {
      const bsModal = new bootstrap.Modal(playlistModal);
      bsModal.show();
    }
  } catch (error) {
    console.error('Error fetching playlist:', error);
    showNotification('Error loading playlist', 'error');
  }
}

/**
 * Delete a playlist
 * @param {string} playlistId - ID of the playlist to delete
 */
async function deletePlaylist(playlistId) {
  if (!confirm('Are you sure you want to delete this playlist?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification('Playlist deleted successfully', 'success');
      fetchPlaylists();
    } else {
      showNotification(data.error || 'Error deleting playlist', 'error');
    }
  } catch (error) {
    console.error('Error deleting playlist:', error);
    showNotification('Error deleting playlist', 'error');
  }
}

/**
 * Handle playlist form submission
 * @param {Event} event - Form submit event
 */
async function handlePlaylistSubmit(event) {
  event.preventDefault();
  
  const title = playlistTitleInput?.value;
  const description = playlistDescriptionInput?.value;
  const featured = playlistFeaturedInput?.checked;
  
  if (!title || !description) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  if (tracks.length === 0) {
    showNotification('Please add at least one track to the playlist', 'error');
    return;
  }
  
  const playlistData = {
    title,
    description,
    featured,
    tracks
  };
  
  try {
    const url = currentPlaylist 
      ? `/api/playlists/${currentPlaylist.id}` 
      : '/api/playlists';
    
    const method = currentPlaylist ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(playlistData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification(
        currentPlaylist 
          ? 'Playlist updated successfully' 
          : 'Playlist created successfully', 
        'success'
      );
      
      closePlaylistModal();
      fetchPlaylists();
    } else {
      showNotification(data.error || 'Error saving playlist', 'error');
    }
  } catch (error) {
    console.error('Error saving playlist:', error);
    showNotification('Error saving playlist', 'error');
  }
}

/**
 * Close the playlist modal
 */
function closePlaylistModal() {
  if (playlistModal) {
    const bsModal = bootstrap.Modal.getInstance(playlistModal);
    if (bsModal) bsModal.hide();
  }
}

/**
 * Open modal for adding a new track
 */
function openNewTrackModal() {
  // Reset form
  if (trackForm) trackForm.reset();
  
  // Update modal title
  const modalTitle = document.querySelector('#track-modal .modal-title');
  if (modalTitle) modalTitle.textContent = 'Add New Track';
  
  // Show modal
  if (trackModal) {
    const bsModal = new bootstrap.Modal(trackModal);
    bsModal.show();
  }
}

/**
 * Handle track form submission
 * @param {Event} event - Form submit event
 */
function handleTrackSubmit(event) {
  event.preventDefault();
  
  const title = trackTitleInput?.value;
  const artist = trackArtistInput?.value;
  const duration = trackDurationInput?.value;
  const mediaId = trackMediaInput?.value;
  
  if (!title || !artist || !duration) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  // Validate duration format (MM:SS)
  const durationRegex = /^([0-5][0-9]):([0-5][0-9])$/;
  if (!durationRegex.test(duration)) {
    showNotification('Duration must be in MM:SS format', 'error');
    return;
  }
  
  const track = {
    title,
    artist,
    duration,
    mediaId: mediaId || undefined
  };
  
  tracks.push(track);
  renderTracks();
  closeTrackModal();
}

/**
 * Close the track modal
 */
function closeTrackModal() {
  if (trackModal) {
    const bsModal = bootstrap.Modal.getInstance(trackModal);
    if (bsModal) bsModal.hide();
  }
}

/**
 * Render tracks in the container
 */
function renderTracks() {
  if (!tracksContainer) return;
  
  tracksContainer.innerHTML = '';
  
  if (tracks.length === 0) {
    tracksContainer.innerHTML = `
      <div class="empty-state">
        <p>No tracks added yet</p>
      </div>
    `;
    return;
  }
  
  // Create a table for tracks
  const table = document.createElement('table');
  table.className = 'table';
  
  // Create table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>#</th>
      <th>Title</th>
      <th>Artist</th>
      <th>Duration</th>
      <th>Actions</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  tracks.forEach((track, index) => {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${track.title}</td>
      <td>${track.artist}</td>
      <td>${track.duration}</td>
      <td>
        <button class="btn btn-sm btn-danger remove-track" data-index="${index}">
          <i class="fas fa-times"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  tracksContainer.appendChild(table);
  
  // Add event listeners to remove buttons
  const removeButtons = document.querySelectorAll('.remove-track');
  
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.getAttribute('data-index'));
      removeTrack(index);
    });
  });
}

/**
 * Remove a track from the list
 * @param {number} index - Index of the track to remove
 */
function removeTrack(index) {
  tracks.splice(index, 1);
  renderTracks();
}

/**
 * Show a notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
  // Check if notification container exists, create if not
  let notificationContainer = document.getElementById('notification-container');
  
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '9999';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'error' ? 'danger' : type}`;
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Add notification to container
  notificationContainer.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}
