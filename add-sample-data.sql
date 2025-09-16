-- Add sample data for user ID: 527ddf7b-1c91-4c67-9f32-fe82d08061e4
-- Run this AFTER you have created users through authentication

-- First, let's see what users exist
SELECT id, email, name FROM public.users;

-- Add sample tasks for the user
INSERT INTO public.tasks (title, description, priority, status, created_by) VALUES 
    ('Plan weekend trip', 'Research destinations and book accommodations', 'high', 'todo', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Grocery shopping', 'Buy ingredients for dinner party', 'medium', 'in_progress', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Review budget', 'Check monthly expenses and savings', 'low', 'done', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Call mom', 'Weekly check-in call', 'medium', 'todo', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Finish project report', 'Complete the quarterly project report', 'high', 'in_progress', '527ddf7b-1c91-4c67-9f32-fe82d08061e4');

-- Add sample notes
INSERT INTO public.notes (title, content, created_by) VALUES 
    ('Weekend Ideas', 'Beach trip, hiking, movie night, cooking class', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Shopping List', 'Milk, bread, eggs, vegetables, fruits', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Meeting Notes', 'Discuss project timeline and deliverables', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Recipe Ideas', 'Try new pasta recipe, bake cookies for weekend', '527ddf7b-1c91-4c67-9f32-fe82d08061e4');

-- Add sample check-ins
INSERT INTO public.check_ins (user_id, date, mood, note) VALUES 
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', CURRENT_DATE, 'great', 'Feeling excited about the weekend!'),
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', CURRENT_DATE - INTERVAL '1 day', 'good', 'Productive day at work'),
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', CURRENT_DATE - INTERVAL '2 days', 'okay', 'Had some challenges but managed well');

-- Add sample finance entries
INSERT INTO public.finance_entries (title, amount, currency, category, date, created_by) VALUES 
    ('Salary', 5000.00, 'USD', 'income', CURRENT_DATE, '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Groceries', 150.00, 'USD', 'expense', CURRENT_DATE, '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Savings', 500.00, 'USD', 'savings', CURRENT_DATE, '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Coffee', 25.00, 'USD', 'expense', CURRENT_DATE - INTERVAL '1 day', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Investment', 1000.00, 'USD', 'investment', CURRENT_DATE - INTERVAL '2 days', '527ddf7b-1c91-4c67-9f32-fe82d08061e4');

-- Add sample schedule items
INSERT INTO public.schedule_items (title, description, start_date, created_by) VALUES 
    ('Date Night', 'Dinner at the new restaurant downtown', NOW() + INTERVAL '2 days', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Gym Session', 'Morning workout at 7 AM', NOW() + INTERVAL '1 day', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Team Meeting', 'Weekly team standup', NOW() + INTERVAL '3 hours', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Doctor Appointment', 'Annual checkup', NOW() + INTERVAL '5 days', '527ddf7b-1c91-4c67-9f32-fe82d08061e4');

-- Add sample bucket list items
INSERT INTO public.bucket_list_items (title, description, category, priority, created_by) VALUES 
    ('Visit Japan', 'Explore Tokyo, Kyoto, and Osaka', 'Travel', 'high', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Learn Spanish', 'Complete a Spanish language course', 'Education', 'medium', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Run a Marathon', 'Train and complete a full marathon', 'Fitness', 'high', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Learn to Cook', 'Master 10 different cuisines', 'Personal', 'medium', '527ddf7b-1c91-4c67-9f32-fe82d08061e4'),
    ('Read 50 Books', 'Read 50 books in a year', 'Education', 'low', '527ddf7b-1c91-4c67-9f32-fe82d08061e4');

-- Add sample budgets
INSERT INTO public.budgets (user_id, category, amount, currency, period) VALUES 
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'Groceries', 400.00, 'USD', 'monthly'),
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'Entertainment', 200.00, 'USD', 'monthly'),
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'Transportation', 300.00, 'USD', 'monthly');

-- Add sample savings goals
INSERT INTO public.savings_goals (user_id, title, target_amount, current_amount, currency, target_date) VALUES 
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'Emergency Fund', 10000.00, 2500.00, 'USD', '2024-12-31'),
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'Vacation Fund', 3000.00, 800.00, 'USD', '2024-06-01'),
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'New Car', 25000.00, 5000.00, 'USD', '2025-03-01');

-- Add sample notifications
INSERT INTO public.notifications (user_id, title, message, type, data) VALUES 
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'Task Reminder', 'Don''t forget to plan your weekend trip!', 'task', '{"task_id": "sample-task-id"}'),
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'Budget Alert', 'You''re close to your monthly grocery budget', 'reminder', '{"category": "groceries", "amount": 350}'),
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'Achievement Unlocked', 'Great job completing 5 tasks this week!', 'achievement', '{"achievement": "task_master"}');

-- Create some streaks
INSERT INTO public.streaks (user_id, streak_type, current_streak, longest_streak, last_check_in) VALUES 
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'daily_check_in', 3, 7, NOW()),
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'task_completion', 5, 12, NOW()),
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'note_creation', 2, 5, NOW());

-- Note: If you want to set up partner relationships, you'll need another user ID
-- For now, this user will work independently
-- To add a partner later, you can run:
-- UPDATE public.users SET 
--     partner_id = 'partner-user-id',
--     partner_name = 'Partner Name',
--     partner_paired_at = NOW()
-- WHERE id = '527ddf7b-1c91-4c67-9f32-fe82d08061e4';
