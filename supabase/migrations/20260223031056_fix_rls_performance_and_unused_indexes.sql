/*
  # Fix RLS Performance and Remove Unused Indexes

  ## Overview
  This migration addresses critical RLS performance issues and removes unused indexes:
  1. Optimizes RLS policies to prevent re-evaluation of auth.uid() for each row
  2. Removes unused indexes that provide no query performance benefit

  ## Changes Made

  ### 1. RLS Policy Performance Optimization
  
  **Problem:** RLS policies that call `auth.uid()` directly are re-evaluated for each row,
  causing significant performance degradation at scale.
  
  **Solution:** Replace `auth.uid()` with `(select auth.uid())` to evaluate once per query
  instead of once per row.
  
  **Affected Policies:**
  - `task_goals` table:
    - "Users can update task goals for own tasks" (UPDATE policy)
  - `feedback` table:
    - "Users can insert own feedback" (INSERT policy)
    - "Users can read own feedback" (SELECT policy)

  ### 2. Unused Index Removal
  
  **Indexes Removed:**
  - `idx_task_roles_role_id` - Index on task_roles.role_id has not been used
  - `idx_feedback_user_id` - Index on feedback.user_id has not been used
  
  **Note:** These indexes were created but are not being utilized by actual queries.
  Removing them reduces storage overhead and improves write performance.

  ## Performance Impact
  - RLS policy optimization will significantly improve query performance at scale
  - Reduced overhead from unused indexes improves INSERT/UPDATE/DELETE operations
  - Database query planner can make better decisions with cleaner index structure

  ## Security Impact
  - No security impact - all policies maintain the same security guarantees
  - Optimized policies still enforce user isolation correctly
  - Performance improvements reduce risk of performance-based denial of service

  ## Important Notes
  
  ### Manual Configuration Required (Cannot be Fixed via Migration):
  
  1. **Auth DB Connection Strategy**: 
     - Current: Fixed pool of 10 connections
     - Required: Change to percentage-based allocation in Supabase Dashboard
     - Location: Settings > Database > Connection Pooling
  
  2. **Leaked Password Protection**: 
     - Current: HaveIBeenPwned.org checking is disabled
     - Required: Enable password breach checking in Supabase Dashboard
     - Location: Authentication > Providers > Email
*/

-- Drop and recreate task_goals UPDATE policy with optimized auth.uid() call
DROP POLICY IF EXISTS "Users can update task goals for own tasks" ON task_goals;

CREATE POLICY "Users can update task goals for own tasks"
  ON task_goals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_goals.task_id
      AND tasks.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_goals.task_id
      AND tasks.user_id = (select auth.uid())
    )
  );

-- Drop and recreate feedback INSERT policy with optimized auth.uid() call
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;

CREATE POLICY "Users can insert own feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate feedback SELECT policy with optimized auth.uid() call
DROP POLICY IF EXISTS "Users can read own feedback" ON feedback;

CREATE POLICY "Users can read own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_task_roles_role_id;
DROP INDEX IF EXISTS idx_feedback_user_id;
