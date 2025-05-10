/**
 * Soundmaster Admin Dashboard
 * News management functionality
 */

// Global variables
let currentPage = 1;
let totalPages = 1;
let pageSize = 10;
let quillEditor;
let selectedMedia = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Only run on the news page
  if (!window.location.pathname.includes('news.html')) {
    return;
  }

  // Initialize Quill editor
  quillEditor = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
      ]
    },
    placeholder: 'Write your news article content here...'
  });

  // Update hidden content field when editor changes
  quillEditor.on('text-change', function() {
    document.getElementById('content').value = quillEditor.root.innerHTML;
  });

  // Set up event listeners
  setupEventListeners();

  // Check if we're editing an existing article
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get('id');

  if (newsId) {
    // Load existing news article
    await loadNewsItem(newsId);
  } else {
    // Load news list
    await loadNewsList();
  }
});

/**
 * Set up event listeners for the news page
 */
function setupEventListeners() {
  // Create news button
  const createNewsBtn = document.getElementById('createNewsBtn');
  if (createNewsBtn) {
    createNewsBtn.addEventListener('click', () => {
      showNewsEditView();
    });
  }

  // Back to list button
  const backToListBtn = document.getElementById('backToListBtn');
  if (backToListBtn) {
    backToListBtn.addEventListener('click', () => {
      showNewsListView();
    });
  }

  // News form submission
  const newsForm = document.getElementById('newsForm');
  if (newsForm) {
    newsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveNews(true);
    });
  }

  // Save draft button
  const saveDraftBtn = document.getElementById('saveDraftBtn');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', async () => {
      await saveNews(false);
    });
  }

  // Delete news button
  const deleteNewsBtn = document.getElementById('deleteNewsBtn');
  if (deleteNewsBtn) {
    deleteNewsBtn.addEventListener('click', async () => {
      await deleteNews();
    });
  }

  // Search button
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      currentPage = 1;
      loadNewsList();
    });
  }

  // Search input (search on enter)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        currentPage = 1;
        loadNewsList();
      }
    });
  }

  // Status filter
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      currentPage = 1;
      loadNewsList();
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
        document.getElementById('featuredImage').value = selectedMedia.id;
        
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
 * Load the list of news articles
 */
async function loadNewsList() {
  UI.showSpinner();
  
  try {
    const searchQuery = document.getElementById('searchInput').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    // Show the list view
    showNewsListView();
    
    // Set loading state
    document.getElementById('newsTableBody').innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    `;
    
    // Fetch news articles
    const response = await api.getContent('news', {
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      status: statusFilter !== 'all' ? statusFilter : ''
    });
    
    if (response.success) {
      const { content, pagination } = response;
      
      // Update pagination
      totalPages = pagination.totalPages || 1;
      updatePagination();
      
      // Update news count
      document.getElementById('newsCount').textContent = pagination.totalItems || 0;
      
      // Render news table
      renderNewsTable(content);
    } else {
      throw new Error(response.error || 'Failed to load news');
    }
  } catch (error) {
    console.error('Error loading news list:', error);
    document.getElementById('newsTableBody').innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">
          Failed to load news. Please try again.
        </td>
      </tr>
    `;
    UI.showToast('Failed to load news articles', 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Render the news table with data
 * @param {Array} newsItems - List of news articles
 */
function renderNewsTable(newsItems) {
  const tableBody = document.getElementById('newsTableBody');
  
  if (!newsItems || newsItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          No news articles found.
        </td>
      </tr>
    `;
    return;
  }
  
  const rows = newsItems.map(item => `
    <tr>
      <td>${item.title}</td>
      <td>
        <span class="badge bg-${item.is_published ? 'success' : 'secondary'}">
          ${item.is_published ? 'Published' : 'Draft'}
        </span>
      </td>
      <td>${UI.formatDate(item.published_at || item.created_at)}</td>
      <td>
        <div class="action-buttons">
          <a href="news.html?id=${item.id}" class="btn btn-sm btn-primary">
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-sm btn-danger delete-news" data-id="${item.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  tableBody.innerHTML = rows;
  
  // Add event listeners to delete buttons
  const deleteButtons = document.querySelectorAll('.delete-news');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = button.getAttribute('data-id');
      await deleteNewsFromList(id);
    });
  });
}

/**
 * Update pagination controls
 */
function updatePagination() {
  const pagination = document.getElementById('newsPagination');
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
        loadNewsList();
      }
    });
  });
}

/**
 * Load a single news item for editing
 * @param {number} id - News ID
 */
