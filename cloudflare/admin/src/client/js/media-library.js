/**
 * Soundmaster Admin Dashboard
 * Media Library functionality
 */

// Global variables
let currentPage = 1;
let totalPages = 1;
let pageSize = 20;
let selectedFiles = [];
let uploadQueue = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Only run on the media library page
  if (!window.location.pathname.includes('media-library.html')) {
    return;
  }

  // Set up event listeners
  setupEventListeners();

  // Check if we're viewing a specific media item
  const urlParams = new URLSearchParams(window.location.search);
  const mediaId = urlParams.get('id');

  if (mediaId) {
    // Load media item details
    await loadMediaItem(mediaId);
  } else {
    // Load media library
    await loadMediaLibrary();
  }
});

/**
 * Set up event listeners for the media library page
 */
function setupEventListeners() {
  // Upload media button
  const uploadMediaBtn = document.getElementById('uploadMediaBtn');
  if (uploadMediaBtn) {
    uploadMediaBtn.addEventListener('click', () => {
      showMediaUploadView();
    });
  }

  // Back to media list button (from detail view)
  const backToMediaListBtn = document.getElementById('backToMediaListBtn');
  if (backToMediaListBtn) {
    backToMediaListBtn.addEventListener('click', () => {
      showMediaListView();
    });
  }

  // Back to media list button (from upload view)
  const backToMediaListFromUploadBtn = document.getElementById('backToMediaListFromUploadBtn');
  if (backToMediaListFromUploadBtn) {
    backToMediaListFromUploadBtn.addEventListener('click', () => {
      showMediaListView();
    });
  }

  // Search button
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      currentPage = 1;
      loadMediaLibrary();
    });
  }

  // Search input (search on enter)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        currentPage = 1;
        loadMediaLibrary();
      }
    });
  }

  // Type filter
  const typeFilter = document.getElementById('typeFilter');
  if (typeFilter) {
    typeFilter.addEventListener('change', () => {
      currentPage = 1;
      loadMediaLibrary();
    });
  }

  // Visibility filter
  const visibilityFilter = document.getElementById('visibilityFilter');
  if (visibilityFilter) {
    visibilityFilter.addEventListener('change', () => {
      currentPage = 1;
      loadMediaLibrary();
    });
  }

  // Media form submission
  const mediaForm = document.getElementById('mediaForm');
  if (mediaForm) {
    mediaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveMediaMetadata();
    });
  }

  // Delete media button
  const deleteMediaBtn = document.getElementById('deleteMediaBtn');
  if (deleteMediaBtn) {
    deleteMediaBtn.addEventListener('click', async () => {
      await deleteMedia();
    });
  }

  // Download media button
  const downloadMediaBtn = document.getElementById('downloadMediaBtn');
  if (downloadMediaBtn) {
    downloadMediaBtn.addEventListener('click', () => {
      downloadMedia();
    });
  }

  // Copy URL button
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  if (copyUrlBtn) {
    copyUrlBtn.addEventListener('click', () => {
      copyMediaUrl();
    });
  }

  // File input change
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      handleFileSelection(e.target.files);
    });
  }

  // Browse files button
  const browseFilesBtn = document.getElementById('browseFilesBtn');
  if (browseFilesBtn) {
    browseFilesBtn.addEventListener('click', () => {
      document.getElementById('fileInput').click();
    });
  }

  // Clear files button
  const clearFilesBtn = document.getElementById('clearFilesBtn');
  if (clearFilesBtn) {
    clearFilesBtn.addEventListener('click', () => {
      clearSelectedFiles();
    });
  }

  // Upload form submission
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await startUpload();
    });
  }

  // Drop zone for drag and drop
  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      handleFileSelection(e.dataTransfer.files);
    });
  }
}

/**
 * Load the media library
 */
