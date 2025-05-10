/**
 * Media Library Component
 * Handles media file management and interactions
 */
class MediaLibrary {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('media-library');
    this.apiEndpoint = options.apiEndpoint || '/api/media-library';
    this.itemsPerPage = options.itemsPerPage || 20;
    this.currentPage = 1;
    this.selectedItems = new Set();
    this.currentFilter = 'all';
    this.isSelectionMode = false;
    this.isDragging = false;
    this.mediaItems = [];
    this.totalItems = 0;
    this.currentType = 'all';
    this.mediaCallback = null;
    this.searchQuery = '';
    this.searchTimeout = null;
    
    this.init();
  }

  /**
   * Initialize the media library component
   * @param {Function} callback Optional callback for media selection
   */
  async init(callback = null) {
    this.mediaCallback = callback;
    this.setupEventListeners();
    await this.loadMediaTypes();
    await this.loadMediaItems();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    /**
     * Set up drag and drop for the media grid
     */
    this.setupDragAndDrop();
    // Media type filter
    document.getElementById('media-type-filter')?.addEventListener('change', (e) => {
      this.currentType = e.target.value;
      this.currentPage = 1;
      this.loadMediaItems();
    });
    
    // Search input
    document.getElementById('media-search')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.debounceSearch();
    });
    
    // Upload form
    document.getElementById('media-upload-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.uploadMedia();
    });
    
    // Pagination
    document.getElementById('media-prev-page')?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadMediaItems();
      }
    });
    
    document.getElementById('media-next-page')?.addEventListener('click', () => {
      if (this.currentPage * this.itemsPerPage < this.totalItems) {
        this.currentPage++;
        this.loadMediaItems();
      }
    });
    
    // Selection mode toggle
    document.getElementById('selection-mode-toggle')?.addEventListener('click', () => {
      this.toggleSelectionMode();
    });
    
    // Select all button
    document.getElementById('select-all-media')?.addEventListener('click', () => {
      this.selectAllMedia();
    });
    
    // Clear selection button
    document.getElementById('clear-selection')?.addEventListener('click', () => {
      this.clearSelection();
    });
    
    // Delete selected button
    document.getElementById('delete-selected')?.addEventListener('click', () => {
      this.confirmDeleteSelected();
    });
    
    // Confirm delete button
    document.getElementById('confirm-delete-media')?.addEventListener('click', () => {
      this.deleteSelectedMedia();
    });
    
    // File input preview
    document.getElementById('media-file')?.addEventListener('change', (e) => {
      this.previewUploadFile(e.target.files[0]);
    });
    
    // Update metadata form
    document.getElementById('media-metadata-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateMediaMetadata();
    });
  }

  /**
   * Set up debounced search
   */
  debounceSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadMediaItems();
    }, 300);
  }

  /**
   * Load media types from API
   */
  async loadMediaTypes() {
    try {
      const response = await fetch('/api/media-library/types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          this.renderMediaTypeFilter(data.types);
        }
      }
    } catch (error) {
      console.error('Error loading media types:', error);
    }
  }

  /**
   * Render media type filter
   * @param {Array} types Media types
   */
  renderMediaTypeFilter(types) {
    const filter = document.getElementById('media-type-filter');
    if (!filter) return;
    
    // Add "All" option
    let html = '<option value="all">All Media</option>';
    
    // Add type options
    types.forEach(type => {
      if (typeof type === 'object' && type.type && type.count) {
        html += `<option value="${type.type}">${this.capitalizeFirstLetter(type.type)} (${type.count})</option>`;
      }
    });
    
    filter.innerHTML = html;
    filter.value = this.currentType;
  }

  /**
   * Load media items from API
   */
  async loadMediaItems() {
    try {
      // Show loading indicator
      document.getElementById('media-loading').style.display = 'flex';
      document.getElementById('media-grid').style.display = 'none';
      document.getElementById('media-pagination').style.display = 'none';
      
      const offset = (this.currentPage - 1) * this.itemsPerPage;
      
      let url = `/api/media-library?type=${this.currentType}&limit=${this.itemsPerPage}&offset=${offset}`;
      
      if (this.searchQuery) {
        url += `&search=${encodeURIComponent(this.searchQuery)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          this.mediaItems = data.mediaItems || [];
          this.totalItems = data.pagination?.total || 0;
          
          this.renderMediaGrid();
          this.renderPagination();
        }
      }
    } catch (error) {
      console.error('Error loading media items:', error);
    } finally {
      // Hide loading indicator
      document.getElementById('media-loading').style.display = 'none';
    }
  }

  /**
   * Render media grid
   */
  renderMediaGrid() {
    const grid = document.getElementById('media-grid');
    if (!grid) return;
    
    // Clear grid
    grid.innerHTML = '';
    
    if (this.mediaItems.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center p-5"><p>No media items found</p></div>';
      grid.style.display = 'block';
      return;
    }
    
    // Render media items
    this.mediaItems.forEach(item => {
      const mediaItem = document.createElement('div');
      mediaItem.className = 'media-item';
      mediaItem.dataset.id = item.id;
      
      // Add selected class if item is selected
      if (this.selectedItems.has(item.id)) {
        mediaItem.classList.add('selected');
      }
      
      // Create media item HTML
      mediaItem.innerHTML = `
        <div class="media-item-inner">
          <div class="media-thumbnail">
            ${this.renderThumbnail(item)}
            ${this.isSelectionMode ? `
              <div class="media-select">
                <input type="checkbox" class="form-check-input" ${this.selectedItems.has(item.id) ? 'checked' : ''}>
              </div>
            ` : ''}
          </div>
          <div class="media-info">
            <div class="media-filename">${this.truncateFilename(item.filename, 20)}</div>
            <div class="media-meta">${this.formatFileSize(item.size)}</div>
          </div>
        </div>
      `;
      
      // Add event listeners
      mediaItem.addEventListener('click', (e) => {
        if (this.isSelectionMode) {
          // Toggle selection
          this.toggleItemSelection(item.id);
          e.preventDefault();
          e.stopPropagation();
        } else {
          // Show media details
          this.showMediaDetails(item);
        }
      });
      
      grid.appendChild(mediaItem);
    });
    
    grid.style.display = 'grid';
  }

  /**
   * Render thumbnail for media item
   * @param {Object} item Media item
   * @returns {string} Thumbnail HTML
   */
  renderThumbnail(item) {
    if (item.type === 'image') {
      return `<img src="/api/media-library/${item.id}/url" alt="${item.filename}">`;
    }
    
    // Icon based on media type
    let icon = 'bi-file';
    
    if (item.type === 'audio') {
      icon = 'bi-file-earmark-music';
    } else if (item.type === 'video') {
      icon = 'bi-file-earmark-play';
    } else if (item.type === 'document') {
      icon = 'bi-file-earmark-text';
    }
    
    return `<div class="media-icon"><i class="bi ${icon}"></i></div>`;
  }

  /**
   * Render pagination
   */
  renderPagination() {
    const pagination = document.getElementById('media-pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Update page info
    document.getElementById('media-page-info').textContent = `Page ${this.currentPage} of ${totalPages || 1}`;
    
    // Update prev/next buttons
    document.getElementById('media-prev-page').disabled = this.currentPage <= 1;
    document.getElementById('media-next-page').disabled = this.currentPage >= totalPages;
    
    pagination.style.display = 'flex';
  }

  /**
   * Upload media
   */
  async uploadMedia() {
    try {
      const fileInput = document.getElementById('media-file');
      const titleInput = document.getElementById('upload-title');
      const descriptionInput = document.getElementById('upload-description');
      const altTextInput = document.getElementById('upload-alt-text');
      const typeInput = document.getElementById('upload-type');
      
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        this.showAlert('danger', 'Please select a file to upload', 'upload-alert');
        return;
      }
      
      const file = fileInput.files[0];
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', titleInput.value);
      formData.append('description', descriptionInput.value);
      formData.append('alt_text', altTextInput.value);
      formData.append('type', typeInput.value);
      
      // Show loading indicator
      document.getElementById('upload-loading').style.display = 'block';
      document.getElementById('upload-btn').disabled = true;
      
      const response = await fetch('/api/media-library/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          this.showAlert('success', 'Media uploaded successfully');
          
          // Reset form
          document.getElementById('media-upload-form').reset();
          document.getElementById('file-preview').innerHTML = '';
          
          // Close the modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('upload-modal'));
          if (modal) {
            modal.hide();
          }
          
          // Reload media items
          await this.loadMediaItems();
          
          // Reload media types
          await this.loadMediaTypes();
        } else {
          this.showAlert('danger', 'Failed to upload media', 'upload-alert');
        }
      } else {
        const error = await response.json();
        this.showAlert('danger', error.error || 'Failed to upload media', 'upload-alert');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      this.showAlert('danger', 'Failed to upload media. Please try again later.', 'upload-alert');
    } finally {
      // Hide loading indicator
      document.getElementById('upload-loading').style.display = 'none';
      document.getElementById('upload-btn').disabled = false;
    }
  }

  /**
   * Toggle selection mode
   */
  toggleSelectionMode() {
    this.isSelectionMode = !this.isSelectionMode;
    
    // Update UI
    const toggleBtn = document.getElementById('selection-mode-toggle');
    const selectionControls = document.getElementById('selection-controls');
    
    if (this.isSelectionMode) {
      toggleBtn.classList.add('btn-primary');
      toggleBtn.classList.remove('btn-outline-primary');
      toggleBtn.innerHTML = '<i class="bi bi-check2-square"></i> Exit Selection';
      selectionControls.style.display = 'block';
    } else {
      toggleBtn.classList.remove('btn-primary');
      toggleBtn.classList.add('btn-outline-primary');
      toggleBtn.innerHTML = '<i class="bi bi-check2-square"></i> Select Media';
      selectionControls.style.display = 'none';
      this.clearSelection();
    }
    
    // Re-render media grid
    this.renderMediaGrid();
  }

  /**
   * Toggle selection of a media item
   * @param {string} id Media item ID
   */
  toggleItemSelection(id) {
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
    
    // Update UI
    this.updateSelectionUI();
    this.renderMediaGrid();
  }

  /**
   * Select all media items
   */
  selectAllMedia() {
    this.mediaItems.forEach(item => {
      this.selectedItems.add(item.id);
    });
    
    // Update UI
    this.updateSelectionUI();
    this.renderMediaGrid();
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selectedItems.clear();
    
    // Update UI
    this.updateSelectionUI();
    this.renderMediaGrid();
  }

  /**
   * Update selection UI
   */
  updateSelectionUI() {
    const selectedCount = this.selectedItems.size;
    const countElement = document.getElementById('selected-count');
    const deleteButton = document.getElementById('delete-selected');
    
    if (countElement) {
      countElement.textContent = selectedCount.toString();
    }
    
    if (deleteButton) {
      deleteButton.disabled = selectedCount === 0;
    }
  }

  /**
   * Confirm delete selected media items
   */
  confirmDeleteSelected() {
    const selectedCount = this.selectedItems.size;
    if (selectedCount === 0) return;
    
    // Update confirm dialog
    const countElement = document.getElementById('delete-count');
    if (countElement) {
      countElement.textContent = selectedCount.toString();
    }
    
    // Show confirm dialog
    const modal = new bootstrap.Modal(document.getElementById('confirm-delete-modal'));
    modal.show();
  }

  /**
   * Delete selected media items
   */
  async deleteSelectedMedia() {
    try {
      // Show loading indicator
      document.getElementById('delete-loading').style.display = 'block';
      document.getElementById('confirm-delete-media').disabled = true;
      
      // Delete each selected item
      const deletePromises = Array.from(this.selectedItems).map(id => {
        return fetch(`/api/media-library/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });
      
      await Promise.all(deletePromises);
      
      // Hide confirm dialog
      const modal = bootstrap.Modal.getInstance(document.getElementById('confirm-delete-modal'));
      if (modal) {
        modal.hide();
      }
      
      // Clear selection
      this.clearSelection();
      
      // Show success message
      this.showAlert('success', 'Media items deleted successfully');
      
      // Reload media items
      await this.loadMediaItems();
      
      // Reload media types
      await this.loadMediaTypes();
    } catch (error) {
      console.error('Error deleting media items:', error);
      this.showAlert('danger', 'Failed to delete media items');
    } finally {
      // Hide loading indicator
      document.getElementById('delete-loading').style.display = 'none';
      document.getElementById('confirm-delete-media').disabled = false;
    }
  }

  /**
   * Show media details
   * @param {Object} item Media item
   */
  async showMediaDetails(item) {
    try {
      // Get media details
      const response = await fetch(`/api/media-library/${item.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const mediaItem = data.mediaItem;
          
          // Set media ID
          document.getElementById('media-id').value = mediaItem.id;
          
          // Set media preview
          const previewContainer = document.getElementById('media-preview');
          if (previewContainer) {
            if (mediaItem.type === 'image') {
              previewContainer.innerHTML = `<img src="/api/media-library/${mediaItem.id}/url" class="img-fluid" alt="${mediaItem.filename}">`;
            } else if (mediaItem.type === 'audio') {
              previewContainer.innerHTML = `<audio controls class="w-100"><source src="/api/media-library/${mediaItem.id}/url" type="${mediaItem.content_type}">Your browser does not support the audio element.</audio>`;
            } else if (mediaItem.type === 'video') {
              previewContainer.innerHTML = `<video controls class="w-100"><source src="/api/media-library/${mediaItem.id}/url" type="${mediaItem.content_type}">Your browser does not support the video element.</video>`;
            } else {
              previewContainer.innerHTML = `<div class="text-center p-5"><i class="bi bi-file-earmark-text display-1"></i><p class="mt-3"><a href="/api/media-library/${mediaItem.id}/url" target="_blank" class="btn btn-primary">Download ${mediaItem.filename}</a></p></div>`;
            }
          }
          
          // Set media details
          const detailsList = document.getElementById('media-details-list');
          if (detailsList) {
            detailsList.innerHTML = `
              <li class="list-group-item"><strong>Filename:</strong> ${mediaItem.filename}</li>
              <li class="list-group-item"><strong>Type:</strong> ${mediaItem.type}</li>
              <li class="list-group-item"><strong>Size:</strong> ${this.formatFileSize(mediaItem.size)}</li>
              <li class="list-group-item"><strong>Uploaded:</strong> ${new Date(mediaItem.uploaded_at).toLocaleString()}</li>
            `;
          }
          
          // Set form values
          document.getElementById('media-title').value = mediaItem.metadata?.title || '';
          document.getElementById('media-description').value = mediaItem.metadata?.description || '';
          document.getElementById('media-alt-text').value = mediaItem.metadata?.alt_text || '';
          
          // Show modal
          const modal = new bootstrap.Modal(document.getElementById('media-details-modal'));
          modal.show();
        }
      }
    } catch (error) {
      console.error('Error getting media details:', error);
      this.showAlert('danger', 'Failed to load media details');
    }
  }

  /**
   * Update media metadata
   */
  async updateMediaMetadata() {
    try {
      const mediaId = document.getElementById('media-id').value;
      const title = document.getElementById('media-title').value;
      const description = document.getElementById('media-description').value;
      const altText = document.getElementById('media-alt-text').value;
      
      const response = await fetch(`/api/media-library/${mediaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          alt_text: altText
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          this.showAlert('success', 'Media metadata updated successfully');
          
          // Close the modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('media-details-modal'));
          if (modal) {
            modal.hide();
          }
          
          // Reload media items
          await this.loadMediaItems();
        } else {
          this.showAlert('danger', 'Failed to update media metadata');
        }
      } else {
        const error = await response.json();
        this.showAlert('danger', error.error || 'Failed to update media metadata');
      }
    } catch (error) {
      console.error('Error updating media metadata:', error);
      this.showAlert('danger', 'Failed to update media metadata');
    }
  }

  /**
   * Preview upload file with optimization preview for images
   * @param {File} file File to preview
   */
  previewUploadFile(file) {
    if (!file) return;
    
    const preview = document.getElementById('file-preview');
    if (!preview) return;
    
    // Clear preview
    preview.innerHTML = '';
    
    // Set title if empty
    const titleInput = document.getElementById('upload-title');
    if (titleInput && !titleInput.value) {
      titleInput.value = file.name.split('.')[0];
    }
    
    // Set media type based on file type
    const typeInput = document.getElementById('upload-type');
    if (typeInput) {
      if (file.type.startsWith('image/')) {
        typeInput.value = 'image';
        
        // Create image preview with optimization comparison
        const reader = new FileReader();
        reader.onload = (e) => {
          // Create container for before/after comparison
          const container = document.createElement('div');
          container.className = 'image-preview-container d-flex flex-column';
          
          // Create original image preview
          const originalImg = document.createElement('img');
          originalImg.src = e.target.result;
          originalImg.className = 'img-thumbnail mb-2';
          originalImg.style.maxHeight = '150px';
          originalImg.alt = 'Original';
          
          // Create optimized image preview
          const optimizedContainer = document.createElement('div');
          optimizedContainer.className = 'optimized-preview';
          optimizedContainer.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-muted">Optimized Preview</small>
              <span class="badge bg-primary">Size reduced</span>
            </div>
          `;
          
          // Create canvas for image optimization preview
          this.createOptimizedPreview(file, e.target.result).then(optimizedDataUrl => {
            const optimizedImg = document.createElement('img');
            optimizedImg.src = optimizedDataUrl;
            optimizedImg.className = 'img-thumbnail';
            optimizedImg.style.maxHeight = '150px';
            optimizedImg.alt = 'Optimized Preview';
            optimizedContainer.appendChild(optimizedImg);
            
            // Add file size information
            const sizeInfo = document.createElement('div');
            sizeInfo.className = 'mt-1 d-flex justify-content-between';
            sizeInfo.innerHTML = `
              <small class="text-muted">Original: ${this.formatFileSize(file.size)}</small>
              <small class="text-success">Estimated after optimization: ~${this.formatFileSize(Math.round(file.size * 0.6))}</small>
            `;
            optimizedContainer.appendChild(sizeInfo);
          });
          
          // Add to container
          container.appendChild(originalImg);
          container.appendChild(optimizedContainer);
          preview.appendChild(container);
          
          // Add info text
          const infoText = document.createElement('div');
          infoText.className = 'text-muted small mt-2';
          infoText.innerHTML = 'Images are automatically optimized during upload. Large images will be resized to max width of 1920px.';
          preview.appendChild(infoText);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('audio/')) {
        typeInput.value = 'audio';
        preview.innerHTML = `<div class="p-3 bg-light rounded text-center"><i class="bi bi-file-earmark-music fs-1"></i><p class="mt-2">${file.name}</p></div>`;
      } else if (file.type.startsWith('video/')) {
        typeInput.value = 'video';
        preview.innerHTML = `<div class="p-3 bg-light rounded text-center"><i class="bi bi-file-earmark-play fs-1"></i><p class="mt-2">${file.name}</p></div>`;
      } else {
        typeInput.value = 'document';
        preview.innerHTML = `<div class="p-3 bg-light rounded text-center"><i class="bi bi-file-earmark-text fs-1"></i><p class="mt-2">${file.name}</p></div>`;
      }
    }
  }
  
  /**
   * Create optimized preview of an image
   * @param {File} file Original image file
   * @param {string} dataUrl Data URL of the original image
   * @returns {Promise<string>} Data URL of the optimized image
   */
  async createOptimizedPreview(file, dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const MAX_WIDTH = 1920;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          const aspectRatio = width / height;
          width = MAX_WIDTH;
          height = Math.round(width / aspectRatio);
        }
        
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw image to canvas with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get data URL with reduced quality
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(optimizedDataUrl);
      };

const response = await fetch(`/api/media-library/${mediaId}`, {
method: 'PUT',
headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`,
'Content-Type': 'application/json'
},
body: JSON.stringify({
title,
description,
alt_text: altText
})
});

if (response.ok) {
const data = await response.json();

if (data.success) {
this.showAlert('success', 'Media metadata updated successfully');

// Close the modal
const modal = bootstrap.Modal.getInstance(document.getElementById('media-details-modal'));
if (modal) {
modal.hide();
}

// Reload media items
await this.loadMediaItems();
} else {
this.showAlert('danger', 'Failed to update media metadata');
}
} else {
const error = await response.json();
this.showAlert('danger', error.error || 'Failed to update media metadata');
}
} catch (error) {
console.error('Error updating media metadata:', error);
this.showAlert('danger', 'Failed to update media metadata');
}
}

