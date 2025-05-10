/**
 * Soundmaster Admin Dashboard
 * Schedule management functionality
 */

// Global variables
let currentPage = 1;
let totalPages = 1;
let pageSize = 10;
let calendar;
let selectedMedia = null;
let teamMembers = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Only run on the schedule page
  if (!window.location.pathname.includes('schedule.html')) {
    return;
  }

  // Initialize FullCalendar
  initializeCalendar();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load team members for the host/co-host selects
  await loadTeamMembers();
  
  // Load schedule data
  await loadScheduleData();
});

/**
 * Initialize FullCalendar
 */
function initializeCalendar() {
  const calendarEl = document.getElementById('calendar');
  
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotMinTime: '06:00:00',
    slotMaxTime: '24:00:00',
    allDaySlot: false,
    height: 'auto',
    eventClick: handleEventClick,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: 'short'
    }
  });
  
  calendar.render();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // View toggle buttons
  document.getElementById('calendarViewBtn').addEventListener('click', () => {
    document.getElementById('calendarView').style.display = 'block';
    document.getElementById('listView').style.display = 'none';
    document.getElementById('calendarViewBtn').classList.add('btn-primary');
    document.getElementById('calendarViewBtn').classList.remove('btn-outline-secondary');
    document.getElementById('listViewBtn').classList.add('btn-outline-secondary');
    document.getElementById('listViewBtn').classList.remove('btn-primary');
    calendar.updateSize();
  });
  
  document.getElementById('listViewBtn').addEventListener('click', () => {
    document.getElementById('calendarView').style.display = 'none';
    document.getElementById('listView').style.display = 'block';
    document.getElementById('listViewBtn').classList.add('btn-primary');
    document.getElementById('listViewBtn').classList.remove('btn-outline-secondary');
    document.getElementById('calendarViewBtn').classList.add('btn-outline-secondary');
    document.getElementById('calendarViewBtn').classList.remove('btn-primary');
  });
  
  // Add schedule button
  document.getElementById('addScheduleBtn').addEventListener('click', () => {
    openScheduleModal();
  });
  
  // Save schedule button
  document.getElementById('saveScheduleBtn').addEventListener('click', async () => {
    await saveSchedule();
  });
  
  // Delete schedule button
  document.getElementById('deleteScheduleBtn').addEventListener('click', async () => {
    await deleteSchedule();
  });
  
  // Search button
  document.getElementById('searchBtn').addEventListener('click', () => {
    currentPage = 1;
    loadScheduleList();
  });
  
  // Search input (search on enter)
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      currentPage = 1;
      loadScheduleList();
    }
  });
  
  // Recurring checkbox
  document.getElementById('isRecurring').addEventListener('change', (e) => {
    document.getElementById('dateRangeContainer').style.display = e.target.checked ? 'flex' : 'none';
  });
  
  // Select image button
  document.getElementById('selectImageBtn').addEventListener('click', () => {
    openMediaPicker();
  });
  
  // Select media button in modal
  document.getElementById('selectMediaBtn').addEventListener('click', () => {
    if (selectedMedia) {
      document.getElementById('showImage').value = selectedMedia.id;
      
      // Close the modal
      const mediaPicker = document.getElementById('mediaPicker');
      const modal = bootstrap.Modal.getInstance(mediaPicker);
      modal.hide();
    } else {
      UI.showToast('Please select an image first', 'warning');
    }
  });
  
  // Media search in modal
  document.getElementById('mediaSearch').addEventListener('input', debounce(() => {
    loadMediaForPicker();
  }, 500));
}

/**
 * Load team members for the host/co-host selects
 */
async function loadTeamMembers() {
  try {
    const response = await api.getContent('team', { limit: 100 });
    
    if (response.success && response.content) {
      teamMembers = response.content;
      
      // Populate host select
      const hostSelect = document.getElementById('hostId');
      const coHostSelect = document.getElementById('coHostIds');
      
      let hostOptions = '<option value="">Select Host</option>';
      let coHostOptions = '';
      
      teamMembers.forEach(member => {
        if (member.is_active !== false) {
          hostOptions += `<option value="${member.id}">${member.name}</option>`;
          coHostOptions += `<option value="${member.id}">${member.name}</option>`;
        }
      });
      
      hostSelect.innerHTML = hostOptions;
      coHostSelect.innerHTML = coHostOptions;
    }
  } catch (error) {
    console.error('Error loading team members:', error);
    UI.showToast('Failed to load team members', 'error');
  }
}

