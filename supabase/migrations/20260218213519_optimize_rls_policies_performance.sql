/*
  # Optimize RLS Policies for Performance

  ## Overview
  This migration optimizes all RLS policies by wrapping auth.uid() in a SELECT
  statement to prevent re-evaluation for each row, significantly improving query
  performance at scale.

  ## Changes
  1. Drop all existing RLS policies
  2. Recreate them with optimized (select auth.uid()) pattern
  3. Fix function search_path to be immutable

  ## Security
  All policies maintain the same security rules, only the performance is improved.
*/

-- Drop existing policies for goals
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;

-- Drop existing policies for task_roles
DROP POLICY IF EXISTS "Users can view task roles for own tasks" ON task_roles;
DROP POLICY IF EXISTS "Users can insert task roles for own tasks" ON task_roles;
DROP POLICY IF EXISTS "Users can delete task roles for own tasks" ON task_roles;

-- Drop existing policies for task_goals
DROP POLICY IF EXISTS "Users can view task goals for own tasks" ON task_goals;
DROP POLICY IF EXISTS "Users can insert task goals for own tasks and goals" ON task_goals;
DROP POLICY IF EXISTS "Users can delete task goals for own tasks" ON task_goals;

-- Drop existing policies for weekly_plans
DROP POLICY IF EXISTS "Users can view own weekly plans" ON weekly_plans;
DROP POLICY IF EXISTS "Users can insert own weekly plans" ON weekly_plans;
DROP POLICY IF EXISTS "Users can update own weekly plans" ON weekly_plans;
DROP POLICY IF EXISTS "Users can delete own weekly plans" ON weekly_plans;

-- Drop existing policies for user_preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

-- Recreate optimized policies for goals
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Recreate optimized policies for task_roles
CREATE POLICY "Users can view task roles for own tasks"
  ON task_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_roles.task_id
      AND tasks.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert task roles for own tasks"
  ON task_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_roles.task_id
      AND tasks.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete task roles for own tasks"
  ON task_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_roles.task_id
      AND tasks.user_id = (select auth.uid())
    )
  );

-- Recreate optimized policies for task_goals
CREATE POLICY "Users can view task goals for own tasks"
  ON task_goals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_goals.task_id
      AND tasks.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert task goals for own tasks and goals"
  ON task_goals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_goals.task_id
      AND tasks.user_id = (select auth.uid())
    )
    AND
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = task_goals.goal_id
      AND goals.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete task goals for own tasks"
  ON task_goals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_goals.task_id
      AND tasks.user_id = (select auth.uid())
    )
  );

-- Recreate optimized policies for weekly_plans
CREATE POLICY "Users can view own weekly plans"
  ON weekly_plans FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own weekly plans"
  ON weekly_plans FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own weekly plans"
  ON weekly_plans FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own weekly plans"
  ON weekly_plans FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Recreate optimized policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Fix function search path to be immutable
-- Drop triggers first
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- Drop and recreate function with proper search_path
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