/**
* Preview upload file with optimization preview for images
* @param {File} file File to preview
*/
previewUploadFile(file) {
if (!file) return;

const preview = document.getElementById('file-preview');
if (!preview) return;

// Clear preview
preview.innerHTML = '';

// Set title if empty
const titleInput = document.getElementById('upload-title');
if (titleInput && !titleInput.value) {
titleInput.value = file.name.split('.')[0];
}

// Set media type based on file type
const typeInput = document.getElementById('upload-type');
if (typeInput) {
if (file.type.startsWith('image/')) {
typeInput.value = 'image';

// Create image preview with optimization comparison
const reader = new FileReader();
reader.onload = (e) => {
// Create container for before/after comparison
const container = document.createElement('div');
container.className = 'image-preview-container d-flex flex-column';

// Create original image preview
const originalImg = document.createElement('img');
originalImg.src = e.target.result;
originalImg.className = 'img-thumbnail mb-2';
originalImg.style.maxHeight = '150px';
originalImg.alt = 'Original';

// Create optimized image preview
const optimizedContainer = document.createElement('div');
optimizedContainer.className = 'optimized-preview';
optimizedContainer.innerHTML = `
<div class="d-flex justify-content-between align-items-center mb-1">
<small class="text-muted">Optimized Preview</small>
<span class="badge bg-primary">Size reduced</span>
</div>
`;

// Create canvas for image optimization preview
this.createOptimizedPreview(file, e.target.result).then(optimizedDataUrl => {
const optimizedImg = document.createElement('img');
optimizedImg.src = optimizedDataUrl;
optimizedImg.className = 'img-thumbnail';
optimizedImg.style.maxHeight = '150px';
optimizedImg.alt = 'Optimized Preview';
optimizedContainer.appendChild(optimizedImg);

// Add file size information
const sizeInfo = document.createElement('div');
sizeInfo.className = 'mt-1 d-flex justify-content-between';
sizeInfo.innerHTML = `
<small class="text-muted">Original: ${this.formatFileSize(file.size)}</small>
<small class="text-success">Estimated after optimization: ~${this.formatFileSize(Math.round(file.size * 0.6))}</small>
`;
optimizedContainer.appendChild(sizeInfo);
});

// Add to container
container.appendChild(originalImg);
container.appendChild(optimizedContainer);
preview.appendChild(container);

// Add info text
const infoText = document.createElement('div');
infoText.className = 'text-muted small mt-2';
infoText.innerHTML = 'Images are automatically optimized during upload. Large images will be resized to max width of 1920px.';
preview.appendChild(infoText);
};
reader.readAsDataURL(file);
} else if (file.type.startsWith('audio/')) {
typeInput.value = 'audio';
preview.innerHTML = `<div class="p-3 bg-light rounded text-center"><i class="bi bi-file-earmark-music fs-1"></i><p class="mt-2">${file.name}</p></div>`;
} else if (file.type.startsWith('video/')) {
typeInput.value = 'video';
preview.innerHTML = `<div class="p-3 bg-light rounded text-center"><i class="bi bi-file-earmark-play fs-1"></i><p class="mt-2">${file.name}</p></div>`;
} else {
typeInput.value = 'document';
preview.innerHTML = `<div class="p-3 bg-light rounded text-center"><i class="bi bi-file-earmark-text fs-1"></i><p class="mt-2">${file.name}</p></div>`;
}
}
}

