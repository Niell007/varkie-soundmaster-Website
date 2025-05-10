/**
 * Media Picker Component for Soundmaster Admin Dashboard
 * This component allows for selecting media from the media library
 * and integrating it with content editors.
 * Includes drag-and-drop functionality and image optimization preview.
 */

class MediaPicker {
  constructor(options = {}) {
    this.targetInput = options.targetInput || null;
    this.previewContainer = options.previewContainer || null;
    this.buttonContainer = options.buttonContainer || null;
    this.mediaType = options.mediaType || 'all';
    this.multiple = options.multiple || false;
    this.selectedMedia = options.initialSelection || [];
    this.onSelect = options.onSelect || null;
    this.modalId = 'media-picker-modal';
    this.isDragging = false;
    this.optimizeImages = options.optimizeImages !== false; // Enable image optimization by default
    
    // Create modal if it doesn't exist
    this.createModal();
    
    // Initialize the picker
    this.init();
  }
  
  /**
   * Initialize the media picker
   */
  init() {
    // Create select button
    this.createSelectButton();
    
    // Set up drag and drop functionality
    if (this.previewContainer) {
      this.setupDragAndDrop();
    }
    
    // Render initial selection
    if (this.previewContainer && this.selectedMedia.length > 0) {
      this.renderPreview();
    }
    
    // Update target input value
    if (this.targetInput && this.selectedMedia.length > 0) {
      this.updateInputValue();
    }
    
    // Add styles for drag and drop
    this.addDragAndDropStyles();
  }
  
  /**
   * Create select button
   */
  createSelectButton() {
    if (!this.buttonContainer) return;
    
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline-primary';
    button.innerHTML = '<i class="bi bi-images me-2"></i>Select Media';
    
    button.addEventListener('click', () => {
      this.openMediaPicker();
    });
    
    this.buttonContainer.appendChild(button);
  }
  
  /**
   * Create modal for media picker
   */
  createModal() {
    // Check if modal already exists
    if (document.getElementById(this.modalId)) return;
    
    const modalHtml = `
      <div class="modal fade" id="${this.modalId}" tabindex="-1" aria-labelledby="${this.modalId}-label" aria-hidden="true">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${this.modalId}-label">Select Media</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div id="${this.modalId}-container">
                <!-- Media library content will be loaded here -->
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="${this.modalId}-select-btn">Select</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Append modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Add event listener to select button
    document.getElementById(`${this.modalId}-select-btn`).addEventListener('click', () => {
      this.confirmSelection();
    });
  }
  
  /**
   * Open media picker modal
   */
  async openMediaPicker() {
    // Initialize modal
    const modal = new bootstrap.Modal(document.getElementById(this.modalId));
    
    // Load media library
    const container = document.getElementById(`${this.modalId}-container`);
    
    // Show loading indicator
    container.innerHTML = `
      <div class="d-flex justify-content-center p-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
    
    try {
      // Load media library template
      const response = await fetch('templates/media-library.html');
      const html = await response.text();
      
      // Set container content
      container.innerHTML = html;
      
      // Initialize media library with callback
      import('./media-library.js')
        .then(module => {
          if (typeof module.initMediaLibrary === 'function') {
            // Initialize with selection callback
            this.mediaLibrary = module.initMediaLibrary(this.handleMediaSelection.bind(this));
            
            // Set selection mode based on multiple option
            if (this.multiple) {
              this.mediaLibrary.toggleSelectionMode();
            }
            
            // Pre-select media items
            if (this.selectedMedia.length > 0) {
              this.selectedMedia.forEach(item => {
                this.mediaLibrary.selectedItems.add(item.id);
              });
              this.mediaLibrary.updateSelectionUI();
              this.mediaLibrary.renderMediaGrid();
            }
          }
        })
        .catch(error => {
          console.error('Error loading media library:', error);
          container.innerHTML = '<div class="alert alert-danger">Failed to load media library</div>';
        });
    } catch (error) {
      console.error('Error loading media library template:', error);
      container.innerHTML = '<div class="alert alert-danger">Failed to load media library template</div>';
    }
    
    // Show modal
    modal.show();
  }
  
  /**
   * Handle media selection
   * @param {Object} mediaItem Selected media item
   */
  handleMediaSelection(mediaItem) {
    if (!this.multiple) {
      this.selectedMedia = [mediaItem];
      this.confirmSelection();
    }
  }
  
