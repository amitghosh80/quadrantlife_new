/*
  # Fix Security Issues

  ## Changes
  
  ### 1. Add Missing Foreign Key Indexes
    - Add index on `feedback.user_id` to improve query performance
    - The `task_roles.role_id` index already exists from migration 20260222015136
  
  ### 2. Security Notes
    - Auth DB connection strategy and leaked password protection are server-level settings
    - These must be configured in Supabase Dashboard under Project Settings
    - Cannot be set via SQL migrations
*/

-- Add index for feedback.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
