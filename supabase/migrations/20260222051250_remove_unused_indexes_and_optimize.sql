/*
  # Remove Unused Indexes and Optimize Query Performance

  1. Index Optimization
    - Remove unused indexes on `tasks.role_id` and `tasks.goal_id` (legacy columns not used in queries)
    - Remove single-column indexes on `task_goals.goal_id` and `task_roles.role_id`
    - Add composite indexes on junction tables to support actual query patterns
    
  2. Rationale
    - The application uses junction tables (`task_roles`, `task_goals`) for many-to-many relationships
    - Queries filter by `task_id` first, then join to get role/goal information
    - Single-column indexes on the second column are not used when filtering by `task_id`
    - Composite indexes (task_id, role_id/goal_id) will be used for these queries
    
  3. Performance Impact
    - Reduces index maintenance overhead
    - Improves write performance (fewer indexes to update)
    - Composite indexes will be used for queries like:
      - `SELECT * FROM task_roles WHERE task_id = ? AND role_id = ?`
      - `SELECT role_id FROM task_roles WHERE task_id = ?`
*/

-- Drop unused indexes on legacy columns in tasks table
DROP INDEX IF EXISTS idx_tasks_role_id;
DROP INDEX IF EXISTS idx_tasks_goal_id;

-- Drop single-column indexes on junction tables
-- These are not used because queries filter by task_id first
DROP INDEX IF EXISTS idx_task_goals_goal_id;
DROP INDEX IF EXISTS idx_task_roles_role_id;

-- Add composite indexes on junction tables to support actual query patterns
-- These will be used when filtering by task_id or both task_id and goal_id/role_id
CREATE INDEX IF NOT EXISTS idx_task_goals_task_goal ON task_goals(task_id, goal_id);
CREATE INDEX IF NOT EXISTS idx_task_roles_task_role ON task_roles(task_id, role_id);

-- Add indexes for reverse lookups (finding tasks by goal/role)
CREATE INDEX IF NOT EXISTS idx_task_goals_goal_task ON task_goals(goal_id, task_id);
CREATE INDEX IF NOT EXISTS idx_task_roles_role_task ON task_roles(role_id, task_id);
