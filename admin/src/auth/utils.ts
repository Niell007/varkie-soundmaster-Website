// Authentication utilities for Soundmaster Admin Dashboard

/**
 * Hash a password using Web Crypto API
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  // Convert password string to buffer
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Hash the password with salt
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new Uint8Array([...salt, ...data])
  );
  
  // Convert hash buffer to base64 string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Combine salt and hash
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${saltHex}:${hashHex}`;
}

/**
 * Compare a plain text password with a hashed password
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns True if passwords match, false otherwise
 */
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Split hash into salt and hash
    const [saltHex, storedHashHex] = hashedPassword.split(':');
    
    // Convert salt hex to Uint8Array
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Convert password string to buffer
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Hash the password with the extracted salt
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new Uint8Array([...salt, ...data])
    );
    
    // Convert hash buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Compare hashes
    return hashHex === storedHashHex;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

/**
 * Generate a secure random string
 * @param length Length of the string
 * @returns Random string
 */
export function generateRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
}

/**
 * Initialize the admin user if it doesn't exist
 * @param env Environment variables
 */
export async function initializeAdminUser(env: any): Promise<void> {
  try {
    // Check if admin user exists
    const stmt = env.USERS_DB.prepare('SELECT id FROM users WHERE email = ?');
    const adminUser = await stmt.bind(env.ADMIN_EMAIL).first() as { id: string } | null;
    
    if (!adminUser) {
      // Generate a random password for the admin user
      const adminPassword = generateRandomString(12);
      
      // Hash the password
      const hashedPassword = await hashPassword(adminPassword);
      
      // Generate user ID
      const userId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      // Insert admin user into database
      const insertStmt = env.USERS_DB.prepare(
        'INSERT INTO users (id, email, password, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      
      await insertStmt.bind(
        userId,
        env.ADMIN_EMAIL,
        hashedPassword,
        'Admin',
        'admin',
        now,
        now
      ).run();
      
      console.log(`Admin user created with email: ${env.ADMIN_EMAIL} and password: ${adminPassword}`);
      console.log('IMPORTANT: Save this password securely as it will not be shown again.');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}
