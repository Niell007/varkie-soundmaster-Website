// Script to initialize users in the Auth.js database with secure password hashing
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const SALT_ROUNDS = 10;
const DEFAULT_ADMIN = {
  id: randomUUID(),
  name: 'Admin User',
  email: 'admin@soundmaster.co.za',
  password: 'admin123', // This will be hashed
  role: 'admin',
  emailVerified: new Date().toISOString()
};

// Additional users if needed
const ADDITIONAL_USERS = [
  {
    id: randomUUID(),
    name: 'Editor User',
    email: 'editor@soundmaster.co.za',
    password: 'editor123', // This will be hashed
    role: 'editor',
    emailVerified: new Date().toISOString()
  }
];

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function initializeUsers() {
  try {
    console.log('Starting user initialization...');
    
    // Hash the admin password
    const hashedAdminPassword = await hashPassword(DEFAULT_ADMIN.password);
    
    // Create SQL for admin user
    const adminSQL = `
      INSERT INTO users (id, name, email, password, role, emailVerified) 
      VALUES ('${DEFAULT_ADMIN.id}', '${DEFAULT_ADMIN.name}', '${DEFAULT_ADMIN.email}', 
      '${hashedAdminPassword}', '${DEFAULT_ADMIN.role}', '${DEFAULT_ADMIN.emailVerified}')
      ON CONFLICT (email) DO NOTHING;
    `;
    
    // Execute SQL for admin user
    const adminTempFile = path.join(os.tmpdir(), 'admin-user.sql');
    fs.writeFileSync(adminTempFile, adminSQL);
    execSync(`npx wrangler d1 execute soundmaster_db --local --file="${adminTempFile}"`);
    console.log(`Admin user created: ${DEFAULT_ADMIN.email}`);
    
    // Create and execute SQL for additional users
    for (const user of ADDITIONAL_USERS) {
      const hashedPassword = await hashPassword(user.password);
      
      const userSQL = `
        INSERT INTO users (id, name, email, password, role, emailVerified) 
        VALUES ('${user.id}', '${user.name}', '${user.email}', 
        '${hashedPassword}', '${user.role}', '${user.emailVerified}')
        ON CONFLICT (email) DO NOTHING;
      `;
      
      const userTempFile = path.join(os.tmpdir(), `user-${user.id}.sql`);
      fs.writeFileSync(userTempFile, userSQL);
      execSync(`npx wrangler d1 execute soundmaster_db --local --file="${userTempFile}"`);
      console.log(`User created: ${user.email}`);
    }
    
    console.log('User initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing users:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeUsers();
