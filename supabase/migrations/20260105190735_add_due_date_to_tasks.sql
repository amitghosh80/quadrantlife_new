/*
  # Add due_date column to tasks table

  1. Changes
    - Add `due_date` column to `tasks` table
      - Type: date (stores only the date without time)
      - Optional: nullable field since existing tasks won't have due dates
      - Default: null
    
  2. Notes
    - Using date type instead of timestamptz since we only need the date
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN due_date date;
  END IF;
END $$;