async function loadMediaLibrary() {
  UI.showSpinner();
  
  try {
    const searchQuery = document.getElementById('searchInput').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const visibilityFilter = document.getElementById('visibilityFilter').value;
    
    // Show the list view
    showMediaListView();
    
    // Set loading state
    document.getElementById('mediaGrid').innerHTML = `
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
    
    if (typeFilter !== 'all') {
      options.type = typeFilter;
    }
    
    if (visibilityFilter !== 'all') {
      options.isPublic = visibilityFilter === 'public';
    }
    
    // Fetch media items
    const response = await api.getMedia(options);
    
    if (response.success) {
      const { media, pagination } = response;
      
      // Update pagination
      totalPages = pagination.totalPages || 1;
      updatePagination();
      
      // Update media count
      document.getElementById('mediaCount').textContent = pagination.totalItems || 0;
      
      // Render media grid
      renderMediaGrid(media);
    } else {
      throw new Error(response.error || 'Failed to load media');
    }
  } catch (error) {
    console.error('Error loading media library:', error);
    document.getElementById('mediaGrid').innerHTML = `
      <div class="text-center py-5 text-danger">
        <i class="fas fa-exclamation-circle fa-3x mb-3"></i>
        <h5>Failed to load media library</h5>
        <p>Please try again later</p>
      </div>
    `;
    UI.showToast('Failed to load media library', 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Render the media grid with data
 * @param {Array} mediaItems - List of media items
 */
function renderMediaGrid(mediaItems) {
  const mediaGrid = document.getElementById('mediaGrid');
  
  if (!mediaItems || mediaItems.length === 0) {
    mediaGrid.innerHTML = `
      <div class="text-center py-5">
        <i class="fas fa-photo-video fa-3x mb-3 text-muted"></i>
        <h5>No media found</h5>
        <p>Upload some media to get started</p>
      </div>
    `;
    return;
  }
  
  // Create HTML for media grid
  const gridHTML = mediaItems.map(item => `
    <div class="media-item">
      ${getMediaThumbnail(item)}
      <div class="media-overlay">
        <div class="media-title">${item.title || item.filename}</div>
        <div class="media-meta">
          <span class="badge ${item.is_public ? 'bg-success' : 'bg-secondary'}">
            ${item.is_public ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
      <a href="media-library.html?id=${item.id}" class="stretched-link"></a>
    </div>
  `).join('');
  
  mediaGrid.innerHTML = gridHTML;
}

/**
 * Get media thumbnail based on media type
 * @param {Object} media - Media item
 * @returns {string} HTML for media thumbnail
 */
function getMediaThumbnail(media) {
  const type = media.type || 'unknown';
  const url = `/api/media/${media.id}/url`;
  
  switch (type) {
    case 'image':
      return `<img src="${url}" alt="${media.title || media.filename}" loading="lazy">`;
    case 'audio':
      return `<div class="media-icon"><i class="fas fa-music fa-3x"></i></div>`;
    case 'video':
      return `<div class="media-icon"><i class="fas fa-video fa-3x"></i></div>`;
    case 'document':
      return `<div class="media-icon"><i class="fas fa-file-alt fa-3x"></i></div>`;
    default:
      return `<div class="media-icon"><i class="fas fa-file fa-3x"></i></div>`;
  }
}

/**
 * Update pagination controls
 */
function updatePagination() {
  const pagination = document.getElementById('mediaPagination');
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
        loadMediaLibrary();
      }
    });
  });
}

/**
 * Load a single media item for viewing/editing
 * @param {string} id - Media ID
 */
async function loadMediaItem(id) {
  UI.showSpinner();
  
  try {
    const response = await api.getMediaItem(id);
    
    if (response.success && response.media) {
      const mediaItem = response.media;
      
      // Show detail view
      showMediaDetailView();
      
      // Set form values
      document.getElementById('mediaId').value = mediaItem.id;
      document.getElementById('mediaTitle').value = mediaItem.title || '';
      document.getElementById('mediaDescription').value = mediaItem.description || '';
      document.getElementById('mediaAltText').value = mediaItem.alt_text || '';
      document.getElementById('mediaIsPublic').checked = mediaItem.is_public || false;
      
      // Set file information
      document.getElementById('mediaFilename').textContent = mediaItem.filename || 'Unknown';
      document.getElementById('mediaType').textContent = mediaItem.mime_type || 'Unknown';
      document.getElementById('mediaSize').textContent = formatFileSize(mediaItem.size || 0);
      document.getElementById('mediaUploaded').textContent = UI.formatDate(mediaItem.created_at);
      
      // Set media preview
      const previewContainer = document.getElementById('mediaPreview');
      previewContainer.innerHTML = getMediaPreview(mediaItem);
    } else {
      throw new Error(response.error || 'Failed to load media item');
    }
  } catch (error) {
    console.error('Error loading media item:', error);
    UI.showToast('Failed to load media item', 'error');
    showMediaListView();
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Get media preview based on media type
 * @param {Object} media - Media item
 * @returns {string} HTML for media preview
 */
function getMediaPreview(media) {
  const type = media.type || 'unknown';
  const url = `/api/media/${media.id}/url`;
  
  switch (type) {
    case 'image':
      return `<img src="${url}" alt="${media.title || media.filename}" class="img-fluid">`;
    case 'audio':
      return `
        <audio controls class="w-100">
          <source src="${url}" type="${media.mime_type}">
          Your browser does not support the audio element.
        </audio>
      `;
    case 'video':
      return `
        <video controls class="w-100">
          <source src="${url}" type="${media.mime_type}">
          Your browser does not support the video element.
        </video>
      `;
    case 'document':
      return `
        <div class="text-center">
          <i class="fas fa-file-alt fa-5x text-primary mb-3"></i>
          <h5>${media.filename}</h5>
          <p class="text-muted">${media.mime_type}</p>
        </div>
      `;
    default:
      return `
        <div class="text-center">
          <i class="fas fa-file fa-5x text-secondary mb-3"></i>
          <h5>${media.filename}</h5>
          <p class="text-muted">${media.mime_type}</p>
        </div>
      `;
  }
}

/**
 * Save media metadata
 */
async function saveMediaMetadata() {
  UI.showSpinner();
  
  try {
    const id = document.getElementById('mediaId').value;
    const title = document.getElementById('mediaTitle').value;
    const description = document.getElementById('mediaDescription').value;
    const altText = document.getElementById('mediaAltText').value;
    const isPublic = document.getElementById('mediaIsPublic').checked;
    
    if (!id) {
      throw new Error('Media ID is required');
    }
    
    const data = {
      title,
      description,
      alt_text: altText,
      is_public: isPublic
    };
    
    const response = await api.updateMediaMetadata(id, data);
    
    if (response.success) {
      UI.showToast('Media metadata updated successfully', 'success');
    } else {
      throw new Error(response.error || 'Failed to update media metadata');
    }
  } catch (error) {
    console.error('Error saving media metadata:', error);
    UI.showToast(`Failed to save media metadata: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Delete a media item
 */
async function deleteMedia() {
  const id = document.getElementById('mediaId').value;
  
  if (!id) {
    UI.showToast('No media item selected', 'warning');
    return;
  }
  
  // Confirm deletion
  const confirmed = await UI.confirm('Are you sure you want to delete this media item? This action cannot be undone.');
  
  if (!confirmed) {
    return;
  }
  
  UI.showSpinner();
  
  try {
    const response = await api.deleteMedia(id);
    
    if (response.success) {
      UI.showToast('Media item deleted successfully', 'success');
      showMediaListView();
      await loadMediaLibrary();
    } else {
      throw new Error(response.error || 'Failed to delete media item');
    }
  } catch (error) {
    console.error('Error deleting media:', error);
    UI.showToast(`Failed to delete media item: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Download a media item
 */
function downloadMedia() {
  const id = document.getElementById('mediaId').value;
  const filename = document.getElementById('mediaFilename').textContent;
  
  if (!id) {
    UI.showToast('No media item selected', 'warning');
    return;
  }
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = `/api/media/${id}/download`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy media URL to clipboard
 */
function copyMediaUrl() {
  const id = document.getElementById('mediaId').value;
  
  if (!id) {
    UI.showToast('No media item selected', 'warning');
    return;
  }
  
  const url = `/api/media/${id}/url`;
  
  // Copy to clipboard
  navigator.clipboard.writeText(url)
    .then(() => {
      UI.showToast('URL copied to clipboard', 'success');
    })
    .catch((error) => {
      console.error('Error copying URL:', error);
      UI.showToast('Failed to copy URL', 'error');
    });
}

/**
 * Handle file selection for upload
 * @param {FileList} files - Selected files
 */
function handleFileSelection(files) {
  if (!files || files.length === 0) {
    return;
  }
  
  // Convert FileList to array
  const fileArray = Array.from(files);
  
  // Add files to selected files array
  selectedFiles = [...selectedFiles, ...fileArray];
  
  // Update UI
  updateFileList();
  
  // Show upload preview
  document.getElementById('uploadPreview').style.display = 'block';
  document.getElementById('clearFilesBtn').style.display = 'block';
  document.getElementById('startUploadBtn').disabled = false;
}

/**
 * Update the file list in the upload view
 */
function updateFileList() {
  const fileList = document.getElementById('fileList');
  
  if (!fileList) return;
  
  if (selectedFiles.length === 0) {
    fileList.innerHTML = '<div class="list-group-item">No files selected</div>';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('clearFilesBtn').style.display = 'none';
    document.getElementById('startUploadBtn').disabled = true;
    return;
  }
  
  // Create HTML for file list
  const fileListHTML = selectedFiles.map((file, index) => `
    <div class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <i class="${getFileIcon(file.type)}"></i>
        ${file.name}
        <small class="text-muted ms-2">${formatFileSize(file.size)}</small>
      </div>
      <button type="button" class="btn btn-sm btn-danger remove-file" data-index="${index}">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
  
  fileList.innerHTML = fileListHTML;
  
  // Add event listeners to remove buttons
  const removeButtons = fileList.querySelectorAll('.remove-file');
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.getAttribute('data-index'));
      removeFile(index);
    });
  });
}

