/**
 * Content Loader for Soundmaster Website
 * Dynamically loads content from the Cloudflare Worker
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Load dynamic content sections
  loadDynamicContent();
  
  // Initialize audio players if present
  initAudioPlayers();
});

/**
 * Load dynamic content from the API
 */
async function loadDynamicContent() {
  // Load news items on the news page
  if (window.location.pathname.includes('news.html')) {
    await loadNewsContent();
  }
  
  // Load on-demand content
  if (window.location.pathname.includes('on_demand.html')) {
    await loadOnDemandContent();
  }
  
  // Load team members
  if (window.location.pathname.includes('team.html')) {
    await loadTeamContent();
  }
  
  // Load schedule
  if (window.location.pathname.includes('schedule.html')) {
    await loadScheduleContent();
  }
  
  // Load playlists
  if (window.location.pathname.includes('playlists.html')) {
    await loadPlaylistsContent();
  }
}

/**
 * Load news content
 */
async function loadNewsContent() {
  const newsContainer = document.getElementById('news-container');
  if (!newsContainer) return;
  
  try {
    const response = await api.getContent({ type: 'news' });
    
    if (response.success && response.content && response.content.length > 0) {
      const newsItems = response.content;
      
      newsContainer.innerHTML = newsItems.map(item => `
        <div class="news-item">
          <h3>${item.title}</h3>
          <p class="news-date">${new Date(item.published_at).toLocaleDateString()}</p>
          <div class="news-content">${item.content}</div>
        </div>
      `).join('');
    } else {
      newsContainer.innerHTML = '<p>No news items available.</p>';
    }
  } catch (error) {
    console.error('Error loading news content:', error);
    newsContainer.innerHTML = '<p>Failed to load news content. Please try again later.</p>';
  }
}

/**
 * Load on-demand content
 */
async function loadOnDemandContent() {
  const onDemandContainer = document.getElementById('on-demand-container');
  if (!onDemandContainer) return;
  
  try {
    const response = await api.getMedia({ type: 'audio' });
    
    if (response.success && response.media && response.media.length > 0) {
      const audioItems = response.media;
      
      onDemandContainer.innerHTML = audioItems.map(item => `
        <div class="audio-item">
          <h3>${item.title}</h3>
          <p class="audio-description">${item.description || ''}</p>
          <audio controls src="${api.getMediaUrl(item.id)}"></audio>
        </div>
      `).join('');
    } else {
      onDemandContainer.innerHTML = '<p>No on-demand content available.</p>';
    }
  } catch (error) {
    console.error('Error loading on-demand content:', error);
    onDemandContainer.innerHTML = '<p>Failed to load on-demand content. Please try again later.</p>';
  }
}

/**
 * Load team content
 */
async function loadTeamContent() {
  const teamContainer = document.getElementById('team-container');
  if (!teamContainer) return;
  
  try {
    const response = await api.getContent({ type: 'team' });
    
    if (response.success && response.content && response.content.length > 0) {
      const teamMembers = response.content;
      
      teamContainer.innerHTML = teamMembers.map(member => `
        <div class="team-member">
          <img src="${api.getMediaUrl(member.featured_image_id)}" alt="${member.title}" class="team-photo">
          <h3>${member.title}</h3>
          <p class="team-role">${member.metadata?.role || ''}</p>
          <div class="team-bio">${member.content}</div>
        </div>
      `).join('');
    } else {
      teamContainer.innerHTML = '<p>No team information available.</p>';
    }
  } catch (error) {
    console.error('Error loading team content:', error);
    teamContainer.innerHTML = '<p>Failed to load team information. Please try again later.</p>';
  }
}

/**
 * Load schedule content
 */
async function loadScheduleContent() {
  const scheduleContainer = document.getElementById('schedule-container');
  if (!scheduleContainer) return;
  
  try {
    const response = await api.getContent({ type: 'schedule' });
    
    if (response.success && response.content && response.content.length > 0) {
      const scheduleItems = response.content;
      
      scheduleContainer.innerHTML = scheduleItems.map(item => `
        <div class="schedule-item">
          <h3>${item.title}</h3>
          <p class="schedule-time">${item.metadata?.day || ''} ${item.metadata?.time || ''}</p>
          <div class="schedule-description">${item.content}</div>
        </div>
      `).join('');
    } else {
      scheduleContainer.innerHTML = '<p>No schedule information available.</p>';
    }
  } catch (error) {
    console.error('Error loading schedule content:', error);
    scheduleContainer.innerHTML = '<p>Failed to load schedule information. Please try again later.</p>';
  }
}

/**
 * Load playlists content
 */
async function loadPlaylistsContent() {
  const playlistsContainer = document.getElementById('playlists-container');
  if (!playlistsContainer) return;
  
  try {
    const response = await api.getContent({ type: 'playlist' });
    
    if (response.success && response.content && response.content.length > 0) {
      const playlists = response.content;
      
      playlistsContainer.innerHTML = playlists.map(playlist => `
        <div class="playlist-item">
          <h3>${playlist.title}</h3>
          <p class="playlist-date">${new Date(playlist.published_at).toLocaleDateString()}</p>
          <div class="playlist-content">${playlist.content}</div>
        </div>
      `).join('');
    } else {
      playlistsContainer.innerHTML = '<p>No playlists available.</p>';
    }
  } catch (error) {
    console.error('Error loading playlists content:', error);
    playlistsContainer.innerHTML = '<p>Failed to load playlists. Please try again later.</p>';
  }
}

/**
 * Initialize audio players
 */
function initAudioPlayers() {
  // Add any custom audio player initialization here
  const audioPlayers = document.querySelectorAll('audio');
  
  audioPlayers.forEach(player => {
    // Add event listeners or custom controls as needed
    player.addEventListener('play', () => {
      // Pause other players when one starts playing
      audioPlayers.forEach(otherPlayer => {
        if (otherPlayer !== player && !otherPlayer.paused) {
          otherPlayer.pause();
        }
      });
    });
  });
}
