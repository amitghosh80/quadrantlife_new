/*
  # Add Roles, Goals, and Weekly Planning Features

  ## Overview
  This migration implements the foundation for role-based organization, goal alignment, 
  and weekly planning rituals based on Covey's 7 Habits framework.

  ## New Tables
  
  ### 1. `roles`
  Predefined Covey life roles that users can assign to tasks
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Role name (e.g., "Manager", "Parent", "Health")
  - `description` (text) - Brief description of the role
  - `icon` (text) - Icon name from lucide-react
  - `color` (text) - Hex color for visual identification
  - `sort_order` (integer) - Display order
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. `goals`
  User-defined goals that tasks can be linked to
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Owner of the goal
  - `title` (text) - Goal title
  - `description` (text, optional) - Detailed description
  - `is_active` (boolean) - Whether goal is currently active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `task_roles`
  Junction table for many-to-many relationship between tasks and roles
  - `id` (uuid, primary key) - Unique identifier
  - `task_id` (uuid, foreign key) - Reference to task
  - `role_id` (uuid, foreign key) - Reference to role
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `task_goals`
  Junction table for many-to-many relationship between tasks and goals
  - `id` (uuid, primary key) - Unique identifier
  - `task_id` (uuid, foreign key) - Reference to task
  - `goal_id` (uuid, foreign key) - Reference to goal
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. `weekly_plans`
  Track weekly planning sessions and commitments
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - User who created the plan
  - `week_start_date` (date) - Start date of the week (Monday)
  - `completed_at` (timestamptz) - When planning was completed
  - `notes` (text, optional) - User notes from planning session
  - `created_at` (timestamptz) - Creation timestamp

  ### 6. `user_preferences`
  Store user preferences for planning reminders and settings
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - User reference
  - `last_planning_date` (date, optional) - Last completed planning date
  - `planning_reminder_enabled` (boolean) - Whether to show reminders
  - `planning_reminder_day` (integer) - Day of week for reminder (0=Sunday)
  - `dismissed_planning_until` (date, optional) - Date until reminder is snoozed
  - `onboarding_completed` (boolean) - Whether user completed onboarding
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all new tables
  - Users can only access their own goals, weekly plans, and preferences
  - Roles table is public read-only (predefined system data)
  - Task-role and task-goal junctions secured through task ownership

  ## Indexes
  - Index on user_id for goals, weekly_plans, and user_preferences
  - Index on task_id for task_roles and task_goals
  - Composite unique index to prevent duplicate role/goal assignments
*/

-- Create roles table (predefined system data)
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  sort_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task_roles junction table
CREATE TABLE IF NOT EXISTS task_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, role_id)
);

-- Create task_goals junction table
CREATE TABLE IF NOT EXISTS task_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, goal_id)
);

-- Create weekly_plans table
CREATE TABLE IF NOT EXISTS weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  completed_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  last_planning_date date,
  planning_reminder_enabled boolean DEFAULT true,
  planning_reminder_day integer DEFAULT 0,
  dismissed_planning_until date,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert predefined Covey roles
INSERT INTO roles (name, description, icon, color, sort_order) VALUES
  ('Manager', 'Leadership and management responsibilities', 'Briefcase', '#3B82F6', 1),
  ('Individual Contributor', 'Personal professional work and projects', 'Code', '#8B5CF6', 2),
  ('Parent', 'Parenting and family responsibilities', 'Baby', '#EC4899', 3),
  ('Spouse/Partner', 'Relationship with significant other', 'Heart', '#EF4444', 4),
  ('Friend', 'Friendships and social connections', 'Users', '#F59E0B', 5),
  ('Community Member', 'Community involvement and service', 'Home', '#10B981', 6),
  ('Health', 'Physical and mental well-being', 'Heart', '#14B8A6', 7),
  ('Personal Growth', 'Learning, hobbies, and self-improvement', 'BookOpen', '#6366F1', 8)
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_is_active ON goals(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_task_roles_task_id ON task_roles(task_id);
CREATE INDEX IF NOT EXISTS idx_task_roles_role_id ON task_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_task_goals_task_id ON task_goals(task_id);
CREATE INDEX IF NOT EXISTS idx_task_goals_goal_id ON task_goals(goal_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_user_id ON weekly_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_week_start_date ON weekly_plans(week_start_date);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles (public read-only)
CREATE POLICY "Anyone can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for goals
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for task_roles (secured through task ownership)
CREATE POLICY "Users can view task roles for own tasks"
  ON task_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_roles.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert task roles for own tasks"
  ON task_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_roles.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete task roles for own tasks"
  ON task_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_roles.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- RLS Policies for task_goals (secured through task and goal ownership)
CREATE POLICY "Users can view task goals for own tasks"
  ON task_goals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_goals.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert task goals for own tasks and goals"
  ON task_goals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_goals.task_id
      AND tasks.user_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = task_goals.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete task goals for own tasks"
  ON task_goals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_goals.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- RLS Policies for weekly_plans
CREATE POLICY "Users can view own weekly plans"
  ON weekly_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly plans"
  ON weekly_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly plans"
  ON weekly_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly plans"
  ON weekly_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
