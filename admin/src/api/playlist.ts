// Playlist management API for Soundmaster Admin Dashboard
import { Env } from '../types/env';
import { Playlist, PlaylistRequest, Track } from '../types/content';
import { RequestWithParams } from '../types/request';
import { verifyToken } from '../auth';

/**
 * Create a new playlist
 * @param request Request with playlist data
 * @param env Cloudflare environment
 * @returns Response with created playlist or error
 */
export async function createPlaylist(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token and get user ID
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const data = await request.json() as PlaylistRequest;
    
    // Validate input
    if (!data.title || !data.description) {
      return new Response(JSON.stringify({ error: 'Title and description are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate playlist ID
    const playlistId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Calculate total duration and track count
    let totalSeconds = 0;
    const tracks: Track[] = data.tracks.map(track => {
      // Parse duration (MM:SS) to seconds
      const [minutes, seconds] = track.duration.split(':').map(Number);
      totalSeconds += (minutes * 60) + seconds;
      
      return {
        id: crypto.randomUUID(),
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        mediaId: track.mediaId
      };
    });
    
    // Convert total seconds back to H:MM:SS format
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const duration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Create playlist object
    const playlist: Playlist = {
      id: playlistId,
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
      tracks,
      duration,
      trackCount: tracks.length,
      featured: data.featured || false,
      createdAt: now,
      updatedAt: now
    };
    
    // Store playlist in database
    const stmt = env.DB.prepare(`
      INSERT INTO playlists (
        id, title, description, cover_image, tracks, duration, 
        track_count, featured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      playlistId,
      playlist.title,
      playlist.description,
      playlist.coverImage || null,
      JSON.stringify(playlist.tracks),
      playlist.duration,
      playlist.trackCount,
      playlist.featured ? 1 : 0,
      playlist.createdAt,
      playlist.updatedAt
    ).run();
    
    // Generate HTML for the playlists page
    await generatePlaylistsHtml(env);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Playlist created successfully',
      ...playlist
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return new Response(JSON.stringify({ error: 'Failed to create playlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get all playlists
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with playlists or error
 */
export async function getPlaylists(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all playlists from database
    const stmt = env.DB.prepare(`
      SELECT * FROM playlists ORDER BY featured DESC, created_at DESC
    `);
    
    const result = await stmt.all();
    
    if (!result.results || !Array.isArray(result.results)) {
      return new Response(JSON.stringify({ playlists: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Format playlists
    const playlists: Playlist[] = result.results.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      coverImage: row.cover_image,
      tracks: JSON.parse(row.tracks),
      duration: row.duration,
      trackCount: row.track_count,
      featured: row.featured === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    return new Response(JSON.stringify({ playlists }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting playlists:', error);
    return new Response(JSON.stringify({ error: 'Failed to get playlists' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get a playlist by ID
 * @param request Request with playlist ID
 * @param env Cloudflare environment
 * @returns Response with playlist or error
 */
export async function getPlaylist(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get playlist ID from params
    const { id } = request.params || {};
    if (!id) {
      return new Response(JSON.stringify({ error: 'Playlist ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get playlist from database
    const stmt = env.DB.prepare(`
      SELECT * FROM playlists WHERE id = ?
    `);
    
    const result = await stmt.bind(id).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Playlist not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Format playlist
    const playlist: Playlist = {
      id: result.id,
      title: result.title,
      description: result.description,
      coverImage: result.cover_image,
      tracks: JSON.parse(result.tracks),
      duration: result.duration,
      trackCount: result.track_count,
      featured: result.featured === 1,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
    
    return new Response(JSON.stringify(playlist), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting playlist:', error);
    return new Response(JSON.stringify({ error: 'Failed to get playlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update a playlist
 * @param request Request with playlist ID and updated data
 * @param env Cloudflare environment
 * @returns Response with updated playlist or error
 */
export async function updatePlaylist(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get playlist ID from params
    const { id } = request.params || {};
    if (!id) {
      return new Response(JSON.stringify({ error: 'Playlist ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    const data = await request.json() as PlaylistRequest;
    
    // Validate input
    if (!data.title || !data.description) {
      return new Response(JSON.stringify({ error: 'Title and description are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if playlist exists
    const checkStmt = env.DB.prepare(`
      SELECT id FROM playlists WHERE id = ?
    `);
    
    const existingPlaylist = await checkStmt.bind(id).first();
    
    if (!existingPlaylist) {
      return new Response(JSON.stringify({ error: 'Playlist not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Calculate total duration and track count
    let totalSeconds = 0;
    const tracks: Track[] = data.tracks.map(track => {
      // Parse duration (MM:SS) to seconds
      const [minutes, seconds] = track.duration.split(':').map(Number);
      totalSeconds += (minutes * 60) + seconds;
      
      return {
        id: crypto.randomUUID(),
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        mediaId: track.mediaId
      };
    });
    
    // Convert total seconds back to H:MM:SS format
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const duration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update playlist in database
    const now = new Date().toISOString();
    const updateStmt = env.DB.prepare(`
      UPDATE playlists
      SET title = ?, description = ?, cover_image = ?, tracks = ?,
          duration = ?, track_count = ?, featured = ?, updated_at = ?
      WHERE id = ?
    `);
    
    await updateStmt.bind(
      data.title,
      data.description,
      data.coverImage || null,
      JSON.stringify(tracks),
      duration,
      tracks.length,
      data.featured ? 1 : 0,
      now,
      id
    ).run();
    
    // Get updated playlist
    const getStmt = env.DB.prepare(`
      SELECT * FROM playlists WHERE id = ?
    `);
    
    const result = await getStmt.bind(id).first();
    
    // Format playlist
    const playlist: Playlist = {
      id: result.id,
      title: result.title,
      description: result.description,
      coverImage: result.cover_image,
      tracks: JSON.parse(result.tracks),
      duration: result.duration,
      trackCount: result.track_count,
      featured: result.featured === 1,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
    
    // Generate HTML for the playlists page
    await generatePlaylistsHtml(env);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Playlist updated successfully',
      ...playlist
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating playlist:', error);
    return new Response(JSON.stringify({ error: 'Failed to update playlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Delete a playlist
 * @param request Request with playlist ID
 * @param env Cloudflare environment
 * @returns Response with success or error
 */
export async function deletePlaylist(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get playlist ID from params
    const { id } = request.params || {};
    if (!id) {
      return new Response(JSON.stringify({ error: 'Playlist ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if playlist exists
    const checkStmt = env.DB.prepare(`
      SELECT id FROM playlists WHERE id = ?
    `);
    
    const existingPlaylist = await checkStmt.bind(id).first();
    
    if (!existingPlaylist) {
      return new Response(JSON.stringify({ error: 'Playlist not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete playlist from database
    const deleteStmt = env.DB.prepare(`
      DELETE FROM playlists WHERE id = ?
    `);
    
    await deleteStmt.bind(id).run();
    
    // Generate HTML for the playlists page
    await generatePlaylistsHtml(env);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Playlist deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete playlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generate HTML for the playlists page
 * @param env Cloudflare environment
 */
async function generatePlaylistsHtml(env: Env): Promise<void> {
  try {
    // Get all playlists from database
    const stmt = env.DB.prepare(`
      SELECT * FROM playlists ORDER BY featured DESC, created_at DESC
    `);
    
    const result = await stmt.all();
    
    if (!result.results || !Array.isArray(result.results)) {
      return;
    }
    
    // Format playlists
    const playlists: Playlist[] = result.results.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      coverImage: row.cover_image,
      tracks: JSON.parse(row.tracks),
      duration: row.duration,
      trackCount: row.track_count,
      featured: row.featured === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    // Get template HTML
    const templateKey = 'templates/playlists.html';
    const template = await env.ADMIN_ASSETS.get(templateKey);
    
    if (!template) {
      console.error('Playlists template not found');
      return;
    }
    
    // Generate playlist cards HTML
    let playlistCardsHtml = '';
    
    for (let i = 0; i < playlists.length; i++) {
      const playlist = playlists[i];
      
      // Create a card for each playlist
      playlistCardsHtml += `
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title"><i class="fas fa-music"></i> ${playlist.title}</h3>
              <p class="card-text">${playlist.description}</p>
              <p><strong>Tracks:</strong> ${playlist.trackCount}</p>
              <p><strong>Duration:</strong> ${playlist.duration}</p>
              <a href="http://www.virtualdj.com/user/djvarkie/live.html" class="btn mt-2">Listen Now</a>
            </div>
          </div>
        </div>
      `;
      
      // Break into rows of 3 cards
      if ((i + 1) % 3 === 0 && i < playlists.length - 1) {
        playlistCardsHtml += '</div><div class="row">';
      }
    }
    
    // Replace placeholder in template
    const html = template.replace('{{PLAYLIST_CARDS}}', playlistCardsHtml);
    
    // Store generated HTML
    await env.ADMIN_ASSETS.put('playlists.html', html);
    
    console.log('Playlists HTML generated successfully');
  } catch (error) {
    console.error('Error generating playlists HTML:', error);
  }
}
