// Deployment API for Soundmaster Admin Dashboard
import { Env } from '../types/env';
import { RequestWithParams } from '../types/request';
import { Playlist } from '../types/playlist';
import { verifyToken } from './auth';

/**
 * Deploy the website content
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with deployment status
 */
export async function deployWebsite(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token and ensure admin role
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user has admin role
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only administrators can deploy the website' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate all HTML files
    await generateAllHtml(env);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Website deployed successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deploying website:', error);
    return new Response(JSON.stringify({ error: 'Failed to deploy website' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generate all HTML files for the website
 * @param env Cloudflare environment
 */
async function generateAllHtml(env: Env): Promise<void> {
  try {
    // Generate index.html
    await generateIndexHtml(env);
    
    // Generate playlists.html
    await generatePlaylistsHtml(env);
    
    // Generate schedule.html
    await generateScheduleHtml(env);
    
    // Generate news.html and individual news pages
    await generateNewsHtml(env);
    
    console.log('All HTML files generated successfully');
  } catch (error) {
    console.error('Error generating HTML files:', error);
    throw error;
  }
}

/**
 * Generate the index.html file
 * @param env Cloudflare environment
 */
async function generateIndexHtml(env: Env): Promise<void> {
  try {
    // Get template
    const templateKey = 'templates/index.html';
    const template = await env.ADMIN_ASSETS.get(templateKey);
    
    if (!template) {
      console.error('Index template not found');
      return;
    }
    
    // Get featured playlists
    const playlistsStmt = env.DB.prepare(`
      SELECT * FROM playlists WHERE featured = 1 ORDER BY created_at DESC LIMIT 3
    `);
    
    const playlistsResult = await playlistsStmt.all();
    
    // Get featured news
    const newsStmt = env.DB.prepare(`
      SELECT * FROM news 
      WHERE featured = 1 AND publish_date <= datetime('now') 
      ORDER BY publish_date DESC LIMIT 3
    `);
    
    const newsResult = await newsStmt.all();
    
    // Generate featured playlists HTML
    let featuredPlaylistsHtml = '';
    
    if (playlistsResult.results && Array.isArray(playlistsResult.results) && playlistsResult.results.length > 0) {
      featuredPlaylistsHtml = '<div class="row">';
      
      playlistsResult.results.forEach((playlist) => {
        // Use type assertion to avoid TypeScript errors
        const typedPlaylist = playlist as any;
        
        featuredPlaylistsHtml += `
          <div class="col-md-4 mb-4">
            <div class="card">
              <div class="card-body">
                <h3 class="card-title"><i class="fas fa-music"></i> ${typedPlaylist.title}</h3>
                <p class="card-text">${typedPlaylist.description}</p>
                <p><strong>Tracks:</strong> ${typedPlaylist.track_count}</p>
                <p><strong>Duration:</strong> ${typedPlaylist.duration}</p>
                <a href="http://www.virtualdj.com/user/djvarkie/live.html" class="btn mt-2">Listen Now</a>
              </div>
            </div>
          </div>
        `;
      });
      
      featuredPlaylistsHtml += '</div>';
    } else {
      featuredPlaylistsHtml = '<p class="text-center">No featured playlists available.</p>';
    }
    
    // Generate featured news HTML
    let featuredNewsHtml = '';
    
    if (newsResult.results && Array.isArray(newsResult.results) && newsResult.results.length > 0) {
      featuredNewsHtml = '<div class="row">';
      
      newsResult.results.forEach((news: any) => {
        const publishDate = new Date(news.publish_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        featuredNewsHtml += `
          <div class="col-md-4 mb-4">
            <div class="card news-card">
              ${news.image ? `<img src="${news.image}" class="card-img-top" alt="${news.title}">` : ''}
              <div class="card-body">
                <h3 class="card-title">${news.title}</h3>
                <p class="card-text">${news.summary}</p>
                <div class="card-meta">
                  <span class="publish-date"><i class="far fa-calendar-alt"></i> ${publishDate}</span>
                </div>
                <a href="news/${news.id}.html" class="btn mt-3">Read More</a>
              </div>
            </div>
          </div>
        `;
      });
      
      featuredNewsHtml += '</div>';
    } else {
      featuredNewsHtml = '<p class="text-center">No featured news available.</p>';
    }
    
    // Replace placeholders in template
    let html = template;
    html = html.replace('{{FEATURED_PLAYLISTS}}', featuredPlaylistsHtml);
    html = html.replace('{{FEATURED_NEWS}}', featuredNewsHtml);
    
    // Store generated HTML
    await env.ADMIN_ASSETS.put('index.html', html);
    
    console.log('Index HTML generated successfully');
  } catch (error) {
    console.error('Error generating index HTML:', error);
  }
}

/**
 * Generate the playlists.html file
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
    
    // Get template HTML
    const templateKey = 'templates/playlists.html';
    const template = await env.ADMIN_ASSETS.get(templateKey);
    
    if (!template) {
      console.error('Playlists template not found');
      return;
    }
    
    // Generate playlist cards HTML
    let playlistCardsHtml = '';
    
    if (result.results.length === 0) {
      playlistCardsHtml = '<p class="text-center">No playlists available.</p>';
    } else {
      playlistCardsHtml = '<div class="row">';
      
      for (let i = 0; i < result.results.length; i++) {
        const playlist = result.results[i] as any;
        
        // Create a card for each playlist
        playlistCardsHtml += `
          <div class="col-md-4 mb-4">
            <div class="card">
              <div class="card-body">
                <h3 class="card-title"><i class="fas fa-music"></i> ${playlist.title}</h3>
                <p class="card-text">${playlist.description}</p>
                <p><strong>Tracks:</strong> ${playlist.track_count}</p>
                <p><strong>Duration:</strong> ${playlist.duration}</p>
                <a href="http://www.virtualdj.com/user/djvarkie/live.html" class="btn mt-2">Listen Now</a>
              </div>
            </div>
          </div>
        `;
        
        // Break into rows of 3 cards
        if ((i + 1) % 3 === 0 && i < result.results.length - 1) {
          playlistCardsHtml += '</div><div class="row">';
        }
      }
      
      playlistCardsHtml += '</div>';
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

/**
 * Generate the schedule.html file
 * @param env Cloudflare environment
 */
async function generateScheduleHtml(env: Env): Promise<void> {
  try {
    // Get all schedule items from database
    const stmt = env.DB.prepare(`
      SELECT * FROM schedule ORDER BY start_time ASC
    `);
    
    const result = await stmt.all();
    
    if (!result.results || !Array.isArray(result.results)) {
      return;
    }
    
    // Get template HTML
    const templateKey = 'templates/schedule.html';
    const template = await env.ADMIN_ASSETS.get(templateKey);
    
    if (!template) {
      console.error('Schedule template not found');
      return;
    }
    
    // Format schedule items
    const scheduleItems = result.results.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      days: JSON.parse(row.days),
      playlistId: row.playlist_id,
      hostId: row.host_id,
      color: row.color,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    // Generate schedule grid HTML
    let scheduleGridHtml = '';
    
    // Days of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Create day columns
    let dayColumnsHtml = '<div class="time-column"><div class="time-header">Time</div>';
    
    // Create time slots (6:00 AM to 12:00 AM in 1-hour increments)
    for (let hour = 6; hour < 24; hour++) {
      const displayHour = hour > 12 ? hour - 12 : hour;
      const amPm = hour >= 12 ? 'PM' : 'AM';
      dayColumnsHtml += `<div class="time-slot">${displayHour}:00 ${amPm}</div>`;
    }
    
    dayColumnsHtml += '</div>';
    
    // Create day columns with schedule items
    for (const day of days) {
      dayColumnsHtml += `<div class="day-column"><div class="day-header">${day}</div>`;
      
      // For each hour slot
      for (let hour = 6; hour < 24; hour++) {
        // Find schedule items for this day and time
        const itemsForSlot = scheduleItems.filter(item => {
          // Check if the item is scheduled for this day
          if (!item.days.includes(day)) return false;
          
          // Parse start and end times (format: "HH:MM")
          const [startHour, startMinute] = item.startTime.split(':').map(Number);
          const [endHour, endMinute] = item.endTime.split(':').map(Number);
          
          // Check if this hour falls within the item's time range
          return hour >= startHour && hour < endHour;
        });
        
        if (itemsForSlot.length > 0) {
          // Use the first matching item (we'll handle overlaps later)
          const item = itemsForSlot[0];
          dayColumnsHtml += `
            <div class="schedule-item" style="background-color: ${item.color}33;">
              <div class="item-title">${item.title}</div>
              <div class="item-time">${item.startTime} - ${item.endTime}</div>
            </div>
          `;
        } else {
          dayColumnsHtml += `<div class="empty-slot"></div>`;
        }
      }
      
      dayColumnsHtml += '</div>';
    }
    
    scheduleGridHtml = `
      <div class="schedule-grid">
        ${dayColumnsHtml}
      </div>
    `;
    
    // Replace placeholder in template
    const html = template.replace('{{SCHEDULE_CONTENT}}', scheduleGridHtml);
    
    // Store generated HTML
    await env.ADMIN_ASSETS.put('schedule.html', html);
    
    console.log('Schedule HTML generated successfully');
  } catch (error) {
    console.error('Error generating schedule HTML:', error);
  }
}

/**
 * Generate the news.html file and individual news pages
 * @param env Cloudflare environment
 */
async function generateNewsHtml(env: Env): Promise<void> {
  try {
    // Get all news items from database
    const stmt = env.DB.prepare(`
      SELECT * FROM news 
      WHERE publish_date <= datetime('now') 
      ORDER BY featured DESC, publish_date DESC
    `);
    
    const result = await stmt.all();
    
    if (!result.results || !Array.isArray(result.results)) {
      return;
    }
    
    // Format news items
    const newsItems = result.results.map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      summary: row.summary,
      image: row.image,
      publishDate: row.publish_date,
      featured: row.featured === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    // Get template HTML
    const templateKey = 'templates/news.html';
    const template = await env.ADMIN_ASSETS.get(templateKey);
    
    if (!template) {
      console.error('News template not found');
      return;
    }
    
    // Generate news content HTML
    let newsContentHtml = '';
    
    // Featured news section
    const featuredNews = newsItems.filter(item => item.featured);
    if (featuredNews.length > 0) {
      newsContentHtml += '<div class="featured-news mb-5">';
      newsContentHtml += '<h2 class="section-title mb-4">Featured News</h2>';
      newsContentHtml += '<div class="row">';
      
      featuredNews.slice(0, 3).forEach(item => {
        const publishDate = new Date(item.publishDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        newsContentHtml += `
          <div class="col-md-4 mb-4">
            <div class="card news-card featured">
              ${item.image ? `<img src="${item.image}" class="card-img-top" alt="${item.title}">` : ''}
              <div class="card-body">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-text">${item.summary}</p>
                <div class="card-meta">
                  <span class="publish-date"><i class="far fa-calendar-alt"></i> ${publishDate}</span>
                </div>
                <a href="news/${item.id}.html" class="btn mt-3">Read More</a>
              </div>
            </div>
          </div>
        `;
      });
      
      newsContentHtml += '</div></div>';
    }
    
    // Regular news section
    newsContentHtml += '<div class="all-news">';
    newsContentHtml += '<h2 class="section-title mb-4">Latest News</h2>';
    newsContentHtml += '<div class="row">';
    
    const regularNews = newsItems.filter(item => !item.featured);
    if (regularNews.length === 0) {
      newsContentHtml += '<p class="text-center col-12">No news articles available.</p>';
    } else {
      regularNews.forEach(item => {
        const publishDate = new Date(item.publishDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        newsContentHtml += `
          <div class="col-md-6 mb-4">
            <div class="card news-card">
              ${item.image ? `<img src="${item.image}" class="card-img-top" alt="${item.title}">` : ''}
              <div class="card-body">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-text">${item.summary}</p>
                <div class="card-meta">
                  <span class="publish-date"><i class="far fa-calendar-alt"></i> ${publishDate}</span>
                </div>
                <a href="news/${item.id}.html" class="btn mt-3">Read More</a>
              </div>
            </div>
          </div>
        `;
      });
    }
    
    newsContentHtml += '</div></div>';
    
    // Replace placeholder in template
    const html = template.replace('{{NEWS_CONTENT}}', newsContentHtml);
    
    // Store generated HTML
    await env.ADMIN_ASSETS.put('news.html', html);
    
    // Generate individual news pages
    for (const item of newsItems) {
      await generateNewsItemPage(env, item);
    }
    
    console.log('News HTML generated successfully');
  } catch (error) {
    console.error('Error generating news HTML:', error);
  }
}

/**
 * Generate HTML for an individual news item page
 * @param env Cloudflare environment
 * @param newsItem News item to generate page for
 */
async function generateNewsItemPage(env: Env, newsItem: any): Promise<void> {
  try {
    // Format publish date
    const publishDate = new Date(newsItem.publishDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create HTML for news item page
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${newsItem.summary ? newsItem.summary.substring(0, 160) : ''}">
    <title>${newsItem.title} - Soundmaster</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="../css/modern.css" rel="stylesheet" type="text/css">
</head>
<body>
    <div class="container">
        <header>
            <img src="../images/logo.jpg" alt="Soundmaster Logo" class="logo" width="244" height="52">
            
            <nav class="main-nav">
                <ul class="nav-list">
                    <li class="nav-item"><a href="../index.html" class="nav-link">Home</a></li>
                    <li class="nav-item"><a href="https://www.virtualdj.com/ask/Soundmaster" class="nav-link">About</a></li>
                    <li class="nav-item"><a href="http://www.virtualdj.com/user/djvarkie/live.html" class="nav-link">Playlist</a></li>
                    <li class="nav-item"><a href="../team.html" class="nav-link">Our Team</a></li>
                    <li class="nav-item"><a href="../contacts.html" class="nav-link">Contacts</a></li>
                    <li class="nav-item"><a href="../on_demand.html" class="nav-link">On-Demand</a></li>
                    <li class="nav-item"><a href="../schedule.html" class="nav-link">Schedule</a></li>
                    <li class="nav-item"><a href="../playlists.html" class="nav-link">Playlists</a></li>
                    <li class="nav-item"><a href="../news.html" class="nav-link active">News</a></li>
                </ul>
            </nav>
        </header>

        <main>
            <div class="container">
                <div class="content mt-4">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="../index.html">Home</a></li>
                            <li class="breadcrumb-item"><a href="../news.html">News</a></li>
                            <li class="breadcrumb-item active" aria-current="page">${newsItem.title}</li>
                        </ol>
                    </nav>
                    
                    <article class="news-article">
                        <h1 class="article-title">${newsItem.title}</h1>
                        <div class="article-meta mb-4">
                            <span class="publish-date"><i class="far fa-calendar-alt"></i> ${publishDate}</span>
                        </div>
                        
                        ${newsItem.image ? `<img src="${newsItem.image}" class="article-image mb-4" alt="${newsItem.title}">` : ''}
                        
                        <div class="article-content">
                            ${newsItem.content}
                        </div>
                        
                        <div class="article-footer mt-5">
                            <a href="../news.html" class="btn"><i class="fas fa-arrow-left"></i> Back to News</a>
                        </div>
                    </article>
                </div>
            </div>
        </main>

        <footer>
            <div class="container">
                <div class="footer-nav">
                    <a href="../index.html">HOME</a> | 
                    <a href="#">BOERE MUSIEK</a> | 
                    <a href="https://www.virtualdj.com/ask/Soundmaster">REQUEST SONG</a> | 
                    <a href="http://www.virtualdj.com/user/djvarkie/live.html">LIVE STREAM</a> | 
                    <a href="#">60'S-90'S</a> | 
                    <a href="#">AFRIKAANS</a>
                </div>
                <div class="social-links mt-3">
                    <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                </div>
                <p class="copyright mt-3">Copyright © 2025 Soundmaster | Design by Henry van Staden</p>
                <p class="mt-1">This site is for entertainment only and is a non-profit private hobby</p>
            </div>
        </footer>
    </div>

    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
    `;
    
    // Create directory for news pages if it doesn't exist
    await env.ADMIN_ASSETS.put(`news/${newsItem.id}.html`, html);
  } catch (error) {
    console.error(`Error generating news item page for ${newsItem.id}:`, error);
  }
}
