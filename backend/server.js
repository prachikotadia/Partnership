const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/partnership_app',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Rate limiting - More generous for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (increased for development)
});
app.use('/api/', limiter);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// =============================================
// AUTHENTICATION ROUTES
// =============================================

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, name',
      [username, email, hashedPassword, name]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || 'your-secret-key');
    
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username or email
    const result = await pool.query(
      'SELECT id, username, email, name, password_hash FROM users WHERE username = $1 OR email = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || 'your-secret-key');
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, name FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// TASKS ROUTES
// =============================================

// Get all tasks for user - SORTED BY DUE DATE
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching tasks for user:', req.user.userId);
    const result = await pool.query(
      'SELECT id, user_id, name, description, due_date, due_time, priority, status, money_required, currency, assigned_to, assigned_by, created_at, updated_at FROM tasks WHERE user_id = $1 ORDER BY due_date ASC, created_at DESC',
      [req.user.userId]
    );
    console.log('📋 Found tasks:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new task - BULLETPROOF VALIDATION
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    console.log('📋 POST /api/tasks - Request body:', req.body);
    console.log('📋 POST /api/tasks - User ID:', req.user.userId);
    
    const { name, description, due_date, due_time, priority, status, money_required, currency, assigned_to, assigned_by } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === '') {
      console.log('❌ Validation failed: Task name is required');
      return res.status(400).json({ error: 'Task name is required' });
    }
    
    // Validate due_date if provided
    if (due_date && due_date !== null && isNaN(Date.parse(due_date))) {
      console.log('❌ Validation failed: Invalid due date format');
      return res.status(400).json({ error: 'Invalid due date format' });
    }
    
    // Validate currency
    const validCurrencies = ['USD', 'INR'];
    const finalCurrency = currency && validCurrencies.includes(currency) ? currency : 'USD';
    
    // Normalize priority to match database constraint (capitalized)
    const normalizedPriority = priority ? 
      priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase() : 
      'Medium';
    
    // Validate priority is one of the allowed values
    const allowedPriorities = ['Low', 'Medium', 'High'];
    const finalPriority = allowedPriorities.includes(normalizedPriority) ? normalizedPriority : 'Medium';
    
    console.log('📋 Creating enhanced task with values:', { 
      user_id: req.user.userId, 
      name, 
      description, 
      due_date, 
      due_time,
      priority: finalPriority, 
      status,
      money_required,
      currency: finalCurrency,
      assigned_to,
      assigned_by
    });
    
    const result = await pool.query(
      'INSERT INTO tasks (user_id, name, description, due_date, due_time, priority, status, money_required, currency, assigned_to, assigned_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [req.user.userId, name, description || null, due_date || null, due_time || null, finalPriority, status || 'pending', money_required || null, finalCurrency, assigned_to || null, assigned_by || null]
    );
    
    console.log('✅ Task created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Create task error details:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error detail:', error.detail);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update task - FULL UPDATE
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, due_date, due_time, priority, status, money_required, currency, assigned_to, assigned_by } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Task name is required' });
    }
    
    // Validate currency
    const validCurrencies = ['USD', 'INR'];
    const finalCurrency = currency && validCurrencies.includes(currency) ? currency : 'USD';
    
    // Normalize priority to match database constraint (capitalized)
    const normalizedPriority = priority ? 
      priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase() : 
      'Medium';
    
    // Validate priority is one of the allowed values
    const allowedPriorities = ['Low', 'Medium', 'High'];
    const finalPriority = allowedPriorities.includes(normalizedPriority) ? normalizedPriority : 'Medium';
    
    console.log('📋 Updating enhanced task:', id, { 
      name, 
      description, 
      due_date, 
      due_time,
      priority: finalPriority, 
      status,
      money_required,
      currency: finalCurrency,
      assigned_to,
      assigned_by
    });
    
    const result = await pool.query(
      'UPDATE tasks SET name = $1, description = $2, due_date = $3, due_time = $4, priority = $5, status = $6, money_required = $7, currency = $8, assigned_to = $9, assigned_by = $10, updated_at = NOW() WHERE id = $11 AND user_id = $12 RETURNING *',
      [name, description, due_date, due_time, finalPriority, status, money_required, finalCurrency, assigned_to, assigned_by, id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    console.log('✅ Task updated:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task - PERMANENT DELETION
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📋 Deleting task:', id);
    
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    console.log('✅ Task deleted:', result.rows[0]);
    res.json({ message: 'Task deleted successfully', deletedTask: result.rows[0] });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// INVITES ROUTES - BULLETPROOF INVITE SYSTEM
// =============================================

// Generate secure random code (8-12 alphanumeric)
function generateSecureCode(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate secure link token (32 characters)
function generateLinkToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create new invite - SECURE GENERATION
app.post('/api/invites', authenticateToken, async (req, res) => {
  try {
    const { target_id, expiration_days, max_uses } = req.body;
    
    console.log('🔗 Creating invite for user:', req.user.userId);
    
    // Generate unique code and link token
    let code, linkToken;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      code = generateSecureCode();
      linkToken = generateLinkToken();
      attempts++;
      
      // Check if code or token already exists
      const existing = await pool.query(
        'SELECT id FROM invites WHERE code = $1 OR link_token = $2',
        [code, linkToken]
      );
      
      if (existing.rows.length === 0) break;
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique invite code');
      }
    } while (true);
    
    // Calculate expiration date
    const expirationDate = expiration_days ? 
      new Date(Date.now() + (expiration_days * 24 * 60 * 60 * 1000)) : 
      new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // Default 7 days
    
    console.log('🔗 Generated invite:', { code, linkToken, expirationDate, max_uses });
    
    const result = await pool.query(
      'INSERT INTO invites (creator_user_id, target_id, code, link_token, expiration_date, max_uses) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.userId, target_id || null, code, linkToken, expirationDate, max_uses || null]
    );
    
    const invite = result.rows[0];
    console.log('✅ Invite created successfully:', invite);
    
    res.status(201).json({
      id: invite.id,
      code: invite.code,
      link: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/join/${invite.link_token}`,
      link_token: invite.link_token,
      expiration_date: invite.expiration_date,
      max_uses: invite.max_uses,
      uses_count: invite.uses_count,
      created_at: invite.created_at
    });
  } catch (error) {
    console.error('❌ Create invite error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get invite details
app.get('/api/invites/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM invites WHERE id = $1 AND creator_user_id = $2',
      [id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found' });
    }
    
    const invite = result.rows[0];
    res.json({
      id: invite.id,
      code: invite.code,
      link: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/join/${invite.link_token}`,
      link_token: invite.link_token,
      expiration_date: invite.expiration_date,
      max_uses: invite.max_uses,
      uses_count: invite.uses_count,
      is_active: invite.is_active,
      created_at: invite.created_at
    });
  } catch (error) {
    console.error('Get invite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join via invite code or link - BULLETPROOF VALIDATION
app.post('/api/invites/join', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { code, link_token } = req.body;
    
    if (!code && !link_token) {
      return res.status(400).json({ error: 'Either code or link_token is required' });
    }
    
    console.log('🔗 Joining via invite:', { code, link_token, user: req.user.userId });
    
    await client.query('BEGIN');
    
    // Find invite by code or link_token
    const inviteQuery = code ? 
      'SELECT * FROM invites WHERE code = $1 AND is_active = TRUE FOR UPDATE' :
      'SELECT * FROM invites WHERE link_token = $1 AND is_active = TRUE FOR UPDATE';
    
    const inviteResult = await client.query(inviteQuery, [code || link_token]);
    
    if (inviteResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invalid or expired invite' });
    }
    
    const invite = inviteResult.rows[0];
    
    // Check if invite is expired
    if (invite.expiration_date && new Date() > new Date(invite.expiration_date)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invite has expired' });
    }
    
    // Check if max uses reached
    if (invite.max_uses && invite.uses_count >= invite.max_uses) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invite has reached maximum uses' });
    }
    
    // Check if user is already in partnership (if target_id exists)
    if (invite.target_id) {
      const existingPartnership = await client.query(
        'SELECT id FROM partnerships WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)',
        [req.user.userId, invite.target_id]
      );
      
      if (existingPartnership.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'You are already connected to this user' });
      }
    }
    
    // Create partnership if target_id exists
    if (invite.target_id) {
      await client.query(
        'INSERT INTO partnerships (user1_id, user2_id, status) VALUES ($1, $2, $3) ON CONFLICT (user1_id, user2_id) DO NOTHING',
        [invite.creator_user_id, req.user.userId, 'accepted']
      );
    }
    
    // Increment uses count
    await client.query(
      'UPDATE invites SET uses_count = uses_count + 1, updated_at = NOW() WHERE id = $1',
      [invite.id]
    );
    
    await client.query('COMMIT');
    
    console.log('✅ Successfully joined via invite:', invite.id);
    res.json({ 
      success: true, 
      message: 'Successfully joined!',
      invite_id: invite.id,
      partnership_created: !!invite.target_id
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Join invite error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    client.release();
  }
});

// Get user's invites
app.get('/api/invites', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, code, link_token, expiration_date, max_uses, uses_count, is_active, created_at FROM invites WHERE creator_user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    
    const invites = result.rows.map(invite => ({
      id: invite.id,
      code: invite.code,
      link: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/join/${invite.link_token}`,
      link_token: invite.link_token,
      expiration_date: invite.expiration_date,
      max_uses: invite.max_uses,
      uses_count: invite.uses_count,
      is_active: invite.is_active,
      created_at: invite.created_at
    }));
    
    res.json(invites);
  } catch (error) {
    console.error('Get invites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Revoke invite
app.delete('/api/invites/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE invites SET is_active = FALSE, updated_at = NOW() WHERE id = $1 AND creator_user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found' });
    }
    
    console.log('✅ Invite revoked:', result.rows[0].id);
    res.json({ success: true, message: 'Invite revoked successfully' });
  } catch (error) {
    console.error('Revoke invite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// TIMELINE ROUTES - BULLETPROOF TIMELINE SYSTEM
// =============================================

// Get all timeline entries for user with reactions and comments
app.get('/api/timeline', authenticateToken, async (req, res) => {
  try {
    console.log('📅 Fetching timeline entries for user:', req.user.userId);
    
    // Get timeline entries with user info, reactions, and comments
    const result = await pool.query(`
      SELECT 
        te.*,
        u.username,
        u.name as user_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', tr.id,
              'user_id', tr.user_id,
              'reaction_type', tr.reaction_type,
              'created_at', tr.created_at
            )
          ) FILTER (WHERE tr.id IS NOT NULL),
          '[]'::json
        ) as reactions,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', tc.id,
              'user_id', tc.user_id,
              'content', tc.content,
              'created_at', tc.created_at,
              'commenter_name', uc.name
            )
          ) FILTER (WHERE tc.id IS NOT NULL),
          '[]'::json
        ) as comments
      FROM timeline_entries te
      LEFT JOIN users u ON te.user_id = u.id
      LEFT JOIN timeline_reactions tr ON te.id = tr.entry_id
      LEFT JOIN timeline_comments tc ON te.id = tc.entry_id
      LEFT JOIN users uc ON tc.user_id = uc.id
      WHERE te.user_id = $1 OR te.visibility = 'public'
      GROUP BY te.id, u.username, u.name
      ORDER BY te.created_at DESC
      LIMIT 50
    `, [req.user.userId]);
    
    console.log('📅 Found timeline entries:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single timeline entry
app.get('/api/timeline/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        te.*,
        u.username,
        u.name as user_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', tr.id,
              'user_id', tr.user_id,
              'reaction_type', tr.reaction_type,
              'created_at', tr.created_at
            )
          ) FILTER (WHERE tr.id IS NOT NULL),
          '[]'::json
        ) as reactions,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', tc.id,
              'user_id', tc.user_id,
              'content', tc.content,
              'created_at', tc.created_at,
              'commenter_name', uc.name
            )
          ) FILTER (WHERE tc.id IS NOT NULL),
          '[]'::json
        ) as comments
      FROM timeline_entries te
      LEFT JOIN users u ON te.user_id = u.id
      LEFT JOIN timeline_reactions tr ON te.id = tr.entry_id
      LEFT JOIN timeline_comments tc ON te.id = tc.entry_id
      LEFT JOIN users uc ON tc.user_id = uc.id
      WHERE te.id = $1 AND (te.user_id = $2 OR te.visibility = 'public')
      GROUP BY te.id, u.username, u.name
    `, [id, req.user.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timeline entry not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get timeline entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new timeline entry
app.post('/api/timeline', authenticateToken, async (req, res) => {
  try {
    console.log('📅 Creating timeline entry for user:', req.user.userId);
    console.log('📅 Request body:', req.body);
    
    const { title, content, media_urls, visibility, due_date, target_date } = req.body;
    
    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Validate visibility
    const validVisibilities = ['private', 'public', 'group'];
    const finalVisibility = visibility && validVisibilities.includes(visibility) ? visibility : 'private';
    
    // Validate dates if provided
    let finalDueDate = null;
    let finalTargetDate = null;
    
    if (due_date && due_date !== null) {
      if (isNaN(Date.parse(due_date))) {
        return res.status(400).json({ error: 'Invalid due date format' });
      }
      finalDueDate = new Date(due_date);
    }
    
    if (target_date && target_date !== null) {
      if (isNaN(Date.parse(target_date))) {
        return res.status(400).json({ error: 'Invalid target date format' });
      }
      finalTargetDate = new Date(target_date);
    }
    
    // Validate media_urls array
    let finalMediaUrls = [];
    if (media_urls && Array.isArray(media_urls)) {
      finalMediaUrls = media_urls.filter(url => typeof url === 'string' && url.trim() !== '');
    }
    
    console.log('📅 Creating timeline entry with values:', { 
      user_id: req.user.userId, 
      title, 
      content, 
      media_urls: finalMediaUrls,
      visibility: finalVisibility,
      due_date: finalDueDate,
      target_date: finalTargetDate
    });
    
    const result = await pool.query(
      'INSERT INTO timeline_entries (user_id, title, content, media_urls, visibility, due_date, target_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.userId, title, content || null, finalMediaUrls, finalVisibility, finalDueDate, finalTargetDate]
    );
    
    console.log('✅ Timeline entry created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Create timeline entry error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update timeline entry
app.put('/api/timeline/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, media_urls, visibility, due_date, target_date } = req.body;
    
    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Validate visibility
    const validVisibilities = ['private', 'public', 'group'];
    const finalVisibility = visibility && validVisibilities.includes(visibility) ? visibility : 'private';
    
    // Validate dates if provided
    let finalDueDate = null;
    let finalTargetDate = null;
    
    if (due_date && due_date !== null) {
      if (isNaN(Date.parse(due_date))) {
        return res.status(400).json({ error: 'Invalid due date format' });
      }
      finalDueDate = new Date(due_date);
    }
    
    if (target_date && target_date !== null) {
      if (isNaN(Date.parse(target_date))) {
        return res.status(400).json({ error: 'Invalid target date format' });
      }
      finalTargetDate = new Date(target_date);
    }
    
    // Validate media_urls array
    let finalMediaUrls = [];
    if (media_urls && Array.isArray(media_urls)) {
      finalMediaUrls = media_urls.filter(url => typeof url === 'string' && url.trim() !== '');
    }
    
    console.log('📅 Updating timeline entry:', id, { 
      title, 
      content, 
      media_urls: finalMediaUrls,
      visibility: finalVisibility,
      due_date: finalDueDate,
      target_date: finalTargetDate
    });
    
    const result = await pool.query(
      'UPDATE timeline_entries SET title = $1, content = $2, media_urls = $3, visibility = $4, due_date = $5, target_date = $6, updated_at = NOW() WHERE id = $7 AND user_id = $8 RETURNING *',
      [title, content, finalMediaUrls, finalVisibility, finalDueDate, finalTargetDate, id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timeline entry not found or not authorized' });
    }
    
    console.log('✅ Timeline entry updated:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update timeline entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete timeline entry
app.delete('/api/timeline/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM timeline_entries WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timeline entry not found or not authorized' });
    }
    
    console.log('✅ Timeline entry deleted:', result.rows[0]);
    res.json({ success: true, message: 'Timeline entry deleted successfully' });
  } catch (error) {
    console.error('Delete timeline entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add reaction to timeline entry
app.post('/api/timeline/:id/reactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction_type } = req.body;
    
    // Validate reaction type
    const validReactions = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];
    const finalReactionType = reaction_type && validReactions.includes(reaction_type) ? reaction_type : 'like';
    
    console.log('📅 Adding reaction to timeline entry:', id, 'reaction:', finalReactionType);
    
    // Check if entry exists and user can access it
    const entryCheck = await pool.query(
      'SELECT id FROM timeline_entries WHERE id = $1 AND (user_id = $2 OR visibility = \'public\')',
      [id, req.user.userId]
    );
    
    if (entryCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Timeline entry not found or not accessible' });
    }
    
    // Insert or update reaction (upsert)
    const result = await pool.query(
      'INSERT INTO timeline_reactions (entry_id, user_id, reaction_type) VALUES ($1, $2, $3) ON CONFLICT (entry_id, user_id, reaction_type) DO UPDATE SET created_at = NOW() RETURNING *',
      [id, req.user.userId, finalReactionType]
    );
    
    console.log('✅ Reaction added successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Add reaction error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Remove reaction from timeline entry
app.delete('/api/timeline/:id/reactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction_type } = req.body;
    
    const finalReactionType = reaction_type || 'like';
    
    console.log('📅 Removing reaction from timeline entry:', id, 'reaction:', finalReactionType);
    
    const result = await pool.query(
      'DELETE FROM timeline_reactions WHERE entry_id = $1 AND user_id = $2 AND reaction_type = $3 RETURNING *',
      [id, req.user.userId, finalReactionType]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reaction not found' });
    }
    
    console.log('✅ Reaction removed successfully');
    res.json({ success: true, message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('❌ Remove reaction error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Add comment to timeline entry
app.post('/api/timeline/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Validate content
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    console.log('📅 Adding comment to timeline entry:', id, 'content:', content);
    
    // Check if entry exists and user can access it
    const entryCheck = await pool.query(
      'SELECT id FROM timeline_entries WHERE id = $1 AND (user_id = $2 OR visibility = \'public\')',
      [id, req.user.userId]
    );
    
    if (entryCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Timeline entry not found or not accessible' });
    }
    
    const result = await pool.query(
      'INSERT INTO timeline_comments (entry_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [id, req.user.userId, content.trim()]
    );
    
    console.log('✅ Comment added successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Add comment error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update comment
app.put('/api/timeline/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    // Validate content
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    console.log('📅 Updating comment:', commentId, 'content:', content);
    
    const result = await pool.query(
      'UPDATE timeline_comments SET content = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [content.trim(), commentId, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }
    
    console.log('✅ Comment updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Update comment error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Delete comment
app.delete('/api/timeline/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    console.log('📅 Deleting comment:', commentId);
    
    const result = await pool.query(
      'DELETE FROM timeline_comments WHERE id = $1 AND user_id = $2 RETURNING *',
      [commentId, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }
    
    console.log('✅ Comment deleted successfully');
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('❌ Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// =============================================
// STREAK ROUTES - BULLETPROOF STREAK SYSTEM
// =============================================

// Get current streak for user
app.get('/api/streak', authenticateToken, async (req, res) => {
  try {
    console.log('🔥 Fetching streak for user:', req.user.userId);
    
    const result = await pool.query(
      'SELECT * FROM streaks WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      // Create new streak for user if doesn't exist
      const newStreak = await pool.query(
        'INSERT INTO streaks (user_id, last_click_date, current_streak_count, max_streak_count, is_active, emoji) VALUES ($1, $2, 0, 0, TRUE, $3) RETURNING *',
        [req.user.userId, new Date().toISOString().split('T')[0], '🔥']
      );
      console.log('🔥 Created new streak for user:', newStreak.rows[0]);
      return res.json(newStreak.rows[0]);
    }
    
    const streak = result.rows[0];
    console.log('🔥 Found streak:', streak);
    res.json(streak);
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record streak click - BULLETPROOF LOGIC
app.post('/api/streak/click', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    console.log('🔥 Recording streak click for user:', req.user.userId);
    
    await client.query('BEGIN');
    
    // Get current streak
    const streakResult = await client.query(
      'SELECT * FROM streaks WHERE user_id = $1 FOR UPDATE',
      [req.user.userId]
    );
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let streak;
    
    if (streakResult.rows.length === 0) {
      // Create new streak
      const newStreak = await client.query(
        'INSERT INTO streaks (user_id, last_click_date, current_streak_count, max_streak_count, is_active, emoji) VALUES ($1, $2, 1, 1, TRUE, $3) RETURNING *',
        [req.user.userId, today, '🔥']
      );
      streak = newStreak.rows[0];
      console.log('🔥 Created new streak:', streak);
    } else {
      streak = streakResult.rows[0];
      
      console.log('🔥 Date check:', { today, yesterday, lastClickDate: streak.last_click_date });
      
      // Check if already clicked today
      const lastClickDate = streak.last_click_date ? 
        (typeof streak.last_click_date === 'string' ? streak.last_click_date.split('T')[0] : streak.last_click_date.toISOString().split('T')[0]) : 
        null;
      if (lastClickDate === today) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: 'Already clicked today', 
          streak: streak,
          message: 'You have already recorded your streak for today! 🔥'
        });
      }
      
      let newStreakCount = 1;
      let newMaxStreak = streak.max_streak_count;
      
      // Check if streak continues
      if (lastClickDate === yesterday) {
        // Streak continues - increment
        newStreakCount = streak.current_streak_count + 1;
        newMaxStreak = Math.max(newMaxStreak, newStreakCount);
        console.log('🔥 Streak continues! New count:', newStreakCount);
      } else {
        // Streak broken - reset to 1
        console.log('🔥 Streak broken, resetting to 1');
      }
      
      // Update streak
      const updatedStreak = await client.query(
        'UPDATE streaks SET last_click_date = $1, current_streak_count = $2, max_streak_count = $3, is_active = TRUE, updated_at = NOW() WHERE user_id = $4 RETURNING *',
        [today, newStreakCount, newMaxStreak, req.user.userId]
      );
      
      streak = updatedStreak.rows[0];
      console.log('🔥 Updated streak:', streak);
    }
    
    await client.query('COMMIT');
    
    // Determine reward and emoji based on streak count
    let reward = '';
    let emoji = '🔥';
    
    if (streak.current_streak_count >= 100) {
      reward = 'Century Club! 🏆';
      emoji = '💎';
    } else if (streak.current_streak_count >= 50) {
      reward = 'Half Century! 🎯';
      emoji = '⭐';
    } else if (streak.current_streak_count >= 30) {
      reward = 'Monthly Master! 📅';
      emoji = '🌟';
    } else if (streak.current_streak_count >= 7) {
      reward = 'Weekly Warrior! ⚔️';
      emoji = '🔥';
    } else if (streak.current_streak_count >= 3) {
      reward = 'Getting Started! 🚀';
      emoji = '🔥';
    }
    
    // Update emoji if reward earned
    if (reward) {
      await client.query(
        'UPDATE streaks SET emoji = $1, reward_earned = $2 WHERE user_id = $3',
        [emoji, reward, req.user.userId]
      );
      streak.emoji = emoji;
      streak.reward_earned = reward;
    }
    
    console.log('✅ Streak click recorded successfully:', streak);
    res.json({
      success: true,
      streak: streak,
      message: reward || `Streak updated! ${emoji} ${streak.current_streak_count} days!`,
      reward: reward,
      emoji: emoji
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Streak click error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    client.release();
  }
});

// Get streak history (optional)
app.get('/api/streak/history', authenticateToken, async (req, res) => {
  try {
    console.log('🔥 Fetching streak history for user:', req.user.userId);
    
    const result = await pool.query(
      'SELECT * FROM streaks WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 30',
      [req.user.userId]
    );
    
    console.log('🔥 Found streak history:', result.rows.length, 'entries');
    res.json(result.rows);
  } catch (error) {
    console.error('Get streak history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// BUCKET LIST ROUTES
// =============================================

// Get all bucket list items for user
app.get('/api/bucketlist', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bucket_list_items WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get bucket list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new bucket list item
app.post('/api/bucketlist', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, target_date } = req.body;
    const result = await pool.query(
      'INSERT INTO bucket_list_items (user_id, title, description, priority, target_date, completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.userId, title, description, priority, target_date, false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create bucket list item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bucket list item
app.put('/api/bucketlist/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, target_date, completed } = req.body;
    
    const result = await pool.query(
      'UPDATE bucket_list_items SET title = $1, description = $2, priority = $3, target_date = $4, completed = $5, updated_at = NOW() WHERE id = $6 AND user_id = $7 RETURNING *',
      [title, description, priority, target_date, completed, id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bucket list item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update bucket list item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete bucket list item
app.delete('/api/bucketlist/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM bucket_list_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bucket list item not found' });
    }
    
    res.json({ message: 'Bucket list item deleted successfully' });
  } catch (error) {
    console.error('Delete bucket list item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// NOTES ROUTES
// =============================================

// Get all notes for user
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new note
app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const { title, content, description, category, starred } = req.body;
    const result = await pool.query(
      'INSERT INTO notes (user_id, title, content, description, category, starred) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.userId, title, content, description, category, starred || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update note
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, description, category, starred } = req.body;
    
    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, description = $3, category = $4, starred = $5, updated_at = NOW() WHERE id = $6 AND user_id = $7 RETURNING *',
      [title, content, description, category, starred, id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// ENHANCED FINANCE ROUTES WITH CURRENCY CONVERSION
// =============================================

// REAL Currency conversion utility using exchangerate.host API
const fetchExchangeRates = async () => {
  try {
    console.log('💱 Fetching REAL exchange rates from exchangerate.host...');
    
    // Get all major currencies
    const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
    
    // Fetch rates for each base currency
    for (const baseCurrency of currencies) {
      console.log(`💱 Fetching rates for ${baseCurrency}...`);
      
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      const data = await response.json();
      
      if (!data.rates) {
        console.error(`❌ Failed to fetch rates for ${baseCurrency}:`, data);
        continue;
      }
      
      // Store rates in database
      for (const targetCurrency of currencies) {
        if (baseCurrency !== targetCurrency && data.rates[targetCurrency]) {
          const rate = parseFloat(data.rates[targetCurrency]);
          
          await pool.query(`
            INSERT INTO currency_rates (base_currency, target_currency, rate, last_updated)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (base_currency, target_currency)
            DO UPDATE SET rate = $3, last_updated = NOW()
          `, [baseCurrency, targetCurrency, rate]);
        }
      }
    }
    
    console.log('✅ REAL exchange rates updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to fetch REAL exchange rates:', error);
    return false;
  }
};

// Get exchange rates (cached or fresh) - REAL API
app.get('/api/currency-rates', authenticateToken, async (req, res) => {
  try {
    const { base = 'USD', target = 'USD' } = req.query;
    
    // Check if we have recent rates (within 24 hours)
    const result = await pool.query(`
      SELECT rate, last_updated FROM currency_rates 
      WHERE base_currency = $1 AND target_currency = $2
      AND last_updated > NOW() - INTERVAL '24 hours'
    `, [base, target]);
    
    if (result.rows.length > 0) {
      return res.json({ 
        base, 
        target, 
        rate: parseFloat(result.rows[0].rate),
        last_updated: result.rows[0].last_updated,
        cached: true,
        source: 'exchangerate-api.com'
      });
    }
    
    // Fetch fresh rates if cache is stale
    console.log(`💱 Cache stale, fetching fresh rates for ${base} → ${target}`);
    const success = await fetchExchangeRates();
    if (!success) {
      return res.status(500).json({ error: 'Failed to fetch exchange rates' });
    }
    
    // Return the fresh rate
    const freshResult = await pool.query(`
      SELECT rate, last_updated FROM currency_rates 
      WHERE base_currency = $1 AND target_currency = $2
    `, [base, target]);
    
    if (freshResult.rows.length > 0) {
      res.json({ 
        base, 
        target, 
        rate: parseFloat(freshResult.rows[0].rate),
        last_updated: freshResult.rows[0].last_updated,
        cached: false,
        source: 'exchangerate-api.com'
      });
    } else {
      res.status(404).json({ error: 'Exchange rate not found' });
    }
  } catch (error) {
    console.error('❌ Currency rates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Convert amount between currencies - REAL API
app.post('/api/convert', authenticateToken, async (req, res) => {
  try {
    const { amount, from, to } = req.body;
    
    if (!amount || !from || !to) {
      return res.status(400).json({ error: 'Missing required fields: amount, from, to' });
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Get exchange rate
    const rateResult = await pool.query(`
      SELECT rate, last_updated FROM currency_rates 
      WHERE base_currency = $1 AND target_currency = $2
      AND last_updated > NOW() - INTERVAL '24 hours'
    `, [from, to]);
    
    if (rateResult.rows.length === 0) {
      // Try to fetch fresh rates
      console.log(`💱 No cached rate for ${from} → ${to}, fetching fresh rates...`);
      const success = await fetchExchangeRates();
      if (!success) {
        return res.status(500).json({ error: 'Failed to fetch exchange rates' });
      }
      
      // Try again after fetching
      const freshRateResult = await pool.query(`
        SELECT rate, last_updated FROM currency_rates 
        WHERE base_currency = $1 AND target_currency = $2
      `, [from, to]);
      
      if (freshRateResult.rows.length === 0) {
        return res.status(404).json({ error: `Exchange rate not found for ${from} → ${to}` });
      }
      
      const rate = parseFloat(freshRateResult.rows[0].rate);
      const converted = (amountNum * rate).toFixed(2);
      
      res.json({
        amount: amountNum,
        from,
        to,
        rate,
        converted: parseFloat(converted),
        last_updated: freshRateResult.rows[0].last_updated,
        source: 'exchangerate-api.com'
      });
    } else {
      const rate = parseFloat(rateResult.rows[0].rate);
      const converted = (amountNum * rate).toFixed(2);
      
      res.json({
        amount: amountNum,
        from,
        to,
        rate,
        converted: parseFloat(converted),
        last_updated: rateResult.rows[0].last_updated,
        source: 'exchangerate-api.com'
      });
    }
  } catch (error) {
    console.error('❌ Currency conversion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get finance transactions for specific person with currency conversion
app.get('/api/finance', authenticateToken, async (req, res) => {
  try {
    const { person = 'person1', display_currency = 'USD' } = req.query;
    
    console.log(`💰 Fetching finance for ${person} with display currency: ${display_currency}`);
    
    const result = await pool.query(`
      SELECT f.*, u.username, u.name as user_name
      FROM finance f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.user_id = $1 AND f.person = $2
      ORDER BY f.date DESC, f.created_at DESC
    `, [req.user.userId, person]);
    
    console.log(`💰 Found ${result.rows.length} transactions for ${person}`);
    
    // Convert currencies if needed
    if (display_currency !== 'USD') {
      const conversionResult = await pool.query(`
        SELECT rate FROM currency_rates 
        WHERE base_currency = 'USD' AND target_currency = $1
        AND last_updated > NOW() - INTERVAL '24 hours'
      `, [display_currency]);
      
      if (conversionResult.rows.length > 0) {
        const rate = parseFloat(conversionResult.rows[0].rate);
        result.rows = result.rows.map(transaction => ({
          ...transaction,
          original_amount: transaction.amount,
          original_currency: transaction.currency,
          converted_amount: (parseFloat(transaction.amount) * rate).toFixed(2),
          display_currency
        }));
      }
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get finance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new finance transaction for specific person
app.post('/api/finance', authenticateToken, async (req, res) => {
  try {
    const { title, amount, currency = 'USD', category, date, type, person = 'person1' } = req.body;
    
    // Validate required fields
    if (!title || !amount || !category || !date || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate person
    if (!['person1', 'person2'].includes(person)) {
      return res.status(400).json({ error: 'Invalid person. Must be person1 or person2' });
    }
    
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be income or expense' });
    }
    
    console.log(`💰 Creating finance transaction for ${person}:`, { title, amount, currency, type, category });
    
    const result = await pool.query(`
      INSERT INTO finance (user_id, person, title, amount, currency, category, date, type) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `, [req.user.userId, person, title, amountNum, currency, category, date, type]);
    
    console.log(`💰 Finance transaction created for ${person}:`, result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Create finance transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update finance transaction
app.put('/api/finance/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, currency, category, date, type } = req.body;
    
    // Validate amount if provided
    if (amount !== undefined) {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
    }
    
    // Validate type if provided
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be income or expense' });
    }
    
    const result = await pool.query(`
      UPDATE finance 
      SET title = COALESCE($1, title),
          amount = COALESCE($2, amount),
          currency = COALESCE($3, currency),
          category = COALESCE($4, category),
          date = COALESCE($5, date),
          type = COALESCE($6, type),
          updated_at = NOW()
      WHERE id = $7 AND user_id = $8 
      RETURNING *
    `, [title, amount, currency, category, date, type, id, req.user.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Finance transaction not found' });
    }
    
    console.log('💰 Finance transaction updated:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Update finance transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete finance transaction
app.delete('/api/finance/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM finance WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Finance transaction not found' });
    }
    
    console.log('💰 Finance transaction deleted:', result.rows[0]);
    res.json({ message: 'Finance transaction deleted successfully' });
  } catch (error) {
    console.error('❌ Delete finance transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get finance summary with totals for specific person
app.get('/api/finance/summary', authenticateToken, async (req, res) => {
  try {
    const { person = 'person1', display_currency = 'USD' } = req.query;
    
    console.log(`💰 Fetching finance summary for ${person} with display currency: ${display_currency}`);
    
    const result = await pool.query(`
      SELECT 
        type,
        SUM(amount) as total,
        currency,
        COUNT(*) as count
      FROM finance 
      WHERE user_id = $1 AND person = $2
      GROUP BY type, currency
      ORDER BY type, currency
    `, [req.user.userId, person]);
    
    console.log(`💰 Found ${result.rows.length} summary rows for ${person}`);
    
    // Calculate totals by type
    const summary = {
      income: { total: 0, count: 0, currency: display_currency },
      expense: { total: 0, count: 0, currency: display_currency },
      balance: 0,
      person: person
    };
    
    for (const row of result.rows) {
      let amount = parseFloat(row.total);
      
      // Convert to display currency if needed
      if (row.currency !== display_currency) {
        const conversionResult = await pool.query(`
          SELECT rate FROM currency_rates 
          WHERE base_currency = $1 AND target_currency = $2
          AND last_updated > NOW() - INTERVAL '24 hours'
        `, [row.currency, display_currency]);
        
        if (conversionResult.rows.length > 0) {
          amount *= parseFloat(conversionResult.rows[0].rate);
        }
      }
      
      summary[row.type].total += amount;
      summary[row.type].count += parseInt(row.count);
    }
    
    summary.balance = summary.income.total - summary.expense.total;
    
    console.log(`💰 Finance summary for ${person}:`, summary);
    res.json(summary);
  } catch (error) {
    console.error('❌ Finance summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// PERSON NAME MANAGEMENT ROUTES
// =============================================

// Get person names for user
app.get('/api/persons', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT person_key, name, currency_preference 
      FROM persons 
      WHERE user_id = $1 
      ORDER BY person_key
    `, [req.user.userId]);
    
    const persons = {
      person1: result.rows.find(p => p.person_key === 'person1') || { name: 'Person 1', currency_preference: 'USD' },
      person2: result.rows.find(p => p.person_key === 'person2') || { name: 'Person 2', currency_preference: 'USD' }
    };
    
    res.json(persons);
  } catch (error) {
    console.error('❌ Get persons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update person name
app.put('/api/persons/:personKey', authenticateToken, async (req, res) => {
  try {
    const { personKey } = req.params;
    const { name, currency_preference } = req.body;
    
    if (!['person1', 'person2'].includes(personKey)) {
      return res.status(400).json({ error: 'Invalid person key' });
    }
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await pool.query(`
      UPDATE persons 
      SET name = $1, currency_preference = $2, updated_at = NOW()
      WHERE user_id = $3 AND person_key = $4
      RETURNING *
    `, [name.trim(), currency_preference || 'USD', req.user.userId, personKey]);
    
    if (result.rows.length === 0) {
      // Create if doesn't exist
      const createResult = await pool.query(`
        INSERT INTO persons (user_id, person_key, name, currency_preference)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [req.user.userId, personKey, name.trim(), currency_preference || 'USD']);
      
      res.json(createResult.rows[0]);
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('❌ Update person error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// OLD TIMELINE ROUTES REMOVED - Using new timeline_entries system above
// =============================================

// =============================================
// HEALTH CHECK
// =============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Database: PostgreSQL`);
  console.log(`🔐 Authentication: JWT`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
});
