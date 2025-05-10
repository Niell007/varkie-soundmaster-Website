import { Router } from 'itty-router';
import { Env } from './types/env';
import { RequestWithParams } from './types/request';
import { handleLogin, handleLogout, handleRegister } from './auth/handlers';
import { createPlaylist, getPlaylists, getPlaylist, updatePlaylist, deletePlaylist } from './api/playlist';
import { createScheduleItem, getScheduleItems, getScheduleItem, updateScheduleItem, deleteScheduleItem } from './api/schedule';
import { createNewsItem, getNewsItems, getNewsItem, updateNewsItem, deleteNewsItem } from './api/news';
import { createContentTables, initializeTemplates } from './migrations/content';

// Create a new router
const router = Router();

// Auth routes
router.post('/api/login', handleLogin);
router.post('/api/register', handleRegister);
router.post('/api/logout', handleLogout);

// Playlist routes
router.get('/api/playlists', async (request: RequestWithParams, env: Env) => getPlaylists(request, env));
router.post('/api/playlists', async (request: RequestWithParams, env: Env) => createPlaylist(request, env));
router.get('/api/playlists/:id', async (request: RequestWithParams, env: Env) => getPlaylist(request, env));
router.put('/api/playlists/:id', async (request: RequestWithParams, env: Env) => updatePlaylist(request, env));
router.delete('/api/playlists/:id', async (request: RequestWithParams, env: Env) => deletePlaylist(request, env));

// Schedule routes
router.get('/api/schedule', async (request: RequestWithParams, env: Env) => getScheduleItems(request, env));
router.post('/api/schedule', async (request: RequestWithParams, env: Env) => createScheduleItem(request, env));
router.get('/api/schedule/:id', async (request: RequestWithParams, env: Env) => getScheduleItem(request, env));
router.put('/api/schedule/:id', async (request: RequestWithParams, env: Env) => updateScheduleItem(request, env));
router.delete('/api/schedule/:id', async (request: RequestWithParams, env: Env) => deleteScheduleItem(request, env));

// News routes
router.get('/api/news', async (request: RequestWithParams, env: Env) => getNewsItems(request, env));
router.post('/api/news', async (request: RequestWithParams, env: Env) => createNewsItem(request, env));
router.get('/api/news/:id', async (request: RequestWithParams, env: Env) => getNewsItem(request, env));
router.put('/api/news/:id', async (request: RequestWithParams, env: Env) => updateNewsItem(request, env));
router.delete('/api/news/:id', async (request: RequestWithParams, env: Env) => deleteNewsItem(request, env));

// Handle all requests
export async function handleRequest(request: Request, env: Env): Promise<Response> {
  // Initialize database tables if needed
  try {
    await createContentTables(env);
    await initializeTemplates(env);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
  
  // Parse URL to get pathname
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Check if request is for static asset
  if (path.startsWith('/assets/')) {
    const assetKey = path.replace('/assets/', '');
    const asset = await env.ADMIN_ASSETS.get(assetKey);
    
    if (asset) {
      // Determine content type based on file extension
      const contentType = getContentType(assetKey);
      return new Response(asset, {
        headers: {
          'Content-Type': contentType
        }
      });
    }
  }
  
  // Check if request is for API
  if (path.startsWith('/api/')) {
    // Add params to request object for router
    const params = {};
    const request2 = { ...request, params };
    
    // Handle API request with router
    return router.handle(request2, env);
  }
  
  // Serve index.html for all other routes (SPA)
  const indexHtml = await env.ADMIN_ASSETS.get('index.html');
  
  if (indexHtml) {
    return new Response(indexHtml, {
      headers: {
        'Content-Type': 'text/html'
      }
    });
  }
  
  // Fallback response
  return new Response('Not Found', { status: 404 });
}

/**
 * Get content type based on file extension
 * @param filename File name or path
 * @returns Content type string
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'html': return 'text/html';
    case 'css': return 'text/css';
    case 'js': return 'application/javascript';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'ico': return 'image/x-icon';
    case 'txt': return 'text/plain';
    case 'pdf': return 'application/pdf';
    case 'mp3': return 'audio/mpeg';
    case 'mp4': return 'video/mp4';
    default: return 'application/octet-stream';
  }
}
