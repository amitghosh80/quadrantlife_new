/*
  # Fix Security and Performance Issues

  1. Remove Unused Indexes
    - Drop `idx_task_goals_goal_id` (foreign key already provides index via unique constraint)
    - Drop `idx_weekly_plans_user_id` (unique constraint on user_id + week_start_date provides coverage)
    - Drop `idx_weekly_plans_week_start_date` (unique constraint provides coverage)
    - Drop `idx_task_roles_role_id` (foreign key already provides index via unique constraint)
    - Drop `idx_tasks_role_id` (deprecated column, using task_roles table instead)
    - Drop `idx_tasks_goal_id` (deprecated column, using task_goals table instead)

  2. Notes
    - The tasks table has legacy role_id and goal_id columns that are nullable and deprecated
    - The many-to-many relationship tables (task_roles, task_goals) have proper unique constraints that serve as indexes
    - Auth configuration and password protection settings need to be adjusted in Supabase dashboard (cannot be done via SQL)
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_task_goals_goal_id;
DROP INDEX IF EXISTS idx_weekly_plans_user_id;
DROP INDEX IF EXISTS idx_weekly_plans_week_start_date;
DROP INDEX IF EXISTS idx_task_roles_role_id;
DROP INDEX IF EXISTS idx_tasks_role_id;
DROP INDEX IF EXISTS idx_tasks_goal_id;
