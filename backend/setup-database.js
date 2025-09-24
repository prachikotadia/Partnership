const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/partnership_app',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(255),
        timezone VARCHAR(50) DEFAULT 'UTC',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        priority VARCHAR(20) DEFAULT 'medium',
        due_date DATE,
        category VARCHAR(50),
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create bucket_list_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bucket_list_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        priority VARCHAR(20) DEFAULT 'medium',
        target_date DATE,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content TEXT,
        category VARCHAR(50),
        starred BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create persons table for two-person finance system
    await pool.query(`
      CREATE TABLE IF NOT EXISTS persons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        person_key VARCHAR(20) NOT NULL CHECK (person_key IN ('person1', 'person2')),
        name VARCHAR(100) NOT NULL DEFAULT 'Person',
        currency_preference VARCHAR(3) DEFAULT 'USD',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, person_key)
      )
    `);

    // Create enhanced finance table for two-person financial tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS finance (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        person VARCHAR(20) NOT NULL CHECK (person IN ('person1', 'person2')),
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        category VARCHAR(100) NOT NULL,
        date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      )
    `);

    // Add person column to existing finance table if it doesn't exist
    await pool.query(`
      ALTER TABLE finance 
      ADD COLUMN IF NOT EXISTS person VARCHAR(20) DEFAULT 'person1' 
      CHECK (person IN ('person1', 'person2'))
    `);

    // Add person_key column to existing persons table if it doesn't exist
    await pool.query(`
      ALTER TABLE persons 
      ADD COLUMN IF NOT EXISTS person_key VARCHAR(20) DEFAULT 'person1'
      CHECK (person_key IN ('person1', 'person2'))
    `);

    // Update existing persons records to have person_key
    await pool.query(`
      UPDATE persons 
      SET person_key = 'person1' 
      WHERE person_key IS NULL
    `);

    // Create currency rates table for live conversion
    await pool.query(`
      CREATE TABLE IF NOT EXISTS currency_rates (
        id SERIAL PRIMARY KEY,
        base_currency VARCHAR(3) NOT NULL,
        target_currency VARCHAR(3) NOT NULL,
        rate DECIMAL(15,6) NOT NULL,
        last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        UNIQUE(base_currency, target_currency)
      )
    `);

    // Create timeline_entries table (new system with media support)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timeline_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
        visibility VARCHAR(50) DEFAULT 'private',
        due_date TIMESTAMP WITHOUT TIME ZONE,
        target_date TIMESTAMP WITHOUT TIME ZONE,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      )
    `);

    // Create timeline_reactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timeline_reactions (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER NOT NULL REFERENCES timeline_entries(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reaction_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        UNIQUE (entry_id, user_id, reaction_type)
      )
    `);

    // Create timeline_comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timeline_comments (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER NOT NULL REFERENCES timeline_entries(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bucket_list_user_id ON bucket_list_items(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_finance_user_id ON finance(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_finance_person ON finance(person)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_finance_user_person ON finance(user_id, person)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_finance_date ON finance(date)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_finance_type ON finance(type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_finance_category ON finance(category)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_persons_user_id ON persons(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_persons_user_key ON persons(user_id, person_key)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_currency_rates_base_target ON currency_rates(base_currency, target_currency)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_timeline_entries_user_id ON timeline_entries(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_timeline_entries_created_at ON timeline_entries(created_at DESC)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_timeline_reactions_entry_id ON timeline_reactions(entry_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_timeline_reactions_user_id ON timeline_reactions(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_timeline_comments_entry_id ON timeline_comments(entry_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_timeline_comments_user_id ON timeline_comments(user_id)');

    console.log('✅ Database setup complete!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - tasks');
    console.log('   - bucket_list_items');
    console.log('   - notes');
    console.log('   - persons');
    console.log('   - finance');
    console.log('   - currency_rates');
    console.log('   - timeline_entries');
    console.log('   - timeline_reactions');
    console.log('   - timeline_comments');
    // Initialize default person names for existing users
    await initializePersonNames();
    
    console.log('🔍 Indexes created for optimal performance');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Initialize default person names for all users
async function initializePersonNames() {
  try {
    console.log('👤 Initializing person names...');
    
    // Get all users
    const users = await pool.query('SELECT id FROM users');
    
    for (const user of users.rows) {
      // Check if person1 exists
      const person1Exists = await pool.query(
        'SELECT id FROM persons WHERE user_id = $1 AND person_key = $2',
        [user.id, 'person1']
      );
      
      if (person1Exists.rows.length === 0) {
        await pool.query(`
          INSERT INTO persons (user_id, person_key, name, currency_preference)
          VALUES ($1, $2, $3, $4)
        `, [user.id, 'person1', 'Person 1', 'USD']);
        console.log(`👤 Created Person 1 for user ${user.id}`);
      }
      
      // Check if person2 exists
      const person2Exists = await pool.query(
        'SELECT id FROM persons WHERE user_id = $1 AND person_key = $2',
        [user.id, 'person2']
      );
      
      if (person2Exists.rows.length === 0) {
        await pool.query(`
          INSERT INTO persons (user_id, person_key, name, currency_preference)
          VALUES ($1, $2, $3, $4)
        `, [user.id, 'person2', 'Person 2', 'USD']);
        console.log(`👤 Created Person 2 for user ${user.id}`);
      }
    }
    
    console.log('✅ Person names initialized');
  } catch (error) {
    console.error('❌ Failed to initialize person names:', error);
  }
}

setupDatabase();
