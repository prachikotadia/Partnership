-- Create bucket_list table if it doesn't exist
-- Run this in your Supabase SQL Editor

-- Create the bucket_list table
CREATE TABLE IF NOT EXISTS bucket_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'personal',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    cost DECIMAL(10,2),
    estimated_time VARCHAR(50), -- e.g., "2 weeks", "1 month", "6 months"
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
    location VARCHAR(255),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bucket_list_created_by ON bucket_list(created_by);
CREATE INDEX IF NOT EXISTS idx_bucket_list_status ON bucket_list(status);
CREATE INDEX IF NOT EXISTS idx_bucket_list_category ON bucket_list(category);
CREATE INDEX IF NOT EXISTS idx_bucket_list_priority ON bucket_list(priority);
CREATE INDEX IF NOT EXISTS idx_bucket_list_due_date ON bucket_list(due_date);

-- Enable Row Level Security (RLS)
ALTER TABLE bucket_list ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can see their own bucket list items and their partner's items
CREATE POLICY "Users can view their own and partner's bucket list items" ON bucket_list
    FOR SELECT USING (
        created_by = auth.uid() OR 
        created_by IN (
            SELECT partner_id FROM users WHERE id = auth.uid()
        )
    );

-- Users can insert their own bucket list items
CREATE POLICY "Users can insert their own bucket list items" ON bucket_list
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update their own bucket list items
CREATE POLICY "Users can update their own bucket list items" ON bucket_list
    FOR UPDATE USING (created_by = auth.uid());

-- Users can delete their own bucket list items
CREATE POLICY "Users can delete their own bucket list items" ON bucket_list
    FOR DELETE USING (created_by = auth.uid());

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_bucket_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_bucket_list_updated_at
    BEFORE UPDATE ON bucket_list
    FOR EACH ROW
    EXECUTE FUNCTION update_bucket_list_updated_at();

-- Insert some sample data (optional)
-- Using the correct Person2 ID: 9b1fa7e3-63b3-4b94-b439-3af6a4a29db1
INSERT INTO bucket_list (title, description, category, priority, status, progress, cost, estimated_time, difficulty, location, due_date, created_by) VALUES
('Visit Japan', 'Experience the culture, food, and technology of Japan', 'travel', 'high', 'not-started', 0, 5000.00, '2 weeks', 'medium', 'Japan', '2025-12-31', (SELECT id FROM users WHERE email = 'person1@example.com' LIMIT 1)),
('Learn Spanish', 'Become conversational in Spanish', 'personal', 'medium', 'in-progress', 30, 200.00, '6 months', 'medium', 'Online', '2025-06-30', (SELECT id FROM users WHERE email = 'person1@example.com' LIMIT 1)),
('Run a Marathon', 'Complete a full 26.2 mile marathon', 'fitness', 'high', 'not-started', 0, 150.00, '1 year', 'hard', 'Local', '2025-10-15', '9b1fa7e3-63b3-4b94-b439-3af6a4a29db1'),
('Start a Business', 'Launch my own tech startup', 'career', 'urgent', 'in-progress', 15, 10000.00, '2 years', 'extreme', 'Remote', '2026-12-31', '9b1fa7e3-63b3-4b94-b439-3af6a4a29db1'),
('Learn to Cook Italian Food', 'Master authentic Italian recipes', 'personal', 'low', 'not-started', 0, 300.00, '3 months', 'easy', 'Home', NULL, (SELECT id FROM users WHERE email = 'person1@example.com' LIMIT 1))
ON CONFLICT (id) DO NOTHING;
