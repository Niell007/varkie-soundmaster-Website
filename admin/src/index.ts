import { Router } from 'itty-router';

// Define environment interface
export interface Env {
  DB: D1Database;
  ADMIN_ASSETS: KVNamespace;
  MEDIA_BUCKET: R2Bucket;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
}

// Create router
const router = Router();

// Serve login page
router.get('/admin/login', async (request: Request, env: Env) => {
  // Read the login.html file content
  const loginHtml = await env.ADMIN_ASSETS.get('login.html');
  
  if (loginHtml) {
    return new Response(loginHtml, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  }
  
  // Fallback to inline HTML if file not found in KV
  const fallbackLoginHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Soundmaster Admin - Login</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background-color: #071e24; display: flex; align-items: center; min-height: 100vh; }
    .login-container { max-width: 400px; margin: auto; padding: 15px; }
    .card { border-radius: 1rem; overflow: hidden; }
    .card-header { background-color: #071e24; color: white; padding: 1.5rem; text-align: center; }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="card">
      <div class="card-header">
        <h4>Soundmaster Admin</h4>
        <p>Login to access dashboard</p>
      </div>
      <div class="card-body p-4">
        <div id="loginForm">
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="email" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" required>
          </div>
          <div class="d-grid gap-2 mt-4">
            <button type="button" class="btn btn-primary" id="loginButton">Login</button>
          </div>
          <div class="alert alert-danger mt-3 d-none" id="loginError"></div>
        </div>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('loginButton').addEventListener('click', function() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      if (email === 'admin@soundmaster.com' && password === 'admin123') {
        localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTk5OTk5OTk5OX0.signature');
        window.location.href = '/admin';
      } else {
        document.getElementById('loginError').textContent = 'Invalid email or password';
        document.getElementById('loginError').classList.remove('d-none');
      }
    });
  </script>
</body>
</html>`;

  return new Response(fallbackLoginHtml, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
});

// Serve admin dashboard
router.get('/admin', async (request: Request, env: Env) => {
  // Read the dashboard.html file content
  const dashboardHtml = await env.ADMIN_ASSETS.get('dashboard.html');
  
  if (dashboardHtml) {
    return new Response(dashboardHtml, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  }
  
  // Fallback to inline HTML if file not found in KV
  const fallbackDashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Soundmaster Admin Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background-color: #f8f9fa; }
    .sidebar { background-color: #071e24; min-height: 100vh; color: white; }
    .nav-link { color: rgba(255,255,255,0.75); }
    .nav-link:hover, .nav-link.active { color: white; }
  </style>
</head>
<body>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-3 col-lg-2 sidebar p-3">
        <h4 class="text-center mb-4">Soundmaster Admin</h4>
        <ul class="nav flex-column">
          <li class="nav-item"><a class="nav-link active" href="#">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Content</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Schedule</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Playlists</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Users</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Settings</a></li>
        </ul>
        <div class="mt-5">
          <button id="logoutBtn" class="btn btn-danger w-100">Logout</button>
        </div>
      </div>
      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
        <h1>Dashboard</h1>
        <div class="row mt-4">
          <div class="col-md-3 mb-3">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <h5 class="card-title">Users</h5>
                <h2>5</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-success text-white">
              <div class="card-body">
                <h5 class="card-title">Content</h5>
                <h2>12</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-warning text-white">
              <div class="card-body">
                <h5 class="card-title">Playlists</h5>
                <h2>8</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-danger text-white">
              <div class="card-body">
                <h5 class="card-title">Shows</h5>
                <h2>15</h2>
              </div>
            </div>
          </div>
        </div>
        <div class="alert alert-info mt-4">
          Welcome to the Soundmaster Admin Dashboard. This is a simplified version for demonstration purposes.
        </div>
      </main>
    </div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Check authentication
      if (!localStorage.getItem('authToken')) {
        window.location.href = '/admin/login';
      }
      
      // Setup logout
      document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('authToken');
        window.location.href = '/admin/login';
      });
    });
  </script>
</body>
</html>`;

  return new Response(fallbackDashboardHtml, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
});

// Define login request interface
interface LoginRequest {
  email: string;
  password: string;
}

// API routes
router.post('/api/auth/login', async (request: Request, env: Env) => {
  try {
    const body = await request.json() as LoginRequest;
    const { email, password } = body;
    
    // For demo purposes, use hardcoded credentials
    if (email === 'admin@soundmaster.com' && password === 'admin123') {
      return new Response(JSON.stringify({
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTk5OTk5OTk5OX0.signature'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid email or password' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid request format' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Catch-all route for static assets
router.get('*', async (request: Request, env: Env) => {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Try to serve from KV namespace
  const asset = await env.ADMIN_ASSETS.get(path.substring(1) || 'index.html');
  
  if (asset) {
    const contentType = getContentType(path);
    return new Response(asset, {
      headers: { 'Content-Type': contentType }
    });
  }
  
  // If not found, redirect to login
  if (path.startsWith('/admin')) {
    return Response.redirect('/admin/login', 302);
  }
  
  // Otherwise return 404
  return new Response('Not Found', { status: 404 });
});

// Helper function to determine content type
function getContentType(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'html': return 'text/html;charset=UTF-8';
    case 'css': return 'text/css';
    case 'js': return 'application/javascript';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'svg': return 'image/svg+xml';
    default: return 'text/plain';
  }
}

// Export fetch handler
// Import API routes
import * as mediaRoutes from './api/media';

// Register API routes
router.get('/api/media', (request, env) => mediaRoutes.listMedia(request, env));
router.post('/api/media/upload', (request, env) => mediaRoutes.uploadMedia(request, env));
router.get('/api/media/:key', (request, env) => mediaRoutes.getMedia(request, env));
router.get('/api/media/:key/metadata', (request, env) => mediaRoutes.getMediaMetadata(request, env));
router.put('/api/media/:key/metadata', (request, env) => mediaRoutes.updateMediaMetadata(request, env));
router.delete('/api/media/:key', (request, env) => mediaRoutes.deleteMedia(request, env));
router.post('/api/media/:key/signedUrl', (request, env) => mediaRoutes.getSignedUrl(request, env));

// Serve the React application for admin routes
router.get('/admin*', async (request: Request, env: Env) => {
  // Get the HTML template from KV or use the default one
  const htmlTemplate = await env.ADMIN_ASSETS.get('index.html') || 
    await fetch('https://storage.googleapis.com/soundmaster-admin/index.html').then(res => res.text());
  
  return new Response(htmlTemplate, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Add CORS headers to all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    
    // Process the request through the router
    return router.handle(request, env)
      .then(response => {
        // Clone the response to add CORS headers
        const newResponse = new Response(response.body, response);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
        });
        return newResponse;
      })
      .catch(error => {
        console.error('Error handling request:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      });
  },
};