
-- Initialize admin user
INSERT OR IGNORE INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  '8afb1e16-5b67-47c2-b738-a47299a74f17',
  'admin@soundmaster.com',
  'aa5a935772d46a8062ea46018451a1ac:61c0e705027992ecf412e12944f08cdf1176d67c59c434a0c952c7d5f4c9d142',
  'Admin',
  'admin',
  '2025-05-10T00:19:54.230Z',
  '2025-05-10T00:19:54.230Z'
);