  /**
   * Confirm media selection
   */
  confirmSelection() {
    if (!this.mediaLibrary) return;
    
    if (this.multiple) {
      // Get selected media items
      const selectedIds = Array.from(this.mediaLibrary.selectedItems);
      
      if (selectedIds.length === 0) {
        return;
      }
      
      // Get media items
      this.selectedMedia = this.mediaLibrary.mediaItems.filter(item => 
        selectedIds.includes(item.id)
      );
    }
    
    // Update preview
    if (this.previewContainer) {
      this.renderPreview();
    }
    
    // Update input value
    if (this.targetInput) {
      this.updateInputValue();
    }
    
    // Call onSelect callback
    if (typeof this.onSelect === 'function') {
      this.onSelect(this.selectedMedia);
    }
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById(this.modalId));
    if (modal) {
      modal.hide();
    }
  }
  
  /**
   * Render preview of selected media
   */
  renderPreview() {
    if (!this.previewContainer) return;
    
    // Clear preview container
    this.previewContainer.innerHTML = '';
    
    if (this.selectedMedia.length === 0) {
      this.previewContainer.innerHTML = '<div class="text-muted">No media selected</div>';
      return;
    }
    
    // Create preview items
    this.selectedMedia.forEach(item => {
      const previewItem = document.createElement('div');
      previewItem.className = 'media-preview-item';
      
      // Create preview content based on media type
      if (item.type === 'image') {
        previewItem.innerHTML = `
          <div class="position-relative">
            <img src="/api/media-library/${item.id}/url" class="img-thumbnail" alt="${item.filename}">
            <button type="button" class="btn-close position-absolute top-0 end-0 m-1" aria-label="Remove" data-id="${item.id}"></button>
          </div>
          <div class="small text-truncate mt-1">${item.filename}</div>
        `;
      } else if (item.type === 'audio') {
        previewItem.innerHTML = `
          <div class="position-relative p-2 border rounded">
            <i class="bi bi-file-earmark-music fs-1 d-block text-center"></i>
            <button type="button" class="btn-close position-absolute top-0 end-0 m-1" aria-label="Remove" data-id="${item.id}"></button>
          </div>
          <div class="small text-truncate mt-1">${item.filename}</div>
        `;
      } else if (item.type === 'video') {
        previewItem.innerHTML = `
          <div class="position-relative p-2 border rounded">
            <i class="bi bi-file-earmark-play fs-1 d-block text-center"></i>
            <button type="button" class="btn-close position-absolute top-0 end-0 m-1" aria-label="Remove" data-id="${item.id}"></button>
          </div>
          <div class="small text-truncate mt-1">${item.filename}</div>
        `;
      } else {
        previewItem.innerHTML = `
          <div class="position-relative p-2 border rounded">
            <i class="bi bi-file-earmark-text fs-1 d-block text-center"></i>
            <button type="button" class="btn-close position-absolute top-0 end-0 m-1" aria-label="Remove" data-id="${item.id}"></button>
          </div>
          <div class="small text-truncate mt-1">${item.filename}</div>
        `;
      }
      
      // Add remove button event listener
      const removeButton = previewItem.querySelector('.btn-close');
      if (removeButton) {
        removeButton.addEventListener('click', () => {
          this.removeMedia(item.id);
        });
      }
      
      this.previewContainer.appendChild(previewItem);
    });
  }
  
  /**
   * Update input value with selected media
   */
  updateInputValue() {
    if (!this.targetInput) return;
    
    if (this.selectedMedia.length === 0) {
      this.targetInput.value = '';
      return;
    }
    
    // Set input value as JSON string of selected media IDs
    const mediaIds = this.selectedMedia.map(item => item.id);
    this.targetInput.value = this.multiple ? JSON.stringify(mediaIds) : mediaIds[0];
  }
  
  /**
   * Remove media from selection
   * @param {string} id Media ID to remove
   */
  removeMedia(id) {
    this.selectedMedia = this.selectedMedia.filter(item => item.id !== id);
    
    // Update preview
    this.renderPreview();
    
    // Update input value
    this.updateInputValue();
    
    // Call onSelect callback
    if (typeof this.onSelect === 'function') {
      this.onSelect(this.selectedMedia);
    }
  }
  
  /**
   * Set selected media
   * @param {Array|Object} media Media item or array of media items
   */
  setMedia(media) {
    if (Array.isArray(media)) {
      this.selectedMedia = this.multiple ? media : media.slice(0, 1);
    } else if (media && typeof media === 'object') {
      this.selectedMedia = [media];
    } else {
      this.selectedMedia = [];
    }
    
    // Update preview
    if (this.previewContainer) {
      this.renderPreview();
    }
    
    // Update input value
    if (this.targetInput) {
      this.updateInputValue();
    }
  }
  
  /**
   * Set up drag and drop functionality for the preview container
   */
  setupDragAndDrop() {
    if (!this.previewContainer) return;
    
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
    this.previewContainer.appendChild(overlay);
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.previewContainer.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      this.previewContainer.addEventListener(eventName, () => {
        this.previewContainer.classList.add('drag-active');
        overlay.classList.remove('d-none');
        this.isDragging = true;
      }, false);
    });
    
    // Remove highlight when item is dragged away
    ['dragleave', 'drop'].forEach(eventName => {
      this.previewContainer.addEventListener(eventName, () => {
        this.previewContainer.classList.remove('drag-active');
        overlay.classList.add('d-none');
        this.isDragging = false;
      }, false);
    });
    
    // Handle dropped files
    this.previewContainer.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      this.handleDroppedFiles(files);
    }, false);
    
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
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'text-center p-3';
    loadingIndicator.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Uploading files...</p>
    `;
    this.previewContainer.appendChild(loadingIndicator);
    
    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check if file is an image and should be optimized
        if (this.optimizeImages && file.type.startsWith('image/')) {
          await this.uploadOptimizedImage(file);
        } else {
          await this.uploadFile(file);
        }
      }
      
      // Remove loading indicator
      this.previewContainer.removeChild(loadingIndicator);
      
      // Show success message
      this.showAlert('success', 'Files uploaded successfully');
    } catch (error) {
      console.error('Error uploading files:', error);
      
      // Remove loading indicator
      if (this.previewContainer.contains(loadingIndicator)) {
        this.previewContainer.removeChild(loadingIndicator);
      }
      
      // Show error message
      this.showAlert('danger', 'Error uploading files');
    }
  }
  
  /**
   * Upload an optimized image
   * @param {File} file Image file to upload
   * @returns {Promise<Object>} Uploaded media item
   */
  uploadOptimizedImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Optimize image
          const optimizedDataUrl = await this.createOptimizedPreview(file, e.target.result);
          
          // Convert data URL to Blob
          const optimizedBlob = this.dataURLtoBlob(optimizedDataUrl);
          
          // Create new file with optimized blob
          const optimizedFile = new File([optimizedBlob], file.name, { type: 'image/jpeg' });
          
          // Upload optimized file
          const mediaItem = await this.uploadFile(optimizedFile);
          resolve(mediaItem);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Upload a file to the media library
   * @param {File} file File to upload
   * @returns {Promise<Object>} Uploaded media item
   */
  async uploadFile(file) {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.split('.')[0]);
    
    // Determine media type based on file type
    let mediaType = 'document';
    if (file.type.startsWith('image/')) {
      mediaType = 'image';
    } else if (file.type.startsWith('audio/')) {
      mediaType = 'audio';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    }
    formData.append('type', mediaType);
    
    // Upload file
    const response = await fetch('/api/media-library/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }
    
    // Add to selected media
    if (this.multiple) {
      this.selectedMedia.push(data.media);
    } else {
      this.selectedMedia = [data.media];
    }
    
    // Update preview
    this.renderPreview();
    
    // Update input value
    this.updateInputValue();
    
    // Call onSelect callback
    if (typeof this.onSelect === 'function') {
      this.onSelect(this.selectedMedia);
    }
    
    return data.media;
  }
  
  /**
   * Create optimized preview of an image
   * @param {File} file Original image file
   * @param {string} dataUrl Data URL of the original image
   * @returns {Promise<string>} Data URL of the optimized image
   */
  createOptimizedPreview(file, dataUrl) {
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
  }
  
  /**
   * Convert data URL to Blob
   * @param {string} dataURL Data URL to convert
   * @returns {Blob} Converted Blob
   */
  dataURLtoBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  }
  
  /**
   * Add styles for drag and drop functionality
   */
  addDragAndDropStyles() {
    // Already added in the global style element
  }
  
  /**
   * Show alert message
   * @param {string} type Alert type (success, danger, etc.)
   * @param {string} message Alert message
   */
  showAlert(type, message) {
    // Create alert container if it doesn't exist
    let alertContainer = document.getElementById('media-picker-alert');
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'media-picker-alert';
      alertContainer.className = 'position-fixed bottom-0 end-0 p-3';
      alertContainer.style.zIndex = '1050';
      document.body.appendChild(alertContainer);
    }
    
    // Create alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    alertContainer.appendChild(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => {
        if (alertContainer.contains(alert)) {
          alertContainer.removeChild(alert);
        }
      }, 150);
    }, 5000);
  }
}

/**
 * Initialize a new media picker
 * @param {Object} options Configuration options
 * @returns {MediaPicker} Media picker instance
 */
export function initMediaPicker(options) {
  return new MediaPicker(options);
}

/**
 * Helper function to format file size
 * @param {number} bytes File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Add CSS for media picker
const style = document.createElement('style');
style.textContent = `
  .media-preview-item {
    display: inline-block;
    width: 120px;
    margin: 0.5rem;
    vertical-align: top;
  }
  
  .media-preview-item img {
    width: 100%;
    height: 100px;
    object-fit: cover;
  }
  
  .drag-active {
    position: relative;
    border: 2px dashed #0d6efd;
    background-color: rgba(13, 110, 253, 0.1);
    border-radius: 0.25rem;
  }
  
  .drop-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(13, 110, 253, 0.2);
    border: 2px dashed #0d6efd;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .drop-message {
    text-align: center;
    color: #0d6efd;
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.25rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }
  
  .image-preview-container {
    margin-bottom: 1rem;
  }
  
  .optimized-preview {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
  }
`;
document.head.appendChild(style);
