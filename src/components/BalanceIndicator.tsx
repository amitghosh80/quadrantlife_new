import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Role, Goal } from '../types';
import { TrendingUp, AlertTriangle, Target, ExternalLink } from 'lucide-react';
import * as Icons from 'lucide-react';

interface TaskRoleCount {
  roleId: string;
  count: number;
  q2Count: number;
}

interface TaskGoalCount {
  goalId: string;
  count: number;
  q2Count: number;
}

type ViewMode = 'roles' | 'goals';

export function BalanceIndicator() {
  const [viewMode, setViewMode] = useState<ViewMode>('goals');
  const [roles, setRoles] = useState<Role[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [roleCounts, setRoleCounts] = useState<TaskRoleCount[]>([]);
  const [goalCounts, setGoalCounts] = useState<TaskGoalCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalanceData();
  }, []);

  async function loadBalanceData() {
    try {
      const [rolesRes, goalsRes, tasksRes, taskRolesRes, taskGoalsRes] = await Promise.all([
        supabase.from('roles').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
        supabase.from('goals').select('*').eq('is_active', true).order('created_at', { ascending: true }),
        supabase.from('tasks').select('id, is_urgent, is_important, completed'),
        supabase.from('task_roles').select('*'),
        supabase.from('task_goals').select('*'),
      ]);

      if (!rolesRes.data || !goalsRes.data || !tasksRes.data || !taskRolesRes.data || !taskGoalsRes.data) return;

      const roles = rolesRes.data;
      const goals = goalsRes.data;
      const activeTasks = tasksRes.data.filter(t => !t.completed);
      const taskRoles = taskRolesRes.data;
      const taskGoals = taskGoalsRes.data;

      const roleCounts: TaskRoleCount[] = roles.map(role => {
        const roleTaskIds = taskRoles
          .filter(tr => tr.role_id === role.id)
          .map(tr => tr.task_id);

        const roleTasks = activeTasks.filter(t => roleTaskIds.includes(t.id));
        const q2Tasks = roleTasks.filter(t => !t.is_urgent && t.is_important);

        return {
          roleId: role.id,
          count: roleTasks.length,
          q2Count: q2Tasks.length,
        };
      });

      const goalCountsData: TaskGoalCount[] = goals.map(goal => {
        const goalTaskIds = taskGoals
          .filter(tg => tg.goal_id === goal.id)
          .map(tg => tg.task_id);

        const goalTasks = activeTasks.filter(t => goalTaskIds.includes(t.id));
        const q2Tasks = goalTasks.filter(t => !t.is_urgent && t.is_important);

        return {
          goalId: goal.id,
          count: goalTasks.length,
          q2Count: q2Tasks.length,
        };
      });

      setRoles(roles);
      setGoals(goals);
      setRoleCounts(roleCounts);
      setGoalCounts(goalCountsData);
    } catch (error) {
      console.error('Error loading balance data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null;
  }

  const neglectedRoles = roleCounts.filter(rc => rc.q2Count === 0 && rc.count === 0);
  const neglectedGoals = goalCounts.filter(gc => gc.q2Count === 0 && gc.count === 0);
  const totalActiveTasks = roleCounts.reduce((sum, rc) => sum + rc.count, 0);

  if (totalActiveTasks === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Balance View</h3>
          <a
            href="https://www.franklincovey.com/the-7-habits/habit-7/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
            title="Learn about Sharpening the Saw"
          >
            <span className="text-xs underline">Sharpen the saw</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('goals')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'goals'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setViewMode('roles')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'roles'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Roles
          </button>
        </div>
      </div>

      {viewMode === 'goals' ? (
        <>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No goals available</p>
              <p className="text-xs mt-1">Use the Weekly Planning button to create goals</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {goals.map(goal => {
                  const goalCount = goalCounts.find(gc => gc.goalId === goal.id);
                  if (!goalCount) return null;

                  const percentage = totalActiveTasks > 0 ? (goalCount.count / totalActiveTasks) * 100 : 0;
                  const isNeglected = goalCount.q2Count === 0 && goalCount.count === 0;

                  const q1Tasks = goalCount.count - goalCount.q2Count;

                  return (
                    <div key={goal.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-600" />
                          <span className="text-base font-semibold text-gray-800">{goal.title}</span>
                          {isNeglected && (
                            <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              No Q2 tasks
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {q1Tasks > 0 && (
                            <span className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm">
                              <span className="text-xs font-normal opacity-90">Q1:</span>
                              {q1Tasks}
                            </span>
                          )}
                          {goalCount.q2Count > 0 && (
                            <span className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm">
                              <span className="text-xs font-normal opacity-90">Q2:</span>
                              {goalCount.q2Count}
                            </span>
                          )}
                          <span className="text-sm font-semibold text-gray-700 min-w-[50px] text-right">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full transition-all bg-green-600"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {goalCount.count} task{goalCount.count !== 1 ? 's' : ''} total
                      </div>
                    </div>
                  );
                })}
              </div>

              {neglectedGoals.length > 0 && (
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-900 font-medium mb-1">
                    Balance Check
                  </p>
                  <p className="text-sm text-orange-800">
                    Consider adding Quadrant 2 tasks for:{' '}
                    {neglectedGoals.map((gc, i) => {
                      const goal = goals.find(g => g.id === gc.goalId);
                      return (
                        <span key={gc.goalId}>
                          {i > 0 && ', '}
                          <strong>{goal?.title}</strong>
                        </span>
                      );
                    })}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <div className="space-y-3">
            {roles.map(role => {
              const roleCount = roleCounts.find(rc => rc.roleId === role.id);
              if (!roleCount) return null;

              const percentage = totalActiveTasks > 0 ? (roleCount.count / totalActiveTasks) * 100 : 0;
              const isNeglected = roleCount.q2Count === 0 && roleCount.count === 0;
              const IconComponent = (Icons as any)[role.icon] || Icons.Circle;

              const q1Tasks = roleCount.count - roleCount.q2Count;

              return (
                <div key={role.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: role.color }}
                      />
                      <span className="text-base font-semibold text-gray-800">{role.name}</span>
                      {isNeglected && (
                        <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          No Q2 tasks
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {q1Tasks > 0 && (
                        <span className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm">
                          <span className="text-xs font-normal opacity-90">Q1:</span>
                          {q1Tasks}
                        </span>
                      )}
                      {roleCount.q2Count > 0 && (
                        <span
                          className="flex items-center gap-1 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm"
                          style={{ backgroundColor: role.color }}
                        >
                          <span className="text-xs font-normal opacity-90">Q2:</span>
                          {roleCount.q2Count}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-700 min-w-[50px] text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: role.color,
                      }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {roleCount.count} task{roleCount.count !== 1 ? 's' : ''} total
                  </div>
                </div>
              );
            })}
          </div>

          {neglectedRoles.length > 0 && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-900 font-medium mb-1">
                Balance Check
              </p>
              <p className="text-sm text-orange-800">
                Consider adding Quadrant 2 tasks for:{' '}
                {neglectedRoles.map((rc, i) => {
                  const role = roles.find(r => r.id === rc.roleId);
                  return (
                    <span key={rc.roleId}>
                      {i > 0 && ', '}
                      <strong>{role?.name}</strong>
                    </span>
                  );
                })}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
