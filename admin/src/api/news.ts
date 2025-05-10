// News management API for Soundmaster Admin Dashboard
import { Env } from '../types/env';
import { NewsItem, NewsItemRequest } from '../types/content';
import { RequestWithParams } from '../types/request';
import { verifyToken } from '../auth';

/**
 * Create a new news item
 * @param request Request with news data
 * @param env Cloudflare environment
 * @returns Response with created news item or error
 */
export async function createNewsItem(request: RequestWithParams, env: Env): Promise<Response> {
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
    const data = await request.json() as NewsItemRequest;
    
    // Validate input
    if (!data.title || !data.content || !data.publishDate) {
      return new Response(JSON.stringify({ error: 'Title, content, and publish date are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate news item ID
    const newsId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Create news item object
    const newsItem: NewsItem = {
      id: newsId,
      title: data.title,
      content: data.content,
      summary: data.summary || data.content.substring(0, 150) + '...',
      image: data.image,
      publishDate: data.publishDate,
      featured: data.featured || false,
      createdAt: now,
      updatedAt: now
    };
    
    // Store news item in database
    const stmt = env.DB.prepare(`
      INSERT INTO news (
        id, title, content, summary, image, publish_date, 
        featured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      newsId,
      newsItem.title,
      newsItem.content,
      newsItem.summary,
      newsItem.image || null,
      newsItem.publishDate,
      newsItem.featured ? 1 : 0,
      newsItem.createdAt,
      newsItem.updatedAt
    ).run();
    
    // Generate HTML for the news page
    await generateNewsHtml(env);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'News item created successfully',
      ...newsItem
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating news item:', error);
    return new Response(JSON.stringify({ error: 'Failed to create news item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get all news items
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with news items or error
 */
export async function getNewsItems(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all news items from database
    const stmt = env.DB.prepare(`
      SELECT * FROM news ORDER BY publish_date DESC
    `);
    
    const result = await stmt.all();
    
    if (!result.results || !Array.isArray(result.results)) {
      return new Response(JSON.stringify({ newsItems: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Format news items
    const newsItems: NewsItem[] = result.results.map((row: any) => ({
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
    
    return new Response(JSON.stringify({ newsItems }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting news items:', error);
    return new Response(JSON.stringify({ error: 'Failed to get news items' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get a news item by ID
 * @param request Request with news item ID
 * @param env Cloudflare environment
 * @returns Response with news item or error
 */
export async function getNewsItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get news item ID from params
    const { id } = request.params || {};
    if (!id) {
      return new Response(JSON.stringify({ error: 'News item ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get news item from database
    const stmt = env.DB.prepare(`
      SELECT * FROM news WHERE id = ?
    `);
    
    const result = await stmt.bind(id).first<Record<string, any>>();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'News item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Format news item
    const newsItem: NewsItem = {
      id: result.id,
      title: result.title,
      content: result.content,
      summary: result.summary,
      image: result.image,
      publishDate: result.publish_date,
      featured: result.featured === 1,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
    
    return new Response(JSON.stringify(newsItem), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting news item:', error);
    return new Response(JSON.stringify({ error: 'Failed to get news item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update a news item
 * @param request Request with news item ID and updated data
 * @param env Cloudflare environment
 * @returns Response with updated news item or error
 */
export async function updateNewsItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get news item ID from params
    const { id } = request.params || {};
    if (!id) {
      return new Response(JSON.stringify({ error: 'News item ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    const data = await request.json() as NewsItemRequest;
    
    // Validate input
    if (!data.title || !data.content || !data.publishDate) {
      return new Response(JSON.stringify({ error: 'Title, content, and publish date are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if news item exists
    const checkStmt = env.DB.prepare(`
      SELECT id FROM news WHERE id = ?
    `);
    
    const existingItem = await checkStmt.bind(id).first();
    
    if (!existingItem) {
      return new Response(JSON.stringify({ error: 'News item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate summary if not provided
    const summary = data.summary || data.content.substring(0, 150) + '...';
    
    // Update news item in database
    const now = new Date().toISOString();
    const updateStmt = env.DB.prepare(`
      UPDATE news
      SET title = ?, content = ?, summary = ?, image = ?,
          publish_date = ?, featured = ?, updated_at = ?
      WHERE id = ?
    `);
    
    await updateStmt.bind(
      data.title,
      data.content,
      summary,
      data.image || null,
      data.publishDate,
      data.featured ? 1 : 0,
      now,
      id
    ).run();
    
    // Get updated news item
    const getStmt = env.DB.prepare(`
      SELECT * FROM news WHERE id = ?
    `);
    
    const result = await getStmt.bind(id).first<Record<string, any>>();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'News item not found after update' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Format news item
    const newsItem: NewsItem = {
      id: result.id,
      title: result.title,
      content: result.content,
      summary: result.summary,
      image: result.image,
      publishDate: result.publish_date,
      featured: result.featured === 1,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
    
    // Generate HTML for the news page
    await generateNewsHtml(env);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'News item updated successfully',
      ...newsItem
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating news item:', error);
    return new Response(JSON.stringify({ error: 'Failed to update news item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Delete a news item
 * @param request Request with news item ID
 * @param env Cloudflare environment
 * @returns Response with success or error
 */
export async function deleteNewsItem(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get news item ID from params
    const { id } = request.params || {};
    if (!id) {
      return new Response(JSON.stringify({ error: 'News item ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if news item exists
    const checkStmt = env.DB.prepare(`
      SELECT id FROM news WHERE id = ?
    `);
    
    const existingItem = await checkStmt.bind(id).first();
    
    if (!existingItem) {
      return new Response(JSON.stringify({ error: 'News item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete news item from database
    const deleteStmt = env.DB.prepare(`
      DELETE FROM news WHERE id = ?
    `);
    
    await deleteStmt.bind(id).run();
    
    // Generate HTML for the news page
    await generateNewsHtml(env);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'News item deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting news item:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete news item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generate HTML for the news page
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
    const newsItems: NewsItem[] = result.results.map((row: any) => ({
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
async function generateNewsItemPage(env: Env, newsItem: NewsItem): Promise<void> {
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
    
    // Store generated HTML
    await env.ADMIN_ASSETS.put(`news/${newsItem.id}.html`, html);
  } catch (error) {
    console.error(`Error generating news item page for ${newsItem.id}:`, error);
  }
}
