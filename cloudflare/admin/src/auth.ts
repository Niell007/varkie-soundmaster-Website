/**
 * Authentication middleware for the Soundmaster Admin API
 */

import { verify, sign } from 'jsonwebtoken';

export interface AdminUser {
  id: string;
  username: string;
  role: string;
}

export interface JWTPayload {
  id: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Authenticate a request using JWT
 * @param request - The incoming request
 * @param env - Environment variables
 * @returns The authenticated user or null
 */
export async function authenticate(request: Request, env: any): Promise<AdminUser | null> {
  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Using the same static JWT secret for verification
    const JWT_SECRET = "soundmaster_static_jwt_secret_key_2025";
    
    // Verify token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    
    // Return user information
    return {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Generate a JWT token for a user
 * @param user - The user to generate a token for
 * @param env - Environment variables
 * @returns The JWT token
 */
export function generateToken(user: AdminUser, env: any): string {
  // Set token expiration to 24 hours
  const expiresIn = 24 * 60 * 60;
  
  // Using a static JWT secret for simplicity
  const JWT_SECRET = "soundmaster_static_jwt_secret_key_2025";
  
  // Create token
  const token = sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn }
  );
  
  return token;
}

/**
 * Authenticate a login request
 * @param request - The login request
 * @param env - Environment variables
 * @returns Response with token or error
 */
export async function login(request: Request, env: any): Promise<Response> {
  try {
    // Parse request body
    const { username, password } = await request.json() as { 
      username: string;
      password: string;
    };
    
    // Validate input
    if (!username || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Username and password are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check credentials with static username and password
    // Using hardcoded credentials for simplicity
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "Soundmaster2025!";
    
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid username or password'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create user object
    const user: AdminUser = {
      id: '1', // In a real implementation, this would be from the database
      username,
      role: 'administrator'
    };
    
    // Generate token
    const token = generateToken(user, env);
    
    // Return success response with token
    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        username: user.username,
        role: user.role
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Authentication failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Middleware to require authentication
 * @param request - The incoming request
 * @param env - Environment variables
 * @param handler - The handler function to call if authenticated
 * @returns Response from handler or unauthorized error
 */
export async function requireAuth(
  request: Request, 
  env: any, 
  handler: (request: Request, env: any, user: AdminUser) => Promise<Response>
): Promise<Response> {
  // Authenticate request
  const user = await authenticate(request, env);
  
  if (!user) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Authentication required'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Call handler with authenticated user
  return handler(request, env, user);
}

/**
 * Middleware to require administrator role
 * @param request - The incoming request
 * @param env - Environment variables
 * @param handler - The handler function to call if authorized
 * @returns Response from handler or forbidden error
 */
export async function requireAdmin(
  request: Request, 
  env: any, 
  handler: (request: Request, env: any, user: AdminUser) => Promise<Response>
): Promise<Response> {
  return requireAuth(request, env, async (request, env, user) => {
    if (user.role !== 'administrator') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Administrator access required'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return handler(request, env, user);
  });
}
