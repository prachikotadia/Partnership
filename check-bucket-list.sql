-- Query to check bucket list table contents
-- Run this in your Supabase SQL Editor

-- First, check if the bucket_list table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'bucket_list'
) as bucket_list_exists;

-- If the table doesn't exist, run create-bucket-list-table.sql first
-- Then come back and run the queries below

-- 1. Check all bucket list entries
SELECT 
    id,
    title,
    description,
    category,
    priority,
    status,
    progress,
    cost,
    estimated_time,
    difficulty,
    location,
    due_date,
    created_by,
    created_at,
    updated_at
FROM bucket_list
ORDER BY created_at DESC;

-- 2. Count total bucket list items
SELECT COUNT(*) as total_items FROM bucket_list;

-- 3. Count by status
SELECT 
    status,
    COUNT(*) as count
FROM bucket_list
GROUP BY status
ORDER BY count DESC;

-- 4. Count by category
SELECT 
    category,
    COUNT(*) as count
FROM bucket_list
GROUP BY category
ORDER BY count DESC;

-- 5. Count by priority
SELECT 
    priority,
    COUNT(*) as count
FROM bucket_list
GROUP BY priority
ORDER BY 
    CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;

-- 6. Check items by user
SELECT 
    created_by,
    COUNT(*) as items_created
FROM bucket_list
GROUP BY created_by
ORDER BY items_created DESC;

-- 7. Check recent items (last 7 days)
SELECT 
    id,
    title,
    status,
    created_by,
    created_at
FROM bucket_list
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 8. Check completed items
SELECT 
    id,
    title,
    category,
    completed_at,
    created_by
FROM bucket_list
WHERE status = 'completed'
ORDER BY completed_at DESC;

-- 9. Check items with due dates
SELECT 
    id,
    title,
    due_date,
    status,
    created_by
FROM bucket_list
WHERE due_date IS NOT NULL
ORDER BY due_date ASC;

-- 10. Summary statistics
SELECT 
    'Total Items' as metric,
    COUNT(*)::text as value
FROM bucket_list
UNION ALL
SELECT 
    'Completed Items',
    COUNT(*)::text
FROM bucket_list
WHERE status = 'completed'
UNION ALL
SELECT 
    'In Progress Items',
    COUNT(*)::text
FROM bucket_list
WHERE status = 'in-progress'
UNION ALL
SELECT 
    'Not Started Items',
    COUNT(*)::text
FROM bucket_list
WHERE status = 'not-started'
UNION ALL
SELECT 
    'Items with Cost',
    COUNT(*)::text
FROM bucket_list
WHERE cost IS NOT NULL AND cost > 0
UNION ALL
SELECT 
    'Items with Due Dates',
    COUNT(*)::text
FROM bucket_list
WHERE due_date IS NOT NULL;
