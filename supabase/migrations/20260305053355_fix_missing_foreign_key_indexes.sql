/*
  # Fix Missing Foreign Key Indexes

  1. Changes
    - Add index on `feedback.user_id` to support the foreign key `feedback_user_id_fkey`
    - Add index on `task_roles.role_id` to support the foreign key `task_roles_role_id_fkey`
  
  2. Performance Impact
    - These indexes will improve query performance when joining or filtering by these foreign keys
    - Prevents full table scans when looking up related records
  
  3. Security
    - No RLS changes required
    - Indexes are purely for performance optimization
*/

-- Add index for feedback.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- Add index for task_roles.role_id foreign key
CREATE INDEX IF NOT EXISTS idx_task_roles_role_id ON task_roles(role_id);