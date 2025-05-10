// Script to upload admin dashboard assets to KV namespace
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const config = {
  srcDir: path.join(process.cwd(), 'src'),
  assetsDir: path.join(process.cwd(), 'assets'),
  kvNamespace: 'ADMIN_ASSETS',
  tempDir: path.join(process.cwd(), 'temp_assets')
};

// Create temp directory if it doesn't exist
if (!fs.existsSync(config.tempDir)) {
  fs.mkdirSync(config.tempDir, { recursive: true });
}

console.log(`Preparing HTML files and assets for upload...`);

// Function to recursively process files
function processDirectory(dir, baseDir = config.assetsDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    const key = relativePath.replace(/\\/g, '/'); // Normalize path separators
    
    if (entry.isDirectory()) {
      processDirectory(fullPath, baseDir);
    } else {
      // Read file content
      const content = fs.readFileSync(fullPath);
      const isBinary = /\.(png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|svg|ico)$/i.test(entry.name);
      
      // Create JSON metadata file for KV upload
      const outputPath = path.join(config.tempDir, `${key.replace(/[\/\\]/g, '_')}.json`);
      const metadata = {
        key,
        value: isBinary ? content.toString('base64') : content.toString('utf8'),
        base64: isBinary
      };
      
      fs.writeFileSync(outputPath, JSON.stringify(metadata));
      console.log(`Processed: ${key}`);
    }
  }
}

// Process HTML files from src directory
const htmlFiles = [
  { path: path.join(config.srcDir, 'login.html'), key: 'login.html' },
  { path: path.join(config.srcDir, 'dashboard.html'), key: 'dashboard.html' }
];

for (const file of htmlFiles) {
  if (fs.existsSync(file.path)) {
    // Read file content
    const content = fs.readFileSync(file.path, 'utf8');
    
    // Create JSON metadata file for KV upload
    const outputPath = path.join(config.tempDir, `${file.key.replace(/[/\\]/g, '_')}.json`);
    const metadata = {
      key: file.key,
      value: content,
      base64: false
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(metadata));
    console.log(`Processed HTML file: ${file.key}`);
  } else {
    console.warn(`Warning: HTML file not found: ${file.path}`);
  }
}

// Process all assets from assets directory
if (fs.existsSync(config.assetsDir)) {
  processDirectory(config.assetsDir);
} else {
  console.warn(`Warning: Assets directory not found: ${config.assetsDir}`);
}

// Upload to KV namespace
console.log('\nUploading assets to KV namespace...');

// Process each file individually
const files = fs.readdirSync(config.tempDir);
for (const file of files) {
  const filePath = path.join(config.tempDir, file);
  const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Create a temporary file for the value
  const valuePath = path.join(config.tempDir, `${file}_value.txt`);
  if (metadata.base64) {
    fs.writeFileSync(valuePath, Buffer.from(metadata.value, 'base64'));
  } else {
    fs.writeFileSync(valuePath, metadata.value);
  }
  
  // Upload to KV namespace
  console.log(`Uploading ${metadata.key}...`);
  try {
    execSync(`npx wrangler kv:key put --binding=${config.kvNamespace} "${metadata.key}" --path="${valuePath}"`);
    console.log(`Successfully uploaded ${metadata.key}`);
  } catch (error) {
    console.error(`Error uploading ${metadata.key}:`, error.message);
  }
  
  // Clean up temporary file
  fs.unlinkSync(valuePath);
}

// Clean up temp directory
console.log('\nCleaning up...');
fs.rmSync(config.tempDir, { recursive: true, force: true });
console.log('Done!');
