/**
 * News Manager Component for Soundmaster Admin Dashboard
 * Handles CRUD operations for news articles
 */

// Import components
import { initMediaPicker } from './media-picker.js';
import { initRichEditor } from './rich-editor.js';

// State management
let newsItems = [];
let currentNewsItem = null;
let mediaPicker = null;
let richEditor = null;

// DOM Elements
const newsContainer = document.getElementById('news-container');
const newsForm = document.getElementById('news-form');
const newsModal = document.getElementById('news-modal');
const newsTitleInput = document.getElementById('news-title');
const newsContentEditor = document.getElementById('news-content');
const newsSummaryInput = document.getElementById('news-summary');
const newsImageInput = document.getElementById('news-image');
const imagePickerContainer = document.getElementById('image-picker-container');
const imagePreviewContainer = document.getElementById('image-preview-container');
const newsPublishDateInput = document.getElementById('news-publish-date');
const newsFeaturedInput = document.getElementById('news-featured');
const saveNewsBtn = document.getElementById('save-news');
const closeNewsModalBtn = document.getElementById('close-news-modal');
const newNewsBtn = document.getElementById('new-news-btn');

/**
 * Initialize the news manager
 */
export function initNewsManager() {
  // Fetch news items
  fetchNewsItems();
  
  // Event listeners
  if (newNewsBtn) {
    newNewsBtn.addEventListener('click', openNewNewsModal);
  }
  
  if (newsForm) {
    newsForm.addEventListener('submit', handleNewsSubmit);
  }
  
  if (closeNewsModalBtn) {
    closeNewsModalBtn.addEventListener('click', closeNewsModal);
  }
  
  // Initialize date picker with today's date as default
  if (newsPublishDateInput) {
    const today = new Date().toISOString().split('T')[0];
    newsPublishDateInput.value = today;
    newsPublishDateInput.min = today;
  }
  
  // Initialize components when the modal is shown
  if (newsModal) {
    newsModal.addEventListener('show.bs.modal', () => {
      // Initialize media picker if not already initialized
      if (!mediaPicker && imagePickerContainer && imagePreviewContainer) {
        mediaPicker = initMediaPicker({
          targetInput: newsImageInput,
          previewContainer: imagePreviewContainer,
          buttonContainer: imagePickerContainer,
          mediaType: 'image',
          multiple: false,
          onSelect: (selectedMedia) => {
            // Update the image input value with the selected media ID
            if (selectedMedia && selectedMedia.length > 0) {
              newsImageInput.value = selectedMedia[0].id;
            } else {
              newsImageInput.value = '';
            }
          }
        });
      }
      
      // Initialize rich text editor if not already initialized
      if (!richEditor && newsContentEditor) {
        richEditor = initRichEditor({
          targetElement: newsContentEditor,
          placeholder: 'Write your article content here...',
          height: '300px',
          initialValue: currentNewsItem ? currentNewsItem.content : '',
          onChange: (value) => {
            // Store the value in a hidden input if needed
            if (!newsContentEditor.value) {
              const hiddenInput = document.createElement('input');
              hiddenInput.type = 'hidden';
              hiddenInput.id = 'news-content-value';
              hiddenInput.name = 'content';
              newsContentEditor.parentNode.appendChild(hiddenInput);
            }
            document.getElementById('news-content-value').value = value;
          }
        });
      } else if (richEditor && currentNewsItem) {
        // Update rich editor content if editing an existing item
        richEditor.setValue(currentNewsItem.content || '');
      } else if (richEditor) {
        // Clear rich editor content if creating a new item
        richEditor.setValue('');
      }
      
      // Set initial media selection if editing an existing news item
      if (mediaPicker && currentNewsItem && currentNewsItem.image) {
        // If we have a media item ID, set it in the picker
        if (currentNewsItem.mediaItem) {
          mediaPicker.setMedia([currentNewsItem.mediaItem]);
        } else {
          // Just set the ID and let the picker handle it
          newsImageInput.value = currentNewsItem.image;
        }
      }
    });
  }
}

/**
 * Fetch all news items from the API
 */
async function fetchNewsItems() {
  try {
    const response = await fetch('/api/news');
    const data = await response.json();
    
    if (data.newsItems) {
      newsItems = data.newsItems;
      renderNewsItems();
    }
  } catch (error) {
    console.error('Error fetching news items:', error);
    showNotification('Error loading news items', 'error');
  }
}

/**
 * Render news items in the container
 */
