/*
  # Cleanup Unused Task Columns

  1. Changes
    - Drop unused `role_id` and `goal_id` columns from `tasks` table
    - These columns were added but never used (app uses junction tables instead)
    - Remove data inconsistency and potential confusion

  2. Notes
    - The app correctly uses `task_roles` and `task_goals` junction tables for many-to-many relationships
    - These direct foreign key columns are redundant and create schema confusion
*/

-- Drop the unused columns
ALTER TABLE tasks DROP COLUMN IF EXISTS role_id;
ALTER TABLE tasks DROP COLUMN IF EXISTS goal_id;
