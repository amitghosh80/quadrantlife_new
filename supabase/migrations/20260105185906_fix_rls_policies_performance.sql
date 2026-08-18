/*
  # Fix RLS Policies Performance and Remove Unused Index

  1. Performance Optimization
    - Drop existing RLS policies on `tasks` table
    - Recreate policies using `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth.uid() for each row, improving query performance at scale

  2. Index Cleanup
    - Remove unused `tasks_created_at_idx` index to reduce storage overhead

  3. Security
    - All RLS policies maintain the same security constraints
    - Users can only access their own tasks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- Recreate policies with optimized auth.uid() calls
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Remove unused index
DROP INDEX IF EXISTS tasks_created_at_idx;