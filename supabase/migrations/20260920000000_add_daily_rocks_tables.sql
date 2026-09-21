/*
  # Add Daily Big Rocks Tables

  ## Overview
  Implements the "Big Rocks" daily ritual from Covey's First Things First:
  each morning the user picks 1-3 important-but-not-urgent (Q2) tasks to
  commit to before the urgent noise fills the day.

  ## New Tables

  ### 1. `daily_plans`
  A user's plan for a specific day
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Owner of the plan
  - `plan_date` (date) - The day this plan is for
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. `daily_plan_tasks`
  Junction table linking tasks to a daily plan (the chosen "rocks")
  - `id` (uuid, primary key) - Unique identifier
  - `daily_plan_id` (uuid, foreign key) - Reference to daily_plans
  - `task_id` (uuid, foreign key) - Reference to tasks
  - `sort_order` (integer) - Rock slot order (1-3)
  - `completed_at` (timestamptz, optional) - When the rock was completed
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `user_preferences` column
  - `daily_rocks_dismissed_date` (date, optional) - Day the rocks prompt was dismissed

  ## Security
  - Enable RLS on new tables
  - Users can only access their own daily plans
  - daily_plan_tasks secured through daily plan ownership

  ## Indexes
  - Index on user_id / plan_date for daily_plans
  - Index on daily_plan_id / task_id for daily_plan_tasks
*/

CREATE TABLE IF NOT EXISTS daily_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, plan_date)
);

CREATE TABLE IF NOT EXISTS daily_plan_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_plan_id uuid NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(daily_plan_id, task_id)
);

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS daily_rocks_dismissed_date date;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_id ON daily_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_plans_plan_date ON daily_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_plan_tasks_daily_plan_id ON daily_plan_tasks(daily_plan_id);
CREATE INDEX IF NOT EXISTS idx_daily_plan_tasks_task_id ON daily_plan_tasks(task_id);

-- Enable RLS
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plan_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_plans
CREATE POLICY "Users can view own daily plans"
  ON daily_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily plans"
  ON daily_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily plans"
  ON daily_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily plans"
  ON daily_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for daily_plan_tasks (secured through daily plan ownership)
CREATE POLICY "Users can view own daily plan tasks"
  ON daily_plan_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_plans
      WHERE daily_plans.id = daily_plan_tasks.daily_plan_id
      AND daily_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own daily plan tasks"
  ON daily_plan_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_plans
      WHERE daily_plans.id = daily_plan_tasks.daily_plan_id
      AND daily_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own daily plan tasks"
  ON daily_plan_tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_plans
      WHERE daily_plans.id = daily_plan_tasks.daily_plan_id
      AND daily_plans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_plans
      WHERE daily_plans.id = daily_plan_tasks.daily_plan_id
      AND daily_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own daily plan tasks"
  ON daily_plan_tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_plans
      WHERE daily_plans.id = daily_plan_tasks.daily_plan_id
      AND daily_plans.user_id = auth.uid()
    )
  );