/**
* Create optimized preview of an image
* @param {File} file Original image file
* @param {string} dataUrl Data URL of the original image
* @returns {Promise<string>} Data URL of the optimized image
*/
async createOptimizedPreview(file, dataUrl) {
return new Promise((resolve) => {
const img = new Image();
img.onload = () => {
// Calculate new dimensions while maintaining aspect ratio
const MAX_WIDTH = 1920;
let width = img.width;
let height = img.height;

if (width > MAX_WIDTH) {
const aspectRatio = width / height;
width = MAX_WIDTH;
height = Math.round(width / aspectRatio);
}

// Create canvas for resizing
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');

// Draw image to canvas with smoothing
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
ctx.drawImage(img, 0, 0, width, height);

// Get data URL with reduced quality
const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
resolve(optimizedDataUrl);
};
img.src = dataUrl;
});

/**
* Set up drag and drop for the media grid
*/
setupDragAndDrop() {
const dropZone = document.getElementById('media-drop-zone') || this.container;

if (!dropZone) return;

// Add drag and drop styles
this.addDragAndDropStyles();

// Create overlay for drag and drop visual feedback
const overlay = document.createElement('div');
overlay.className = 'drop-overlay d-none';
overlay.innerHTML = `
<div class="drop-message">
<i class="bi bi-cloud-upload fs-1 mb-2"></i>
<h4>Drop files to upload</h4>
<p class="mb-0">Your images will be automatically optimized</p>
</div>
`;
mediaContainer.appendChild(overlay);
    
// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
mediaContainer.addEventListener(eventName, preventDefaults, false);
document.body.addEventListener(eventName, preventDefaults, false);
});
    
