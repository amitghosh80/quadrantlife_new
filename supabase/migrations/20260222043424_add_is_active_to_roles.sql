/*
  # Add is_active column to roles table

  1. Changes
    - Add `is_active` column to `roles` table with default value `true`
    - This allows users to archive roles without deleting them
    - Maintains consistency with the `goals` table structure

  2. Notes
    - All existing roles will be set to active by default
    - This is a non-breaking change
*/

-- Add is_active column to roles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE roles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;