import { supabase } from '../lib/supabase';
import { Task } from '../lib/supabase';
import { Role, Goal, TaskRole } from '../types';

export interface TaskWithRelations extends Task {
  roles: Role[];
  goals: Goal[];
}

export async function loadTasksWithRelations(): Promise<TaskWithRelations[]> {
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (tasksError) throw tasksError;
  if (!tasks) return [];

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const filteredTasks = tasks.filter(task => {
    if (!task.completed || !task.completed_at) return true;
    const completedDate = new Date(task.completed_at);
    return completedDate >= threeDaysAgo;
  });

  const taskIds = filteredTasks.map(t => t.id);

  const [taskRolesRes, taskGoalsRes, rolesRes, goalsRes] = await Promise.all([
    supabase.from('task_roles').select('*').in('task_id', taskIds),
    supabase.from('task_goals').select('*').in('task_id', taskIds),
    supabase.from('roles').select('*'),
    supabase.from('goals').select('*').eq('is_active', true),
  ]);

  const taskRoles = taskRolesRes.data || [];
  const taskGoals = taskGoalsRes.data || [];
  const roles = rolesRes.data || [];
  const goals = goalsRes.data || [];

  const rolesMap = new Map(roles.map(r => [r.id, r]));
  const goalsMap = new Map(goals.map(g => [g.id, g]));

  const tasksWithRelations = filteredTasks.map((task) => {
    const taskRoleIds = taskRoles.filter(tr => tr.task_id === task.id).map(tr => tr.role_id);
    const taskGoalIds = taskGoals.filter(tg => tg.task_id === task.id).map(tg => tg.goal_id);

    return {
      ...task,
      roles: taskRoleIds.map(id => rolesMap.get(id)).filter(Boolean) as Role[],
      goals: taskGoalIds.map(id => goalsMap.get(id)).filter(Boolean) as Goal[],
    };
  });

  return tasksWithRelations;
}

export function getMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function checkPlanningStatus(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!prefs) return false;
  if (prefs.dismissed_planning_until) {
    const dismissedUntil = new Date(prefs.dismissed_planning_until);
    if (dismissedUntil > new Date()) return true;
  }

  const monday = getMonday();
  const mondayStr = monday.toISOString().split('T')[0];

  const { data: plan } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', mondayStr)
    .maybeSingle();

  return !!plan;
}
