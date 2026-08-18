import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Goal } from '../types';
import { Task } from '../lib/supabase';
import { Plus, CreditCard as Edit2, Trash2, Target, CheckCircle2, Circle, Trophy, Sparkles, ChevronDown, ChevronRight, Link2, ExternalLink } from 'lucide-react';
import { Balloons } from './Balloons';

interface GoalWithTaskCount extends Goal {
  openTaskCount: number;
  completedTasks?: Task[];
  openTasks?: Task[];
  linkedTaskIds?: string[];
}

export function GoalManager() {
  const [goals, setGoals] = useState<GoalWithTaskCount[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [showBalloons, setShowBalloons] = useState(false);
  const [showTaskLinker, setShowTaskLinker] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      const { data: taskGoalsData } = await supabase
        .from('task_goals')
        .select('goal_id, task_id');

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*');

      const goalsWithCounts = (goalsData || []).map(goal => {
        const goalTaskIds = (taskGoalsData || [])
          .filter(tg => tg.goal_id === goal.id)
          .map(tg => tg.task_id);

        const goalTasks = (tasksData || []).filter(t => goalTaskIds.includes(t.id));
        const openTasks = goalTasks.filter(t => !t.completed);
        const openCount = openTasks.length;
        const completedTasks = !goal.is_active
          ? goalTasks
              .filter(t => t.completed)
              .sort((a, b) => {
                if (!a.completed_at) return 1;
                if (!b.completed_at) return -1;
                return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
              })
          : [];

        return {
          ...goal,
          openTaskCount: openCount,
          openTasks,
          completedTasks,
          linkedTaskIds: goalTaskIds,
        };
      });

      setGoals(goalsWithCounts);
    } catch (error) {
      console.error('Error loading goals:', error);
      alert('Failed to load goals. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update({ title, description })
          .eq('id', editingGoal.id);

        if (error) throw error;

        await syncTaskLinksForGoal(editingGoal.id);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: newGoal, error } = await supabase
          .from('goals')
          .insert([{ user_id: user.id, title, description, is_active: true }])
          .select()
          .single();

        if (error) throw error;

        if (newGoal && selectedTaskIds.length > 0) {
          await linkTasksToGoal(newGoal.id);
        }
      }

      setTitle('');
      setDescription('');
      setIsAdding(false);
      setEditingGoal(null);
      setShowTaskLinker(false);
      setSelectedTaskIds([]);
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  }

  async function syncTaskLinksForGoal(goalId: string) {
    try {
      const { data: existingLinks } = await supabase
        .from('task_goals')
        .select('task_id')
        .eq('goal_id', goalId);

      const existingTaskIds = (existingLinks || []).map(link => link.task_id);

      const toAdd = selectedTaskIds.filter(id => !existingTaskIds.includes(id));
      const toRemove = existingTaskIds.filter(id => !selectedTaskIds.includes(id));

      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('task_goals')
          .delete()
          .eq('goal_id', goalId)
          .in('task_id', toRemove);

        if (deleteError) throw deleteError;
      }

      if (toAdd.length > 0) {
        const taskGoalLinks = toAdd.map(taskId => ({
          task_id: taskId,
          goal_id: goalId
        }));

        const { error: insertError } = await supabase
          .from('task_goals')
          .insert(taskGoalLinks);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error syncing task links:', error);
    }
  }

  async function linkTasksToGoal(goalId: string) {
    try {
      const taskGoalLinks = selectedTaskIds.map(taskId => ({
        task_id: taskId,
        goal_id: goalId
      }));

      const { error } = await supabase
        .from('task_goals')
        .insert(taskGoalLinks);

      if (error) throw error;
    } catch (error) {
      console.error('Error linking tasks to goal:', error);
    }
  }

  async function loadAvailableTasks(currentGoalId?: string) {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('completed', false)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      const { data: taskGoalsData } = await supabase
        .from('task_goals')
        .select('task_id, goal_id');

      const linkedTaskIds = currentGoalId
        ? (taskGoalsData || [])
            .filter(tg => tg.goal_id === currentGoalId)
            .map(tg => tg.task_id)
        : [];

      setAvailableTasks(tasksData || []);
      setSelectedTaskIds(linkedTaskIds);
    } catch (error) {
      console.error('Error loading available tasks:', error);
    }
  }

  function toggleTaskSelection(taskId: string) {
    setSelectedTaskIds(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }

  async function toggleActive(goal: Goal) {
    try {
      const wasActive = goal.is_active;
      const { error } = await supabase
        .from('goals')
        .update({ is_active: !goal.is_active })
        .eq('id', goal.id);

      if (error) throw error;

      if (wasActive) {
        setShowBalloons(true);
        setTimeout(() => setShowBalloons(false), 4000);
      }

      loadGoals();
    } catch (error) {
      console.error('Error toggling goal:', error);
    }
  }

  async function deleteGoal(id: string) {
    if (!confirm('Are you sure you want to delete this goal? This will remove it from all linked tasks.')) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  }

  function startEdit(goal: Goal) {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setIsAdding(true);
    loadAvailableTasks(goal.id);
  }

  function cancelEdit() {
    setIsAdding(false);
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setShowTaskLinker(false);
    setSelectedTaskIds([]);
  }

  function startAddingGoal() {
    setIsAdding(true);
    loadAvailableTasks();
  }

  function toggleExpandGoal(goalId: string) {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  }

  async function completeTask(taskId: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
      loadGoals();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  }

  async function deleteTask(taskId: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      loadGoals();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const activeGoals = goals.filter(g => g.is_active);
  const inactiveGoals = goals.filter(g => !g.is_active);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading goals...</div>;
  }

  return (
    <div className="space-y-6">
      {showBalloons && <Balloons />}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
        </div>
        {!isAdding && (
          <button
            onClick={startAddingGoal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Advance my product strategy skills"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this goal..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {availableTasks.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Link Open Tasks (optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTaskLinker(!showTaskLinker)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Link2 className="w-4 h-4" />
                    {showTaskLinker ? 'Hide tasks' : `Show tasks (${availableTasks.length})`}
                  </button>
                </div>

                {showTaskLinker && (
                  <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-3">
                    {availableTasks.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No open tasks available. Create some tasks first!
                      </p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-300">
                          <span className="text-xs font-medium text-gray-600">
                            {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''} selected
                          </span>
                          {selectedTaskIds.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedTaskIds([])}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                        {availableTasks.map((task) => {
                          const isSelected = selectedTaskIds.includes(task.id);

                          const getQuadrant = (urgent: boolean, important: boolean) => {
                            if (urgent && important) return { num: 1, label: 'Q1', color: 'bg-red-50 border-red-200' };
                            if (!urgent && important) return { num: 2, label: 'Q2', color: 'bg-blue-50 border-blue-200' };
                            if (urgent && !important) return { num: 3, label: 'Q3', color: 'bg-amber-50 border-amber-200' };
                            return { num: 4, label: 'Q4', color: 'bg-gray-50 border-gray-200' };
                          };

                          const quadrant = getQuadrant(task.is_urgent, task.is_important);

                          return (
                            <label
                              key={task.id}
                              className={`flex items-start gap-3 p-2 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-100 border-blue-400 shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleTaskSelection(task.id)}
                                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${quadrant.color}`}>
                                    {quadrant.label}
                                  </span>
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {task.title}
                                  </p>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {activeGoals.length === 0 && !isAdding && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No goals yet</p>
          <p className="text-sm text-gray-500">Create 2-4 meaningful goals to align your tasks</p>
        </div>
      )}

      {activeGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Goals</h3>
          <div className="space-y-3">
            {activeGoals.map((goal) => {
              const isExpanded = expandedGoals.has(goal.id);
              const hasOpenTasks = goal.openTasks && goal.openTasks.length > 0;

              return (
                <div
                  key={goal.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {hasOpenTasks && (
                          <button
                            onClick={() => toggleExpandGoal(goal.id)}
                            className="p-0.5 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <h4 className="font-semibold text-gray-900 truncate">{goal.title}</h4>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-600 ml-7">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {goal.openTaskCount === 0 && (
                        <button
                          onClick={() => toggleActive(goal)}
                          className="px-3 py-1.5 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors font-medium"
                          title="No open tasks - mark as complete"
                        >
                          Mark Complete
                        </button>
                      )}
                      {goal.openTaskCount > 0 && (
                        <span className="text-xs text-gray-500 px-2">
                          {goal.openTaskCount} open {goal.openTaskCount === 1 ? 'task' : 'tasks'}
                        </span>
                      )}
                      <button
                        onClick={() => startEdit(goal)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit goal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && hasOpenTasks && (
                    <div className="mt-3 ml-7 space-y-2 pl-4 border-l-2 border-blue-200">
                      {goal.openTasks!.map((task) => {
                        const getQuadrant = (urgent: boolean, important: boolean) => {
                          if (urgent && important) return { num: 1, label: 'Q1', color: 'bg-red-50 border-red-200 text-red-700' };
                          if (!urgent && important) return { num: 2, label: 'Q2', color: 'bg-blue-50 border-blue-200 text-blue-700' };
                          if (urgent && !important) return { num: 3, label: 'Q3', color: 'bg-amber-50 border-amber-200 text-amber-700' };
                          return { num: 4, label: 'Q4', color: 'bg-gray-50 border-gray-200 text-gray-700' };
                        };

                        const quadrant = getQuadrant(task.is_urgent, task.is_important);

                        return (
                          <div key={task.id} className="flex items-start gap-2 text-sm group">
                            <Circle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${quadrant.color}`}>
                                  {quadrant.label}
                                </span>
                                <span className="text-gray-900 font-medium">{task.title}</span>
                              </div>
                              {task.description && (
                                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => completeTask(task.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Mark as complete"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {inactiveGoals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">Completed Goals</h3>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-3">
            {inactiveGoals.map((goal) => {
              const isExpanded = expandedGoals.has(goal.id);
              const hasCompletedTasks = goal.completedTasks && goal.completedTasks.length > 0;

              return (
                <div
                  key={goal.id}
                  className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border-2 border-amber-200 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -mr-16 -mt-16 opacity-30"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-100 rounded-full -ml-12 -mb-12 opacity-30"></div>
                  <div className="flex items-start justify-between gap-4 relative">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="relative">
                          <Trophy className="w-6 h-6 text-amber-600 flex-shrink-0" />
                          <Sparkles className="w-3 h-3 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">{goal.title}</h4>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-700 ml-9 mb-2">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-2 ml-9">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Goal Achieved!</span>
                        {hasCompletedTasks && (
                          <span className="text-xs text-gray-600 ml-2">
                            ({goal.completedTasks.length} {goal.completedTasks.length === 1 ? 'task' : 'tasks'} completed)
                          </span>
                        )}
                      </div>

                      {hasCompletedTasks && (
                        <button
                          onClick={() => toggleExpandGoal(goal.id)}
                          className="flex items-center gap-1 mt-2 ml-9 text-sm text-amber-700 hover:text-amber-800 font-medium transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Hide completed tasks
                            </>
                          ) : (
                            <>
                              <ChevronRight className="w-4 h-4" />
                              Show completed tasks
                            </>
                          )}
                        </button>
                      )}

                      {isExpanded && hasCompletedTasks && (
                        <div className="mt-3 ml-9 space-y-1.5">
                          {goal.completedTasks.map((task) => (
                            <div
                              key={task.id}
                              className="bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-amber-200 flex items-start gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{task.title}</p>
                                {task.completed_at && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Completed {new Date(task.completed_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(goal)}
                        className="px-3 py-1.5 text-sm bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-300 font-medium"
                        title="Reactivate goal"
                      >
                        Reactivate
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">Tip: Focus on 2-4 meaningful goals</p>
        <p className="text-blue-700">
          Link your Quadrant 1 and 2 tasks to these goals to ensure your daily actions align with what matters most.{' '}
          <a
            href="https://www.franklincovey.com/habit-2/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-800 hover:text-blue-900 transition-colors underline font-medium"
          >
            <span>Begin with the end in mind</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </div>
  );
}