async function loadNewsItem(id) {
  UI.showSpinner();
  
  try {
    const response = await api.getContentItem(id);
    
    if (response.success && response.content) {
      const newsItem = response.content;
      
      // Show edit view
      showNewsEditView(true);
      
      // Set form values
      document.getElementById('newsId').value = newsItem.id;
      document.getElementById('title').value = newsItem.title || '';
      document.getElementById('excerpt').value = newsItem.excerpt || '';
      
      // Set Quill editor content
      quillEditor.root.innerHTML = newsItem.content || '';
      document.getElementById('content').value = newsItem.content || '';
      
      // Set featured image
      document.getElementById('featuredImage').value = newsItem.featured_image || '';
      
      // Set publish date
      if (newsItem.published_at) {
        const publishDate = new Date(newsItem.published_at);
        const formattedDate = publishDate.toISOString().slice(0, 16);
        document.getElementById('publishDate').value = formattedDate;
      } else {
        document.getElementById('publishDate').value = '';
      }
      
      // Set published status
      document.getElementById('isPublished').checked = newsItem.is_published || false;
      
      // Show delete button
      document.getElementById('deleteNewsBtn').style.display = 'block';
      
      // Update page title
      document.getElementById('newsEditTitle').textContent = 'Edit News Article';
    } else {
      throw new Error(response.error || 'Failed to load news article');
    }
  } catch (error) {
    console.error('Error loading news item:', error);
    UI.showToast('Failed to load news article', 'error');
    showNewsListView();
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Save a news article
 * @param {boolean} publish - Whether to publish the article
 */
async function saveNews(publish) {
  UI.showSpinner();
  
  try {
    // Get form values
    const id = document.getElementById('newsId').value;
    const title = document.getElementById('title').value;
    const excerpt = document.getElementById('excerpt').value;
    const content = document.getElementById('content').value;
    const featuredImage = document.getElementById('featuredImage').value;
    const publishDate = document.getElementById('publishDate').value;
    const isPublished = publish || document.getElementById('isPublished').checked;
    
    // Validate required fields
    if (!title) {
      UI.showToast('Title is required', 'warning');
      return;
    }
    
    // Create data object
    const data = {
      type: 'news',
      title,
      excerpt,
      content,
      featured_image: featuredImage,
      is_published: isPublished
    };
    
    // Add publish date if provided
    if (publishDate) {
      data.published_at = new Date(publishDate).toISOString();
    }
    
    let response;
    
    if (id) {
      // Update existing article
      response = await api.updateContent(id, data);
    } else {
      // Create new article
      response = await api.createContent(data);
    }
    
    if (response.success) {
      UI.showToast(`News article ${id ? 'updated' : 'created'} successfully`, 'success');
      
      // Redirect to list view or reload the current item
      if (id) {
        await loadNewsItem(id);
      } else {
        showNewsListView();
        await loadNewsList();
      }
    } else {
      throw new Error(response.error || `Failed to ${id ? 'update' : 'create'} news article`);
    }
  } catch (error) {
    console.error('Error saving news:', error);
    UI.showToast(`Failed to save news article: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Delete a news article from the edit view
 */
async function deleteNews() {
  const id = document.getElementById('newsId').value;
  
  if (!id) {
    UI.showToast('No news article selected', 'warning');
    return;
  }
  
  // Confirm deletion
  const confirmed = await UI.confirm('Are you sure you want to delete this news article? This action cannot be undone.');
  
  if (!confirmed) {
    return;
  }
  
  UI.showSpinner();
  
  try {
    const response = await api.deleteContent(id);
    
    if (response.success) {
      UI.showToast('News article deleted successfully', 'success');
      showNewsListView();
      await loadNewsList();
    } else {
      throw new Error(response.error || 'Failed to delete news article');
    }
  } catch (error) {
    console.error('Error deleting news:', error);
    UI.showToast(`Failed to delete news article: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Delete a news article from the list view
 * @param {number} id - News ID
 */
async function deleteNewsFromList(id) {
  if (!id) return;
  
  // Confirm deletion
  const confirmed = await UI.confirm('Are you sure you want to delete this news article? This action cannot be undone.');
  
  if (!confirmed) {
    return;
  }
  
  UI.showSpinner();
  
  try {
    const response = await api.deleteContent(id);
    
    if (response.success) {
      UI.showToast('News article deleted successfully', 'success');
      await loadNewsList();
    } else {
      throw new Error(response.error || 'Failed to delete news article');
    }
  } catch (error) {
    console.error('Error deleting news:', error);
    UI.showToast(`Failed to delete news article: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Show the news list view
 */
function showNewsListView() {
  document.getElementById('newsList').style.display = 'block';
  document.getElementById('newsEdit').style.display = 'none';
  
  // Clear URL parameters
  window.history.replaceState({}, document.title, window.location.pathname);
}

/**
 * Show the news edit view
 * @param {boolean} isEditing - Whether we're editing an existing article
 */
function showNewsEditView(isEditing = false) {
  document.getElementById('newsList').style.display = 'none';
  document.getElementById('newsEdit').style.display = 'block';
  
  if (!isEditing) {
    // Reset form for new article
    document.getElementById('newsForm').reset();
    document.getElementById('newsId').value = '';
    quillEditor.root.innerHTML = '';
    document.getElementById('content').value = '';
    document.getElementById('deleteNewsBtn').style.display = 'none';
    document.getElementById('newsEditTitle').textContent = 'Create News Article';
    
    // Set default publish date to now
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16);
    document.getElementById('publishDate').value = formattedDate;
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