function renderNewsItems() {
  if (!newsContainer) return;
  
  newsContainer.innerHTML = '';
  
  if (newsItems.length === 0) {
    newsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-newspaper fa-3x mb-3"></i>
        <h3>No News Articles Yet</h3>
        <p>Create your first news article to get started</p>
        <button id="empty-new-news-btn" class="btn btn-primary">
          <i class="fas fa-plus"></i> Create News Article
        </button>
      </div>
    `;
    
    const emptyNewNewsBtn = document.getElementById('empty-new-news-btn');
    if (emptyNewNewsBtn) {
      emptyNewNewsBtn.addEventListener('click', openNewNewsModal);
    }
    
    return;
  }
  
  // Create a table for news items
  const table = document.createElement('table');
  table.className = 'table table-hover';
  
  // Create table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Title</th>
      <th>Publish Date</th>
      <th>Featured</th>
      <th>Actions</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  newsItems.forEach(item => {
    const publishDate = new Date(item.publishDate).toLocaleDateString();
    
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>${item.title}</td>
      <td>${publishDate}</td>
      <td>${item.featured ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>'}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-news" data-id="${item.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-news" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
        <button class="btn btn-sm btn-info preview-news" data-id="${item.id}">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  newsContainer.appendChild(table);
  
  // Add event listeners to edit, delete, and preview buttons
  const editButtons = document.querySelectorAll('.edit-news');
  const deleteButtons = document.querySelectorAll('.delete-news');
  const previewButtons = document.querySelectorAll('.preview-news');
  
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      const newsId = button.getAttribute('data-id');
      editNewsItem(newsId);
    });
  });
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const newsId = button.getAttribute('data-id');
      deleteNewsItem(newsId);
    });
  });
  
  previewButtons.forEach(button => {
    button.addEventListener('click', () => {
      const newsId = button.getAttribute('data-id');
      previewNewsItem(newsId);
    });
  });
}

/**
 * Open modal for creating a new news item
 */
function openNewNewsModal() {
  currentNewsItem = null;
  
  // Reset form
  if (newsForm) newsForm.reset();
  
  // Reset media picker if it exists
  if (mediaPicker) {
    mediaPicker.setMedia([]);
  }
  
  // Set default publish date to today
  if (newsPublishDateInput) {
    const today = new Date().toISOString().split('T')[0];
    newsPublishDateInput.value = today;
  }
  
  // Clear content editor
  if (newsContentEditor) {
    newsContentEditor.value = '';
  }
  
  // Update modal title
  const modalTitle = document.querySelector('#news-modal .modal-title');
  if (modalTitle) modalTitle.textContent = 'Create News Article';
  
  // Show modal
  if (newsModal) {
    const bsModal = new bootstrap.Modal(newsModal);
    bsModal.show();
  }
}

/**
 * Open modal for editing an existing news item
 * @param {string} newsId - ID of the news item to edit
 */
async function editNewsItem(newsId) {
  try {
    const response = await fetch(`/api/news/${newsId}`);
    const data = await response.json();
    
    if (data.newsItem) {
      currentNewsItem = data.newsItem;
      
      // Set form values
      newsTitleInput.value = currentNewsItem.title || '';
      newsContentEditor.value = currentNewsItem.content || '';
      newsSummaryInput.value = currentNewsItem.summary || '';
      newsImageInput.value = currentNewsItem.image || '';
      
      // If there's an image ID, fetch the media item details
      if (currentNewsItem.image) {
        try {
          const mediaResponse = await fetch(`/api/media-library/${currentNewsItem.image}`);
          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            if (mediaData.success && mediaData.mediaItem) {
              currentNewsItem.mediaItem = mediaData.mediaItem;
            }
          }
        } catch (mediaError) {
          console.error('Error fetching media item:', mediaError);
          // Continue even if media fetch fails
        }
      }
      
      // Format date for input
      if (currentNewsItem.publishDate) {
        const date = new Date(currentNewsItem.publishDate);
        const formattedDate = date.toISOString().split('T')[0];
        newsPublishDateInput.value = formattedDate;
      }
      
      newsFeaturedInput.checked = currentNewsItem.featured || false;
      
      // Update modal title
      document.getElementById('newsModalLabel').textContent = 'Edit News Article';
      
      // Show modal
      const modal = new bootstrap.Modal(newsModal);
      modal.show();
    } else {
      showNotification(data.error || 'Error loading news article', 'error');
    }
  } catch (error) {
    console.error('Error editing news article:', error);
    showNotification('Error loading news article', 'error');
  }
}

/**
 * Handle news form submission
 * @param {Event} event - Form submit event
 */
async function handleNewsSubmit(event) {
  event.preventDefault();
  
  const title = newsTitleInput?.value;
  // Get content from rich editor if available, otherwise from textarea
  const content = richEditor ? richEditor.getValue() : newsContentEditor?.value;
  const summary = newsSummaryInput?.value;
  const image = newsImageInput?.value;
  const publishDate = newsPublishDateInput?.value;
  const featured = newsFeaturedInput?.checked;
  
  if (!title || !content || !publishDate) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  // Disable the save button to prevent multiple submissions
  if (saveNewsBtn) {
    saveNewsBtn.disabled = true;
    saveNewsBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
  }
  
  const newsData = {
    title,
    content,
    summary: summary || undefined,
    image: image || undefined,
    publishDate,
    featured
  };
  
  try {
    const url = currentNewsItem 
      ? `/api/news/${currentNewsItem.id}` 
      : '/api/news';
    
    const method = currentNewsItem ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(newsData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification(
        currentNewsItem 
          ? 'News article updated successfully' 
          : 'News article created successfully', 
        'success'
      );
      
      closeNewsModal();
      fetchNewsItems();
    } else {
      showNotification(data.error || 'Error saving news article', 'error');
    }
  } catch (error) {
    console.error('Error saving news article:', error);
    showNotification('Error saving news article', 'error');
  } finally {
    // Re-enable the save button
    if (saveNewsBtn) {
      saveNewsBtn.disabled = false;
      saveNewsBtn.innerHTML = 'Save Article';
    }
  }
}

/**
 * Delete a news item
 * @param {string} newsId - ID of the news item to delete
 */
async function deleteNewsItem(newsId) {
  if (!confirm('Are you sure you want to delete this news article?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/news/${newsId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification('News article deleted successfully', 'success');
      fetchNewsItems();
    } else {
      showNotification(data.error || 'Error deleting news article', 'error');
    }
  } catch (error) {
    console.error('Error deleting news article:', error);
    showNotification('Error deleting news article', 'error');
  }
}

/**
 * Preview a news item
 * @param {string} newsId - ID of the news item to preview
 */
function previewNewsItem(newsId) {
  // In a real implementation, this would open a preview window
  // For now, we'll just show a notification
  showNotification('Preview functionality would be implemented here', 'info');
}

/**
 * Close the news modal
 */
function closeNewsModal() {
  if (newsModal) {
    const bsModal = bootstrap.Modal.getInstance(newsModal);
    if (bsModal) bsModal.hide();
  }
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
