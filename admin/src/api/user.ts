import { Env } from '../types/env';
import { RequestWithParams } from '../types/request';
import { verifyToken } from './auth';

/**
 * Get the current user's profile
 */
export async function getUserProfile(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token and get user ID
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return user profile (excluding sensitive information)
    const { password, ...userProfile } = user;
    
    return new Response(JSON.stringify(userProfile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update user settings
 */
export async function updateUserSettings(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token and get user ID
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get request body
    const updates = await request.json();
    
    // Validate updates
    if (updates.newPassword) {
      // Check if current password is provided
      if (!updates.currentPassword) {
        return new Response(JSON.stringify({ message: 'Current password is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Verify current password
      const isPasswordValid = await env.DB.prepare(
        'SELECT password FROM users WHERE id = ?'
      )
        .bind(user.id)
        .first();
      
      // Type assertion to ensure TypeScript knows isPasswordValid has a password property
      if (!isPasswordValid || (isPasswordValid as { password: string }).password !== updates.currentPassword) {
        return new Response(JSON.stringify({ message: 'Current password is incorrect' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Build update query
    const updateFields = [];
    const params = [];
    
    if (updates.name) {
      updateFields.push('name = ?');
      params.push(updates.name);
    }
    
    if (updates.email) {
      // Check if email is already in use
      const existingUser = await env.DB.prepare(
        'SELECT id FROM users WHERE email = ? AND id != ?'
      )
        .bind(updates.email, user.id)
        .first();
      
      if (existingUser) {
        return new Response(JSON.stringify({ message: 'Email is already in use' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      updateFields.push('email = ?');
      params.push(updates.email);
    }
    
    if (updates.newPassword) {
      updateFields.push('password = ?');
      params.push(updates.newPassword);
    }
    
    // If no updates, return success
    if (updateFields.length === 0) {
      return new Response(JSON.stringify({ message: 'No changes to save' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update user
    params.push(user.id);
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;
    
    await env.DB.prepare(updateQuery).bind(...params).run();
    
    // Get updated user
    const updatedUser = await env.DB.prepare(
      'SELECT id, name, email, role FROM users WHERE id = ?'
    )
      .bind(user.id)
      .first();
    
    return new Response(JSON.stringify({
      message: 'Settings updated successfully',
      user: updatedUser
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
