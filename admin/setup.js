// Setup script for Soundmaster Admin Dashboard
// This script helps initialize the Cloudflare Workers project and deploy assets

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const config = {
  projectName: 'soundmaster-admin',
  assetsDir: path.join(process.cwd(), 'assets'),
  kvNamespace: 'ADMIN_ASSETS',
  d1Databases: [
    { name: 'soundmaster-users', binding: 'USERS_DB' },
    { name: 'soundmaster-content', binding: 'CONTENT_DB' }
  ]
};

// Helper function to run commands
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Check if wrangler is installed
function checkWrangler() {
  try {
    execSync('npx wrangler --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('Wrangler is not installed. Installing...');
    return runCommand('npm install wrangler --save-dev');
  }
}

// Create D1 databases
async function createD1Databases() {
  console.log('\n=== Creating D1 Databases ===');
  
  for (const db of config.d1Databases) {
    console.log(`Creating database: ${db.name}`);
    runCommand(`npx wrangler d1 create ${db.name}`);
  }
}

// Create KV namespace
async function createKVNamespace() {
  console.log('\n=== Creating KV Namespace ===');
  
  console.log(`Creating KV namespace: ${config.kvNamespace}`);
  runCommand(`npx wrangler kv:namespace create ${config.kvNamespace}`);
}

// Apply database migrations
async function applyMigrations() {
  console.log('\n=== Applying Database Migrations ===');
  
  for (const db of config.d1Databases) {
    console.log(`Applying migrations to: ${db.name}`);
    runCommand(`npx wrangler d1 migrations apply ${db.name} --local`);
  }
}

// Upload assets to KV
async function uploadAssets() {
  console.log('\n=== Uploading Assets to KV ===');
  
  // Check if assets directory exists
  if (!fs.existsSync(config.assetsDir)) {
    console.error(`Assets directory not found: ${config.assetsDir}`);
    return;
  }
  
  // Create a temporary directory for bulk upload
  const tempDir = path.join(process.cwd(), 'temp_assets');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  // Copy assets to temp directory with proper key structure
  function copyDir(src, dest, prefix = '') {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      const key = prefix ? `${prefix}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath);
        }
        copyDir(srcPath, destPath, key);
      } else {
        // Create a JSON file with metadata for KV upload
        const content = fs.readFileSync(srcPath);
        const metadata = {
          key,
          value: content.toString('base64'),
          base64: true
        };
        
        fs.writeFileSync(`${destPath}.json`, JSON.stringify(metadata));
      }
    }
  }
  
  copyDir(config.assetsDir, tempDir);
  
  // Upload to KV
  runCommand(`npx wrangler kv:bulk put ${config.kvNamespace} --binding=${config.kvNamespace} ${tempDir}/*.json`);
  
  // Clean up
  fs.rmSync(tempDir, { recursive: true, force: true });
}

// Start development server
async function startDevServer() {
  console.log('\n=== Starting Development Server ===');
  runCommand('npm run dev');
}

// Main function
async function main() {
  console.log('=== Soundmaster Admin Dashboard Setup ===');
  
  // Check if wrangler is installed
  if (!checkWrangler()) {
    console.error('Failed to install or find Wrangler. Please install it manually.');
    process.exit(1);
  }
  
  // Ask what to do
  console.log('\nWhat would you like to do?');
  console.log('1. Create D1 databases');
  console.log('2. Create KV namespace');
  console.log('3. Apply database migrations');
  console.log('4. Upload assets to KV');
  console.log('5. Start development server');
  console.log('6. Run all setup steps');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('\nEnter your choice (1-6): ', async (choice) => {
    readline.close();
    
    switch (choice) {
      case '1':
        await createD1Databases();
        break;
      case '2':
        await createKVNamespace();
        break;
      case '3':
        await applyMigrations();
        break;
      case '4':
        await uploadAssets();
        break;
      case '5':
        await startDevServer();
        break;
      case '6':
        await createD1Databases();
        await createKVNamespace();
        await applyMigrations();
        await uploadAssets();
        await startDevServer();
        break;
      default:
        console.log('Invalid choice. Exiting.');
        process.exit(1);
    }
  });
}

main().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});