/**
 * Load schedule data
 */
async function loadScheduleData() {
  UI.showSpinner();
  
  try {
    // Load calendar events
    await loadCalendarEvents();
    
    // Load schedule list
    await loadScheduleList();
  } catch (error) {
    console.error('Error loading schedule data:', error);
    UI.showToast('Failed to load schedule data', 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Load calendar events
 */
async function loadCalendarEvents() {
  try {
    const response = await api.getContent('schedule', { limit: 100 });
    
    if (response.success && response.content) {
      const schedules = response.content;
      
      // Clear existing events
      calendar.removeAllEvents();
      
      // Add events to calendar
      schedules.forEach(schedule => {
        if (schedule.is_active !== false) {
          addScheduleToCalendar(schedule);
        }
      });
    }
  } catch (error) {
    console.error('Error loading calendar events:', error);
    throw error;
  }
}

/**
 * Add a schedule to the calendar
 * @param {Object} schedule - Schedule data
 */
function addScheduleToCalendar(schedule) {
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = parseInt(schedule.day_of_week);
  
  // Get start and end times
  const startTime = schedule.start_time;
  const endTime = schedule.end_time;
  
  // Create a date for the current week with the day of week
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
  
  const eventDate = new Date(now);
  eventDate.setDate(now.getDate() + daysToAdd);
  
  // Set start and end times
  const startDate = new Date(eventDate);
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  startDate.setHours(startHours, startMinutes, 0, 0);
  
  const endDate = new Date(eventDate);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  endDate.setHours(endHours, endMinutes, 0, 0);
  
  // Add event to calendar
  calendar.addEvent({
    id: schedule.id,
    title: schedule.show_name,
    start: startDate,
    end: endDate,
    backgroundColor: schedule.show_color || '#0055b3',
    borderColor: schedule.show_color || '#0055b3',
    textColor: '#ffffff',
    extendedProps: {
      schedule: schedule
    }
  });
}

/**
 * Load schedule list
 */
async function loadScheduleList() {
  try {
    const searchQuery = document.getElementById('searchInput').value;
    
    // Set loading state
    document.getElementById('scheduleTableBody').innerHTML = `
      <tr>
        <td colspan="6" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    `;
    
    // Fetch schedule items
    const response = await api.getContent('schedule', {
      page: currentPage,
      limit: pageSize,
      search: searchQuery
    });
    
    if (response.success) {
      const { content, pagination } = response;
      
      // Update pagination
      totalPages = pagination.totalPages || 1;
      updatePagination();
      
      // Update schedule count
      document.getElementById('scheduleCount').textContent = pagination.totalItems || 0;
      
      // Render schedule table
      renderScheduleTable(content);
    } else {
      throw new Error(response.error || 'Failed to load schedules');
    }
  } catch (error) {
    console.error('Error loading schedule list:', error);
    document.getElementById('scheduleTableBody').innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-danger">
          Failed to load schedules. Please try again.
        </td>
      </tr>
    `;
  }
}

/**
 * Render the schedule table
 * @param {Array} schedules - List of schedules
 */
function renderScheduleTable(schedules) {
  const tableBody = document.getElementById('scheduleTableBody');
  
  if (!schedules || schedules.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">
          No schedules found.
        </td>
      </tr>
    `;
    return;
  }
  
  // Get day names
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Create table rows
  const rows = schedules.map(schedule => {
    // Find host name
    const host = schedule.host_id ? teamMembers.find(m => m.id === schedule.host_id) : null;
    
    return `
      <tr>
        <td>${schedule.show_name}</td>
        <td>${host ? host.name : 'No host assigned'}</td>
        <td>${dayNames[schedule.day_of_week]}</td>
        <td>${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}</td>
        <td>
          <span class="badge bg-${schedule.is_active !== false ? 'success' : 'secondary'}">
            ${schedule.is_active !== false ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-primary edit-schedule" data-id="${schedule.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-schedule" data-id="${schedule.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  tableBody.innerHTML = rows;
  
  // Add event listeners to action buttons
  const editButtons = document.querySelectorAll('.edit-schedule');
  editButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id');
      await loadScheduleItem(id);
    });
  });
  
  const deleteButtons = document.querySelectorAll('.delete-schedule');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id');
      await deleteScheduleFromList(id);
    });
  });
}

/**
 * Format time for display
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Formatted time
 */
function formatTime(timeString) {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':').map(Number);
  
  let period = 'AM';
  let displayHours = hours;
  
  if (hours >= 12) {
    period = 'PM';
    displayHours = hours === 12 ? 12 : hours - 12;
  }
  
  if (displayHours === 0) {
    displayHours = 12;
  }
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Update pagination controls
 */
function updatePagination() {
  const pagination = document.getElementById('schedulePagination');
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
        loadScheduleList();
      }
    });
  });
}

/**
 * Handle calendar event click
 * @param {Object} info - Event info
 */
async function handleEventClick(info) {
  const scheduleId = info.event.id;
  await loadScheduleItem(scheduleId);
}

/**
 * Load a schedule item for editing
 * @param {string} id - Schedule ID
 */
async function loadScheduleItem(id) {
  UI.showSpinner();
  
  try {
    const response = await api.getContentItem(id);
    
    if (response.success && response.content) {
      const schedule = response.content;
      
      // Open modal for editing
      openScheduleModal(schedule);
    } else {
      throw new Error(response.error || 'Failed to load schedule');
    }
  } catch (error) {
    console.error('Error loading schedule item:', error);
    UI.showToast('Failed to load schedule', 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Open the schedule modal
 * @param {Object} schedule - Schedule data for editing (optional)
 */
function openScheduleModal(schedule = null) {
  // Reset form
  document.getElementById('scheduleForm').reset();
  
  // Set modal title
  document.getElementById('scheduleModalLabel').textContent = schedule ? 'Edit Show' : 'Add Show';
  
  // Show/hide delete button
  document.getElementById('deleteScheduleBtn').style.display = schedule ? 'block' : 'none';
  
  // Set form values if editing
  if (schedule) {
    document.getElementById('scheduleId').value = schedule.id;
    document.getElementById('showName').value = schedule.show_name || '';
    document.getElementById('hostId').value = schedule.host_id || '';
    document.getElementById('description').value = schedule.description || '';
    document.getElementById('showImage').value = schedule.show_image || '';
    document.getElementById('showColor').value = schedule.show_color || '#0055b3';
    document.getElementById('dayOfWeek').value = schedule.day_of_week || '';
    document.getElementById('startTime').value = schedule.start_time || '';
    document.getElementById('endTime').value = schedule.end_time || '';
    document.getElementById('isRecurring').checked = schedule.is_recurring !== false;
    document.getElementById('isActive').checked = schedule.is_active !== false;
    
    // Set start and end dates if available
    if (schedule.start_date) {
      document.getElementById('startDate').value = schedule.start_date.split('T')[0];
    }
    
    if (schedule.end_date) {
      document.getElementById('endDate').value = schedule.end_date.split('T')[0];
    }
    
    // Set co-hosts if available
    if (schedule.co_host_ids && Array.isArray(schedule.co_host_ids)) {
      const coHostSelect = document.getElementById('coHostIds');
      
      // Clear existing selections
      for (let i = 0; i < coHostSelect.options.length; i++) {
        coHostSelect.options[i].selected = false;
      }
      
      // Select co-hosts
      schedule.co_host_ids.forEach(coHostId => {
        for (let i = 0; i < coHostSelect.options.length; i++) {
          if (coHostSelect.options[i].value === coHostId) {
            coHostSelect.options[i].selected = true;
            break;
          }
        }
      });
    }
    
    // Show/hide date range container
    document.getElementById('dateRangeContainer').style.display = 
      schedule.is_recurring !== false ? 'flex' : 'none';
  } else {
    // Set default values for new schedule
    document.getElementById('scheduleId').value = '';
    document.getElementById('showColor').value = '#0055b3';
    document.getElementById('isRecurring').checked = true;
    document.getElementById('isActive').checked = true;
    document.getElementById('dateRangeContainer').style.display = 'flex';
    
    // Set default start and end times
    document.getElementById('startTime').value = '09:00';
    document.getElementById('endTime').value = '10:00';
  }
  
  // Open the modal
  const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
  modal.show();
}

/**
 * Save a schedule
 */
async function saveSchedule() {
  UI.showSpinner();
  
  try {
    // Get form values
    const id = document.getElementById('scheduleId').value;
    const showName = document.getElementById('showName').value;
    const hostId = document.getElementById('hostId').value;
    const description = document.getElementById('description').value;
    const showImage = document.getElementById('showImage').value;
    const showColor = document.getElementById('showColor').value;
    const dayOfWeek = document.getElementById('dayOfWeek').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const isRecurring = document.getElementById('isRecurring').checked;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const isActive = document.getElementById('isActive').checked;
    
    // Get co-host IDs
    const coHostSelect = document.getElementById('coHostIds');
    const coHostIds = Array.from(coHostSelect.selectedOptions).map(option => option.value);
    
    // Validate required fields
    if (!showName) {
      UI.showToast('Show name is required', 'warning');
      return;
    }
    
    if (!dayOfWeek) {
      UI.showToast('Day of week is required', 'warning');
      return;
    }
    
    if (!startTime) {
      UI.showToast('Start time is required', 'warning');
      return;
    }
    
    if (!endTime) {
      UI.showToast('End time is required', 'warning');
      return;
    }
    
    // Create data object
    const data = {
      type: 'schedule',
      show_name: showName,
      host_id: hostId,
      co_host_ids: coHostIds,
      description,
      show_image: showImage,
      show_color: showColor,
      day_of_week: parseInt(dayOfWeek),
      start_time: startTime,
      end_time: endTime,
      is_recurring: isRecurring,
      is_active: isActive
    };
    
    // Add start and end dates if available
    if (startDate) {
      data.start_date = startDate;
    }
    
    if (endDate) {
      data.end_date = endDate;
    }
    
    let response;
    
    if (id) {
      // Update existing schedule
      response = await api.updateContent(id, data);
    } else {
      // Create new schedule
      response = await api.createContent(data);
    }
    
    if (response.success) {
      UI.showToast(`Schedule ${id ? 'updated' : 'created'} successfully`, 'success');
      
      // Close the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'));
      modal.hide();
      
      // Reload schedule data
      await loadScheduleData();
    } else {
      throw new Error(response.error || `Failed to ${id ? 'update' : 'create'} schedule`);
    }
  } catch (error) {
    console.error('Error saving schedule:', error);
    UI.showToast(`Failed to save schedule: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Delete a schedule
 */
async function deleteSchedule() {
  const id = document.getElementById('scheduleId').value;
  
  if (!id) {
    UI.showToast('No schedule selected', 'warning');
    return;
  }
  
  // Confirm deletion
  const confirmed = await UI.confirm('Are you sure you want to delete this schedule? This action cannot be undone.');
  
  if (!confirmed) {
    return;
  }
  
  UI.showSpinner();
  
  try {
    const response = await api.deleteContent(id);
    
    if (response.success) {
      UI.showToast('Schedule deleted successfully', 'success');
      
      // Close the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'));
      modal.hide();
      
      // Reload schedule data
      await loadScheduleData();
    } else {
      throw new Error(response.error || 'Failed to delete schedule');
    }
  } catch (error) {
    console.error('Error deleting schedule:', error);
    UI.showToast(`Failed to delete schedule: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
  }
}

/**
 * Delete a schedule from the list view
 * @param {string} id - Schedule ID
 */
async function deleteScheduleFromList(id) {
  if (!id) return;
  
  // Confirm deletion
  const confirmed = await UI.confirm('Are you sure you want to delete this schedule? This action cannot be undone.');
  
  if (!confirmed) {
    return;
  }
  
  UI.showSpinner();
  
  try {
    const response = await api.deleteContent(id);
    
    if (response.success) {
      UI.showToast('Schedule deleted successfully', 'success');
      
      // Reload schedule data
      await loadScheduleData();
    } else {
      throw new Error(response.error || 'Failed to delete schedule');
    }
  } catch (error) {
    console.error('Error deleting schedule:', error);
    UI.showToast(`Failed to delete schedule: ${error.message}`, 'error');
  } finally {
    UI.hideSpinner();
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
