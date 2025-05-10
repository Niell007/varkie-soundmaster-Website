// Schedule management API for Soundmaster Admin Dashboard
import { Env } from '../types/env';
import { ScheduleItem, ScheduleItemRequest } from '../types/content';
import { RequestWithParams } from '../types/request';
import { verifyToken } from '../auth';

/**
 * Create a new schedule item
 * @param request Request with schedule data
 * @param env Cloudflare environment
 * @returns Response with created schedule item or error
 */
export async function createScheduleItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token and get user ID
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const data = await request.json() as ScheduleItemRequest;
    
    // Validate input
    if (!data.title || !data.description || !data.startTime || !data.endTime || !data.days || !Array.isArray(data.days)) {
      return new Response(JSON.stringify({ error: 'All required fields must be provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate schedule item ID
    const scheduleId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Create schedule item object
    const scheduleItem: ScheduleItem = {
      id: scheduleId,
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      days: data.days,
      playlistId: data.playlistId,
      hostId: data.hostId,
      color: data.color || '#3498db',
      createdAt: now,
      updatedAt: now
    };
    
    // Store schedule item in database
    const stmt = env.DB.prepare(`
      INSERT INTO schedule (
        id, title, description, start_time, end_time, days, 
        playlist_id, host_id, color, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      scheduleId,
      scheduleItem.title,
      scheduleItem.description,
      scheduleItem.startTime,
      scheduleItem.endTime,
      JSON.stringify(scheduleItem.days),
      scheduleItem.playlistId || null,
      scheduleItem.hostId || null,
      scheduleItem.color,
      scheduleItem.createdAt,
      scheduleItem.updatedAt
    ).run();
    
    // Generate HTML for the schedule page
    await generateScheduleHtml(env);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Schedule item created successfully',
      ...scheduleItem
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating schedule item:', error);
    return new Response(JSON.stringify({ error: 'Failed to create schedule item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get all schedule items
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with schedule items or error
 */
export async function getScheduleItems(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all schedule items from database
    const stmt = env.DB.prepare(`
      SELECT * FROM schedule ORDER BY start_time ASC
    `);
    
    const result = await stmt.all();
    
    if (!result.results || !Array.isArray(result.results)) {
      return new Response(JSON.stringify({ scheduleItems: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Format schedule items
    const scheduleItems: ScheduleItem[] = result.results.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      days: JSON.parse(row.days),
      playlistId: row.playlist_id,
      hostId: row.host_id,
      color: row.color,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    return new Response(JSON.stringify({ scheduleItems }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting schedule items:', error);
    return new Response(JSON.stringify({ error: 'Failed to get schedule items' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get a schedule item by ID
 * @param request Request with schedule item ID
 * @param env Cloudflare environment
 * @returns Response with schedule item or error
 */
export async function getScheduleItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get schedule item ID from params
    const { id } = request.params || {};
    if (!id) {
      return new Response(JSON.stringify({ error: 'Schedule item ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get schedule item from database
    const stmt = env.DB.prepare(`
      SELECT * FROM schedule WHERE id = ?
    `);
    
    const result = await stmt.bind(id).first<Record<string, any>>();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Schedule item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Format schedule item
    const scheduleItem: ScheduleItem = {
      id: result.id,
      title: result.title,
      description: result.description,
      startTime: result.start_time,
      endTime: result.end_time,
      days: JSON.parse(result.days),
      playlistId: result.playlist_id,
      hostId: result.host_id,
      color: result.color,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
    
    return new Response(JSON.stringify(scheduleItem), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting schedule item:', error);
    return new Response(JSON.stringify({ error: 'Failed to get schedule item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update a schedule item
 * @param request Request with schedule item ID and updated data
 * @param env Cloudflare environment
 * @returns Response with updated schedule item or error
 */
export async function updateScheduleItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get schedule item ID from params
    const { id } = request.params || {};
    if (!id) {
      return new Response(JSON.stringify({ error: 'Schedule item ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    const data = await request.json() as ScheduleItemRequest;
    
    // Validate input
    if (!data.title || !data.description || !data.startTime || !data.endTime || !data.days || !Array.isArray(data.days)) {
      return new Response(JSON.stringify({ error: 'All required fields must be provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if schedule item exists
    const checkStmt = env.DB.prepare(`
      SELECT id FROM schedule WHERE id = ?
    `);
    
    const existingItem = await checkStmt.bind(id).first();
    
    if (!existingItem) {
      return new Response(JSON.stringify({ error: 'Schedule item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update schedule item in database
    const now = new Date().toISOString();
    const updateStmt = env.DB.prepare(`
      UPDATE schedule
      SET title = ?, description = ?, start_time = ?, end_time = ?,
          days = ?, playlist_id = ?, host_id = ?, color = ?, updated_at = ?
      WHERE id = ?
    `);
    
    await updateStmt.bind(
      data.title,
      data.description,
      data.startTime,
      data.endTime,
      JSON.stringify(data.days),
      data.playlistId || null,
      data.hostId || null,
      data.color || '#3498db',
      now,
      id
    ).run();
    
    // Get updated schedule item
    const getStmt = env.DB.prepare(`
      SELECT * FROM schedule WHERE id = ?
    `);
    
    const result = await getStmt.bind(id).first<Record<string, any>>();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Schedule item not found after update' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Format schedule item
    const scheduleItem: ScheduleItem = {
      id: result.id,
      title: result.title,
      description: result.description,
      startTime: result.start_time,
      endTime: result.end_time,
      days: JSON.parse(result.days),
      playlistId: result.playlist_id,
      hostId: result.host_id,
      color: result.color,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
    
    // Generate HTML for the schedule page
    await generateScheduleHtml(env);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Schedule item updated successfully',
      ...scheduleItem
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating schedule item:', error);
    return new Response(JSON.stringify({ error: 'Failed to update schedule item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Delete a schedule item
 * @param request Request with schedule item ID
 * @param env Cloudflare environment
 * @returns Response with success or error
 */
export async function deleteScheduleItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get schedule item ID from params
    const { id } = request.params || {};
    if (!id) {
      return new Response(JSON.stringify({ error: 'Schedule item ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if schedule item exists
    const checkStmt = env.DB.prepare(`
      SELECT id FROM schedule WHERE id = ?
    `);
    
    const existingItem = await checkStmt.bind(id).first();
    
    if (!existingItem) {
      return new Response(JSON.stringify({ error: 'Schedule item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete schedule item from database
    const deleteStmt = env.DB.prepare(`
      DELETE FROM schedule WHERE id = ?
    `);
    
    await deleteStmt.bind(id).run();
    
    // Generate HTML for the schedule page
    await generateScheduleHtml(env);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Schedule item deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete schedule item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generate HTML for the schedule page
 * @param env Cloudflare environment
 */
async function generateScheduleHtml(env: Env): Promise<void> {
  try {
    // Get all schedule items from database
    const stmt = env.DB.prepare(`
      SELECT * FROM schedule ORDER BY start_time ASC
    `);
    
    const result = await stmt.all();
    
    if (!result.results || !Array.isArray(result.results)) {
      return;
    }
    
    // Format schedule items
    const scheduleItems: ScheduleItem[] = result.results.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      days: JSON.parse(row.days),
      playlistId: row.playlist_id,
      hostId: row.host_id,
      color: row.color,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    // Get template HTML
    const templateKey = 'templates/schedule.html';
    const template = await env.ADMIN_ASSETS.get(templateKey);
    
    if (!template) {
      console.error('Schedule template not found');
      return;
    }
    
    // Generate schedule grid HTML
    let scheduleGridHtml = '';
    
    // Days of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Create day columns
    let dayColumnsHtml = '<div class="time-column"><div class="time-header">Time</div>';
    
    // Create time slots (6:00 AM to 12:00 AM in 1-hour increments)
    for (let hour = 6; hour < 24; hour++) {
      const displayHour = hour > 12 ? hour - 12 : hour;
      const amPm = hour >= 12 ? 'PM' : 'AM';
      dayColumnsHtml += `<div class="time-slot">${displayHour}:00 ${amPm}</div>`;
    }
    
    dayColumnsHtml += '</div>';
    
    // Create day columns with schedule items
    for (const day of days) {
      dayColumnsHtml += `<div class="day-column"><div class="day-header">${day}</div>`;
      
      // For each hour slot
      for (let hour = 6; hour < 24; hour++) {
        const timeSlotHtml = `<div class="schedule-slot" data-hour="${hour}" data-day="${day}">`;
        
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
          dayColumnsHtml += `
            <div class="schedule-item" style="background-color: ${item.color}33;">
              <div class="item-title">${item.title}</div>
              <div class="item-time">${item.startTime} - ${item.endTime}</div>
            </div>
          `;
        } else {
          dayColumnsHtml += `<div class="empty-slot"></div>`;
        }
        
        dayColumnsHtml += '</div>';
      }
      
      dayColumnsHtml += '</div>';
    }
    
    scheduleGridHtml = `
      <div class="schedule-grid">
        ${dayColumnsHtml}
      </div>
    `;
    
    // Replace placeholder in template
    const html = template.replace('{{SCHEDULE_CONTENT}}', scheduleGridHtml);
    
    // Store generated HTML
    await env.ADMIN_ASSETS.put('schedule.html', html);
    
    console.log('Schedule HTML generated successfully');
  } catch (error) {
    console.error('Error generating schedule HTML:', error);
  }
}