// Highlight drop zone when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
mediaContainer.addEventListener(eventName, () => {
mediaContainer.classList.add('drag-active');
overlay.classList.remove('d-none');
this.isDragging = true;
}, false);
});
    
// Remove highlight when item is dragged away
['dragleave', 'drop'].forEach(eventName => {
mediaContainer.addEventListener(eventName, () => {
mediaContainer.classList.remove('drag-active');
overlay.classList.add('d-none');
this.isDragging = false;
}, false);
});
    
// Handle dropped files
mediaContainer.addEventListener('drop', (e) => {
const dt = e.dataTransfer;
const files = dt.files;
this.handleDroppedFiles(files);
}, false);
    
// Also handle file input
const fileInput = document.getElementById('media-file-input');
if (fileInput) {
fileInput.addEventListener('change', (e) => {
this.handleDroppedFiles(e.target.files);
});
}

// Helper function to prevent default behaviors
function preventDefaults(e) {
e.preventDefault();
e.stopPropagation();
}
}

/**
* Handle dropped files
* @param {FileList} files Files dropped by the user
*/
async handleDroppedFiles(files) {
if (files.length === 0) return;

// Show upload progress container
let progressContainer = document.getElementById('batch-upload-progress');

if (!progressContainer) {
progressContainer = document.createElement('div');
progressContainer.id = 'batch-upload-progress';
progressContainer.className = 'batch-upload-progress';
progressContainer.innerHTML = `
<div class="card">
<div class="card-header d-flex justify-content-between align-items-center">
<h5 class="mb-0">Uploading Files</h5>
<button type="button" class="btn-close" aria-label="Close"></button>
</div>
<div class="card-body">
<div id="upload-items"></div>
<div class="d-flex justify-content-between mt-3">
<span id="upload-status">Preparing to upload...</span>
<button id="cancel-uploads" class="btn btn-sm btn-outline-danger">Cancel</button>
</div>
</div>
</div>
`;

document.body.appendChild(progressContainer);

// Add event listener to close button
const closeBtn = progressContainer.querySelector('.btn-close');
closeBtn.addEventListener('click', () => {
progressContainer.remove();
});

// Add event listener to cancel button
const cancelBtn = document.getElementById('cancel-uploads');
cancelBtn.addEventListener('click', () => {
// TODO: Implement cancel functionality
progressContainer.remove();
});

}

const uploadItems = document.getElementById('upload-items');
const uploadStatus = document.getElementById('upload-status');

// Process each file
for (let i = 0; i < files.length; i++) {
const file = files[i];

// Create upload item
const uploadItem = document.createElement('div');
uploadItem.className = 'upload-item';
uploadItem.innerHTML = `
<div class="d-flex justify-content-between align-items-center mb-1">
<span class="upload-filename">${this.truncateFilename(file.name, 30)}</span>
<span class="upload-size">${this.formatFileSize(file.size)}</span>
</div>
<div class="progress">
<div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
</div>
`;

uploadItems.appendChild(uploadItem);

// Determine media type based on file type
let mediaType = 'document';
if (file.type.startsWith('image/')) {
mediaType = 'image';
} else if (file.type.startsWith('audio/')) {
mediaType = 'audio';
} else if (file.type.startsWith('video/')) {
mediaType = 'video';
}

// Create form data
const formData = new FormData();
formData.append('file', file);
formData.append('title', file.name.split('.')[0]);
formData.append('type', mediaType);

try {
// Update status
uploadStatus.textContent = `Uploading ${i + 1} of ${files.length}`;

// Upload file with progress tracking
const progressBar = uploadItem.querySelector('.progress-bar');

const response = await this.uploadFileWithProgress(formData, (progress) => {
progressBar.style.width = `${progress}%`;
progressBar.setAttribute('aria-valuenow', progress);
});

if (response.success) {
// Mark as complete
uploadItem.classList.add('upload-success');
progressBar.classList.add('bg-success');
} else {
// Mark as failed
uploadItem.classList.add('upload-failed');
progressBar.classList.add('bg-danger');

// Add error message
const errorMsg = document.createElement('div');
errorMsg.className = 'upload-error';
errorMsg.textContent = response.error || 'Upload failed';
uploadItem.appendChild(errorMsg);
}
} catch (error) {
console.error('Error uploading file:', error);

// Mark as failed
uploadItem.classList.add('upload-failed');
const progressBar = uploadItem.querySelector('.progress-bar');
progressBar.classList.add('bg-danger');

// Add error message
const errorMsg = document.createElement('div');
errorMsg.className = 'upload-error';
errorMsg.textContent = 'Upload failed';
uploadItem.appendChild(errorMsg);
}
}

// Update status
uploadStatus.textContent = 'Upload complete';

// Reload media items
await this.loadMediaItems();

// Reload media types
await this.loadMediaTypes();
}

