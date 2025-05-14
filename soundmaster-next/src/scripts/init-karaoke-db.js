// Script to initialize the karaoke database in Cloudflare D1
import fs from 'fs';
import path from 'path';

// Function to read SQL file content
function readSqlFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading SQL file: ${error.message}`);
    return null;
  }
}

// Function to execute SQL statements
async function executeSql(db, sql) {
  // Split SQL into individual statements (simple approach)
  const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
  
  for (const statement of statements) {
    try {
      await db.exec(statement + ';');
      console.log('SQL statement executed successfully');
    } catch (error) {
      console.error(`Error executing SQL: ${error.message}`);
      console.error('Statement:', statement);
    }
  }
}

// Main function to initialize the karaoke database
async function initKaraokeDb(db) {
  console.log('Initializing karaoke database...');
  
  // Path to the SQL file
  const sqlFilePath = path.join(process.cwd(), 'src', 'scripts', 'karaoke-data.sql');
  
  // Read SQL file
  const sql = readSqlFile(sqlFilePath);
  if (!sql) {
    console.error('Failed to read SQL file. Aborting.');
    return;
  }
  
  // Execute SQL statements
  await executeSql(db, sql);
  
  console.log('Karaoke database initialized successfully!');
}

// Export the initialization function
export { initKaraokeDb };

// If this script is run directly (not imported)
if (import.meta.url === import.meta.main) {
  // This would be replaced with actual D1 database connection in production
  const mockDb = {
    exec: async (sql) => {
      console.log('Would execute SQL:', sql);
      return { success: true };
    }
  };
  
  initKaraokeDb(mockDb).catch(error => {
    console.error('Failed to initialize karaoke database:', error);
  });
}
