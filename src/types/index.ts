export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  quadrant: 1 | 2 | 3 | 4;
  completed: boolean;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskRole {
  id: string;
  task_id: string;
  role_id: string;
  created_at: string;
}

export interface WeeklyPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  completed_at: string;
  notes?: string;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  last_planning_date?: string;
  planning_reminder_enabled: boolean;
  planning_reminder_day: number;
  dismissed_planning_until?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskWithRelations extends Task {
  roles?: Role[];
  goals?: Goal[];
}
