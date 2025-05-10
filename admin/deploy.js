// Deploy script for Soundmaster Admin Dashboard
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Configuration
const config = {
  projectName: 'soundmaster-admin',
  assetsDir: path.join(process.cwd(), 'assets'),
  migrationsDir: path.join(process.cwd(), 'migrations')
};

// Helper function to run commands
function runCommand(command, options = {}) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Create D1 databases in Cloudflare
async function createD1Databases() {
  console.log('\n=== Creating D1 Databases ===');
  
  // Create users database
  console.log('Creating users database...');
  runCommand('npx wrangler d1 create soundmaster-users');
  
  // Create content database
  console.log('Creating content database...');
  runCommand('npx wrangler d1 create soundmaster-content');
}

// Create KV namespace in Cloudflare
async function createKVNamespace() {
  console.log('\n=== Creating KV Namespace ===');
  
  console.log('Creating KV namespace...');
  runCommand('npx wrangler kv:namespace create ADMIN_ASSETS');
}

// Apply migrations to D1 databases
async function applyMigrations() {
  console.log('\n=== Applying Database Migrations ===');
  
  // Apply migrations to users database
  console.log('Applying migrations to users database...');
  runCommand('npx wrangler d1 migrations apply soundmaster-users');
  
  // Apply migrations to content database
  console.log('Applying migrations to content database...');
  runCommand('npx wrangler d1 migrations apply soundmaster-content');
}

// Upload assets to KV namespace
async function uploadAssets() {
  console.log('\n=== Uploading Assets to KV Namespace ===');
  
  // Upload assets using the upload-assets.js script
  runCommand('node upload-assets.js');
}

// Deploy the worker
async function deployWorker() {
  console.log('\n=== Deploying Worker ===');
  
  // Deploy the worker
  runCommand('npx wrangler deploy');
}

// Main function
async function main() {
  console.log('=== Soundmaster Admin Dashboard Deployment ===');
  
  // Check if wrangler is installed
  try {
    execSync('npx wrangler --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Wrangler is not installed. Installing...');
    runCommand('npm install wrangler --save-dev');
  }
  
  // Ask what to do
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('\nWhat would you like to do?');
  console.log('1. Create D1 databases in Cloudflare');
  console.log('2. Create KV namespace in Cloudflare');
  console.log('3. Apply database migrations');
  console.log('4. Upload assets to KV namespace');
  console.log('5. Deploy the worker');
  console.log('6. Run all deployment steps');
  
  rl.question('\nEnter your choice (1-6): ', async (choice) => {
    rl.close();
    
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
        await deployWorker();
        break;
      case '6':
        await createD1Databases();
        await createKVNamespace();
        await applyMigrations();
        await uploadAssets();
        await deployWorker();
        break;
      default:
        console.log('Invalid choice. Exiting.');
        process.exit(1);
    }
  });
}

main().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
