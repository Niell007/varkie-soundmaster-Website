/**
 * Schedule Manager Component for Soundmaster Admin Dashboard
 * Handles CRUD operations for schedule items
 */

// State management
let scheduleItems = [];
let currentScheduleItem = null;
let playlists = [];

// DOM Elements
const scheduleContainer = document.getElementById('schedule-container');
const scheduleForm = document.getElementById('schedule-form');
const scheduleModal = document.getElementById('schedule-modal');
const scheduleTitleInput = document.getElementById('schedule-title');
const scheduleDescriptionInput = document.getElementById('schedule-description');
const scheduleStartTimeInput = document.getElementById('schedule-start-time');
const scheduleEndTimeInput = document.getElementById('schedule-end-time');
const scheduleDaysContainer = document.getElementById('schedule-days');
const schedulePlaylistSelect = document.getElementById('schedule-playlist');
const scheduleColorInput = document.getElementById('schedule-color');
const saveScheduleBtn = document.getElementById('save-schedule');
const closeScheduleModalBtn = document.getElementById('close-schedule-modal');
const newScheduleBtn = document.getElementById('new-schedule-btn');

// Days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Initialize the schedule manager
 */
export function initScheduleManager() {
  // Fetch schedule items
  fetchScheduleItems();
  
  // Fetch playlists for the dropdown
  fetchPlaylists();
  
  // Event listeners
  if (newScheduleBtn) {
    newScheduleBtn.addEventListener('click', openNewScheduleModal);
  }
  
  if (scheduleForm) {
    scheduleForm.addEventListener('submit', handleScheduleSubmit);
  }
  
  if (closeScheduleModalBtn) {
    closeScheduleModalBtn.addEventListener('click', closeScheduleModal);
  }
  
  // Initialize the schedule calendar
  initScheduleCalendar();
}

/**
 * Fetch all schedule items from the API
 */
async function fetchScheduleItems() {
  try {
    const response = await fetch('/api/schedule');
    const data = await response.json();
    
    if (data.scheduleItems) {
      scheduleItems = data.scheduleItems;
      renderScheduleItems();
    }
  } catch (error) {
    console.error('Error fetching schedule items:', error);
    showNotification('Error loading schedule items', 'error');
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
      populatePlaylistDropdown();
    }
  } catch (error) {
    console.error('Error fetching playlists:', error);
    showNotification('Error loading playlists', 'error');
  }
}

/**
 * Populate the playlist dropdown
 */
function populatePlaylistDropdown() {
  if (!schedulePlaylistSelect) return;
  
  // Clear existing options
  schedulePlaylistSelect.innerHTML = '<option value="">Select a playlist (optional)</option>';
  
  // Add playlist options
  playlists.forEach(playlist => {
    const option = document.createElement('option');
    option.value = playlist.id;
    option.textContent = playlist.title;
    schedulePlaylistSelect.appendChild(option);
  });
}

/**
 * Initialize the schedule calendar
 */
