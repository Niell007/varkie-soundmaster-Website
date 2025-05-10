/**
 * Migration script for Soundmaster website
 * Transfers existing content to Cloudflare D1 and R2
 */

// This is a TypeScript file that would be executed with Wrangler
// to migrate existing content to Cloudflare

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // This is a simple UI for the migration process
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soundmaster Migration Tool</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #0055b3;
          }
          pre {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .step {
            margin-bottom: 30px;
          }
          .step-number {
            display: inline-block;
            width: 30px;
            height: 30px;
            background-color: #0055b3;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            margin-right: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Soundmaster Migration Tool</h1>
        <p class="lead">This tool helps migrate your existing content to Cloudflare D1 and R2.</p>
        
        <div class="card">
          <h2>Migration Steps</h2>
          
          <div class="step">
            <h3><span class="step-number">1</span>Export Media Files</h3>
            <p>First, we need to export all media files from your existing system:</p>
            <pre>
# Run this script to export media files
node scripts/export-media.js --output=./media-export
            </pre>
            <p>This will create a directory with all your media files and a JSON metadata file.</p>
          </div>
          
          <div class="step">
            <h3><span class="step-number">2</span>Export Content</h3>
            <p>Next, export all content from your existing database:</p>
            <pre>
# Run this script to export content
node scripts/export-content.js --output=./content-export
            </pre>
            <p>This will create JSON files containing all your content data.</p>
          </div>
          
          <div class="step">
            <h3><span class="step-number">3</span>Import to Cloudflare</h3>
            <p>Finally, import everything to Cloudflare:</p>
            <pre>
# Run this script to import to Cloudflare
wrangler d1 execute soundmaster-db --file=./content-export/import.sql
wrangler r2 object put soundmaster-media --file=./media-export/media.json
            </pre>
            <p>This will populate your D1 database and R2 bucket with your existing content.</p>
          </div>
        </div>
        
        <div class="card">
          <h2>Migration Scripts</h2>
          <p>Create the following scripts in a <code>scripts</code> directory:</p>
          
          <h4>export-media.js</h4>
          <pre>
const fs = require('fs');
const path = require('path');

// Configuration
const mediaDir = './public/media'; // Path to your existing media files
const outputDir = process.argv.find(arg => arg.startsWith('--output=')).split('=')[1];

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create media directory in output
const mediaOutputDir = path.join(outputDir, 'media');
if (!fs.existsSync(mediaOutputDir)) {
  fs.mkdirSync(mediaOutputDir, { recursive: true });
}

// Get all media files
const mediaFiles = [];
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else {
      const relativePath = path.relative(mediaDir, filePath);
      const fileExt = path.extname(file).toLowerCase();
      
      // Determine media type
      let type = 'document';
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
        type = 'image';
      } else if (['.mp3', '.wav', '.ogg'].includes(fileExt)) {
        type = 'audio';
      } else if (['.mp4', '.webm', '.mov'].includes(fileExt)) {
        type = 'video';
      }
      
      // Generate a unique key
      const key = crypto.randomUUID();
      
      // Copy file to output directory
      fs.copyFileSync(filePath, path.join(mediaOutputDir, key + fileExt));
      
      // Add to media files list
      mediaFiles.push({
        key,
        filename: file,
        content_type: getMimeType(fileExt),
        size: stat.size,
        type,
        title: path.basename(file, fileExt),
        is_public: true
      });
    }
  }
}

function getMimeType(ext) {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// Scan media directory
scanDirectory(mediaDir);

// Write metadata to JSON file
fs.writeFileSync(
  path.join(outputDir, 'media.json'),
  JSON.stringify(mediaFiles, null, 2)
);

console.log(\`Exported \${mediaFiles.length} media files to \${outputDir}\`);
          </pre>
          
          <h4>export-content.js</h4>
          <pre>
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Configuration
const dbPath = './admin/src/db/database.sqlite'; // Path to your existing database
const outputDir = process.argv.find(arg => arg.startsWith('--output=')).split('=')[1];

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Connect to database
const db = new sqlite3.Database(dbPath);

// Generate SQL import file
let importSql = '';

// Export users
db.all('SELECT * FROM users', [], (err, users) => {
  if (err) {
    console.error('Error exporting users:', err);
    return;
  }
  
  // Generate SQL for users
  importSql += '-- Users\n';
  for (const user of users) {
    importSql += \`INSERT INTO users (id, username, password_hash, email, role, created_at, last_login)
VALUES (\${user.id}, '\${user.username}', '\${user.password_hash}', '\${user.email}', '\${user.role}', '\${user.created_at}', '\${user.last_login || 'NULL'}');\n\n\`;
  }
  
  // Export media
  db.all('SELECT * FROM media', [], (err, media) => {
    if (err) {
      console.error('Error exporting media:', err);
      return;
    }
    
    // Generate SQL for media
    importSql += '-- Media\n';
    for (const item of media) {
      importSql += \`INSERT INTO media (id, key, filename, content_type, size, type, title, alt_text, description, is_public, uploaded_at, uploaded_by)
VALUES (\${item.id}, '\${item.key}', '\${item.filename}', '\${item.content_type}', \${item.size}, '\${item.type}', '\${item.title || 'NULL'}', '\${item.alt_text || 'NULL'}', '\${item.description || 'NULL'}', \${item.is_public || 0}, '\${item.uploaded_at}', \${item.uploaded_by || 'NULL'});\n\n\`;
    }
    
    // Export content
    db.all('SELECT * FROM content', [], (err, content) => {
      if (err) {
        console.error('Error exporting content:', err);
        return;
      }
      
      // Generate SQL for content
      importSql += '-- Content\n';
      for (const item of content) {
        importSql += \`INSERT INTO content (id, type, slug, title, content, meta_description, featured_image, is_published, created_at, updated_at, published_at, created_by)
VALUES (\${item.id}, '\${item.type}', '\${item.slug}', '\${item.title}', '\${item.content.replace(/'/g, "''")}', '\${item.meta_description || 'NULL'}', \${item.featured_image || 'NULL'}, \${item.is_published || 0}, '\${item.created_at}', '\${item.updated_at}', '\${item.published_at || 'NULL'}', \${item.created_by || 'NULL'});\n\n\`;
      }
      
      // Export settings
      db.all('SELECT * FROM settings', [], (err, settings) => {
        if (err) {
          console.error('Error exporting settings:', err);
          return;
        }
        
        // Generate SQL for settings
        importSql += '-- Settings\n';
        for (const item of settings) {
          importSql += \`INSERT INTO settings (key, value, updated_at)
VALUES ('\${item.key}', '\${item.value.replace(/'/g, "''")}', '\${item.updated_at}');\n\n\`;
        }
        
        // Write import SQL to file
        fs.writeFileSync(
          path.join(outputDir, 'import.sql'),
          importSql
        );
        
        console.log(\`Exported database to \${outputDir}/import.sql\`);
        
        // Close database
        db.close();
      });
    });
  });
});
          </pre>
        </div>
      </body>
      </html>
    `, {
      headers: {
        "Content-Type": "text/html"
      }
    });
  }
};
