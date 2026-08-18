/*
  # Fix Foreign Key Indexes and Remove Unused Indexes

  ## Overview
  This migration addresses security and performance issues by:
  1. Adding missing indexes for foreign keys on the tasks table
  2. Removing unused indexes that provide no performance benefit
  
  ## Changes Made
  
  ### 1. New Indexes
  - `idx_tasks_goal_id` - Index on tasks.goal_id for faster foreign key lookups
  - `idx_tasks_role_id` - Index on tasks.role_id for faster foreign key lookups
  
  ### 2. Removed Indexes
  - `idx_task_goals_task_goal` - Unused index on task_goals table
  - `idx_task_roles_role_task` - Unused index on task_roles table
  
  ## Performance Impact
  - Foreign key indexes will improve query performance when filtering or joining by goal_id or role_id
  - Removing unused indexes reduces storage overhead and improves write performance
  
  ## Security Impact
  - Proper indexing prevents potential performance degradation that could lead to denial of service
  - Follows database best practices for foreign key indexing
*/

-- Add indexes for foreign keys on tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_role_id ON tasks(role_id);

-- Remove unused indexes if they exist
DROP INDEX IF EXISTS idx_task_goals_task_goal;
DROP INDEX IF EXISTS idx_task_roles_role_task;
