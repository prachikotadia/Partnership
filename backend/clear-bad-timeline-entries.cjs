// Script to clear timeline entries with example.com URLs
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/partnership_app',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function clearBadTimelineEntries() {
  try {
    console.log('🧹 Clearing timeline entries with example.com URLs...');
    
    // Delete timeline entries that contain example.com URLs
    const result = await pool.query(`
      DELETE FROM timeline_entries 
      WHERE media_urls && ARRAY['https://example.com/timeline.jpg', 'https://example.com/celebration.jpg', 'https://example.com/project.jpg']
      OR media_urls::text LIKE '%example.com%'
    `);
    
    console.log(`✅ Deleted ${result.rowCount} problematic timeline entries`);
    
    // Also delete any timeline entries with invalid URLs
    const result2 = await pool.query(`
      DELETE FROM timeline_entries 
      WHERE media_urls::text LIKE '%example.com%'
    `);
    
    console.log(`✅ Deleted ${result2.rowCount} additional problematic entries`);
    
    console.log('🎉 Database cleaned successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await pool.end();
  }
}

clearBadTimelineEntries();
