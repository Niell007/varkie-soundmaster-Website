// Enhanced build script for Soundmaster Admin Dashboard
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy client/index.html to dist
const srcHtmlPath = path.join(__dirname, 'src', 'client', 'index.html');
const destHtmlPath = path.join(distDir, 'index.html');

if (fs.existsSync(srcHtmlPath)) {
  fs.copyFileSync(srcHtmlPath, destHtmlPath);
  console.log('Copied index.html to dist directory');
}

// Create a functional JavaScript file with basic admin interface
const adminJs = `
// Soundmaster Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (!root) return;
  
  // Create app structure
  const app = document.createElement('div');
  app.className = 'admin-app';
  
  // Create header
  const header = document.createElement('header');
  header.className = 'admin-header';
  header.innerHTML = '<div class="logo">Soundmaster Admin</div><nav class="main-nav"><ul><li><button id="nav-dashboard" class="nav-btn active">Dashboard</button></li><li><button id="nav-media" class="nav-btn">Media</button></li><li><button id="nav-users" class="nav-btn">Users</button></li><li><button id="nav-settings" class="nav-btn">Settings</button></li><li><button id="nav-playlists" class="nav-btn">Playlists</button></li><li><button id="nav-schedule" class="nav-btn">Schedule</button></li></ul></nav><div class="user-menu"><span>Admin</span></div>';
  
  // Create main content area
  const main = document.createElement('main');
  main.className = 'admin-main';
  
  // Create dashboard content
  const dashboard = document.createElement('div');
  dashboard.className = 'dashboard-page';
  dashboard.innerHTML = '<h1>Dashboard</h1><div class="dashboard-stats"><div class="stat-card"><h3>Total Media</h3><div class="stat-value">124</div></div><div class="stat-card"><h3>Storage Used</h3><div class="stat-value">1.2 GB</div></div><div class="stat-card"><h3>Users</h3><div class="stat-value">8</div></div><div class="stat-card"><h3>Playlists</h3><div class="stat-value">12</div></div></div><div class="recent-activity"><h2>Recent Activity</h2><ul class="activity-list"><li><span class="activity-time">Today, 10:45 AM</span><span class="activity-desc">New media uploaded: <strong>intro-music.mp3</strong></span></li><li><span class="activity-time">Yesterday, 3:20 PM</span><span class="activity-desc">User profile updated: <strong>john.doe</strong></span></li><li><span class="activity-time">May 8, 2025</span><span class="activity-desc">Media deleted: <strong>old-jingle.wav</strong></span></li></ul></div>';
  
  // Create media library content
  const mediaLibrary = document.createElement('div');
  mediaLibrary.className = 'media-page';
  mediaLibrary.style.display = 'none';
  mediaLibrary.innerHTML = '<h1>Media Library</h1><div class="media-controls"><div class="search-bar"><input type="text" placeholder="Search media..."><button>Search</button></div><div class="filter-controls"><select><option>All Types</option><option>Audio</option><option>Image</option><option>Video</option></select></div><button class="upload-btn">Upload New</button></div><div class="media-grid"><div class="media-item"><div class="media-thumb audio"></div><div class="media-info"><div class="media-name">station-id.mp3</div><div class="media-meta">2.4 MB • Audio</div></div></div><div class="media-item"><div class="media-thumb image"></div><div class="media-info"><div class="media-name">logo.png</div><div class="media-meta">145 KB • Image</div></div></div><div class="media-item"><div class="media-thumb audio"></div><div class="media-info"><div class="media-name">jingle.wav</div><div class="media-meta">3.1 MB • Audio</div></div></div></div>';
  
  // Create users page
  const usersPage = document.createElement('div');
  usersPage.className = 'users-page';
  usersPage.style.display = 'none';
  usersPage.innerHTML = '<h1>User Management</h1><div class="users-controls"><button class="add-user-btn">Add New User</button></div><table class="users-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody><tr><td>John Doe</td><td>john@example.com</td><td>Admin</td><td><button class="edit-btn">Edit</button></td></tr><tr><td>Jane Smith</td><td>jane@example.com</td><td>Editor</td><td><button class="edit-btn">Edit</button></td></tr></tbody></table>';
  
  // Create settings page
  const settingsPage = document.createElement('div');
  settingsPage.className = 'settings-page';
  settingsPage.style.display = 'none';
  settingsPage.innerHTML = '<h1>Settings</h1><div class="settings-form"><div class="form-group"><label>Site Name</label><input type="text" value="Soundmaster Radio"></div><div class="form-group"><label>Admin Email</label><input type="email" value="admin@soundmaster.com"></div><div class="form-group"><label>Storage Quota</label><input type="text" value="5 GB" disabled></div><div class="form-actions"><button class="save-btn">Save Changes</button></div></div>';
  
  // Create playlists page
  const playlistsPage = document.createElement('div');
  playlistsPage.className = 'playlists-page';
  playlistsPage.style.display = 'none';
  playlistsPage.innerHTML = '<h1>Playlists Management</h1><div class="playlists-controls"><button class="add-playlist-btn">Create New Playlist</button></div><div class="playlists-grid"><div class="playlist-item"><div class="playlist-header"><h3>Morning Show</h3><span class="playlist-meta">12 tracks • 45 minutes</span></div><div class="playlist-actions"><button class="edit-btn">Edit</button><button class="play-btn">Preview</button></div></div><div class="playlist-item"><div class="playlist-header"><h3>Evening Chill</h3><span class="playlist-meta">18 tracks • 62 minutes</span></div><div class="playlist-actions"><button class="edit-btn">Edit</button><button class="play-btn">Preview</button></div></div><div class="playlist-item"><div class="playlist-header"><h3>Weekend Mix</h3><span class="playlist-meta">24 tracks • 78 minutes</span></div><div class="playlist-actions"><button class="edit-btn">Edit</button><button class="play-btn">Preview</button></div></div></div>';

  // Create schedule page
  const schedulePage = document.createElement('div');
  schedulePage.className = 'schedule-page';
  schedulePage.style.display = 'none';
  schedulePage.innerHTML = '<h1>Broadcast Schedule</h1><div class="schedule-controls"><button class="add-schedule-btn">Add Schedule Item</button></div><div class="schedule-calendar"><div class="calendar-header"><button class="prev-week">←</button><h3>Week of May 10, 2025</h3><button class="next-week">→</button></div><div class="calendar-grid"><div class="time-column"><div class="time-header">Time</div><div class="time-slot">6:00 AM</div><div class="time-slot">9:00 AM</div><div class="time-slot">12:00 PM</div><div class="time-slot">3:00 PM</div><div class="time-slot">6:00 PM</div><div class="time-slot">9:00 PM</div></div><div class="day-column"><div class="day-header">Monday</div><div class="schedule-item morning-show">Morning Show</div><div class="schedule-item news-hour">News Hour</div><div class="schedule-item afternoon-mix">Afternoon Mix</div><div class="schedule-item drive-time">Drive Time</div><div class="schedule-item evening-chill">Evening Chill</div><div class="schedule-item late-night">Late Night</div></div><div class="day-column"><div class="day-header">Tuesday</div><div class="schedule-item morning-show">Morning Show</div><div class="schedule-item news-hour">News Hour</div><div class="schedule-item afternoon-mix">Afternoon Mix</div><div class="schedule-item drive-time">Drive Time</div><div class="schedule-item evening-chill">Evening Chill</div><div class="schedule-item late-night">Late Night</div></div></div></div>';

  // Add all content sections to main
  main.appendChild(dashboard);
  main.appendChild(mediaLibrary);
  main.appendChild(usersPage);
  main.appendChild(settingsPage);
  main.appendChild(playlistsPage);
  main.appendChild(schedulePage);
  
  // Add header and main to app
  app.appendChild(header);
  app.appendChild(main);
  
  // Add app to root
  root.appendChild(app);
  
  // Navigation handling with buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  const pages = {
    'nav-dashboard': dashboard,
    'nav-media': mediaLibrary,
    'nav-users': usersPage,
    'nav-settings': settingsPage,
    'nav-playlists': playlistsPage,
    'nav-schedule': schedulePage
  };
  
  // Handle navigation button clicks
  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const buttonId = e.target.id;
      
      // Hide all pages
      Object.values(pages).forEach(page => {
        page.style.display = 'none';
      });
      
      // Show target page
      if (pages[buttonId]) {
        pages[buttonId].style.display = 'block';
      }
      
      // Update active button
      navButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      e.target.classList.add('active');
      
      // Log navigation for debugging
      console.log('Navigated to:', buttonId);
    });
  });
  
  // Add click handlers for all action buttons
  document.querySelectorAll('.edit-btn, .play-btn, .upload-btn, .add-user-btn, .save-btn, .prev-week, .next-week').forEach(btn => {
    btn.addEventListener('click', (e) => {
      alert('Action: ' + e.target.textContent + ' - This would trigger the corresponding functionality in the full application.');
    });
  });
  
  // Initialize playlist manager when on playlists page
  document.getElementById('nav-playlists').addEventListener('click', async () => {
    try {
      // Load playlist template if not already loaded
      if (document.querySelector('.playlists-page').children.length === 0) {
        const response = await fetch('/assets/templates/playlists.html');
        if (response.ok) {
          const html = await response.text();
          document.querySelector('.playlists-page').innerHTML = html;
          
          // Initialize playlist manager
          if (typeof initPlaylistManager === 'function') {
            initPlaylistManager();
          } else {
            console.error('Playlist manager not loaded');
          }
        }
      }
    } catch (error) {
      console.error('Error loading playlist template:', error);
    }
  });
});
`;

