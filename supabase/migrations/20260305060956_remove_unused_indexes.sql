/*
  # Remove Unused Database Indexes

  ## Changes
  This migration removes database indexes that are not being used by queries, improving database efficiency:
  
  1. **Removed Indexes**
    - `idx_feedback_user_id` on `public.feedback` table (unused)
    - `idx_task_roles_role_id` on `public.task_roles` table (unused)
  
  ## Security Impact
  Removing unused indexes:
  - Reduces storage overhead
  - Improves write performance (INSERT, UPDATE, DELETE operations)
  - Reduces maintenance overhead during table operations
  - Does not impact query performance since these indexes were not being used
  
  ## Notes
  - These indexes were created but analysis shows they are not being utilized by any queries
  - If query patterns change in the future and these indexes are needed, they can be recreated
*/

-- Remove unused index on feedback table
DROP INDEX IF EXISTS idx_feedback_user_id;

-- Remove unused index on task_roles table
DROP INDEX IF EXISTS idx_task_roles_role_id;