// Initialize admin user and database for Soundmaster Admin Dashboard
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Generate a secure random password
function generatePassword(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}

// Hash a password (simplified version for initialization)
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.createHash('sha256');
  hash.update(Buffer.concat([salt, Buffer.from(password)]));
  const hashHex = hash.digest('hex');
  const saltHex = salt.toString('hex');
  return `${saltHex}:${hashHex}`;
}

// Main function
async function main() {
  console.log('=== Initializing Soundmaster Admin Dashboard ===');
  
  // Create migrations directory if it doesn't exist
  const migrationsDir = path.join(process.cwd(), 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // Apply migrations to create database tables
  console.log('\n=== Applying Database Migrations ===');
  try {
    execSync('npx wrangler d1 migrations apply soundmaster-users --local', { stdio: 'inherit' });
    execSync('npx wrangler d1 migrations apply soundmaster-content --local', { stdio: 'inherit' });
    console.log('Migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error.message);
    return;
  }
  
  // Create admin user
  console.log('\n=== Creating Admin User ===');
  
  // Generate admin credentials
  const adminEmail = 'admin@soundmaster.com';
  const adminPassword = generatePassword();
  const hashedPassword = await hashPassword(adminPassword);
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  // Create SQL file for inserting admin user
  const adminSql = `
-- Initialize admin user
INSERT OR IGNORE INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  '${userId}',
  '${adminEmail}',
  '${hashedPassword}',
  'Admin',
  'admin',
  '${now}',
  '${now}'
);
`;
  
  const adminSqlPath = path.join(migrationsDir, '0001_init_admin.sql');
  fs.writeFileSync(adminSqlPath, adminSql);
  
  // Apply admin user migration
  try {
    execSync('npx wrangler d1 migrations apply soundmaster-users --local', { stdio: 'inherit' });
    console.log(`\nAdmin user created successfully:`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\nIMPORTANT: Save these credentials securely as they will not be shown again.');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    return;
  }
  
  // Upload assets to KV namespace
  console.log('\n=== Uploading Assets to KV Namespace ===');
  try {
    execSync('node upload-assets.js', { stdio: 'inherit' });
    console.log('Assets uploaded successfully');
  } catch (error) {
    console.error('Error uploading assets:', error.message);
    return;
  }
  
  console.log('\n=== Initialization Complete ===');
  console.log('You can now start the development server with:');
  console.log('npx wrangler dev --local');
}

main().catch(error => {
  console.error('Initialization failed:', error);
  process.exit(1);
});