fs.writeFileSync(path.join(distDir, 'bundle.js'), adminJs);
console.log('Created admin dashboard bundle.js in dist directory');

// Create a comprehensive CSS file
const adminCss = `
/* Soundmaster Admin Dashboard Styles */
:root {
  --primary: #2c3e50;
  --secondary: #3498db;
  --accent: #e74c3c;
  --light: #ecf0f1;
  --dark: #2c3e50;
  --success: #2ecc71;
  --warning: #f39c12;
  --danger: #e74c3c;
  --gray: #95a5a6;
  --border-radius: 4px;
  --shadow: 0 2px 4px rgba(0,0,0,0.1);
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

/* Layout */
.admin-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-header {
  background-color: var(--primary);
  color: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
}

.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-nav li {
  margin: 0 5px;
}

.main-nav button.nav-btn {
  color: rgba(255,255,255,0.8);
  background: none;
  border: none;
  padding: 20px 15px;
  display: block;
  transition: all 0.3s;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.main-nav button.nav-btn:hover, .main-nav button.nav-btn.active {
  color: white;
  background-color: rgba(255,255,255,0.1);
}

.user-menu {
  display: flex;
  align-items: center;
}

.admin-main {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Dashboard */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.stat-card h3 {
  margin-top: 0;
  color: var(--gray);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark);
}

.recent-activity {
  background: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.activity-list {
  list-style: none;
  padding: 0;
}

.activity-list li {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: flex-start;
}

.activity-time {
  color: var(--gray);
  font-size: 0.85rem;
  width: 150px;
  flex-shrink: 0;
}

/* Media Library */
.media-controls {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  display: flex;
}

.search-bar input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  font-size: 14px;
}

.search-bar button {
  background: var(--secondary);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  cursor: pointer;
}

.filter-controls select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  background-color: white;
}

.upload-btn {
  background: var(--success);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.media-item {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.2s;
  cursor: pointer;
}

.media-item:hover {
  transform: translateY(-3px);
}

.media-thumb {
  height: 140px;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-thumb.audio {
  background-color: #3498db33;
}

.media-thumb.audio::before {
  content: '♪';
  font-size: 3rem;
  color: #3498db;
}

.media-thumb.image {
  background-color: #2ecc7133;
}

.media-thumb.image::before {
  content: '🖼️';
  font-size: 2rem;
}

.media-info {
  padding: 10px;
}

.media-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.media-meta {
  font-size: 0.8rem;
  color: var(--gray);
}

/* Users Table */
.users-controls {
  margin-bottom: 20px;
}

.add-user-btn {
  background: var(--success);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.users-table th, .users-table td {
  padding: 12px 15px;
  text-align: left;
}

.users-table thead {
  background-color: var(--primary);
  color: white;
}

.users-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.users-table tbody tr:hover {
  background-color: #f1f1f1;
}

.edit-btn {
  background: var(--secondary);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.8rem;
}

/* Settings */
.settings-form {
  background: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow);
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 14px;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.save-btn {
  background: var(--success);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
}

/* Playlists Page */
.playlists-controls {
  margin-bottom: 20px;
}

.add-playlist-btn {
  background: var(--success);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.playlist-item {
  background: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.playlist-header {
  margin-bottom: 15px;
}

.playlist-header h3 {
  margin: 0 0 5px 0;
}

.playlist-meta {
  color: var(--gray);
  font-size: 0.85rem;
}

.playlist-actions {
  display: flex;
  gap: 10px;
}

.play-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.8rem;
}

/* Schedule Page */
.schedule-controls {
  margin-bottom: 20px;
}

.add-schedule-btn {
  background: var(--success);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.schedule-calendar {
  background: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.calendar-header button {
  background: var(--light);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
}

.calendar-grid {
  display: flex;
  overflow-x: auto;
}

.time-column, .day-column {
  min-width: 120px;
  border-right: 1px solid #eee;
}

.time-column {
  min-width: 80px;
}

.time-header, .day-header {
  padding: 10px;
  text-align: center;
  font-weight: 500;
  background-color: var(--light);
  border-bottom: 1px solid #eee;
}

.time-slot {
  height: 80px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--gray);
}

.schedule-item {
  height: 80px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  cursor: pointer;
}

.schedule-item.morning-show { background-color: #3498db33; }
.schedule-item.news-hour { background-color: #f39c1233; }
.schedule-item.afternoon-mix { background-color: #2ecc7133; }
.schedule-item.drive-time { background-color: #9b59b633; }
.schedule-item.evening-chill { background-color: #34495e33; }
.schedule-item.late-night { background-color: #8e44ad33; }

/* Responsive */
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
  
  .main-nav {
    width: 100%;
    margin: 10px 0;
  }
  
  .main-nav ul {
    justify-content: space-between;
  }
  
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
  
  .activity-list li {
    flex-direction: column;
  }
  
  .activity-time {
    width: 100%;
    margin-bottom: 5px;
  }
}
`;

fs.writeFileSync(path.join(distDir, 'styles.css'), adminCss);
console.log('Created admin dashboard styles.css in dist directory');

console.log('Build completed successfully!');
