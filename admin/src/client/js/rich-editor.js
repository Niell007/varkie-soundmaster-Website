/**
 * Rich Text Editor Component for Soundmaster Admin Dashboard
 * This component provides a rich text editing experience with media integration
 */

import { initMediaPicker } from './media-picker.js';

class RichEditor {
  constructor(options = {}) {
    this.targetElement = options.targetElement || null;
    this.placeholder = options.placeholder || 'Start writing...';
    this.height = options.height || '300px';
    this.value = options.initialValue || '';
    this.onChange = options.onChange || null;
    this.mediaPickerOptions = options.mediaPickerOptions || {};
    this.editorId = `rich-editor-${Math.random().toString(36).substring(2, 9)}`;
    this.toolbarId = `${this.editorId}-toolbar`;
    this.contentId = `${this.editorId}-content`;
    
    // Initialize the editor
    this.init();
  }
  
  /**
   * Initialize the rich text editor
   */
  init() {
    if (!this.targetElement) return;
    
    // Create editor container
    const editorContainer = document.createElement('div');
    editorContainer.className = 'rich-editor';
    editorContainer.id = this.editorId;
    
    // Create toolbar
    const toolbar = this.createToolbar();
    editorContainer.appendChild(toolbar);
    
    // Create content area
    const contentArea = document.createElement('div');
    contentArea.className = 'rich-editor-content';
    contentArea.id = this.contentId;
    contentArea.contentEditable = true;
    contentArea.style.height = this.height;
    contentArea.dataset.placeholder = this.placeholder;
    contentArea.innerHTML = this.value;
    
    // Add event listeners
    contentArea.addEventListener('input', () => {
      this.handleInput();
    });
    
    contentArea.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });
    
    editorContainer.appendChild(contentArea);
    
    // Replace target element with editor
    this.targetElement.parentNode.replaceChild(editorContainer, this.targetElement);
    
    // Add editor styles
    this.addEditorStyles();
  }
  
  /**
   * Create toolbar for rich text editor
   * @returns {HTMLElement} Toolbar element
   */
  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'rich-editor-toolbar';
    toolbar.id = this.toolbarId;
    
    // Text formatting buttons
    const formatButtons = [
      { command: 'bold', icon: 'bi-type-bold', title: 'Bold' },
      { command: 'italic', icon: 'bi-type-italic', title: 'Italic' },
      { command: 'underline', icon: 'bi-type-underline', title: 'Underline' },
      { command: 'strikeThrough', icon: 'bi-type-strikethrough', title: 'Strikethrough' },
      { type: 'separator' },
      { command: 'formatBlock', value: 'h1', icon: 'bi-type-h1', title: 'Heading 1' },
      { command: 'formatBlock', value: 'h2', icon: 'bi-type-h2', title: 'Heading 2' },
      { command: 'formatBlock', value: 'h3', icon: 'bi-type-h3', title: 'Heading 3' },
      { command: 'formatBlock', value: 'p', icon: 'bi-paragraph', title: 'Paragraph' },
      { type: 'separator' },
      { command: 'justifyLeft', icon: 'bi-text-left', title: 'Align Left' },
      { command: 'justifyCenter', icon: 'bi-text-center', title: 'Align Center' },
      { command: 'justifyRight', icon: 'bi-text-right', title: 'Align Right' },
      { type: 'separator' },
      { command: 'insertUnorderedList', icon: 'bi-list-ul', title: 'Bullet List' },
      { command: 'insertOrderedList', icon: 'bi-list-ol', title: 'Numbered List' },
      { type: 'separator' },
      { command: 'createLink', icon: 'bi-link', title: 'Insert Link' },
      { command: 'insertImage', icon: 'bi-image', title: 'Insert Image' },
      { command: 'removeFormat', icon: 'bi-eraser', title: 'Clear Formatting' }
    ];
    
    formatButtons.forEach(button => {
      if (button.type === 'separator') {
        const separator = document.createElement('div');
        separator.className = 'toolbar-separator';
        toolbar.appendChild(separator);
        return;
      }
      
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toolbar-button';
      btn.title = button.title;
      btn.innerHTML = `<i class="bi ${button.icon}"></i>`;
      
      btn.addEventListener('click', () => {
        this.executeCommand(button.command, button.value);
      });
      
      toolbar.appendChild(btn);
    });
    
    return toolbar;
  }
  
  /**
   * Execute command on the editor
   * @param {string} command Command to execute
   * @param {string} value Optional value for the command
   */
  executeCommand(command, value = null) {
    // Focus the editor
    document.getElementById(this.contentId).focus();
    
    // Handle special commands
    if (command === 'createLink') {
      const url = prompt('Enter the URL:');
      if (url) {
        document.execCommand(command, false, url);
      }
      return;
    }
    
    if (command === 'insertImage') {
      this.openMediaPicker();
      return;
    }
    
    // Execute standard command
    document.execCommand(command, false, value);
    
    // Trigger change event
    this.handleInput();
  }
  
  /**
   * Open media picker to insert image
   */
  openMediaPicker() {
    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById('rich-editor-media-modal');
    
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'rich-editor-media-modal';
      
      const modalHtml = `
        <div class="modal fade" id="rich-editor-media-picker-modal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Insert Media</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div id="rich-editor-media-container">
                  <!-- Media library content will be loaded here -->
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="rich-editor-media-insert-btn">Insert</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      modalContainer.innerHTML = modalHtml;
      document.body.appendChild(modalContainer);
      
      // Add event listener to insert button
      document.getElementById('rich-editor-media-insert-btn').addEventListener('click', () => {
        this.insertSelectedMedia();
      });
    }
    
    // Initialize modal
    const modal = new bootstrap.Modal(document.getElementById('rich-editor-media-picker-modal'));
    
    // Load media library
    const container = document.getElementById('rich-editor-media-container');
    
    // Show loading indicator
    container.innerHTML = `
      <div class="d-flex justify-content-center p-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
    
    // Load media library template
    fetch('templates/media-library.html')
      .then(response => response.text())
      .then(html => {
        container.innerHTML = html;
        
        // Initialize media library
        import('./media-library.js')
          .then(module => {
            if (typeof module.initMediaLibrary === 'function') {
              this.mediaLibrary = module.initMediaLibrary();
            }
          })
          .catch(error => {
            console.error('Error loading media library:', error);
            container.innerHTML = '<div class="alert alert-danger">Failed to load media library</div>';
          });
      })
      .catch(error => {
        console.error('Error loading media library template:', error);
        container.innerHTML = '<div class="alert alert-danger">Failed to load media library template</div>';
      });
    
    // Show modal
    modal.show();
  }
  
  /**
   * Insert selected media into the editor
   */
  insertSelectedMedia() {
    if (!this.mediaLibrary || this.mediaLibrary.selectedItems.size === 0) {
      return;
    }
    
    // Get selected media items
    const selectedIds = Array.from(this.mediaLibrary.selectedItems);
    const selectedItems = this.mediaLibrary.mediaItems.filter(item => 
      selectedIds.includes(item.id)
    );
    
    // Insert each media item
    selectedItems.forEach(item => {
      if (item.type === 'image') {
        document.execCommand('insertHTML', false, `<img src="/api/media-library/${item.id}/url" alt="${item.filename}" class="img-fluid">`);
      } else if (item.type === 'audio') {
        document.execCommand('insertHTML', false, `<audio controls class="w-100"><source src="/api/media-library/${item.id}/url" type="${item.content_type}">Your browser does not support the audio element.</audio>`);
      } else if (item.type === 'video') {
        document.execCommand('insertHTML', false, `<video controls class="w-100"><source src="/api/media-library/${item.id}/url" type="${item.content_type}">Your browser does not support the video element.</video>`);
      } else {
        document.execCommand('insertHTML', false, `<a href="/api/media-library/${item.id}/url" target="_blank">${item.filename}</a>`);
      }
    });
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('rich-editor-media-picker-modal'));
    if (modal) {
      modal.hide();
    }
    
    // Trigger change event
    this.handleInput();
  }
  
  /**
   * Handle input event
   */
  handleInput() {
    if (typeof this.onChange === 'function') {
      this.onChange(this.getValue());
    }
  }
  
  /**
   * Handle keydown event
   * @param {KeyboardEvent} event Keyboard event
   */
  handleKeyDown(event) {
    // Handle tab key
    if (event.key === 'Tab') {
      event.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }
  
  /**
   * Get the editor value
   * @returns {string} Editor content
   */
  getValue() {
    const contentArea = document.getElementById(this.contentId);
    return contentArea ? contentArea.innerHTML : '';
  }
  
  /**
   * Set the editor value
   * @param {string} value Content to set
   */
  setValue(value) {
    const contentArea = document.getElementById(this.contentId);
    if (contentArea) {
      contentArea.innerHTML = value;
      this.handleInput();
    }
  }
  
  /**
   * Add editor styles
   */
  addEditorStyles() {
    // Check if styles already exist
    if (document.getElementById('rich-editor-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'rich-editor-styles';
    style.textContent = `
      .rich-editor {
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
        overflow: hidden;
      }
      
      .rich-editor-toolbar {
        display: flex;
        flex-wrap: wrap;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border-bottom: 1px solid #ced4da;
      }
      
      .toolbar-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        padding: 0;
        background: none;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .toolbar-button:hover {
        background-color: #e9ecef;
      }
      
      .toolbar-button:active {
        background-color: #dee2e6;
      }
      
      .toolbar-separator {
        width: 1px;
        height: 1.5rem;
        margin: 0 0.5rem;
        background-color: #ced4da;
      }
      
      .rich-editor-content {
        padding: 1rem;
        min-height: 100px;
        overflow-y: auto;
        outline: none;
      }
      
      .rich-editor-content:empty:before {
        content: attr(data-placeholder);
        color: #6c757d;
        pointer-events: none;
      }
      
      .rich-editor-content img {
        max-width: 100%;
        height: auto;
      }
      
      .rich-editor-content a {
        color: #0d6efd;
        text-decoration: underline;
      }
    `;
    
    document.head.appendChild(style);
  }
}

/**
 * Initialize a rich text editor
 * @param {Object} options Configuration options
 * @returns {RichEditor} Rich editor instance
 */
export function initRichEditor(options) {
  return new RichEditor(options);
}
