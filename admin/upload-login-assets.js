// Script to directly upload login assets to Cloudflare KV namespace
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const config = {
  kvNamespaceId: '0bb6ceac1b77455f8c83af025dfe17cf',
  kvNamespace: 'ADMIN_ASSETS',
  loginHtmlPath: path.join(process.cwd(), 'assets', 'login', 'index.html'),
  tempDir: path.join(process.cwd(), 'temp_uploads')
};

// Create temp directory
if (!fs.existsSync(config.tempDir)) {
  fs.mkdirSync(config.tempDir, { recursive: true });
}

// Read login HTML
if (!fs.existsSync(config.loginHtmlPath)) {
  console.error(`Login HTML not found at ${config.loginHtmlPath}`);
  process.exit(1);
}

console.log(`Reading login HTML from ${config.loginHtmlPath}`);
const loginHtml = fs.readFileSync(config.loginHtmlPath, 'utf8');

// Create JSON file for KV upload
const loginJsonPath = path.join(config.tempDir, 'login_index.json');
const loginJson = {
  key: 'login/index.html',
  value: loginHtml,
  base64: false
};

fs.writeFileSync(loginJsonPath, JSON.stringify(loginJson));
console.log(`Created JSON file at ${loginJsonPath}`);

// Upload to KV namespace
console.log(`Uploading login page to KV namespace ${config.kvNamespace}...`);
try {
  execSync(`npx wrangler kv:key put --binding=${config.kvNamespace} "login/index.html" "${loginHtml}"`, {
    stdio: 'inherit'
  });
  console.log('Login page uploaded successfully!');
} catch (error) {
  console.error('Error uploading login page:', error.message);
}

// Also upload as root index.html for direct access
console.log('Uploading login page as root index.html...');
try {
  execSync(`npx wrangler kv:key put --binding=${config.kvNamespace} "index.html" "${loginHtml}"`, {
    stdio: 'inherit'
  });
  console.log('Root index.html uploaded successfully!');
} catch (error) {
  console.error('Error uploading root index.html:', error.message);
}

// Clean up
fs.rmSync(config.tempDir, { recursive: true, force: true });
console.log('Cleaned up temporary files.');
