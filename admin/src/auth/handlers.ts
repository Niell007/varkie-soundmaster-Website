// Authentication handlers for Soundmaster Admin Dashboard
import { generateToken, User } from './index';
import { Env } from '../index';
import { hashPassword, comparePasswords } from './utils';

/**
 * Handle user login
 * @param request Request object
 * @returns Response with JWT token or error
 */
export async function handleLogin(request: Request): Promise<Response> {
  try {
    // Get environment variables
    const env = (request as any).env as Env;
    
    // Parse request body
    const { email, password } = await request.json() as { email: string, password: string };
    
    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Query database for user
    const stmt = env.DB.prepare('SELECT * FROM users WHERE email = ?');
    const result = await stmt.bind(email.toLowerCase()).first<User>();
    
    // Check if user exists
    if (!result) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify password
    const passwordMatch = await comparePasswords(password, result.password);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate JWT token
    const token = await generateToken(result, env.JWT_SECRET);
    
    // Return token and user info (excluding password)
    const { password: _, ...userWithoutPassword } = result;
    
    return new Response(JSON.stringify({
      token,
      user: userWithoutPassword
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle user registration (admin only)
 * @param request Request object
 * @returns Response with success message or error
 */
export async function handleRegister(request: Request): Promise<Response> {
  try {
    // Get environment variables
    const env = (request as any).env as Env;
    
    // Parse request body
    const { email, password, name, role = 'editor' } = await request.json() as {
      email: string,
      password: string,
      name: string,
      role?: string
    };
    
    // Validate input
    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: 'Email, password, and name are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if email is already registered
    const checkStmt = env.DB.prepare('SELECT id FROM users WHERE email = ?');
    const existingUser = await checkStmt.bind(email.toLowerCase()).first<{ id: string }>();
    
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate user ID
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Insert user into database
    const insertStmt = env.DB.prepare(
      'INSERT INTO users (id, email, password, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    
    await insertStmt.bind(
      userId,
      email.toLowerCase(),
      hashedPassword,
      name,
      role,
      now,
      now
    ).run();
    
    return new Response(JSON.stringify({
      message: 'User registered successfully',
      userId
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle user logout
 * @param request Request object
 * @returns Response with success message
 */
export async function handleLogout(request: Request): Promise<Response> {
  // JWT is stateless, so we don't need to do anything server-side
  // The client should remove the token from storage
  
  return new Response(JSON.stringify({
    message: 'Logged out successfully'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
