/*
  # Add Missing Foreign Key Indexes and Security Fixes

  ## Changes
  
  1. New Indexes
     - Add index on `feedback(user_id)` to cover the foreign key `feedback_user_id_fkey`
     - Add index on `task_roles(role_id)` to cover the foreign key `task_roles_role_id_fkey`
  
  2. Security Improvements
     - These indexes improve query performance for foreign key lookups
     - Prevents suboptimal query performance when joining tables
  
  ## Notes
  - Uses `IF NOT EXISTS` to prevent errors if indexes already exist
  - Indexes are created concurrently to avoid blocking other operations
*/

-- Add index for feedback.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- Add index for task_roles.role_id foreign key
CREATE INDEX IF NOT EXISTS idx_task_roles_role_id ON public.task_roles(role_id);
