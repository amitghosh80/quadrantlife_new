/*
  # Add completed_at timestamp to tasks table

  1. Changes
    - Add `completed_at` column to track when a task was completed
    - This enables automatic filtering of completed tasks after 3 days
  
  2. Notes
    - Column is nullable (NULL for incomplete tasks)
    - When a task is marked complete, this timestamp is set
    - Tasks completed more than 3 days ago will be filtered from the UI
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE tasks ADD COLUMN completed_at timestamptz;
  END IF;
END $$;