function initScheduleCalendar() {
  if (!scheduleContainer) return;
  
  // Create calendar container
  const calendarContainer = document.createElement('div');
  calendarContainer.className = 'schedule-calendar';
  
  // Create calendar header
  const calendarHeader = document.createElement('div');
  calendarHeader.className = 'calendar-header';
  calendarHeader.innerHTML = `
    <div class="calendar-title">Weekly Schedule</div>
    <div class="calendar-controls">
      <button class="btn btn-sm btn-outline-secondary prev-week">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button class="btn btn-sm btn-outline-secondary next-week">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;
  
  calendarContainer.appendChild(calendarHeader);
  
  // Create calendar grid
  const calendarGrid = document.createElement('div');
  calendarGrid.className = 'calendar-grid';
  calendarGrid.id = 'calendar-grid';
  
  calendarContainer.appendChild(calendarGrid);
  
  // Add calendar to container
  scheduleContainer.appendChild(calendarContainer);
  
  // Add event listeners for week navigation
  const prevWeekBtn = calendarContainer.querySelector('.prev-week');
  const nextWeekBtn = calendarContainer.querySelector('.next-week');
  
  if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', () => {
      // In a real implementation, this would navigate to the previous week
      showNotification('Previous week navigation would be implemented here', 'info');
    });
  }
  
  if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', () => {
      // In a real implementation, this would navigate to the next week
      showNotification('Next week navigation would be implemented here', 'info');
    });
  }
}

/**
 * Render schedule items in the calendar
 */
function renderScheduleItems() {
  const calendarGrid = document.getElementById('calendar-grid');
  if (!calendarGrid) return;
  
  // Clear existing grid
  calendarGrid.innerHTML = '';
  
  // Create time column
  const timeColumn = document.createElement('div');
  timeColumn.className = 'time-column';
  timeColumn.innerHTML = '<div class="time-header">Time</div>';
  
  // Create time slots (6:00 AM to 12:00 AM in 1-hour increments)
  for (let hour = 6; hour < 24; hour++) {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const amPm = hour >= 12 ? 'PM' : 'AM';
    const timeSlot = document.createElement('div');
    timeSlot.className = 'time-slot';
    timeSlot.textContent = `${displayHour}:00 ${amPm}`;
    timeColumn.appendChild(timeSlot);
  }
  
  calendarGrid.appendChild(timeColumn);
  
  // Create day columns
  daysOfWeek.forEach(day => {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'day-column';
    dayColumn.innerHTML = `<div class="day-header">${day}</div>`;
    
    // Create hour slots for this day
    for (let hour = 6; hour < 24; hour++) {
      const hourSlot = document.createElement('div');
      hourSlot.className = 'schedule-slot';
      hourSlot.dataset.day = day;
      hourSlot.dataset.hour = hour;
      
      // Find schedule items for this day and time
      const itemsForSlot = scheduleItems.filter(item => {
        // Check if the item is scheduled for this day
        if (!item.days.includes(day)) return false;
        
        // Parse start and end times (format: "HH:MM")
        const [startHour, startMinute] = item.startTime.split(':').map(Number);
        const [endHour, endMinute] = item.endTime.split(':').map(Number);
        
        // Check if this hour falls within the item's time range
        return hour >= startHour && hour < endHour;
      });
      
      if (itemsForSlot.length > 0) {
        // Use the first matching item (we'll handle overlaps later)
        const item = itemsForSlot[0];
        
        const scheduleItemEl = document.createElement('div');
        scheduleItemEl.className = 'schedule-item';
        scheduleItemEl.style.backgroundColor = `${item.color}33`;
        scheduleItemEl.dataset.id = item.id;
        scheduleItemEl.innerHTML = `
          <div class="item-title">${item.title}</div>
          <div class="item-time">${item.startTime} - ${item.endTime}</div>
        `;
        
        // Add click event to edit the schedule item
        scheduleItemEl.addEventListener('click', () => {
          editScheduleItem(item.id);
        });
        
        hourSlot.appendChild(scheduleItemEl);
      } else {
        // Empty slot - add click event to create a new schedule item
        hourSlot.addEventListener('click', () => {
          openNewScheduleModal(day, hour);
        });
      }
      
      dayColumn.appendChild(hourSlot);
    }
    
    calendarGrid.appendChild(dayColumn);
  });
  
  // Add legend for schedule items
  const legend = document.createElement('div');
  legend.className = 'schedule-legend mt-3';
  legend.innerHTML = `
    <div class="legend-title mb-2">Legend:</div>
    <div class="d-flex flex-wrap gap-3">
      ${scheduleItems.map(item => `
        <div class="legend-item" style="background-color: ${item.color}33;">
          <span class="legend-color" style="background-color: ${item.color}"></span>
          <span class="legend-text">${item.title}</span>
        </div>
      `).join('')}
    </div>
  `;
  
  scheduleContainer.appendChild(legend);
}

/**
 * Open modal for creating a new schedule item
 * @param {string} [day] - Optional day to pre-select
 * @param {number} [hour] - Optional hour to pre-set
 */
function openNewScheduleModal(day, hour) {
  currentScheduleItem = null;
  
  // Reset form
  if (scheduleForm) scheduleForm.reset();
  
  // Pre-select day if provided
  if (day && scheduleDaysContainer) {
    const checkboxes = scheduleDaysContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      if (checkbox.value === day) {
        checkbox.checked = true;
      }
    });
  }
  
  // Pre-set time if provided
  if (hour !== undefined) {
    if (scheduleStartTimeInput) {
      const startHour = hour.toString().padStart(2, '0');
      scheduleStartTimeInput.value = `${startHour}:00`;
    }
    
    if (scheduleEndTimeInput) {
      const endHour = (hour + 1).toString().padStart(2, '0');
      scheduleEndTimeInput.value = `${endHour}:00`;
    }
  }
  
  // Update modal title
  const modalTitle = document.querySelector('#schedule-modal .modal-title');
  if (modalTitle) modalTitle.textContent = 'Create New Schedule Item';
  
  // Show modal
  if (scheduleModal) {
    const bsModal = new bootstrap.Modal(scheduleModal);
    bsModal.show();
  }
}

/**
 * Open modal for editing an existing schedule item
 * @param {string} scheduleItemId - ID of the schedule item to edit
 */
async function editScheduleItem(scheduleItemId) {
  try {
    const response = await fetch(`/api/schedule/${scheduleItemId}`);
    const scheduleItem = await response.json();
    
    if (!scheduleItem || scheduleItem.error) {
      showNotification('Error loading schedule item', 'error');
      return;
    }
    
    currentScheduleItem = scheduleItem;
    
    // Fill form with schedule item data
    if (scheduleTitleInput) scheduleTitleInput.value = scheduleItem.title;
    if (scheduleDescriptionInput) scheduleDescriptionInput.value = scheduleItem.description;
    if (scheduleStartTimeInput) scheduleStartTimeInput.value = scheduleItem.startTime;
    if (scheduleEndTimeInput) scheduleEndTimeInput.value = scheduleItem.endTime;
    if (schedulePlaylistSelect) schedulePlaylistSelect.value = scheduleItem.playlistId || '';
    if (scheduleColorInput) scheduleColorInput.value = scheduleItem.color;
    
    // Check day checkboxes
    if (scheduleDaysContainer) {
      const checkboxes = scheduleDaysContainer.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.checked = scheduleItem.days.includes(checkbox.value);
      });
    }
    
    // Update modal title
    const modalTitle = document.querySelector('#schedule-modal .modal-title');
    if (modalTitle) modalTitle.textContent = 'Edit Schedule Item';
    
    // Show modal
    if (scheduleModal) {
      const bsModal = new bootstrap.Modal(scheduleModal);
      bsModal.show();
    }
  } catch (error) {
    console.error('Error fetching schedule item:', error);
    showNotification('Error loading schedule item', 'error');
  }
}

/**
 * Handle schedule form submission
 * @param {Event} event - Form submit event
 */
async function handleScheduleSubmit(event) {
  event.preventDefault();
  
  const title = scheduleTitleInput?.value;
  const description = scheduleDescriptionInput?.value;
  const startTime = scheduleStartTimeInput?.value;
  const endTime = scheduleEndTimeInput?.value;
  const playlistId = schedulePlaylistSelect?.value;
  const color = scheduleColorInput?.value;
  
  // Get selected days
  const selectedDays = [];
  if (scheduleDaysContainer) {
    const checkboxes = scheduleDaysContainer.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
      selectedDays.push(checkbox.value);
    });
  }
  
  if (!title || !description || !startTime || !endTime || selectedDays.length === 0) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  // Validate time format (HH:MM)
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    showNotification('Time must be in 24-hour format (HH:MM)', 'error');
    return;
  }
  
  // Validate that end time is after start time
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  if (endMinutes <= startMinutes) {
    showNotification('End time must be after start time', 'error');
    return;
  }
  
  const scheduleData = {
    title,
    description,
    startTime,
    endTime,
    days: selectedDays,
    playlistId: playlistId || undefined,
    color: color || '#3498db'
  };
  
  try {
    const url = currentScheduleItem 
      ? `/api/schedule/${currentScheduleItem.id}` 
      : '/api/schedule';
    
    const method = currentScheduleItem ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scheduleData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification(
        currentScheduleItem 
          ? 'Schedule item updated successfully' 
          : 'Schedule item created successfully', 
        'success'
      );
      
      closeScheduleModal();
      fetchScheduleItems();
    } else {
      showNotification(data.error || 'Error saving schedule item', 'error');
    }
  } catch (error) {
    console.error('Error saving schedule item:', error);
    showNotification('Error saving schedule item', 'error');
  }
}

/**
 * Delete a schedule item
 * @param {string} scheduleItemId - ID of the schedule item to delete
 */
async function deleteScheduleItem(scheduleItemId) {
  if (!confirm('Are you sure you want to delete this schedule item?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/schedule/${scheduleItemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification('Schedule item deleted successfully', 'success');
      fetchScheduleItems();
    } else {
      showNotification(data.error || 'Error deleting schedule item', 'error');
    }
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    showNotification('Error deleting schedule item', 'error');
  }
}

/**
 * Close the schedule modal
 */
function closeScheduleModal() {
  if (scheduleModal) {
    const bsModal = bootstrap.Modal.getInstance(scheduleModal);
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
