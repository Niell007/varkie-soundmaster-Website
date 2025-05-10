// Authentication module for Soundmaster Admin Dashboard
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';

// Interface for JWT payload
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: string;
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}

// Interface for User
export interface User {
  id: string;
  email: string;
  password: string; // Hashed password
  role: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Generate a JWT token for a user
 * @param user User object
 * @param secret JWT secret
 * @param expiresIn Token expiration time in seconds (default: 24 hours)
 * @returns JWT token
 */
export async function generateToken(user: User, secret: string, expiresIn: number = 86400): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: now + expiresIn,
    iat: now
  };
  
  return await sign(payload, secret);
}

/**
 * Verify a JWT token
 * @param token JWT token
 * @param secret JWT secret
 * @returns Decoded JWT payload if valid, null otherwise
 */
export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const isValid = await verify(token, secret);
    if (!isValid) return null;
    
    const decoded = JSON.parse(atob(token.split('.')[1])) as JWTPayload;
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) return null;
    
    return decoded;
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
}

/**
 * Middleware to verify JWT token in request headers
 * @param request Request object
 * @param env Environment variables
 * @returns Response if authentication fails, otherwise passes to next handler
 */
export async function verifyToken(request: Request, env: any): Promise<Response | void> {
  // Get authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  // Verify token
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Add user info to request for use in handlers
  // @ts-ignore
  request.user = payload;
}
