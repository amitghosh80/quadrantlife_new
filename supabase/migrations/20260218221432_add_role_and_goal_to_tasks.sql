/*
  # Add role and goal associations to tasks

  1. Changes
    - Add `role_id` column to `tasks` table (nullable foreign key to roles)
    - Add `goal_id` column to `tasks` table (nullable foreign key to goals)
    - Add indexes for better query performance
  
  2. Notes
    - Both columns are nullable as tasks may not be assigned to a role or goal initially
    - Foreign key constraints ensure referential integrity
    - ON DELETE SET NULL ensures tasks remain if a role or goal is deleted
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN role_id uuid REFERENCES roles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'goal_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN goal_id uuid REFERENCES goals(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_role_id ON tasks(role_id);
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
