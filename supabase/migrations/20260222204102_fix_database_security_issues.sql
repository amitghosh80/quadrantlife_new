/*
  # Fix Database Security and Performance Issues

  ## Overview
  This migration addresses critical security and performance issues identified in the database:
  1. Adds missing index for task_roles.role_id foreign key
  2. Removes unused indexes on tasks table (idx_tasks_goal_id and idx_tasks_role_id)
  
  ## Changes Made
  
  ### 1. New Index
  - `idx_task_roles_role_id` - Index on task_roles.role_id for the foreign key constraint task_roles_role_id_fkey
    - This index is essential for optimal query performance when filtering or joining by role_id
    - Prevents performance degradation that could occur without proper foreign key indexing
  
  ### 2. Removed Indexes
  - `idx_tasks_goal_id` - Unused index on tasks.goal_id (tasks no longer have a direct role_id or goal_id column)
  - `idx_tasks_role_id` - Unused index on tasks.role_id (tasks no longer have a direct role_id column)
    - These indexes were created for columns that were removed when the schema was refactored to use junction tables
    - Removing unused indexes reduces storage overhead and improves write performance
  
  ## Performance Impact
  - The new index on task_roles.role_id will improve query performance for role-based filtering
  - Removing unused indexes reduces database bloat and speeds up INSERT/UPDATE/DELETE operations
  
  ## Security Impact
  - Proper foreign key indexing prevents potential performance-based denial of service
  - Follows PostgreSQL and Supabase best practices for database design
  
  ## Note on Auth Configuration Issues
  The following issues require manual configuration in the Supabase Dashboard and cannot be fixed via migrations:
  
  1. **Auth DB Connection Strategy**: The Auth server is using a fixed connection pool (10 connections) 
     instead of a percentage-based strategy. This should be changed in the Supabase Dashboard under 
     Settings > Database > Connection Pooling to use a percentage-based allocation.
  
  2. **Leaked Password Protection**: HaveIBeenPwned.org password breach checking is currently disabled.
     This should be enabled in the Supabase Dashboard under Authentication > Providers > Email to 
     enhance security by preventing users from using compromised passwords.
*/

-- Add index for task_roles.role_id foreign key
CREATE INDEX IF NOT EXISTS idx_task_roles_role_id ON task_roles(role_id);

-- Remove unused indexes from tasks table
-- These indexes reference columns (role_id, goal_id) that no longer exist on the tasks table
DROP INDEX IF EXISTS idx_tasks_goal_id;
DROP INDEX IF EXISTS idx_tasks_role_id;
