import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/app/auth';

// Paths that require authentication
const PROTECTED_PATHS = [
  '/admin/dashboard',
  '/admin/news',
  '/admin/team',
];

// Paths that are exceptions (public within protected areas)
const PUBLIC_PATHS = [
  '/admin', // The login page itself is public
  '/api/auth',
];

// API paths that require authentication
const PROTECTED_API_PATHS = [
  '/api/dashboard',
  '/api/content',
  '/api/media',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedPage = PROTECTED_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  const isProtectedApi = PROTECTED_API_PATHS.some(path => 
    pathname.startsWith(path)
  );
  
  // Check if the path is a public exception
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // If it's not protected or it's a public exception, allow access
  if ((!isProtectedPage && !isProtectedApi) || isPublicPath) {
    return NextResponse.next();
  }
  
  // Use Auth.js to check authentication
  const session = await auth();
  
  // If not authenticated, redirect to login or return unauthorized
  if (!session || !session.user) {
    if (isProtectedPage) {
      // For page requests, redirect to login
      const url = new URL('/admin', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    } else {
      // For API routes, return unauthorized status
      if (isProtectedApi) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // For pages, redirect to login
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  // Check for role-based access control
  const userRole = session.user.role;
  
  // Admin-only paths (higher level of protection)
  const ADMIN_ONLY_PATHS = [
    '/admin/dashboard/users',
    '/api/dashboard/users',
  ];
  
  // Check if the path requires admin role
  const isAdminOnlyPath = ADMIN_ONLY_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // If it's an admin-only path and user is not an admin, deny access
  if (isAdminOnlyPath && userRole !== 'admin') {
    // For API routes, return forbidden status
    if (isProtectedApi) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // For pages, redirect to dashboard with access denied message
    const url = new URL('/admin/dashboard', request.url);
    url.searchParams.set('error', 'access_denied');
    return NextResponse.redirect(url);
  }
  
  // User is authenticated and has appropriate role, allow access
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all protected paths
    '/admin/dashboard/:path*',
    '/admin/news/:path*',
    '/admin/team/:path*',
    // Match all protected API paths
    '/api/dashboard/:path*',
    '/api/content/:path*',
    '/api/media/:path*',
  ],
};
