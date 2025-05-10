// Local development setup script for Soundmaster Admin Dashboard
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Configuration
const config = {
  projectDir: process.cwd(),
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

// Create local D1 database
async function createLocalDatabase() {
  console.log('\n=== Creating Local D1 Database ===');
  
  // Create users database
  console.log('Creating users database...');
  runCommand('npx wrangler d1 create soundmaster-users --local');
  
  // Create content database
  console.log('Creating content database...');
  runCommand('npx wrangler d1 create soundmaster-content --local');
}

// Apply migrations to local database
async function applyMigrations() {
  console.log('\n=== Applying Database Migrations ===');
  
  // Apply migrations to users database
  console.log('Applying migrations to users database...');
  runCommand('npx wrangler d1 migrations apply soundmaster-users --local');
  
  // Apply migrations to content database
  console.log('Applying migrations to content database...');
  runCommand('npx wrangler d1 migrations apply soundmaster-content --local');
}

// Start development server
async function startDevServer() {
  console.log('\n=== Starting Development Server ===');
  runCommand('npx wrangler dev --local');
}

// Main function
async function main() {
  console.log('=== Soundmaster Admin Dashboard Local Setup ===');
  
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
  console.log('1. Create local D1 databases');
  console.log('2. Apply database migrations');
  console.log('3. Start development server');
  console.log('4. Run all setup steps');
  
  rl.question('\nEnter your choice (1-4): ', async (choice) => {
    rl.close();
    
    switch (choice) {
      case '1':
        await createLocalDatabase();
        break;
      case '2':
        await applyMigrations();
        break;
      case '3':
        await startDevServer();
        break;
      case '4':
        await createLocalDatabase();
        await applyMigrations();
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
