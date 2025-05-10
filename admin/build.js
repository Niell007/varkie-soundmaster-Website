// Build script for Soundmaster Admin Dashboard
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Execute a command and log output
function execute(command, errorMessage) {
  try {
    log(`\n${colors.bright}${colors.cyan}Executing: ${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`\n${colors.bright}${colors.red}${errorMessage || 'Command failed'}${colors.reset}`);
    log(`${colors.red}${error.message}${colors.reset}`);
    return false;
  }
}

// Main build process
async function build() {
  log(`\n${colors.bright}${colors.green}Starting build process for Soundmaster Admin Dashboard${colors.reset}`);
  
  // Check if dist directory exists and create it if not
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    log(`Created dist directory`, colors.green);
  }
  
  // Step 1: Install dependencies
  log(`\n${colors.bright}${colors.yellow}Step 1: Installing dependencies${colors.reset}`);
  if (!execute('npm install', 'Failed to install dependencies')) {
    return;
  }
  
  // Step 2: Type checking
  log(`\n${colors.bright}${colors.yellow}Step 2: Running TypeScript type checking${colors.reset}`);
  if (!execute('npm run types:check', 'TypeScript type checking failed')) {
    return;
  }
  
  // Step 3: Build client-side React application
  log(`\n${colors.bright}${colors.yellow}Step 3: Building client-side React application${colors.reset}`);
  if (!execute('npm run build', 'Failed to build client-side application')) {
    return;
  }
  
  // Step 4: Build Cloudflare Worker
  log(`\n${colors.bright}${colors.yellow}Step 4: Building Cloudflare Worker${colors.reset}`);
  if (!execute('npm run build:worker', 'Failed to build Cloudflare Worker')) {
    return;
  }
  
  // Step 5: Deploy if --deploy flag is provided
  if (process.argv.includes('--deploy')) {
    log(`\n${colors.bright}${colors.yellow}Step 5: Deploying to Cloudflare${colors.reset}`);
    if (!execute('npm run deploy', 'Failed to deploy to Cloudflare')) {
      return;
    }
  }
  
  log(`\n${colors.bright}${colors.green}Build process completed successfully!${colors.reset}`);
  
  if (!process.argv.includes('--deploy')) {
    log(`\n${colors.bright}${colors.cyan}To deploy, run: node build.js --deploy${colors.reset}`);
  }
}

// Run the build process
build().catch(error => {
  log(`\n${colors.bright}${colors.red}Build process failed: ${error.message}${colors.reset}`);
  process.exit(1);
});
