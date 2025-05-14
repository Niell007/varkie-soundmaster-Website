// Simple authentication utility for Cloudflare Pages
// This is a simplified version that doesn't rely on jsonwebtoken

import { cookies } from 'next/headers';

// Secret key for token generation
const AUTH_SECRET = process.env.JWT_SECRET || 'soundmaster-auth-secret-2025';
const AUTH_COOKIE_NAME = 'soundmaster-auth';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

interface AuthUser {
  username: string;
  role: string;
  userId?: number;
}

// Simple token generation that works in edge environments
export function generateToken(user: AuthUser): string {
  const payload = {
    username: user.username,
    role: user.role,
    userId: user.userId || 1,
    exp: Date.now() + SESSION_DURATION,
  };
  
  // Base64 encode the payload with the secret
  const tokenData = JSON.stringify(payload);
  const base64Data = Buffer.from(tokenData).toString('base64');
  const signature = Buffer.from(`${base64Data}:${AUTH_SECRET}`).toString('base64');
  
  return `${base64Data}.${signature}`;
}

// Verify the token
export function verifyToken(token: string): AuthUser | null {
  try {
    const [base64Data, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = Buffer.from(`${base64Data}:${AUTH_SECRET}`).toString('base64');
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(base64Data, 'base64').toString());
    
    // Check expiration
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return {
      username: payload.username,
      role: payload.role,
      userId: payload.userId,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Set auth cookie in response
export function setAuthCookieInResponse(response: Response, token: string): Response {
  response.headers.set('Set-Cookie', 
    `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_DURATION / 1000}; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}`
  );
  return response;
}

// Get auth cookie from request
export function getAuthCookieFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies[AUTH_COOKIE_NAME] || null;
}

// For server components using the cookies API
export function getAuthCookie(): string | undefined {
  try {
    const cookieStore = cookies();
    return cookieStore.get(AUTH_COOKIE_NAME)?.value;
  } catch {
    // Fallback for environments where cookies() is not available
    return undefined;
  }
}

// For server components using the cookies API
export function clearAuthCookie(): void {
  try {
    const cookieStore = cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
  } catch {
    // Fallback for environments where cookies() is not available
    console.warn('Could not clear auth cookie');
  }
}

// Get current user from cookie
export function getCurrentUser(): AuthUser | null {
  const token = getAuthCookie();
  if (!token) return null;
  
  return verifyToken(token);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Check if user has admin role
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user !== null && user.role === 'admin';
}
