-- Create admin user
INSERT OR IGNORE INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@soundmaster.com',
  -- This is a hashed version of 'admin123' (for testing only)
  '5d41402abc4b2a76b9719d911017c592:5d41402abc4b2a76b9719d911017c592',
  'Admin',
  'admin',
  '2025-05-10T00:00:00.000Z',
  '2025-05-10T00:00:00.000Z'
);
