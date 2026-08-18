import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task } from '../lib/supabase';
import { Goal, Role } from '../types';
import { X, Calendar, CheckCircle2, AlertCircle, Target, TrendingUp, Check, Clock, Trash2, Plus, ExternalLink } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Balloons } from './Balloons';

interface WeeklyPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onCreateTask?: () => void;
  initialStep?: number;
}

export function WeeklyPlanningModal({ isOpen, onClose, onComplete, onCreateTask, initialStep = 1 }: WeeklyPlanningModalProps) {
  const [step, setStep] = useState(initialStep);
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [taskRoles, setTaskRoles] = useState<Record<string, string[]>>({});
  const [taskGoals, setTaskGoals] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showBalloons, setShowBalloons] = useState(false);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      loadPlanningData();
    }
  }, [isOpen, initialStep]);

  async function loadPlanningData() {
    try {
      const [incompleteTasksRes, allTasksRes, rolesRes, goalsRes, taskRolesRes, taskGoalsRes] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('completed', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('roles')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('goals')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('task_roles')
          .select('task_id, role_id'),
        supabase
          .from('task_goals')
          .select('task_id, goal_id'),
      ]);

      setIncompleteTasks(incompleteTasksRes.data || []);
      setAllTasks(allTasksRes.data || []);
      setRoles(rolesRes.data || []);
      setGoals(goalsRes.data || []);

      if (taskRolesRes.data) {
        const taskRoleMap: Record<string, string[]> = {};
        taskRolesRes.data.forEach((tr: { task_id: string; role_id: string }) => {
          if (!taskRoleMap[tr.task_id]) {
            taskRoleMap[tr.task_id] = [];
          }
          taskRoleMap[tr.task_id].push(tr.role_id);
        });
        setTaskRoles(taskRoleMap);
      }

      if (taskGoalsRes.data) {
        const taskGoalMap: Record<string, string[]> = {};
        taskGoalsRes.data.forEach((tg: { task_id: string; goal_id: string }) => {
          if (!taskGoalMap[tg.task_id]) {
            taskGoalMap[tg.task_id] = [];
          }
          taskGoalMap[tg.task_id].push(tg.goal_id);
        });
        setTaskGoals(taskGoalMap);
      }
    } catch (error) {
      console.error('Error loading planning data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleKeep(taskId: string) {
    setProcessingTaskId(taskId);
    try {
      await supabase
        .from('tasks')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', taskId);

      setIncompleteTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error keeping task:', error);
    } finally {
      setProcessingTaskId(null);
    }
  }

  async function handleUpdateTask(taskId: string, updates: Partial<Task>) {
    try {
      await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      setIncompleteTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, ...updates } : t
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async function handleGoalAssignment(taskId: string, goalId: string | null) {
    try {
      const currentGoals = taskGoals[taskId] || [];

      await supabase
        .from('task_goals')
        .delete()
        .eq('task_id', taskId);

      if (goalId) {
        await supabase
          .from('task_goals')
          .insert({ task_id: taskId, goal_id: goalId });

        setTaskGoals(prev => ({
          ...prev,
          [taskId]: [goalId]
        }));
      } else {
        setTaskGoals(prev => ({
          ...prev,
          [taskId]: []
        }));
      }
    } catch (error) {
      console.error('Error assigning goal:', error);
    }
  }

  async function handleRoleAssignment(taskId: string, roleId: string) {
    try {
      const currentRoles = taskRoles[taskId] || [];

      if (currentRoles.includes(roleId)) {
        await supabase
          .from('task_roles')
          .delete()
          .eq('task_id', taskId)
          .eq('role_id', roleId);

        setTaskRoles(prev => ({
          ...prev,
          [taskId]: currentRoles.filter(id => id !== roleId)
        }));
      } else {
        await supabase
          .from('task_roles')
          .insert({ task_id: taskId, role_id: roleId });

        setTaskRoles(prev => ({
          ...prev,
          [taskId]: [...currentRoles, roleId]
        }));
      }
    } catch (error) {
      console.error('Error updating task roles:', error);
    }
  }

  async function handleDefer(taskId: string) {
    setProcessingTaskId(taskId);
    try {
      const task = incompleteTasks.find(t => t.id === taskId);
      if (!task) return;

      const updates: Partial<Task> = {
        is_urgent: false
      };

      if (task.due_date) {
        const nextWeek = new Date(task.due_date);
        nextWeek.setDate(nextWeek.getDate() + 7);
        updates.due_date = nextWeek.toISOString().split('T')[0];
      }

      await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      setIncompleteTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deferring task:', error);
    } finally {
      setProcessingTaskId(null);
    }
  }

  async function handleMakeUrgent(taskId: string) {
    setProcessingTaskId(taskId);
    try {
      await supabase
        .from('tasks')
        .update({ is_urgent: true })
        .eq('id', taskId);

      setIncompleteTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, is_urgent: true } : t
      ));
    } catch (error) {
      console.error('Error making task urgent:', error);
    } finally {
      setProcessingTaskId(null);
    }
  }

  async function handleDrop(taskId: string) {
    setProcessingTaskId(taskId);
    try {
      await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      setIncompleteTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error dropping task:', error);
    } finally {
      setProcessingTaskId(null);
    }
  }

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('goals')
        .insert([{ user_id: user.id, title: newGoalTitle, description: newGoalDescription, is_active: true }]);

      if (error) throw error;

      setNewGoalTitle('');
      setNewGoalDescription('');
      setIsCreatingGoal(false);
      await loadPlanningData();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  }

  async function handleComplete() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      monday.setHours(0, 0, 0, 0);

      await supabase.from('weekly_plans').insert({
        user_id: user.id,
        week_start_date: monday.toISOString().split('T')[0],
        notes,
      });

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          last_planning_date: new Date().toISOString().split('T')[0],
          planning_reminder_enabled: true,
          planning_reminder_day: 0,
          onboarding_completed: true,
        }, {
          onConflict: 'user_id',
        });

      setStep(1);
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error completing planning:', error);
    }
  }

  function getMonday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  if (!isOpen) return null;

  const q1Tasks = incompleteTasks.filter(t => t.is_urgent && t.is_important);
  const q2Tasks = incompleteTasks.filter(t => !t.is_urgent && t.is_important);
  const q3Tasks = incompleteTasks.filter(t => t.is_urgent && !t.is_important);
  const q4Tasks = incompleteTasks.filter(t => !t.is_urgent && !t.is_important);

  return (
    <>
      {showBalloons && <Balloons />}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        {loading ? (
          <div className="bg-white rounded-xl shadow-2xl p-12">
            <div className="text-center text-gray-500">Loading planning data...</div>
          </div>
        ) : (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quadrant Life</h2>
              <p className="text-sm text-gray-600">
                Intentional planning for a balanced, productive life
                <a
                  href="https://www.franklincovey.com/the-7-habits/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 ml-2 text-blue-600 hover:text-blue-700 transition-colors"
                  title="Learn about The 7 Habits"
                >
                  <span className="text-xs underline">The 7 Habits of Highly Effective People</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {(
            <>
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-600 mb-4">
                      You have {incompleteTasks.length} incomplete tasks. Review them and decide what to keep, defer, or drop.
                    </p>
                  </div>

                  {incompleteTasks.length === 0 ? (
                    allTasks.length === 0 ? (
                      <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-dashed border-blue-300 rounded-xl">
                        <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">Let's start creating some tasks</h4>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          You haven't created any tasks yet. Start by adding tasks to your matrix and organize them by urgency and importance.
                        </p>
                        {onCreateTask && (
                          <button
                            onClick={() => {
                              onClose();
                              onCreateTask();
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                          >
                            <Target className="w-5 h-5" />
                            Create Your First Task
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-dashed border-green-300 rounded-xl">
                        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">Perfect! No incomplete tasks</h4>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          You've cleared your task list. This is a great time to plan ahead and create meaningful Q2 tasks for the upcoming week.
                        </p>
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-200 rounded-lg text-sm text-gray-700">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span>Continue to focus on your roles and goals</span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Q1: Urgent & Important ({q1Tasks.length})
                      </h4>
                      {q1Tasks.length === 0 ? (
                        <p className="text-sm text-red-700">No tasks</p>
                      ) : (
                        <div className="space-y-2">
                          {q1Tasks.map(task => {
                            const taskRoleIds = taskRoles[task.id] || [];
                            const taskRoleObjects = roles.filter(r => taskRoleIds.includes(r.id));
                            const taskGoalIds = taskGoals[task.id] || [];
                            const taskGoal = taskGoalIds.length > 0 ? goals.find(g => g.id === taskGoalIds[0]) : null;
                            return (
                              <div key={task.id} className="bg-white rounded-lg p-3 border border-red-200">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="text-sm text-gray-900 font-medium flex-1">{task.title}</p>
                                  {task.due_date && (
                                    <span className="text-xs text-gray-600 flex items-center gap-1 flex-shrink-0">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>

                                {editingTaskId === task.id ? (
                                  <div className="space-y-2 mb-2">
                                    <div className="text-xs font-medium text-gray-700 mb-1">Roles:</div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                      {roles.map(role => {
                                        const currentRoles = taskRoles[task.id] || [];
                                        return (
                                          <label key={role.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={currentRoles.includes(role.id)}
                                              onChange={() => handleRoleAssignment(task.id, role.id)}
                                              className="rounded"
                                            />
                                            <span>{role.name}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                    <div className="text-xs font-medium text-gray-700 mb-1 mt-2">Goal:</div>
                                    <select
                                      value={taskGoalIds.length > 0 ? taskGoalIds[0] : ''}
                                      onChange={(e) => handleGoalAssignment(task.id, e.target.value || null)}
                                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded"
                                    >
                                      <option value="">No goal</option>
                                      {goals.map(goal => (
                                        <option key={goal.id} value={goal.id}>{goal.title}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => setEditingTaskId(null)}
                                      className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                      Done
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mb-2 min-h-5">
                                    {(taskRoleObjects.length > 0 || taskGoal) && (
                                      <div className="flex flex-wrap gap-1 text-xs mb-1">
                                        {taskRoleObjects.map(role => (
                                          <span key={role.id} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                            {role.name}
                                          </span>
                                        ))}
                                        {taskGoal && (
                                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            {taskGoal.title}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    <button
                                      onClick={() => setEditingTaskId(task.id)}
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      {taskRoleObjects.length > 0 || taskGoal ? 'Edit' : 'Assign role/goal'}
                                    </button>
                                  </div>
                                )}

                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleKeep(task.id)}
                                    disabled={processingTaskId === task.id}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition disabled:opacity-50"
                                    title="Keep for this week"
                                  >
                                    <Check className="w-3 h-3" />
                                    Keep
                                  </button>
                                  <button
                                    onClick={() => handleDefer(task.id)}
                                    disabled={processingTaskId === task.id}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition disabled:opacity-50"
                                    title="Defer to next week"
                                  >
                                    <Clock className="w-3 h-3" />
                                    Defer
                                  </button>
                                  <button
                                    onClick={() => handleDrop(task.id)}
                                    disabled={processingTaskId === task.id}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Drop
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Q2: Not Urgent but Important ({q2Tasks.length})
                      </h4>
                      {q2Tasks.length === 0 ? (
                        <p className="text-sm text-blue-700">No tasks</p>
                      ) : (
                        <div className="space-y-2">
                          {q2Tasks.map(task => {
                            const taskRoleIds = taskRoles[task.id] || [];
                            const taskRoleObjects = roles.filter(r => taskRoleIds.includes(r.id));
                            const taskGoalIds = taskGoals[task.id] || [];
                            const taskGoal = taskGoalIds.length > 0 ? goals.find(g => g.id === taskGoalIds[0]) : null;
                            return (
                              <div key={task.id} className="bg-white rounded-lg p-3 border border-blue-200">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="text-sm text-gray-900 font-medium flex-1">{task.title}</p>
                                  {task.due_date && (
                                    <span className="text-xs text-gray-600 flex items-center gap-1 flex-shrink-0">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>

                                {editingTaskId === task.id ? (
                                  <div className="space-y-2 mb-2">
                                    <div className="text-xs font-medium text-gray-700 mb-1">Roles:</div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                      {roles.map(role => {
                                        const currentRoles = taskRoles[task.id] || [];
                                        return (
                                          <label key={role.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={currentRoles.includes(role.id)}
                                              onChange={() => handleRoleAssignment(task.id, role.id)}
                                              className="rounded"
                                            />
                                            <span>{role.name}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                    <div className="text-xs font-medium text-gray-700 mb-1 mt-2">Goal:</div>
                                    <select
                                      value={taskGoalIds.length > 0 ? taskGoalIds[0] : ''}
                                      onChange={(e) => handleGoalAssignment(task.id, e.target.value || null)}
                                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded"
                                    >
                                      <option value="">No goal</option>
                                      {goals.map(goal => (
                                        <option key={goal.id} value={goal.id}>{goal.title}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => setEditingTaskId(null)}
                                      className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                      Done
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mb-2 min-h-5">
                                    {(taskRoleObjects.length > 0 || taskGoal) && (
                                      <div className="flex flex-wrap gap-1 text-xs mb-1">
                                        {taskRoleObjects.map(role => (
                                          <span key={role.id} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                            {role.name}
                                          </span>
                                        ))}
                                        {taskGoal && (
                                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            {taskGoal.title}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    <button
                                      onClick={() => setEditingTaskId(task.id)}
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      {taskRoleObjects.length > 0 || taskGoal ? 'Edit' : 'Assign role/goal'}
                                    </button>
                                  </div>
                                )}

                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleKeep(task.id)}
                                    disabled={processingTaskId === task.id}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition disabled:opacity-50"
                                    title="Keep for this week"
                                  >
                                    <Check className="w-3 h-3" />
                                    Keep
                                  </button>
                                  <button
                                    onClick={() => handleMakeUrgent(task.id)}
                                    disabled={processingTaskId === task.id}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-orange-100 text-orange-700 rounded text-xs font-medium hover:bg-orange-200 transition disabled:opacity-50"
                                    title="Mark as urgent"
                                  >
                                    <AlertCircle className="w-3 h-3" />
                                    Urgent
                                  </button>
                                  <button
                                    onClick={() => handleDrop(task.id)}
                                    disabled={processingTaskId === task.id}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Drop
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-3">Q3: Urgent but Not Important ({q3Tasks.length})</h4>
                      <p className="text-xs text-yellow-700 mb-3">Consider delegating or eliminating these</p>
                      {q3Tasks.length > 0 && (
                        <div className="space-y-2">
                          {q3Tasks.map(task => {
                            const taskRoleIds = taskRoles[task.id] || [];
                            const taskRoleObjects = roles.filter(r => taskRoleIds.includes(r.id));
                            const taskGoalIds = taskGoals[task.id] || [];
                            const taskGoal = taskGoalIds.length > 0 ? goals.find(g => g.id === taskGoalIds[0]) : null;
                            return (
                              <div key={task.id} className="bg-white rounded-lg p-3 border border-yellow-200">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="text-sm text-gray-900 font-medium flex-1">{task.title}</p>
                                  {task.due_date && (
                                    <span className="text-xs text-gray-600 flex items-center gap-1 flex-shrink-0">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>

                                {editingTaskId === task.id ? (
                                  <div className="space-y-2 mb-2">
                                    <div className="text-xs font-medium text-gray-700 mb-1">Roles:</div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                      {roles.map(role => {
                                        const currentRoles = taskRoles[task.id] || [];
                                        return (
                                          <label key={role.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={currentRoles.includes(role.id)}
                                              onChange={() => handleRoleAssignment(task.id, role.id)}
                                              className="rounded"
                                            />
                                            <span>{role.name}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                    <div className="text-xs font-medium text-gray-700 mb-1 mt-2">Goal:</div>
                                    <select
                                      value={taskGoalIds.length > 0 ? taskGoalIds[0] : ''}
                                      onChange={(e) => handleGoalAssignment(task.id, e.target.value || null)}
                                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded"
                                    >
                                      <option value="">No goal</option>
                                      {goals.map(goal => (
                                        <option key={goal.id} value={goal.id}>{goal.title}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => setEditingTaskId(null)}
                                      className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                      Done
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mb-2 min-h-5">
                                    {(taskRoleObjects.length > 0 || taskGoal) && (
                                      <div className="flex flex-wrap gap-1 text-xs mb-1">
                                        {taskRoleObjects.map(role => (
                                          <span key={role.id} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                            {role.name}
                                          </span>
                                        ))}
                                        {taskGoal && (
                                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            {taskGoal.title}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    <button
                                      onClick={() => setEditingTaskId(task.id)}
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      {taskRoleObjects.length > 0 || taskGoal ? 'Edit' : 'Assign role/goal'}
                                    </button>
                                  </div>
                                )}

                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleKeep(task.id)}
                                    disabled={processingTaskId === task.id}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition disabled:opacity-50"
                                    title="Keep for this week"
                                  >
                                    <Check className="w-3 h-3" />
                                    Keep
                                  </button>
                                  <button
                                    onClick={() => handleDefer(task.id)}
                                    disabled={processingTaskId === task.id}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition disabled:opacity-50"
                                    title="Defer to next week"
                                  >
                                    <Clock className="w-3 h-3" />
                                    Defer
                                  </button>
                                  <button
                                    onClick={() => handleDrop(task.id)}
                                    disabled={processingTaskId === task.id}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Drop
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Q4: Neither Urgent nor Important ({q4Tasks.length})</h4>
                      <p className="text-xs text-gray-700 mb-3">Consider eliminating these tasks</p>
                      {q4Tasks.length > 0 && (
                        <div className="space-y-2">
                          {q4Tasks.map(task => {
                            const taskRoleIds = taskRoles[task.id] || [];
                            const taskRoleObjects = roles.filter(r => taskRoleIds.includes(r.id));
                            const taskGoalIds = taskGoals[task.id] || [];
                            const taskGoal = taskGoalIds.length > 0 ? goals.find(g => g.id === taskGoalIds[0]) : null;
                            return (
                              <div key={task.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="text-sm text-gray-900 font-medium flex-1">{task.title}</p>
                                  {task.due_date && (
                                    <span className="text-xs text-gray-600 flex items-center gap-1 flex-shrink-0">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>

                                {editingTaskId === task.id ? (
                                  <div className="space-y-2 mb-2">
                                    <div className="text-xs font-medium text-gray-700 mb-1">Roles:</div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                      {roles.map(role => {
                                        const currentRoles = taskRoles[task.id] || [];
                                        return (
                                          <label key={role.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={currentRoles.includes(role.id)}
                                              onChange={() => handleRoleAssignment(task.id, role.id)}
                                              className="rounded"
                                            />
                                            <span>{role.name}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                    <div className="text-xs font-medium text-gray-700 mb-1 mt-2">Goal:</div>
                                    <select
                                      value={taskGoalIds.length > 0 ? taskGoalIds[0] : ''}
                                      onChange={(e) => handleGoalAssignment(task.id, e.target.value || null)}
                                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded"
                                    >
                                      <option value="">No goal</option>
                                      {goals.map(goal => (
                                        <option key={goal.id} value={goal.id}>{goal.title}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => setEditingTaskId(null)}
                                      className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                      Done
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mb-2 min-h-5">
                                    {(taskRoleObjects.length > 0 || taskGoal) && (
                                      <div className="flex flex-wrap gap-1 text-xs mb-1">
                                        {taskRoleObjects.map(role => (
                                          <span key={role.id} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                            {role.name}
                                          </span>
                                        ))}
                                        {taskGoal && (
                                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            {taskGoal.title}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    <button
                                      onClick={() => setEditingTaskId(task.id)}
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      {taskRoleObjects.length > 0 || taskGoal ? 'Edit' : 'Assign role/goal'}
                                    </button>
                                  </div>
                                )}

                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleKeep(task.id)}
                                    disabled={processingTaskId === task.id}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition disabled:opacity-50"
                                    title="Keep for this week"
                                  >
                                    <Check className="w-3 h-3" />
                                    Keep
                                  </button>
                                  <button
                                    onClick={() => handleDrop(task.id)}
                                    disabled={processingTaskId === task.id}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Drop
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                  {incompleteTasks.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-1">Planning Tip</p>
                    <p className="text-sm text-blue-800">
                      Focus on Quadrant 2 tasks this week. These important but not urgent activities drive long-term success.
                    </p>
                  </div>
                  )}

                  {incompleteTasks.length > 0 && (
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Action Guide:</p>
                    <div className="space-y-1 text-xs text-gray-700">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-green-700 min-w-14">Keep:</span>
                        <span>Keep task as-is for this week</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-orange-700 min-w-14">Urgent:</span>
                        <span>Mark as urgent and move to Q1 (Q2 only)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-blue-700 min-w-14">Defer:</span>
                        <span>Mark as not urgent (Q1/Q3 only). If due date exists, push out 7 days</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-red-700 min-w-14">Drop:</span>
                        <span>Delete the task permanently</span>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Goals</h3>
                    <p className="text-gray-600 mb-4">
                      Make sure your important tasks this week are linked to these goals.
                    </p>
                  </div>

                  {goals.length === 0 ? (
                    isCreatingGoal ? (
                      <form onSubmit={handleCreateGoal} className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Create a Goal</h4>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="goalTitle" className="block text-sm font-medium text-gray-700 mb-2">
                              Goal Title
                            </label>
                            <input
                              id="goalTitle"
                              type="text"
                              value={newGoalTitle}
                              onChange={(e) => setNewGoalTitle(e.target.value)}
                              placeholder="e.g., Launch new product, Get healthy, Learn Spanish"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="goalDescription" className="block text-sm font-medium text-gray-700 mb-2">
                              Description (optional)
                            </label>
                            <textarea
                              id="goalDescription"
                              value={newGoalDescription}
                              onChange={(e) => setNewGoalDescription(e.target.value)}
                              placeholder="What does success look like?"
                              rows={3}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreatingGoal(false);
                                setNewGoalTitle('');
                                setNewGoalDescription('');
                              }}
                              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                            >
                              Create Goal
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-br from-yellow-50 to-green-50 border-2 border-dashed border-yellow-300 rounded-lg">
                        <Target className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">Create meaningful goals</h4>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Goals help you align your tasks with what truly matters. Create 2-4 meaningful goals to guide your weekly planning.
                        </p>
                        <button
                          onClick={() => setIsCreatingGoal(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          <Plus className="w-5 h-5" />
                          Create a Goal
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      {goals.map(goal => {
                        const linkedTasks = allTasks.filter(task => {
                          const goalIds = taskGoals[task.id] || [];
                          return goalIds.includes(goal.id);
                        });
                        const incompleteTasks = linkedTasks.filter(task => !task.completed);
                        const completedCount = linkedTasks.filter(task => task.completed).length;
                        const hasOpenTasks = incompleteTasks.length > 0;
                        return (
                          <div
                            key={goal.id}
                            className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{goal.title}</h4>
                                {goal.description && (
                                  <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                                )}
                                {linkedTasks.length > 0 && (
                                  <div className="text-xs text-green-700 font-medium">
                                    {completedCount} of {linkedTasks.length} tasks completed
                                  </div>
                                )}
                              </div>
                            </div>

                            {hasOpenTasks ? (
                              <div className="ml-8 space-y-1.5">
                                {linkedTasks.map(task => (
                                  <div
                                    key={task.id}
                                    className={`flex items-center gap-2 text-sm p-2 rounded ${
                                      task.completed
                                        ? 'bg-white/50 text-gray-500'
                                        : 'bg-white text-gray-900'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2 flex-1">
                                      {task.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                      ) : (
                                        <div className="w-4 h-4 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
                                      )}
                                      <span className={task.completed ? 'line-through' : ''}>
                                        {task.title}
                                      </span>
                                      {task.due_date && !task.completed && (
                                        <span className="ml-auto text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                      )}
                                    </div>
                                    {!task.completed && (
                                      <button
                                        onClick={async () => {
                                          try {
                                            await supabase
                                              .from('tasks')
                                              .update({
                                                completed: true,
                                                completed_at: new Date().toISOString()
                                              })
                                              .eq('id', task.id);
                                            await loadPlanningData();
                                          } catch (error) {
                                            console.error('Error completing task:', error);
                                          }
                                        }}
                                        className="p-1 rounded hover:bg-green-100 text-green-600 transition flex-shrink-0"
                                        title="Complete task"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                {incompleteTasks.length > 0 && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const incompleteTaskIds = incompleteTasks.map(t => t.id);
                                        await supabase
                                          .from('tasks')
                                          .update({
                                            completed: true,
                                            completed_at: new Date().toISOString()
                                          })
                                          .in('id', incompleteTaskIds);
                                        await loadPlanningData();
                                      } catch (error) {
                                        console.error('Error completing tasks:', error);
                                      }
                                    }}
                                    className="mt-2 text-xs text-green-600 hover:text-green-700 font-medium"
                                  >
                                    Complete all {incompleteTasks.length} open task{incompleteTasks.length !== 1 ? 's' : ''}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="ml-8 space-y-2">
                                <p className="text-xs text-gray-500 italic">No tasks linked to this goal yet</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      try {
                                        await supabase
                                          .from('goals')
                                          .update({ is_active: false })
                                          .eq('id', goal.id);
                                        setShowBalloons(true);
                                        setTimeout(() => setShowBalloons(false), 4000);
                                        await loadPlanningData();
                                      } catch (error) {
                                        console.error('Error marking goal as complete:', error);
                                      }
                                    }}
                                    className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                  >
                                    Mark as complete
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Delete goal "${goal.title}"?`)) {
                                        try {
                                          await supabase
                                            .from('goals')
                                            .delete()
                                            .eq('id', goal.id);
                                          await loadPlanningData();
                                        } catch (error) {
                                          console.error('Error deleting goal:', error);
                                        }
                                      }
                                    }}
                                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                                  >
                                    Delete goal
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900 font-medium mb-1">Next Step</p>
                    <p className="text-sm text-green-800">
                      Review your life roles to ensure balanced focus across all important areas.
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Task Distribution by Role</h3>
                    <p className="text-gray-600 mb-4">
                      Review how your tasks are distributed across life roles. Ensure balanced attention to all important areas.
                    </p>
                  </div>

                  {roles.length === 0 ? (
                    <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl">
                      <Icons.Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Define Your Life Roles</h4>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Create 3-7 key roles that represent the important areas of your life. Examples include Professional, Parent, Spouse, Health, Community, or Personal Development.
                      </p>
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-200 rounded-lg text-sm text-gray-700">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span>Define roles in your profile after completing this ritual</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const roleStats = roles.map(role => {
                          const roleTasks = allTasks.filter(t => taskRoles[t.id]?.includes(role.id));
                          return {
                            role,
                            count: roleTasks.length,
                            q1Count: roleTasks.filter(t => t.is_urgent && t.is_important).length,
                            q2Count: roleTasks.filter(t => !t.is_urgent && t.is_important).length,
                            q3Count: roleTasks.filter(t => t.is_urgent && !t.is_important).length,
                            q4Count: roleTasks.filter(t => !t.is_urgent && !t.is_important).length,
                          };
                        }).filter(stat => stat.count > 0);

                        const totalTasks = roleStats.reduce((sum, stat) => sum + stat.count, 0);

                        if (totalTasks === 0) {
                          return (
                            <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                              <Icons.PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-700 font-medium mb-1">No tasks assigned to roles yet</p>
                              <p className="text-sm text-gray-600">
                                Start assigning tasks to roles to see your distribution.
                              </p>
                            </div>
                          );
                        }

                        let currentAngle = 0;
                        const radius = 100;
                        const centerX = 120;
                        const centerY = 120;

                        return (
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-center">
                              <svg width="240" height="240" viewBox="0 0 240 240" className="drop-shadow-lg">
                                {roleStats.map((stat, index) => {
                                  const percentage = (stat.count / totalTasks) * 100;
                                  const sliceAngle = (stat.count / totalTasks) * 360;

                                  const startAngle = currentAngle;
                                  const endAngle = currentAngle + sliceAngle;

                                  const startRad = (startAngle - 90) * (Math.PI / 180);
                                  const endRad = (endAngle - 90) * (Math.PI / 180);

                                  const x1 = centerX + radius * Math.cos(startRad);
                                  const y1 = centerY + radius * Math.sin(startRad);
                                  const x2 = centerX + radius * Math.cos(endRad);
                                  const y2 = centerY + radius * Math.sin(endRad);

                                  const largeArcFlag = sliceAngle > 180 ? 1 : 0;

                                  const pathData = [
                                    `M ${centerX} ${centerY}`,
                                    `L ${x1} ${y1}`,
                                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                    'Z'
                                  ].join(' ');

                                  currentAngle = endAngle;

                                  return (
                                    <path
                                      key={stat.role.id}
                                      d={pathData}
                                      fill={stat.role.color}
                                      opacity="0.85"
                                      stroke="white"
                                      strokeWidth="2"
                                    />
                                  );
                                })}
                                <circle
                                  cx={centerX}
                                  cy={centerY}
                                  r="45"
                                  fill="white"
                                  stroke="#e5e7eb"
                                  strokeWidth="2"
                                />
                                <text
                                  x={centerX}
                                  y={centerY - 10}
                                  textAnchor="middle"
                                  className="text-2xl font-bold fill-gray-800"
                                >
                                  {totalTasks}
                                </text>
                                <text
                                  x={centerX}
                                  y={centerY + 10}
                                  textAnchor="middle"
                                  className="text-xs fill-gray-600"
                                >
                                  tasks
                                </text>
                              </svg>
                            </div>

                            <div className="space-y-2">
                              {roleStats.map(stat => {
                                const IconComponent = (Icons as any)[stat.role.icon] || Icons.Circle;
                                const percentage = ((stat.count / totalTasks) * 100).toFixed(1);

                                return (
                                  <div
                                    key={stat.role.id}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <IconComponent
                                          className="w-5 h-5 flex-shrink-0"
                                          style={{ color: stat.role.color }}
                                        />
                                        <span className="font-semibold text-gray-900">{stat.role.name}</span>
                                      </div>
                                      <span className="text-sm font-bold text-gray-700">{percentage}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                      {stat.q1Count > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                                          {stat.q1Count} Q1 task{stat.q1Count !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                      {stat.q2Count > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                          {stat.q2Count} Q2 task{stat.q2Count !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                      {stat.q3Count > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                          {stat.q3Count} Q3 task{stat.q3Count !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                      {stat.q4Count > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">
                                          {stat.q4Count} Q4 task{stat.q4Count !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Weekly Notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Any thoughts, reflections, or commitments for this week..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900 font-medium mb-1">After Planning</p>
                    <p className="text-sm text-green-800">
                      Use the Task Matrix to create new Q2 tasks and assign them to roles and goals.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t p-6 bg-gray-50 flex items-center justify-between">
          <div className="flex gap-1">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full ${s === step ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                <CheckCircle2 className="w-5 h-5" />
                Finish Review
              </button>
            )}
          </div>
        </div>
      </div>
        )}
      </div>
    </>
  );
}
