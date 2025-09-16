-- Check all expenses in the database
-- Run this in your Supabase SQL Editor

-- 1. Check all finance entries (including expenses)
SELECT 
    id,
    title,
    amount,
    currency,
    category,
    description,
    date,
    created_by,
    created_at
FROM public.finance_entries 
ORDER BY date DESC, created_at DESC;

-- 2. Check only expenses (filter by category)
SELECT 
    id,
    title,
    amount,
    currency,
    description,
    date,
    created_by,
    created_at
FROM public.finance_entries 
WHERE category = 'expense'
ORDER BY date DESC, created_at DESC;

-- 3. Check expenses by user
SELECT 
    fe.id,
    fe.title,
    fe.amount,
    fe.currency,
    fe.description,
    fe.date,
    u.name as user_name,
    u.email as user_email,
    fe.created_at
FROM public.finance_entries fe
JOIN public.users u ON fe.created_by = u.id
WHERE fe.category = 'expense'
ORDER BY fe.date DESC, fe.created_at DESC;

-- 4. Summary of expenses by user
SELECT 
    u.name as user_name,
    u.email as user_email,
    COUNT(*) as total_expenses,
    SUM(fe.amount) as total_amount,
    AVG(fe.amount) as average_amount,
    MIN(fe.amount) as min_amount,
    MAX(fe.amount) as max_amount
FROM public.finance_entries fe
JOIN public.users u ON fe.created_by = u.id
WHERE fe.category = 'expense'
GROUP BY u.id, u.name, u.email
ORDER BY total_amount DESC;

-- 5. Check expenses by month
SELECT 
    DATE_TRUNC('month', date::date) as month,
    COUNT(*) as expense_count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount
FROM public.finance_entries 
WHERE category = 'expense'
GROUP BY DATE_TRUNC('month', date::date)
ORDER BY month DESC;

-- 6. Check all finance entries by category
SELECT 
    category,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount
FROM public.finance_entries 
GROUP BY category
ORDER BY total_amount DESC;
