/*
  # Add UPDATE Policy for task_goals

  1. Changes
    - Add missing UPDATE policy for task_goals table
    - Ensures consistent RLS coverage across all operations

  2. Security
    - Users can only update task_goals for their own tasks
    - Maintains data isolation between users
*/

CREATE POLICY "Users can update task goals for own tasks"
  ON task_goals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_goals.task_id
      AND tasks.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_goals.task_id
      AND tasks.user_id = auth.uid()
    )
  );
