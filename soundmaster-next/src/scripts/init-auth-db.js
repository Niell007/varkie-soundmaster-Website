// Initialize Auth.js database tables for Cloudflare D1
// This script creates the necessary tables for Auth.js to work with Cloudflare D1

const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

// Configuration
const SALT_ROUNDS = 10;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

console.log(`${colors.cyan}${colors.bright}=== Initializing Auth.js Database Tables ===${colors.reset}`);

// SQL for creating Auth.js tables
// Based on the schema from @auth/d1-adapter
const authTablesSql = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  emailVerified INTEGER,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  image TEXT
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  sessionToken TEXT NOT NULL UNIQUE,
  userId TEXT NOT NULL,
  expires INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires INTEGER NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Admin user will be inserted via JavaScript with hashed password
`;

// Write the SQL to a temporary file
const fs = require('fs');
const path = require('path');
const os = require('os');
const tempSqlFile = path.join(os.tmpdir(), 'auth-tables.sql');

// Function to hash password
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Function to insert users with hashed passwords
async function insertUsers() {
  // Default admin user
  const adminUser = {
    id: randomUUID(),
    name: 'Admin User',
    email: 'admin@soundmaster.com',
    username: 'admin',
    password: await hashPassword('admin123'),
    role: 'admin',
    emailVerified: Math.floor(Date.now() / 1000)
  };

  // Editor user
  const editorUser = {
    id: randomUUID(),
    name: 'Editor User',
    email: 'editor@soundmaster.com',
    username: 'editor',
    password: await hashPassword('editor123'),
    role: 'editor',
    emailVerified: Math.floor(Date.now() / 1000)
  };

  // Insert admin user
  const adminSql = `INSERT OR IGNORE INTO users (id, name, email, username, password, role, emailVerified)
    VALUES ('${adminUser.id}', '${adminUser.name}', '${adminUser.email}', '${adminUser.username}',
    '${adminUser.password}', '${adminUser.role}', ${adminUser.emailVerified});`;

  // Insert editor user
  const editorSql = `INSERT OR IGNORE INTO users (id, name, email, username, password, role, emailVerified)
    VALUES ('${editorUser.id}', '${editorUser.name}', '${editorUser.email}', '${editorUser.username}',
    '${editorUser.password}', '${editorUser.role}', ${editorUser.emailVerified});`;

  return { adminSql, editorSql, adminUser, editorUser };
}

// Main execution function
async function main() {
  try {
    console.log(`${colors.blue}Creating SQL file...${colors.reset}`);
    fs.writeFileSync(tempSqlFile, authTablesSql);
    
    console.log(`${colors.yellow}Applying SQL to local D1 database...${colors.reset}`);
    // Execute the SQL against the local D1 database
    execSync(`npx wrangler d1 execute soundmaster_db --local --file="${tempSqlFile}"`, {
      stdio: 'inherit',
    });
    
    console.log(`${colors.cyan}Creating users with secure password hashing...${colors.reset}`);
    const { adminSql, editorSql, adminUser, editorUser } = await insertUsers();
    
    // Insert admin user
    fs.writeFileSync(tempSqlFile, adminSql);
    execSync(`npx wrangler d1 execute soundmaster_db --local --file="${tempSqlFile}"`, {
      stdio: 'inherit',
    });
    
    // Insert editor user
    fs.writeFileSync(tempSqlFile, editorSql);
    execSync(`npx wrangler d1 execute soundmaster_db --local --file="${tempSqlFile}"`, {
      stdio: 'inherit',
    });
    
    console.log(`${colors.green}${colors.bright}✓ Database tables and users created successfully!${colors.reset}`);
    console.log(`${colors.magenta}Default users:${colors.reset}`);
    console.log(`  Admin: ${adminUser.username} / admin123`);
    console.log(`  Editor: ${editorUser.username} / editor123`);
    
    // Clean up the temporary file
  fs.unlinkSync(tempSqlFile);
} catch (error) {
  console.error(`${colors.red}Error initializing database:${colors.reset}`, error);
  process.exit(1);
}
}

// Run the main function
main();
