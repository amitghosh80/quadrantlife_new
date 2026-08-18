/*
  # Remove Unused Indexes

  1. Changes
    - Drop `idx_feedback_user_id` index on `feedback` table (unused)
    - Drop `idx_task_roles_role_id` index on `task_roles` table (unused)
  
  2. Security
    - These indexes are not being utilized by queries
    - Removing them reduces storage overhead and improves write performance
    - Foreign key constraints remain in place for data integrity
*/

-- Drop unused index on feedback table
DROP INDEX IF EXISTS idx_feedback_user_id;

-- Drop unused index on task_roles table
DROP INDEX IF EXISTS idx_task_roles_role_id;
