// Database migrations for content management
import { Env } from '../types/env';

/**
 * Create content management tables
 * @param env Cloudflare environment
 */
export async function createContentTables(env: Env): Promise<void> {
  try {
    // Create playlists table
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        cover_image TEXT,
        tracks TEXT NOT NULL, -- JSON array of tracks
        duration TEXT NOT NULL,
        track_count INTEGER NOT NULL,
        featured INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    // Create schedule table
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS schedule (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        days TEXT NOT NULL, -- JSON array of days
        playlist_id TEXT,
        host_id TEXT,
        color TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE SET NULL
      )
    `);
    
    // Create news table
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS news (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        image TEXT,
        publish_date TEXT NOT NULL,
        featured INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    // Create pages table
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        template TEXT NOT NULL,
        meta_description TEXT,
        published_at TEXT NOT NULL,
        last_modified TEXT NOT NULL
      )
    `);
    
    // Create templates table
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    console.log('Content tables created successfully');
  } catch (error) {
    console.error('Error creating content tables:', error);
    throw error;
  }
}

/**
 * Initialize default templates
 * @param env Cloudflare environment
 */
export async function initializeTemplates(env: Env): Promise<void> {
  try {
    const now = new Date().toISOString();
    
    // Check if templates already exist
    const checkStmt = env.DB.prepare(`
      SELECT COUNT(*) as count FROM templates
    `);
    
    const result = await checkStmt.first();
    
    if (result && result.count > 0) {
      console.log('Templates already initialized');
      return;
    }
    
    // Playlists template
    const playlistsTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Soundmaster Radio Playlists - Explore our curated music collections">
    <title>Playlists - Soundmaster</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="css/modern.css" rel="stylesheet" type="text/css">
</head>
<body>
    <div class="container">
        <header>
            <img src="images/logo.jpg" alt="Soundmaster Logo" class="logo" width="244" height="52">
            
            <nav class="main-nav">
                <ul class="nav-list">
                    <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
                    <li class="nav-item"><a href="https://www.virtualdj.com/ask/Soundmaster" class="nav-link">About</a></li>
                    <li class="nav-item"><a href="http://www.virtualdj.com/user/djvarkie/live.html" class="nav-link">Playlist</a></li>
                    <li class="nav-item"><a href="team.html" class="nav-link">Our Team</a></li>
                    <li class="nav-item"><a href="contacts.html" class="nav-link">Contacts</a></li>
                    <li class="nav-item"><a href="on_demand.html" class="nav-link">On-Demand</a></li>
                    <li class="nav-item"><a href="schedule.html" class="nav-link">Schedule</a></li>
                    <li class="nav-item"><a href="playlists.html" class="nav-link active">Playlists</a></li>
                    <li class="nav-item"><a href="news.html" class="nav-link">News</a></li>
                </ul>
            </nav>
        </header>

        <main>
            <div class="container">
                <h1 class="text-center mt-4 mb-4"><i class="fas fa-music"></i> Our Playlists</h1>
                
                <div class="content">
                    <div class="section">
                        <p class="lead text-center mb-4">Explore our curated playlists featuring the best music from various genres and eras.</p>
                        
                        <div class="row">
                            {{PLAYLIST_CARDS}}
                        </div>
                    </div>
                    
                    <div class="section mt-4">
                        <h2 class="mb-3"><i class="fas fa-headphones-alt"></i> Request a Playlist</h2>
                        <p>Don't see what you're looking for? Request a custom playlist based on your favorite genre, era, or theme!</p>
                        
                        <form class="mt-3">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <input type="text" class="form-control" placeholder="Playlist Name/Theme" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <input type="email" class="form-control" placeholder="Your Email" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <textarea class="form-control" rows="3" placeholder="Describe your playlist request (artists, genres, themes, etc.)" required></textarea>
                            </div>
                            <button type="submit" class="btn">Submit Request</button>
                        </form>
                    </div>
                </div>
            </div>
        </main>

        <footer>
            <div class="container">
                <div class="footer-nav">
                    <a href="index.html">HOME</a> | 
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
    
    // Schedule template
    const scheduleTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Soundmaster Radio Schedule - Check out our broadcast schedule">
    <title>Schedule - Soundmaster</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="css/modern.css" rel="stylesheet" type="text/css">
</head>
<body>
    <div class="container">
        <header>
            <img src="images/logo.jpg" alt="Soundmaster Logo" class="logo" width="244" height="52">
            
            <nav class="main-nav">
                <ul class="nav-list">
                    <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
                    <li class="nav-item"><a href="https://www.virtualdj.com/ask/Soundmaster" class="nav-link">About</a></li>
                    <li class="nav-item"><a href="http://www.virtualdj.com/user/djvarkie/live.html" class="nav-link">Playlist</a></li>
                    <li class="nav-item"><a href="team.html" class="nav-link">Our Team</a></li>
                    <li class="nav-item"><a href="contacts.html" class="nav-link">Contacts</a></li>
                    <li class="nav-item"><a href="on_demand.html" class="nav-link">On-Demand</a></li>
                    <li class="nav-item"><a href="schedule.html" class="nav-link active">Schedule</a></li>
                    <li class="nav-item"><a href="playlists.html" class="nav-link">Playlists</a></li>
                    <li class="nav-item"><a href="news.html" class="nav-link">News</a></li>
                </ul>
            </nav>
        </header>

        <main>
            <div class="container">
                <h1 class="text-center mt-4 mb-4"><i class="fas fa-calendar-alt"></i> Broadcast Schedule</h1>
                
                <div class="content">
                    <div class="section">
                        <p class="lead text-center mb-4">Check out our weekly broadcast schedule and tune in to your favorite shows!</p>
                        
                        <div class="schedule-container">
                            {{SCHEDULE_CONTENT}}
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <footer>
            <div class="container">
                <div class="footer-nav">
                    <a href="index.html">HOME</a> | 
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
    
    // News template
    const newsTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Soundmaster Radio News - Latest updates and announcements">
    <title>News - Soundmaster</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="css/modern.css" rel="stylesheet" type="text/css">
</head>
<body>
    <div class="container">
        <header>
            <img src="images/logo.jpg" alt="Soundmaster Logo" class="logo" width="244" height="52">
            
            <nav class="main-nav">
                <ul class="nav-list">
                    <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
                    <li class="nav-item"><a href="https://www.virtualdj.com/ask/Soundmaster" class="nav-link">About</a></li>
                    <li class="nav-item"><a href="http://www.virtualdj.com/user/djvarkie/live.html" class="nav-link">Playlist</a></li>
                    <li class="nav-item"><a href="team.html" class="nav-link">Our Team</a></li>
                    <li class="nav-item"><a href="contacts.html" class="nav-link">Contacts</a></li>
                    <li class="nav-item"><a href="on_demand.html" class="nav-link">On-Demand</a></li>
                    <li class="nav-item"><a href="schedule.html" class="nav-link">Schedule</a></li>
                    <li class="nav-item"><a href="playlists.html" class="nav-link">Playlists</a></li>
                    <li class="nav-item"><a href="news.html" class="nav-link active">News</a></li>
                </ul>
            </nav>
        </header>

        <main>
            <div class="container">
                <h1 class="text-center mt-4 mb-4"><i class="fas fa-newspaper"></i> Latest News</h1>
                
                <div class="content">
                    <div class="section">
                        <p class="lead text-center mb-4">Stay up to date with the latest news and announcements from Soundmaster Radio.</p>
                        
                        <div class="news-container">
                            {{NEWS_CONTENT}}
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <footer>
            <div class="container">
                <div class="footer-nav">
                    <a href="index.html">HOME</a> | 
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
    
    // Insert templates into database
    const templates = [
      {
        id: crypto.randomUUID(),
        name: 'playlists',
        content: playlistsTemplate,
        created_at: now,
        updated_at: now
      },
      {
        id: crypto.randomUUID(),
        name: 'schedule',
        content: scheduleTemplate,
        created_at: now,
        updated_at: now
      },
      {
        id: crypto.randomUUID(),
        name: 'news',
        content: newsTemplate,
        created_at: now,
        updated_at: now
      }
    ];
    
    // Insert templates
    const insertStmt = env.DB.prepare(`
      INSERT INTO templates (id, name, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const batch = templates.map(template => 
      insertStmt.bind(
        template.id,
        template.name,
        template.content,
        template.created_at,
        template.updated_at
      )
    );
    
    await env.DB.batch(batch);
    
    // Store templates in KV for faster access
    for (const template of templates) {
      await env.ADMIN_ASSETS.put(`templates/${template.name}.html`, template.content);
    }
    
    console.log('Templates initialized successfully');
  } catch (error) {
    console.error('Error initializing templates:', error);
    throw error;
  }
}
