// API handlers for Soundmaster Admin Dashboard
import type { Env } from '../index';
import {
  getContentList,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  getUserList,
  getScheduleList,
  getPlaylistList,
  getPlaylistTracks as getPlaylistTracksList,
  ContentType,
  BaseContent,
} from './db';

// Interface for request with params
interface RequestWithParams extends Request {
  params?: Record<string, string>;
}

// Content handlers
export async function getContent(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    const type = request.params?.type as ContentType;
    
    if (!type) {
      return new Response(JSON.stringify({ error: 'Content type is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const content = await getContentList(env, type);
    
    return new Response(JSON.stringify(content), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in getContent:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getContentItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    const type = request.params?.type as ContentType;
    const id = request.params?.id;
    
    if (!type || !id) {
      return new Response(JSON.stringify({ error: 'Content type and ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const content = await getContentById(env, type, id);
    
    if (!content) {
      return new Response(JSON.stringify({ error: 'Content not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(content), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in getContentItem:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch content item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function createContentItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    const type = request.params?.type as ContentType;
    
    if (!type) {
      return new Response(JSON.stringify({ error: 'Content type is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const contentData = await request.json() as Partial<BaseContent>;
    
    // Validate required fields
    if (!contentData.title || !contentData.slug) {
      return new Response(JSON.stringify({ error: 'Title and slug are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const id = await createContent(env, type, contentData);
    
    return new Response(JSON.stringify({ id, success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in createContentItem:', error);
    return new Response(JSON.stringify({ error: 'Failed to create content item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function updateContentItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    const type = request.params?.type as ContentType;
    const id = request.params?.id;
    
    if (!type || !id) {
      return new Response(JSON.stringify({ error: 'Content type and ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if content exists
    const existingContent = await getContentById(env, type, id);
    
    if (!existingContent) {
      return new Response(JSON.stringify({ error: 'Content not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const contentData = await request.json() as Partial<BaseContent>;
    
    await updateContent(env, type, id, contentData);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in updateContentItem:', error);
    return new Response(JSON.stringify({ error: 'Failed to update content item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function deleteContentItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    const type = request.params?.type as ContentType;
    const id = request.params?.id;
    
    if (!type || !id) {
      return new Response(JSON.stringify({ error: 'Content type and ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if content exists
    const existingContent = await getContentById(env, type, id);
    
    if (!existingContent) {
      return new Response(JSON.stringify({ error: 'Content not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await deleteContent(env, type, id);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in deleteContentItem:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete content item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// User handlers
export async function getUsers(request: Request, env: Env): Promise<Response> {
  try {
    const users = await getUserList(env);
    
    return new Response(JSON.stringify(users), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Schedule handlers
export async function getSchedule(request: Request, env: Env): Promise<Response> {
  try {
    const schedule = await getScheduleList(env);
    
    return new Response(JSON.stringify(schedule), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in getSchedule:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch schedule' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Playlist handlers
export async function getPlaylists(request: Request, env: Env): Promise<Response> {
  try {
    const playlists = await getPlaylistList(env);
    
    return new Response(JSON.stringify(playlists), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in getPlaylists:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch playlists' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getPlaylistTracks(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    const playlistId = request.params?.id;
    
    if (!playlistId) {
      return new Response(JSON.stringify({ error: 'Playlist ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const tracks = await getPlaylistTracksList(env, playlistId);
    
    return new Response(JSON.stringify(tracks), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in getPlaylistTracks:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch playlist tracks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
