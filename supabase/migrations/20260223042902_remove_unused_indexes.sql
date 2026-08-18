/*
  # Remove Unused Indexes

  1. Changes
    - Drop `idx_task_roles_role_id` index on `task_roles` table (unused)
    - Drop `idx_feedback_user_id` index on `feedback` table (unused)
  
  2. Reasoning
    - These indexes are not being used by any queries
    - Unused indexes consume storage space and slow down write operations
    - The foreign key on task_roles.role_id already provides indexing
    - The feedback table queries are simple enough without additional indexing
  
  3. Performance Impact
    - Reduces storage overhead
    - Improves INSERT/UPDATE/DELETE performance on affected tables
    - No negative impact on query performance as these indexes were not being utilized
*/

-- Drop unused index on task_roles table
DROP INDEX IF EXISTS idx_task_roles_role_id;

-- Drop unused index on feedback table
DROP INDEX IF EXISTS idx_feedback_user_id;