/**
* Upload file with progress tracking
* @param {FormData} formData Form data with file and metadata
* @param {Function} progressCallback Callback for progress updates
* @returns {Promise<Object>} Upload response
*/
uploadFileWithProgress(formData, progressCallback) {
return new Promise((resolve, reject) => {
const xhr = new XMLHttpRequest();

xhr.open('POST', '/api/media-library/upload');
xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);

xhr.upload.addEventListener('progress', (event) => {
if (event.lengthComputable) {
const progress = Math.round((event.loaded / event.total) * 100);
progressCallback(progress);
}
});

xhr.addEventListener('load', () => {
if (xhr.status >= 200 && xhr.status < 300) {
try {
const response = JSON.parse(xhr.responseText);
resolve(response);
} catch (error) {
reject(new Error('Invalid response format'));
}
} else {
try {
const errorResponse = JSON.parse(xhr.responseText);
resolve({ success: false, error: errorResponse.error || 'Upload failed' });
} catch (error) {
reject(new Error(`Upload failed with status ${xhr.status}`));
}
}
});

xhr.addEventListener('error', () => {
        const overlay = document.getElementById('drop-overlay');
        if (overlay) {
          overlay.remove();
        }
      }, false);
    });
    
    // Handle dropped files
    mediaContainer.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleDroppedFiles(files);
      }
    }, false);
    
    // Add styles for drag and drop
    this.addDragAndDropStyles();
  }
  
  /**
   * Handle dropped files
   * @param {FileList} files Files dropped by the user
   */
  async handleDroppedFiles(files) {
    if (files.length === 0) return;
    
    // Show upload progress container
    let progressContainer = document.getElementById('batch-upload-progress');
    
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.id = 'batch-upload-progress';
      progressContainer.className = 'batch-upload-progress';
      progressContainer.innerHTML = `
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Uploading Files</h5>
            <button type="button" class="btn-close" aria-label="Close"></button>
          </div>
          <div class="card-body">
            <div id="upload-items"></div>
            <div class="d-flex justify-content-between mt-3">
              <span id="upload-status">Preparing to upload...</span>
              <button id="cancel-uploads" class="btn btn-sm btn-outline-danger">Cancel</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(progressContainer);
      
      // Add event listener to close button
      const closeBtn = progressContainer.querySelector('.btn-close');
      closeBtn.addEventListener('click', () => {
        progressContainer.remove();
      });
      
      // Add event listener to cancel button
      const cancelBtn = document.getElementById('cancel-uploads');
      cancelBtn.addEventListener('click', () => {
        // TODO: Implement cancel functionality
        progressContainer.remove();
      });
    }
    
    const uploadItems = document.getElementById('upload-items');
    const uploadStatus = document.getElementById('upload-status');
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Create upload item
      const uploadItem = document.createElement('div');
      uploadItem.className = 'upload-item';
      uploadItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="upload-filename">${this.truncateFilename(file.name, 30)}</span>
          <span class="upload-size">${this.formatFileSize(file.size)}</span>
        </div>
        <div class="progress">
          <div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      `;
      
      uploadItems.appendChild(uploadItem);
      
      // Determine media type based on file type
      let mediaType = 'document';
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('audio/')) {
        mediaType = 'audio';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.split('.')[0]);
      formData.append('type', mediaType);
      
      try {
        // Update status
        uploadStatus.textContent = `Uploading ${i + 1} of ${files.length}`;
        
        // Upload file with progress tracking
        const progressBar = uploadItem.querySelector('.progress-bar');
        
        const response = await this.uploadFileWithProgress(formData, (progress) => {
          progressBar.style.width = `${progress}%`;
          progressBar.setAttribute('aria-valuenow', progress);
        });
        
        if (response.success) {
          // Mark as complete
          uploadItem.classList.add('upload-success');
          progressBar.classList.add('bg-success');
        } else {
          // Mark as failed
          uploadItem.classList.add('upload-failed');
          progressBar.classList.add('bg-danger');
          
          // Add error message
          const errorMsg = document.createElement('div');
          errorMsg.className = 'upload-error';
          errorMsg.textContent = response.error || 'Upload failed';
          uploadItem.appendChild(errorMsg);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        
        // Mark as failed
        uploadItem.classList.add('upload-failed');
        const progressBar = uploadItem.querySelector('.progress-bar');
        progressBar.classList.add('bg-danger');
        
        // Add error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'upload-error';
        errorMsg.textContent = 'Upload failed';
        uploadItem.appendChild(errorMsg);
      }
    }
    
    // Update status
    uploadStatus.textContent = 'Upload complete';
    
    // Reload media items
    await this.loadMediaItems();
    
    // Reload media types
    await this.loadMediaTypes();
  }
  
  /**
   * Upload file with progress tracking
   * @param {FormData} formData Form data with file and metadata
   * @param {Function} progressCallback Callback for progress updates
   * @returns {Promise<Object>} Upload response
   */
  uploadFileWithProgress(formData, progressCallback) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', '/api/media-library/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          progressCallback(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            resolve({ success: false, error: errorResponse.error || 'Upload failed' });
          } catch (error) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });
      
      xhr.send(formData);
    });
  }
  
  /**
   * Add styles for drag and drop functionality
   */
  addDragAndDropStyles() {
    // Check if styles already exist
    if (document.getElementById('drag-drop-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'drag-drop-styles';
    style.textContent = `
      .drag-active {
        position: relative;
      }
      
      .drop-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(13, 110, 253, 0.2);
        border: 2px dashed #0d6efd;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      
      .drop-message {
        text-align: center;
        color: #0d6efd;
        background-color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }
      
      .batch-upload-progress {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        width: 400px;
        max-width: 90vw;
        z-index: 1050;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }
      
      .upload-item {
        margin-bottom: 0.75rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #e9ecef;
      }
      
      .upload-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      
      .upload-filename {
        font-weight: 500;
      }
      
      .upload-size {
        color: #6c757d;
        font-size: 0.875rem;
      }
      
      .upload-error {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Helper functions
   */
  truncateFilename(filename, maxLength) {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop();
    const name = filename.substring(0, filename.length - extension.length - 1);
    
    if (name.length <= maxLength - 3 - extension.length) {
      return filename;
    }
    
    return name.substring(0, maxLength - 3 - extension.length) + '...' + extension;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  showAlert(type, message, containerId = 'media-alert') {
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
        if (container.contains(alert)) {
          container.removeChild(alert);
        }
      }, 150);
    }, 5000);
  }
}

/**
 * Initialize the media library
 * @param {Function} callback Optional callback for media selection
 * @returns {MediaLibrary} Media library instance
 */
export function initMediaLibrary(callback = null) {
  const mediaLibrary = new MediaLibrary();
  mediaLibrary.init(callback);
  
  // Make mediaLibrary globally accessible
  window.mediaLibrary = mediaLibrary;
  
  return mediaLibrary;
}

// Initialize the media library when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the media library page and not already initialized
  if (document.getElementById('media-container') && !window.mediaLibrary) {
    initMediaLibrary();
  }
});
