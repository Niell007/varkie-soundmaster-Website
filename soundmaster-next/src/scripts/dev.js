// Development script for running the application with Cloudflare Pages
// This script helps set up the environment for local development

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(`${colors.cyan}${colors.bright}=== Soundmaster Next.js Development Server ===${colors.reset}`);
console.log(`${colors.yellow}Starting development server with Cloudflare Pages integration...${colors.reset}`);

try {
  // Build the application first
  console.log(`${colors.blue}Building Next.js application...${colors.reset}`);
  execSync('next build', { stdio: 'inherit' });
  
  // Start the development server with Cloudflare Pages
  console.log(`${colors.green}Starting Cloudflare Pages development server...${colors.reset}`);
  console.log(`${colors.magenta}This will enable API routes and database integration.${colors.reset}`);
  
  // Run the development server with Cloudflare Pages
  execSync(
    'npx wrangler pages dev .next --compatibility-date=2025-05-13 --compatibility-flag=nodejs_compat --d1=soundmaster-db --binding JWT_SECRET=soundmaster-jwt-secret-2025',
    { stdio: 'inherit' }
  );
} catch (error) {
  console.error(`${colors.red}Error starting development server:${colors.reset}`, error);
  process.exit(1);
}
