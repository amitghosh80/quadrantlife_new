/*
  # Add Indexes for Foreign Keys

  1. New Indexes
    - Add index on `task_goals.goal_id` to support foreign key lookups
    - Add index on `task_roles.role_id` to support foreign key lookups
    - Add index on `tasks.role_id` to support foreign key lookups (legacy column)
    - Add index on `tasks.goal_id` to support foreign key lookups (legacy column)

  2. Performance Impact
    - These indexes will improve query performance when joining tables
    - They will speed up cascading deletes and updates on foreign key relationships
    - Essential for optimal performance when querying tasks by role or goal
*/

-- Add index for task_goals.goal_id foreign key
CREATE INDEX IF NOT EXISTS idx_task_goals_goal_id ON task_goals(goal_id);

-- Add index for task_roles.role_id foreign key
CREATE INDEX IF NOT EXISTS idx_task_roles_role_id ON task_roles(role_id);

-- Add index for tasks.role_id foreign key (legacy column, still has FK constraint)
CREATE INDEX IF NOT EXISTS idx_tasks_role_id ON tasks(role_id);

-- Add index for tasks.goal_id foreign key (legacy column, still has FK constraint)
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
