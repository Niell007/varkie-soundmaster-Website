/**
 * Media Picker Component
 * Reusable component for selecting media from the media library
 */

class MediaPicker {
  /**
   * Initialize the media picker
   * @param {Object} options - Configuration options
   * @param {string} options.targetInput - ID of the input field to receive the selected media URL
   * @param {string} options.targetPreview - ID of the element to preview the selected media
   * @param {string} options.mediaType - Type of media to filter by (image, audio, video, document, all)
   * @param {Function} options.onSelect - Callback function when media is selected
   */
  constructor(options = {}) {
    this.options = {
      targetInput: null,
      targetPreview: null,
      mediaType: 'all',
      onSelect: null,
      ...options
    };
    
    this.modal = null;
    this.mediaItems = [];
    this.selectedItem = null;
    this.currentPage = 1;
    this.totalPages = 1;
    this.searchQuery = '';
    
    this.init();
  }
  
  /**
   * Initialize the media picker
   */
  init() {
    // Create modal if it doesn't exist
    if (!document.getElementById('mediaPicker')) {
      this.createModal();
    } else {
      this.modal = new bootstrap.Modal(document.getElementById('mediaPicker'));
    }
    
    // Add event listeners
    this.addEventListeners();
  }
  
  /**
   * Create the media picker modal
   */
  createModal() {
    const modalHtml = `
      <div class="modal fade" id="mediaPicker" tabindex="-1" aria-labelledby="mediaPickerLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="mediaPickerLabel">Select Media</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-8">
                  <div class="input-group">
                    <input type="text" class="form-control" id="mediaSearchInput" placeholder="Search media...">
                    <button class="btn btn-outline-secondary" type="button" id="mediaSearchBtn">
                      <i class="fas fa-search"></i>
                    </button>
                  </div>
                </div>
                <div class="col-md-4">
                  <select class="form-select" id="mediaTypeFilter">
                    <option value="all">All Media</option>
                    <option value="image">Images</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="document">Documents</option>
                  </select>
                </div>
              </div>
              
              <div class="media-grid" id="mediaGrid">
                <div class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
              
              <nav aria-label="Media pagination" class="mt-3">
                <ul class="pagination justify-content-center" id="mediaPagination">
                  <li class="page-item disabled">
                    <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
                  </li>
                  <li class="page-item active"><a class="page-link" href="#">1</a></li>
                  <li class="page-item disabled">
                    <a class="page-link" href="#">Next</a>
                  </li>
                </ul>
              </nav>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="selectMediaBtn" disabled>Select</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Append modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Initialize Bootstrap modal
    this.modal = new bootstrap.Modal(document.getElementById('mediaPicker'));
  }
  
  /**
   * Add event listeners to modal elements
   */
  addEventListeners() {
    // Search button
    const searchBtn = document.getElementById('mediaSearchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.searchQuery = document.getElementById('mediaSearchInput').value;
        this.currentPage = 1;
        this.loadMedia();
      });
    }
    
    // Search input (enter key)
    const searchInput = document.getElementById('mediaSearchInput');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchQuery = searchInput.value;
          this.currentPage = 1;
          this.loadMedia();
        }
      });
    }
    
    // Media type filter
    const typeFilter = document.getElementById('mediaTypeFilter');
    if (typeFilter) {
      typeFilter.addEventListener('change', () => {
        this.options.mediaType = typeFilter.value;
        this.currentPage = 1;
        this.loadMedia();
      });
    }
    
    // Select media button
    const selectBtn = document.getElementById('selectMediaBtn');
    if (selectBtn) {
      selectBtn.addEventListener('click', () => {
        this.selectMedia();
      });
    }
    
    // Modal shown event
    const mediaPickerModal = document.getElementById('mediaPicker');
    if (mediaPickerModal) {
      mediaPickerModal.addEventListener('shown.bs.modal', () => {
        // Set initial media type filter
        const typeFilter = document.getElementById('mediaTypeFilter');
        if (typeFilter) {
          typeFilter.value = this.options.mediaType;
        }
        
        // Clear search
        const searchInput = document.getElementById('mediaSearchInput');
        if (searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
        }
        
        // Reset pagination
        this.currentPage = 1;
        
        // Load media
        this.loadMedia();
      });
    }
  }
  
  /**
   * Load media from the API
   */
  async loadMedia() {
    const mediaGrid = document.getElementById('mediaGrid');
    if (!mediaGrid) return;
    
    // Show loading spinner
    mediaGrid.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        type: this.options.mediaType,
        page: this.currentPage,
        limit: 20
      });
      
      if (this.searchQuery) {
        params.append('search', this.searchQuery);
      }
      
      // Fetch media from API
      const response = await api.getMedia({
        type: this.options.mediaType,
        page: this.currentPage,
        limit: 20,
        search: this.searchQuery
      });
      
      if (response.success) {
        this.mediaItems = response.media;
        this.totalPages = Math.ceil(response.total / response.limit);
        
        // Render media grid
        this.renderMediaGrid();
        
        // Render pagination
        this.renderPagination();
      } else {
        mediaGrid.innerHTML = `
          <div class="alert alert-danger">
            Failed to load media: ${response.error || 'Unknown error'}
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading media:', error);
      mediaGrid.innerHTML = `
        <div class="alert alert-danger">
          Failed to load media: ${error.message || 'Unknown error'}
        </div>
      `;
    }
  }
  
  /**
   * Render the media grid
   */
  renderMediaGrid() {
    const mediaGrid = document.getElementById('mediaGrid');
    if (!mediaGrid) return;
    
    if (this.mediaItems.length === 0) {
      mediaGrid.innerHTML = `
        <div class="alert alert-info">
          No media found. Upload media in the Media Library.
        </div>
      `;
      return;
    }
    
    // Clear previous selection
    this.selectedItem = null;
    document.getElementById('selectMediaBtn').disabled = true;
    
    // Create grid
    mediaGrid.innerHTML = '<div class="row g-3"></div>';
    const gridRow = mediaGrid.querySelector('.row');
    
    // Add media items
    this.mediaItems.forEach(item => {
      const mediaCard = document.createElement('div');
      mediaCard.className = 'col-md-3 col-sm-4 col-6';
      
      let mediaPreview = '';
      
      // Create preview based on media type
      if (item.type === 'image') {
        mediaPreview = `<img src="/api/media/${item.id}" class="card-img-top" alt="${item.title}" style="height: 120px; object-fit: cover;">`;
      } else if (item.type === 'audio') {
        mediaPreview = `
          <div class="card-img-top d-flex align-items-center justify-content-center bg-light" style="height: 120px;">
            <i class="fas fa-music fa-3x text-primary"></i>
          </div>
        `;
      } else if (item.type === 'video') {
        mediaPreview = `
          <div class="card-img-top d-flex align-items-center justify-content-center bg-light" style="height: 120px;">
            <i class="fas fa-video fa-3x text-primary"></i>
          </div>
        `;
      } else {
        mediaPreview = `
          <div class="card-img-top d-flex align-items-center justify-content-center bg-light" style="height: 120px;">
            <i class="fas fa-file fa-3x text-primary"></i>
          </div>
        `;
      }
      
      mediaCard.innerHTML = `
        <div class="card h-100 media-card" data-id="${item.id}">
          ${mediaPreview}
          <div class="card-body p-2">
            <p class="card-title small text-truncate mb-0" title="${item.title}">${item.title}</p>
            <p class="card-text small text-muted">${this.formatFileSize(item.size)}</p>
          </div>
        </div>
      `;
      
      gridRow.appendChild(mediaCard);
      
      // Add click event to select media
      const card = mediaCard.querySelector('.card');
      card.addEventListener('click', () => {
        // Remove selected class from all cards
        document.querySelectorAll('.media-card').forEach(c => {
          c.classList.remove('border-primary');
        });
        
        // Add selected class to clicked card
        card.classList.add('border-primary');
        
        // Set selected item
        this.selectedItem = item;
        
        // Enable select button
        document.getElementById('selectMediaBtn').disabled = false;
      });
    });
  }
  
  /**
   * Render pagination
   */
  renderPagination() {
    const pagination = document.getElementById('mediaPagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    // Previous button
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `<a class="page-link" href="#" tabindex="-1" aria-disabled="${this.currentPage === 1}">Previous</a>`;
    pagination.appendChild(prevItem);
    
    if (this.currentPage > 1) {
      prevItem.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentPage--;
        this.loadMedia();
      });
    }
    
    // Page numbers
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageItem = document.createElement('li');
      pageItem.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
      pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      pagination.appendChild(pageItem);
      
      if (i !== this.currentPage) {
        pageItem.addEventListener('click', (e) => {
          e.preventDefault();
          this.currentPage = i;
          this.loadMedia();
        });
      }
    }
    
    // Next button
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `<a class="page-link" href="#" tabindex="-1" aria-disabled="${this.currentPage === this.totalPages}">Next</a>`;
    pagination.appendChild(nextItem);
    
    if (this.currentPage < this.totalPages) {
      nextItem.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentPage++;
        this.loadMedia();
      });
    }
  }
  
  /**
   * Select media and close modal
   */
  selectMedia() {
    if (!this.selectedItem) return;
    
    // Get media URL
    const mediaUrl = `/api/media/${this.selectedItem.id}`;
    
    // Set input value if targetInput is provided
    if (this.options.targetInput) {
      const inputElement = document.getElementById(this.options.targetInput);
      if (inputElement) {
        inputElement.value = mediaUrl;
        // Trigger change event
        inputElement.dispatchEvent(new Event('change'));
      }
    }
    
    // Set preview if targetPreview is provided
    if (this.options.targetPreview) {
      const previewElement = document.getElementById(this.options.targetPreview);
      if (previewElement) {
        if (this.selectedItem.type === 'image') {
          previewElement.innerHTML = `<img src="${mediaUrl}" class="img-fluid" alt="${this.selectedItem.title}">`;
        } else if (this.selectedItem.type === 'audio') {
          previewElement.innerHTML = `<audio src="${mediaUrl}" controls></audio>`;
        } else if (this.selectedItem.type === 'video') {
          previewElement.innerHTML = `<video src="${mediaUrl}" controls class="img-fluid"></video>`;
        } else {
          previewElement.innerHTML = `<a href="${mediaUrl}" target="_blank" class="btn btn-sm btn-outline-primary">
            <i class="fas fa-download"></i> ${this.selectedItem.filename}
          </a>`;
        }
      }
    }
    
    // Call onSelect callback if provided
    if (typeof this.options.onSelect === 'function') {
      this.options.onSelect(this.selectedItem, mediaUrl);
    }
    
    // Close modal
    this.modal.hide();
  }
  
  /**
   * Format file size
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Open the media picker
   */
  open() {
    this.modal.show();
  }
}

// Add to global scope
window.MediaPicker = MediaPicker;