/**
 * Remove a file from the selected files
 * @param {number} index - File index
 */
function removeFile(index) {
  if (index >= 0 && index < selectedFiles.length) {
    selectedFiles.splice(index, 1);
    updateFileList();
  }
}

/**
 * Clear all selected files
 */
function clearSelectedFiles() {
  selectedFiles = [];
  updateFileList();
}

/**
 * Start the upload process
 */
async function startUpload() {
  if (selectedFiles.length === 0) {
    UI.showToast('No files selected', 'warning');
    return;
  }
  
  // Prepare upload queue
  uploadQueue = [...selectedFiles];
  selectedFiles = [];
  
  // Show progress container
  document.getElementById('uploadProgress').style.display = 'block';
  document.getElementById('progressBars').innerHTML = '';
  
  // Disable form controls
  document.getElementById('dropZone').style.pointerEvents = 'none';
  document.getElementById('browseFilesBtn').disabled = true;
  document.getElementById('clearFilesBtn').disabled = true;
  document.getElementById('startUploadBtn').disabled = true;
  
  // Get public flag
  const isPublic = document.getElementById('uploadIsPublic').checked;
  
  // Process uploads
  for (let i = 0; i < uploadQueue.length; i++) {
    const file = uploadQueue[i];
    await uploadFile(file, i, isPublic);
  }
  
  // Re-enable form controls
  document.getElementById('dropZone').style.pointerEvents = 'auto';
  document.getElementById('browseFilesBtn').disabled = false;
  document.getElementById('clearFilesBtn').disabled = false;
  document.getElementById('startUploadBtn').disabled = false;
  
  // Clear file input
  document.getElementById('fileInput').value = '';
  
  // Show success message
  UI.showToast('All files uploaded successfully', 'success');
  
  // Hide upload preview
  document.getElementById('uploadPreview').style.display = 'none';
  document.getElementById('clearFilesBtn').style.display = 'none';
}

