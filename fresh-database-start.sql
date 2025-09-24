-- Fresh Database Start - Partnership App
-- This completely resets the database and creates everything from scratch

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- DROP ALL EXISTING TABLES (if they exist)
-- =============================================

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_streaks CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS bucket_list_items CASCADE;
DROP TABLE IF EXISTS finance_transactions CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS partnerships CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- CREATE FRESH TABLES
-- =============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partnerships table
CREATE TABLE partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    invitation_code VARCHAR(10) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_starred BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance transactions table
CREATE TABLE finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bucket list items table
CREATE TABLE bucket_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline events table
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User streaks table
CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert sample users
INSERT INTO users (username, email, password_hash, name) VALUES
('person1', 'person1@example.com', crypt('password123', gen_salt('bf')), 'Person One'),
('person2', 'person2@example.com', crypt('password123', gen_salt('bf')), 'Person Two');

-- Create sample partnership
INSERT INTO partnerships (user1_id, user2_id, status, invitation_code)
SELECT 
    u1.id, 
    u2.id, 
    'active', 
    'SAMPLE1'
FROM users u1, users u2
WHERE u1.username = 'person1' AND u2.username = 'person2';

-- Create sample tasks
INSERT INTO tasks (user_id, partnership_id, title, description)
SELECT 
    u.id, 
    p.id,
    'Plan weekend trip', 
    'Research destinations and book tickets'
FROM users u, partnerships p
WHERE u.username = 'person1' AND p.user1_id = u.id
UNION ALL
SELECT 
    u.id, 
    p.id,
    'Buy groceries', 
    'Weekly grocery shopping'
FROM users u, partnerships p
WHERE u.username = 'person1' AND p.user1_id = u.id;

-- Create sample notes
INSERT INTO notes (user_id, partnership_id, title, content)
SELECT 
    u.id, 
    p.id,
    'Vacation Ideas', 
    'Beach destinations, mountain hiking, city tours'
FROM users u, partnerships p
WHERE u.username = 'person1' AND p.user1_id = u.id
UNION ALL
SELECT 
    u.id, 
    p.id,
    'Shopping List', 
    'Milk, bread, eggs, vegetables, fruits, meat'
FROM users u, partnerships p
WHERE u.username = 'person1' AND p.user1_id = u.id;

-- Create sample finance transactions
INSERT INTO finance_transactions (user_id, partnership_id, title, amount, currency, type)
SELECT 
    u.id, 
    p.id,
    'Salary', 
    3000.00, 
    'USD', 
    'income'
FROM users u, partnerships p
WHERE u.username = 'person1' AND p.user1_id = u.id
UNION ALL
SELECT 
    u.id, 
    p.id,
    'Grocery Shopping', 
    150.00, 
    'USD', 
    'expense'
FROM users u, partnerships p
WHERE u.username = 'person1' AND p.user1_id = u.id;

-- Create sample bucket list items
INSERT INTO bucket_list_items (user_id, partnership_id, title, description)
SELECT 
    u.id, 
    p.id,
    'Visit Japan', 
    'Travel to Japan and experience the culture'
FROM users u, partnerships p
WHERE u.username = 'person1' AND p.user1_id = u.id
UNION ALL
SELECT 
    u.id, 
    p.id,
    'Learn Spanish', 
    'Become conversational in Spanish'
FROM users u, partnerships p
WHERE u.username = 'person1' AND p.user1_id = u.id;

-- No default timeline events - users will add their own

-- Create sample notifications
INSERT INTO notifications (user_id, type, title, message)
SELECT id, 'success', 'Welcome!', 'Welcome to Bondly Glow Partnership App!'
FROM users WHERE username = 'person1'
UNION ALL
SELECT id, 'info', 'Get Started', 'Complete your first task to start your streak!'
FROM users WHERE username = 'person1';

-- Create user streaks
INSERT INTO user_streaks (user_id, current_streak, longest_streak)
SELECT id, 5, 10
FROM users WHERE username = 'person1';

COMMIT;
