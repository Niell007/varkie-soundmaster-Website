// Deploy script for Soundmaster Admin Dashboard to Cloudflare Workers
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import readline from 'readline';

// Generate a secure JWT secret
function generateJwtSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Main deployment function
async function deploy() {
  console.log('=== Deploying Soundmaster Admin Dashboard to Cloudflare Workers ===');
  
  // 1. Update wrangler.jsonc with secure JWT secret
  console.log('\n1. Updating configuration with secure JWT secret...');
  const wranglerPath = path.join(process.cwd(), 'wrangler.jsonc');
  let wranglerConfig = fs.readFileSync(wranglerPath, 'utf8');
  
  // Generate new JWT secret
  const jwtSecret = generateJwtSecret();
  
  // Replace placeholder JWT secret
  wranglerConfig = wranglerConfig.replace(
    /"JWT_SECRET": "change-this-to-a-secure-secret-in-production"/,
    `"JWT_SECRET": "${jwtSecret}"`
  );
  
  // Write updated config
  fs.writeFileSync(wranglerPath, wranglerConfig);
  console.log('JWT secret updated successfully.');
  
  // 2. Create D1 databases in Cloudflare
  console.log('\n2. Creating D1 databases in Cloudflare...');
  try {
    console.log('Creating users database...');
    execSync('npx wrangler d1 create soundmaster-users', { stdio: 'inherit' });
    
    console.log('Creating content database...');
    execSync('npx wrangler d1 create soundmaster-content', { stdio: 'inherit' });
  } catch (error) {
    console.log('Databases may already exist, continuing...');
  }
  
  // 3. Create KV namespace in Cloudflare
  console.log('\n3. Creating KV namespace in Cloudflare...');
  try {
    console.log('Creating ADMIN_ASSETS namespace...');
    execSync('npx wrangler kv:namespace create ADMIN_ASSETS', { stdio: 'inherit' });
  } catch (error) {
    console.log('KV namespace may already exist, continuing...');
  }
  
  // 4. Update wrangler.jsonc with database IDs and KV namespace ID
  console.log('\n4. Updating wrangler.jsonc with database and KV namespace IDs...');
  
  // Get database IDs
  const getDatabaseId = (output) => {
    const match = output.match(/database_id\s*=\s*"([^"]+)"/);
    return match ? match[1] : null;
  };
  
  try {
    // Get users database ID
    const usersDbOutput = execSync('npx wrangler d1 list', { encoding: 'utf8' });
    const usersDbId = getDatabaseId(usersDbOutput);
    
    // Get content database ID
    const contentDbOutput = execSync('npx wrangler d1 list', { encoding: 'utf8' });
    const contentDbId = getDatabaseId(contentDbOutput);
    
    // Get KV namespace ID
    const kvOutput = execSync('npx wrangler kv:namespace list', { encoding: 'utf8' });
    const kvMatch = kvOutput.match(/ADMIN_ASSETS\s+([a-f0-9-]+)/);
    const kvId = kvMatch ? kvMatch[1] : null;
    
    // Update wrangler.jsonc with IDs
    wranglerConfig = fs.readFileSync(wranglerPath, 'utf8');
    
    if (usersDbId) {
      wranglerConfig = wranglerConfig.replace(
        /"binding": "USERS_DB",\s*"database_name": "soundmaster-users"\s*\/\/ The database_id will be added by Wrangler when you create the database/,
        `"binding": "USERS_DB",\n      "database_name": "soundmaster-users",\n      "database_id": "${usersDbId}"`
      );
    }
    
    if (contentDbId) {
      wranglerConfig = wranglerConfig.replace(
        /"binding": "CONTENT_DB",\s*"database_name": "soundmaster-content"\s*\/\/ The database_id will be added by Wrangler when you create the database/,
        `"binding": "CONTENT_DB",\n      "database_name": "soundmaster-content",\n      "database_id": "${contentDbId}"`
      );
    }
    
    if (kvId) {
      wranglerConfig = wranglerConfig.replace(
        /"binding": "ADMIN_ASSETS",\s*"preview_id": "soundmaster-admin-assets"\s*\/\/ The id will be added by Wrangler when you create the KV namespace/,
        `"binding": "ADMIN_ASSETS",\n      "preview_id": "soundmaster-admin-assets",\n      "id": "${kvId}"`
      );
    }
    
    // Write updated config
    fs.writeFileSync(wranglerPath, wranglerConfig);
    console.log('Configuration updated with database and KV namespace IDs.');
  } catch (error) {
    console.error('Error updating configuration:', error.message);
  }
  
  // 5. Apply database migrations
  console.log('\n5. Applying database migrations...');
  try {
    console.log('Applying migrations to users database...');
    execSync('npx wrangler d1 migrations apply soundmaster-users', { stdio: 'inherit' });
    
    console.log('Applying migrations to content database...');
    execSync('npx wrangler d1 migrations apply soundmaster-content', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error applying migrations:', error.message);
  }
  
  // 6. Upload assets to KV namespace
  console.log('\n6. Uploading assets to KV namespace...');
  try {
    execSync('node upload-assets.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error uploading assets:', error.message);
  }
  
  // 7. Deploy the worker
  console.log('\n7. Deploying the worker to Cloudflare...');
  try {
    execSync('npx wrangler deploy', { stdio: 'inherit' });
    console.log('\n=== Deployment Complete ===');
    console.log('Your Soundmaster Admin Dashboard is now deployed to Cloudflare Workers!');
    console.log('Important: Save your JWT secret for future reference:');
    console.log(`JWT_SECRET: ${jwtSecret}`);
  } catch (error) {
    console.error('Error deploying worker:', error.message);
  }
}

// Run the deployment
deploy().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