/**
 * Upload a single file
 * @param {File} file - File to upload
 * @param {number} index - File index
 * @param {boolean} isPublic - Whether the file should be public
 */
async function uploadFile(file, index, isPublic) {
  // Create progress bar
  const progressBarId = `progress-${index}`;
  const progressBars = document.getElementById('progressBars');
  
  progressBars.innerHTML += `
    <div class="mb-3">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span>${file.name}</span>
        <span id="${progressBarId}-text">0%</span>
      </div>
      <div class="progress">
        <div id="${progressBarId}" class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </div>
  `;
  
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('is_public', isPublic);
  
  try {
    // Use XMLHttpRequest for progress tracking
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          updateProgress(progressBarId, percent);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          updateProgress(progressBarId, 100, 'success');
          resolve(JSON.parse(xhr.responseText));
        } else {
          updateProgress(progressBarId, 100, 'danger');
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        updateProgress(progressBarId, 100, 'danger');
        reject(new Error('Network error during upload'));
      });
      
      xhr.open('POST', `/api/media`);
      xhr.setRequestHeader('Authorization', `Bearer ${api.token}`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error(`Error uploading ${file.name}:`, error);
    UI.showToast(`Failed to upload ${file.name}`, 'error');
    return null;
  }
}

/**
 * Update progress bar
 * @param {string} id - Progress bar ID
 * @param {number} percent - Progress percentage
 * @param {string} state - Progress bar state (primary, success, danger)
 */
