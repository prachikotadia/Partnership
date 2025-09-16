-- Quick check of bucket_list table
SELECT 
    id,
    title,
    description,
    category,
    priority,
    status,
    progress,
    cost,
    created_by,
    created_at
FROM bucket_list
ORDER BY created_at DESC
LIMIT 10;
