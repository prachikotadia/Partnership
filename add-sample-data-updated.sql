-- Add sample data for user ID: 4956e5f3-219b-4c62-9bc0-a42f305c7f9e (Person1)
-- Run this AFTER you have created users through authentication

-- First, let's see what users exist
SELECT id, email, name FROM public.users;

-- Add sample tasks for Person1
INSERT INTO public.tasks (title, description, priority, status, created_by) VALUES 
    ('Plan weekend trip', 'Research destinations and book accommodations', 'high', 'todo', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Grocery shopping', 'Buy ingredients for dinner party', 'medium', 'in_progress', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Review budget', 'Check monthly expenses and savings', 'low', 'done', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Call mom', 'Weekly check-in call', 'medium', 'todo', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Finish project report', 'Complete the quarterly project report', 'high', 'in_progress', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e');

-- Add sample notes for Person1
INSERT INTO public.notes (title, content, created_by) VALUES 
    ('Weekend Ideas', 'Beach trip, hiking, movie night, cooking class', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Shopping List', 'Milk, bread, eggs, vegetables, fruits', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Meeting Notes', 'Discuss project timeline and deliverables', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Recipe Ideas', 'Try new pasta recipe, bake cookies for weekend', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e');

-- Add sample finance entries for Person1
INSERT INTO public.finance_entries (title, amount, currency, category, description, date, created_by) VALUES 
    ('Salary', 5000, 'USD', 'income', 'Monthly salary', '2024-01-15', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Rent', 1200, 'USD', 'expense', 'Monthly rent payment', '2024-01-01', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Groceries', 300, 'USD', 'expense', 'Weekly grocery shopping', '2024-01-10', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Investment', 1000, 'USD', 'investment', 'Monthly investment in index fund', '2024-01-05', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Emergency Fund', 500, 'USD', 'savings', 'Monthly emergency fund contribution', '2024-01-20', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e');

-- Add sample schedule items for Person1
INSERT INTO public.schedule_items (title, description, start_date, end_date, is_recurring, recurring_pattern, created_by) VALUES 
    ('Team Meeting', 'Weekly team standup meeting', '2024-01-15T10:00:00Z', '2024-01-15T11:00:00Z', true, 'weekly', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Doctor Appointment', 'Annual checkup', '2024-01-20T14:00:00Z', '2024-01-20T15:00:00Z', false, null, '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Date Night', 'Dinner and movie with partner', '2024-01-18T19:00:00Z', '2024-01-18T23:00:00Z', false, null, '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Gym Session', 'Regular workout session', '2024-01-16T18:00:00Z', '2024-01-16T19:30:00Z', true, 'weekly', '4956e5f3-219b-4c62-9bc0-a42f305c7f9e');

-- Add sample bucket list items for Person1
INSERT INTO public.bucket_list_items (title, description, category, priority, status, target_date, cost, created_by) VALUES 
    ('Visit Japan', 'Explore Tokyo, Kyoto, and Osaka', 'Travel', 'high', 'not_started', '2024-12-31', 5000, '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Learn Spanish', 'Become conversational in Spanish', 'Learning', 'medium', 'in_progress', '2024-06-30', 200, '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Run a Marathon', 'Complete a full marathon', 'Fitness', 'high', 'not_started', '2024-10-15', 150, '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Write a Book', 'Complete first novel', 'Creative', 'medium', 'not_started', '2024-12-31', 0, '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'),
    ('Learn Guitar', 'Master 10 songs on guitar', 'Music', 'low', 'in_progress', '2024-08-31', 300, '4956e5f3-219b-4c62-9bc0-a42f305c7f9e');

-- Add sample check-ins for Person1
INSERT INTO public.check_ins (user_id, date, mood, note) VALUES 
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', '2024-01-15', 'good', 'Had a productive day at work'),
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', '2024-01-14', 'great', 'Amazing weekend with friends'),
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', '2024-01-13', 'okay', 'Feeling a bit tired but overall good');

-- Add sample streaks for Person1
INSERT INTO public.streaks (user_id, streak_type, current_streak, longest_streak, last_check_in) VALUES 
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', 'daily_check_in', 3, 7, '2024-01-15'),
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', 'exercise', 5, 12, '2024-01-15'),
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', 'reading', 2, 15, '2024-01-14');

-- Add sample budgets for Person1
INSERT INTO public.budgets (user_id, category, amount, currency, period) VALUES 
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', 'Groceries', 400, 'USD', 'monthly'),
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', 'Entertainment', 200, 'USD', 'monthly'),
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', 'Transportation', 150, 'USD', 'monthly');

-- Add sample savings goals for Person1
INSERT INTO public.savings_goals (user_id, title, target_amount, current_amount, currency, target_date) VALUES 
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', 'Emergency Fund', 10000, 2500, 'USD', '2024-12-31'),
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', 'Vacation Fund', 3000, 800, 'USD', '2024-06-30'),
    ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', 'New Car', 25000, 5000, 'USD', '2025-06-30');

-- Update Person1's partner information
UPDATE public.users 
SET partner_id = '81f79a40-8665-4b88-a774-6946a78b1921', 
    partner_name = 'Person2', 
    partner_paired_at = NOW()
WHERE id = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e';

-- Update Person2's partner information (if Person2 exists)
UPDATE public.users 
SET partner_id = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e', 
    partner_name = 'Person1', 
    partner_paired_at = NOW()
WHERE id = '81f79a40-8665-4b88-a774-6946a78b1921';

-- Verify the data was inserted
SELECT 'Tasks' as table_name, COUNT(*) as count FROM public.tasks WHERE created_by = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'
UNION ALL
SELECT 'Notes' as table_name, COUNT(*) as count FROM public.notes WHERE created_by = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'
UNION ALL
SELECT 'Finance Entries' as table_name, COUNT(*) as count FROM public.finance_entries WHERE created_by = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'
UNION ALL
SELECT 'Schedule Items' as table_name, COUNT(*) as count FROM public.schedule_items WHERE created_by = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'
UNION ALL
SELECT 'Bucket List Items' as table_name, COUNT(*) as count FROM public.bucket_list_items WHERE created_by = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'
UNION ALL
SELECT 'Check-ins' as table_name, COUNT(*) as count FROM public.check_ins WHERE user_id = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'
UNION ALL
SELECT 'Streaks' as table_name, COUNT(*) as count FROM public.streaks WHERE user_id = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'
UNION ALL
SELECT 'Budgets' as table_name, COUNT(*) as count FROM public.budgets WHERE user_id = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e'
UNION ALL
SELECT 'Savings Goals' as table_name, COUNT(*) as count FROM public.savings_goals WHERE user_id = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e';
