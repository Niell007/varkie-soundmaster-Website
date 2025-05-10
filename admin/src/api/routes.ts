// API routes for Soundmaster Admin Dashboard
import { Router } from 'itty-router';
import type { Env } from '../index';
import { verifyToken } from '../auth';
import {
  getContent,
  getContentItem,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  getSchedule,
  getPlaylists,
  getPlaylistTracks,
  getUsers
} from './handlers';
import {
  uploadMedia,
  getMedia,
  getMediaMetadata,
  updateMediaMetadata,
  listMedia,
  deleteMedia,
  getSignedUrl
} from './media';
import { login, logout } from './auth';
import { getUserProfile, updateUserSettings } from './user';

// Create a new router
const apiRouter = Router({ base: '/api' });

// Content routes
apiRouter.get('/content/:type', verifyToken, getContent);
apiRouter.get('/content/:type/:id', verifyToken, getContentItem);
apiRouter.post('/content/:type', verifyToken, createContentItem);
apiRouter.put('/content/:type/:id', verifyToken, updateContentItem);
apiRouter.delete('/content/:type/:id', verifyToken, deleteContentItem);

// Schedule routes
apiRouter.get('/schedule', verifyToken, getSchedule);

// Playlist routes
apiRouter.get('/playlists', verifyToken, getPlaylists);
apiRouter.get('/playlists/:id/tracks', verifyToken, getPlaylistTracks);

// User routes
apiRouter.get('/users', verifyToken, getUsers);
apiRouter.get('/user/profile', verifyToken, getUserProfile);
apiRouter.put('/user/settings', verifyToken, updateUserSettings);

// Media routes
apiRouter.post('/media/:type?', verifyToken, uploadMedia);
apiRouter.get('/media/:key', getMedia); // Public access for media files
apiRouter.get('/media/:key/metadata', verifyToken, getMediaMetadata);
apiRouter.put('/media/:key/metadata', verifyToken, updateMediaMetadata);
apiRouter.get('/media', verifyToken, listMedia);
apiRouter.delete('/media/:key', verifyToken, deleteMedia);
apiRouter.get('/media/:key/signed-url', verifyToken, getSignedUrl);

// Placeholder routes for future implementation
apiRouter.all('*', verifyToken, () => {
  return new Response(JSON.stringify({ error: 'API endpoint not implemented yet' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
});

export default apiRouter;
