/*
  # Add Missing Index on task_roles.role_id

  ## Changes
  
  ### Add Index
    - Add index on `task_roles.role_id` to optimize queries that filter by role
    - This complements the existing composite index on (task_id, role_id)
    - Improves performance when querying tasks by role
*/

-- Add index for task_roles.role_id foreign key
CREATE INDEX IF NOT EXISTS idx_task_roles_role_id ON task_roles(role_id);
