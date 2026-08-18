/*
  # Create Feedback Table

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key) - Unique identifier for feedback
      - `user_id` (uuid) - References auth.users, the user submitting feedback
      - `feedback_type` (text) - Type of feedback: bug, feature, improvement, other
      - `message` (text) - The actual feedback message
      - `user_email` (text) - Email of the user (for follow-up)
      - `created_at` (timestamptz) - When the feedback was submitted

  2. Security
    - Enable RLS on `feedback` table
    - Add policy for authenticated users to insert their own feedback
    - Add policy for authenticated users to read their own feedback
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feedback_type text NOT NULL CHECK (feedback_type IN ('bug', 'feature', 'improvement', 'other')),
  message text NOT NULL,
  user_email text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own feedback
CREATE POLICY "Users can read own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- Create index for faster queries by created_at
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);