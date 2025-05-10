// User Management API for Soundmaster Admin Dashboard
import { Env } from '../types/env';
import { RequestWithParams } from '../types/request';
import { User } from '../types/user';
import { verifyToken } from './auth';
import { nanoid } from 'nanoid';

/**
 * Get all users
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with users list
 */
export async function getUsers(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token and ensure admin role
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user has admin role
    if (user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only administrators can manage users' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all users from database
    const stmt = env.DB.prepare(`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      ORDER BY name ASC
    `);
    
    const result = await stmt.all();
    
    return new Response(JSON.stringify({
      success: true,
      users: result.results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return new Response(JSON.stringify({ error: 'Failed to get users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get user by ID
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with user data
 */
export async function getUser(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const currentUser = await verifyToken(request, env);
    if (!currentUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get user ID from request parameters
    const userId = request.params.id;
    
    // Check if user is requesting their own profile or is an admin
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'You can only view your own profile' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get user from database
    const stmt = env.DB.prepare(`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `);
    
    const result = await stmt.bind(userId).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      user: result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return new Response(JSON.stringify({ error: 'Failed to get user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Create a new user
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with created user
 */
export async function createUser(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token and ensure admin role
    const currentUser = await verifyToken(request, env);
    if (!currentUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user has admin role
    if (currentUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only administrators can create users' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get user data from request body
    const userData = await request.json<{
      email: string;
      name: string;
      password: string;
      role: string;
    }>();
    
    // Validate required fields
    if (!userData.email || !userData.name || !userData.password || !userData.role) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate role
    const validRoles = ['admin', 'editor', 'contributor', 'viewer'];
    if (!validRoles.includes(userData.role)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if email already exists
    const checkStmt = env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `);
    
    const existingUser = await checkStmt.bind(userData.email).first();
    
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already in use' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate unique ID
    const userId = nanoid();
    
    // Insert user into database
    // In a real application, we would hash the password here
    const insertStmt = env.DB.prepare(`
      INSERT INTO users (id, email, name, password, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    await insertStmt.bind(
      userId,
      userData.email,
      userData.name,
      userData.password, // In a real app, this would be hashed
      userData.role
    ).run();
    
    // Get the created user
    const getStmt = env.DB.prepare(`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `);
    
    const newUser = await getStmt.bind(userId).first();
    
    return new Response(JSON.stringify({
      success: true,
      user: newUser
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: 'Failed to create user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update a user
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with updated user
 */
export async function updateUser(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const currentUser = await verifyToken(request, env);
    if (!currentUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get user ID from request parameters
    const userId = request.params.id;
    
    // Check if user is updating their own profile or is an admin
    const isSelf = currentUser.id === userId;
    const isAdmin = currentUser.role === 'admin';
    
    if (!isSelf && !isAdmin) {
      return new Response(JSON.stringify({ error: 'You can only update your own profile' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get user data from request body
    const userData = await request.json<{
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    }>();
    
    // Check if user exists
    const checkStmt = env.DB.prepare(`
      SELECT id, role FROM users WHERE id = ?
    `);
    
    const existingUser = await checkStmt.bind(userId).first();
    
    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Prevent non-admins from changing roles
    if (userData.role && !isAdmin) {
      return new Response(JSON.stringify({ error: 'Only administrators can change roles' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Prevent changing the role of the last admin
    if (isAdmin && 
        existingUser && 
        typeof existingUser === 'object' && 
        'role' in existingUser && 
        existingUser.role === 'admin' && 
        userData.role && 
        userData.role !== 'admin') {
      // Check if this is the last admin
      const adminCountStmt = env.DB.prepare(`
        SELECT COUNT(*) as count FROM users WHERE role = 'admin'
      `);
      
      const adminCountResult = await adminCountStmt.first();
      
      // Type assertion for the count property
      const adminCount = adminCountResult && 
                         typeof adminCountResult === 'object' && 
                         'count' in adminCountResult ? 
                         Number(adminCountResult.count) : 0;
      
      if (adminCount <= 1) {
        return new Response(JSON.stringify({ error: 'Cannot change role of the last administrator' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Build update query
    let updateQuery = 'UPDATE users SET updated_at = datetime(\'now\')';
    const params: any[] = [];
    
    if (userData.name) {
      updateQuery += ', name = ?';
      params.push(userData.name);
    }
    
    if (userData.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return new Response(JSON.stringify({ error: 'Invalid email format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Check if email is already in use by another user
      const emailCheckStmt = env.DB.prepare(`
        SELECT id FROM users WHERE email = ? AND id != ?
      `);
      
      const existingEmail = await emailCheckStmt.bind(userData.email, userId).first();
      
      if (existingEmail) {
        return new Response(JSON.stringify({ error: 'Email already in use' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      updateQuery += ', email = ?';
      params.push(userData.email);
    }
    
    if (userData.password) {
      // In a real application, we would hash the password here
      updateQuery += ', password = ?';
      params.push(userData.password);
    }
    
    if (userData.role && isAdmin) {
      // Validate role
      const validRoles = ['admin', 'editor', 'contributor', 'viewer'];
      if (!validRoles.includes(userData.role)) {
        return new Response(JSON.stringify({ error: 'Invalid role' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      updateQuery += ', role = ?';
      params.push(userData.role);
    }
    
    // Add WHERE clause
    updateQuery += ' WHERE id = ?';
    params.push(userId);
    
    // Execute update
    const updateStmt = env.DB.prepare(updateQuery);
    await updateStmt.bind(...params).run();
    
    // Get updated user
    const getStmt = env.DB.prepare(`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `);
    
    const updatedUser = await getStmt.bind(userId).first();
    
    return new Response(JSON.stringify({
      success: true,
      user: updatedUser
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(JSON.stringify({ error: 'Failed to update user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Delete a user
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with success status
 */
export async function deleteUser(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token and ensure admin role
    const currentUser = await verifyToken(request, env);
    if (!currentUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user has admin role
    if (currentUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only administrators can delete users' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get user ID from request parameters
    const userId = request.params.id;
    
    // Prevent deleting yourself
    if (currentUser.id === userId) {
      return new Response(JSON.stringify({ error: 'You cannot delete your own account' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user exists and get their role
    const checkStmt = env.DB.prepare(`
      SELECT id, role FROM users WHERE id = ?
    `);
    
    const existingUser = await checkStmt.bind(userId).first();
    
    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Prevent deleting the last admin
    if (existingUser && 
        typeof existingUser === 'object' && 
        'role' in existingUser && 
        existingUser.role === 'admin') {
      // Check if this is the last admin
      const adminCountStmt = env.DB.prepare(`
        SELECT COUNT(*) as count FROM users WHERE role = 'admin'
      `);
      
      const adminCountResult = await adminCountStmt.first();
      
      // Type assertion for the count property
      const adminCount = adminCountResult && 
                         typeof adminCountResult === 'object' && 
                         'count' in adminCountResult ? 
                         Number(adminCountResult.count) : 0;
      
      if (adminCount <= 1) {
        return new Response(JSON.stringify({ error: 'Cannot delete the last administrator' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Delete user
    const deleteStmt = env.DB.prepare(`
      DELETE FROM users WHERE id = ?
    `);
    
    await deleteStmt.bind(userId).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'User deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get user permissions
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with user permissions
 */
export async function getUserPermissions(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Define permissions based on role
    const permissions = {
      admin: {
        users: ['view', 'create', 'update', 'delete'],
        content: ['view', 'create', 'update', 'delete', 'publish'],
        media: ['view', 'upload', 'update', 'delete'],
        playlists: ['view', 'create', 'update', 'delete'],
        schedule: ['view', 'create', 'update', 'delete'],
        news: ['view', 'create', 'update', 'delete', 'publish'],
        settings: ['view', 'update'],
        deploy: ['execute']
      },
      editor: {
        users: ['view'],
        content: ['view', 'create', 'update', 'publish'],
        media: ['view', 'upload', 'update'],
        playlists: ['view', 'create', 'update'],
        schedule: ['view', 'create', 'update'],
        news: ['view', 'create', 'update', 'publish'],
        settings: ['view'],
        deploy: []
      },
      contributor: {
        users: ['view'],
        content: ['view', 'create', 'update'],
        media: ['view', 'upload'],
        playlists: ['view', 'create'],
        schedule: ['view'],
        news: ['view', 'create', 'update'],
        settings: ['view'],
        deploy: []
      },
      viewer: {
        users: ['view'],
        content: ['view'],
        media: ['view'],
        playlists: ['view'],
        schedule: ['view'],
        news: ['view'],
        settings: ['view'],
        deploy: []
      }
    };
    
    // Get permissions for user's role
    const userPermissions = permissions[user.role as keyof typeof permissions] || permissions.viewer;
    
    return new Response(JSON.stringify({
      success: true,
      permissions: userPermissions
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return new Response(JSON.stringify({ error: 'Failed to get user permissions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
