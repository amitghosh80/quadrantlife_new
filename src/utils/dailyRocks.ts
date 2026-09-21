import { supabase } from '../lib/supabase';
import { Task } from '../lib/supabase';
import { DailyPlanTask } from '../types';

export interface TodayRock extends DailyPlanTask {
  task: Task;
}

export function getLocalDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getTodayPlan(): Promise<{ id: string } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: plan, error } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', user.id)
    .eq('plan_date', getLocalDateStr())
    .maybeSingle();

  if (error) {
    console.error('Error fetching today\'s plan:', error);
    return null;
  }

  return plan;
}

export async function hasDailyRocksToday(): Promise<boolean> {
  try {
    const plan = await getTodayPlan();
    return !!plan;
  } catch (error) {
    console.error('Error checking today\'s rocks:', error);
    return false;
  }
}

export async function shouldShowRocksPrompt(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const today = getLocalDateStr();

    const { data: prefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('daily_rocks_dismissed_date')
      .eq('user_id', user.id)
      .maybeSingle();

    if (prefsError) {
      console.error('Error fetching user preferences:', prefsError);
    }

    if (prefs?.daily_rocks_dismissed_date === today) return false;

    const plan = await getTodayPlan();
    return !plan;
  } catch (error) {
    console.error('Error checking rocks prompt:', error);
    return false;
  }
}

export async function dismissRocksPrompt(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      daily_rocks_dismissed_date: getLocalDateStr(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Error dismissing rocks prompt:', error);
  }
}

export async function loadTodayRocks(): Promise<TodayRock[]> {
  try {
    const plan = await getTodayPlan();
    if (!plan) return [];

    const { data: joins, error: joinsError } = await supabase
      .from('daily_plan_tasks')
      .select('*')
      .eq('daily_plan_id', plan.id)
      .order('sort_order', { ascending: true });

    if (joinsError) {
      console.error('Error loading today\'s rocks:', joinsError);
      return [];
    }

    if (!joins || joins.length === 0) return [];

    const taskIds = joins.map(join => join.task_id);

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('id', taskIds);

    if (tasksError) {
      console.error('Error loading rock tasks:', tasksError);
      return [];
    }

    const tasksMap = new Map((tasks || []).map(task => [task.id, task]));

    return joins
      .map(join => ({ ...join, task: tasksMap.get(join.task_id) }))
      .filter((rock): rock is TodayRock => !!rock.task);
  } catch (error) {
    console.error('Error loading today\'s rocks:', error);
    return [];
  }
}

export async function saveTodayRocks(userId: string, taskIds: string[]): Promise<void> {
  const today = getLocalDateStr();

  const existing = await getTodayPlan();

  let plan = existing;

  if (!plan) {
    const { data: createdPlan, error: planError } = await supabase
      .from('daily_plans')
      .insert({ user_id: userId, plan_date: today })
      .select('id')
      .single();

    if (planError) throw planError;
    plan = createdPlan;
  }

  const { error: deleteError } = await supabase
    .from('daily_plan_tasks')
    .delete()
    .eq('daily_plan_id', plan.id);

  if (deleteError) throw deleteError;

  if (taskIds.length === 0) return;

  const { error: insertError } = await supabase
    .from('daily_plan_tasks')
    .insert(taskIds.map((taskId, index) => ({
      daily_plan_id: plan.id,
      task_id: taskId,
      sort_order: index,
    })));

  if (insertError) throw insertError;
}

export async function updateRockCompletion(rockId: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('daily_plan_tasks')
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq('id', rockId);

  if (error) {
    console.error('Error updating rock completion:', error);
  }
}

export async function removeTodayRock(rockId: string): Promise<void> {
  const { error } = await supabase
    .from('daily_plan_tasks')
    .delete()
    .eq('id', rockId);

  if (error) {
    console.error('Error removing rock:', error);
  }
}