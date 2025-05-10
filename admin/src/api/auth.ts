import { Env } from '../types/env';
import { RequestWithParams } from '../types/request';
import { User } from '../types/user';

/**
 * Verify a JWT token from the request headers
 * @param request The request object
 * @param env The environment variables
 * @returns The user object if token is valid, null otherwise
 */
export async function verifyToken(request: RequestWithParams, env: Env): Promise<User | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }
    
    // Verify token (simplified for demo)
    // In a real application, you would use a JWT library to verify the token
    // and check expiration, signature, etc.
    
    // For demo purposes, we'll just look up the user by the token
    const user = await env.D1.prepare(
      'SELECT * FROM users WHERE token = ?'
    )
      .bind(token)
      .first<User>();
    
    return user || null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Login a user and generate a JWT token
 */
export async function login(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Get email and password from request body
    const { email, password } = await request.json<{ email: string; password: string }>();
    
    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find user by email
    const user = await env.D1.prepare(
      'SELECT * FROM users WHERE email = ?'
    )
      .bind(email)
      .first<User>();
    
    // Check if user exists and password is correct
    if (!user || user.password !== password) {
      return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate token (simplified for demo)
    // In a real application, you would use a JWT library to generate a token
    // with expiration, signature, etc.
    const token = crypto.randomUUID();
    
    // Update user token in database
    await env.D1.prepare(
      'UPDATE users SET token = ? WHERE id = ?'
    )
      .bind(token, user.id)
      .run();
    
    // Return user data and token (excluding password)
    const { password: _, ...userData } = user;
    
    return new Response(JSON.stringify({
      token,
      user: userData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Logout a user by invalidating their token
 */
export async function logout(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Invalidate token in database
    await env.D1.prepare(
      'UPDATE users SET token = NULL WHERE token = ?'
    )
      .bind(token)
      .run();
    
    return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