function updateProgress(id, percent, state = 'primary') {
  const progressBar = document.getElementById(id);
  const progressText = document.getElementById(`${id}-text`);
  
  if (progressBar && progressText) {
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute('aria-valuenow', percent);
    progressBar.className = `progress-bar bg-${state}`;
    progressText.textContent = `${percent}%`;
  }
}

/**
 * Get file icon based on file type
 * @param {string} mimeType - File MIME type
 * @returns {string} Font Awesome icon class
 */
function getFileIcon(mimeType) {
  if (!mimeType) return 'fas fa-file';
  
  if (mimeType.startsWith('image/')) {
    return 'fas fa-file-image';
  } else if (mimeType.startsWith('audio/')) {
    return 'fas fa-file-audio';
  } else if (mimeType.startsWith('video/')) {
    return 'fas fa-file-video';
  } else if (mimeType === 'application/pdf') {
    return 'fas fa-file-pdf';
  } else if (mimeType.includes('word') || mimeType === 'application/rtf') {
    return 'fas fa-file-word';
  } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return 'fas fa-file-excel';
  } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
    return 'fas fa-file-powerpoint';
  } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
    return 'fas fa-file-archive';
  } else if (mimeType.includes('text/')) {
    return 'fas fa-file-alt';
  } else {
    return 'fas fa-file';
  }
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Show the media list view
 */
function showMediaListView() {
  document.getElementById('mediaList').style.display = 'block';
  document.getElementById('mediaDetail').style.display = 'none';
  document.getElementById('mediaUpload').style.display = 'none';
  
  // Clear URL parameters
  window.history.replaceState({}, document.title, window.location.pathname);
}

/**
 * Show the media detail view
 */
function showMediaDetailView() {
  document.getElementById('mediaList').style.display = 'none';
  document.getElementById('mediaDetail').style.display = 'block';
  document.getElementById('mediaUpload').style.display = 'none';
}

/**
 * Show the media upload view
 */
function showMediaUploadView() {
  document.getElementById('mediaList').style.display = 'none';
  document.getElementById('mediaDetail').style.display = 'none';
  document.getElementById('mediaUpload').style.display = 'block';
  
  // Reset upload form
  document.getElementById('uploadForm').reset();
  document.getElementById('fileInput').value = '';
  selectedFiles = [];
  updateFileList();
  
  // Hide progress container
  document.getElementById('uploadProgress').style.display = 'none';
}
