#!/usr/bin/env node

/**
 * Unified deployment script for Soundmaster website
 * 
 * This script handles deploying the entire application (frontend, admin panel, and workers)
 * as a single project to Cloudflare Pages with Functions support.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const projectName = 'soundmaster-website';
const environment = process.argv[2] || 'development';
const isProduction = environment === 'production';

// Get current file's directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`\n🚀 Starting unified deployment to Cloudflare Pages (${environment})\n`);

try {
  // Step 1: Build the Next.js application
  console.log('📦 Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 2: Prepare functions directory for Cloudflare Pages
  console.log('🔧 Preparing Cloudflare Functions...');
  const functionsDir = path.join(__dirname, '.cloudflare', 'functions');
  
  if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
  }
  
  // Step 3: Create API route handlers in the functions directory
  console.log('📝 Creating API route handlers...');
  
  // Authentication handler
  fs.writeFileSync(
    path.join(functionsDir, 'api-auth.js'),
    `export async function onRequest(context) {
      // Handle authentication requests
      const { request, env } = context;
      
      // Process the request based on the method
      if (request.method === 'POST') {
        // Handle login/signup
        const data = await request.json();
        // Process authentication logic here
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }`
  );
  
  // Content management handler
  fs.writeFileSync(
    path.join(functionsDir, 'api-content.js'),
    `export async function onRequest(context) {
      // Handle content management requests
      const { request, env } = context;
      
      // Process the request based on the method
      if (request.method === 'GET') {
        // Fetch content
        return new Response(JSON.stringify({ items: [] }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (request.method === 'POST') {
        // Create content
        const data = await request.json();
        // Process content creation logic here
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }`
  );
  
  // AI service handler
  fs.writeFileSync(
    path.join(functionsDir, 'api-ai.js'),
    `export async function onRequest(context) {
      // Handle AI service requests
      const { request, env } = context;
      
      // Process the request
      if (request.method === 'POST') {
        const data = await request.json();
        // Process AI request here
        
        return new Response(JSON.stringify({ result: 'AI response' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }`
  );
  
  // Step 4: Deploy to Cloudflare Pages
  console.log(`🌩️ Deploying to Cloudflare Pages (${projectName})...`);
  
  const deployCommand = isProduction
    ? `npx wrangler pages deploy .next --project-name=${projectName} --branch=main --commit-dirty=true`
    : `npx wrangler pages dev .next --port=8788`;
  
  execSync(deployCommand, { stdio: 'inherit' });
  
  console.log('\n✅ Deployment completed successfully!\n');
  
  if (!isProduction) {
    console.log('🌐 Local development server running at: http://localhost:8788');
    console.log('Press Ctrl+C to stop the server');
  } else {
    console.log(`🌐 Production site available at: https://${projectName}.pages.dev`);
  }
  
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
}
