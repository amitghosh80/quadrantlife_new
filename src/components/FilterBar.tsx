import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Role, Goal } from '../types';
import { Filter, X, Target } from 'lucide-react';
import * as Icons from 'lucide-react';

interface FilterBarProps {
  selectedRoleIds: string[];
  selectedGoalIds: string[];
  onRoleFilterChange: (roleIds: string[]) => void;
  onGoalFilterChange: (goalIds: string[]) => void;
}

export function FilterBar({
  selectedRoleIds,
  selectedGoalIds,
  onRoleFilterChange,
  onGoalFilterChange,
}: FilterBarProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadFilters();
  }, []);

  async function loadFilters() {
    try {
      const [rolesRes, goalsRes] = await Promise.all([
        supabase.from('roles').select('*').order('sort_order', { ascending: true }),
        supabase.from('goals').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      ]);

      if (rolesRes.data) setRoles(rolesRes.data);
      if (goalsRes.data) setGoals(goalsRes.data);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  }

  function toggleRole(roleId: string) {
    if (selectedRoleIds.includes(roleId)) {
      onRoleFilterChange(selectedRoleIds.filter(id => id !== roleId));
    } else {
      onRoleFilterChange([...selectedRoleIds, roleId]);
    }
  }

  function toggleGoal(goalId: string) {
    if (selectedGoalIds.includes(goalId)) {
      onGoalFilterChange(selectedGoalIds.filter(id => id !== goalId));
    } else {
      onGoalFilterChange([...selectedGoalIds, goalId]);
    }
  }

  function clearFilters() {
    onRoleFilterChange([]);
    onGoalFilterChange([]);
  }

  const hasActiveFilters = selectedRoleIds.length > 0 || selectedGoalIds.length > 0;
  const selectedRoles = roles.filter(r => selectedRoleIds.includes(r.id));
  const selectedGoals = goals.filter(g => selectedGoalIds.includes(g.id));

  return (
    <div className="relative">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition text-sm font-medium shadow-sm"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
              {selectedRoleIds.length + selectedGoalIds.length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <>
            {selectedRoles.map(role => {
              const IconComponent = (Icons as any)[role.icon] || Icons.Circle;
              return (
                <span
                  key={role.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shadow-sm"
                  style={{
                    backgroundColor: `${role.color}15`,
                    borderColor: role.color,
                    color: role.color,
                    border: '1.5px solid',
                  }}
                >
                  <IconComponent className="w-3 h-3" />
                  {role.name}
                  <button
                    onClick={() => toggleRole(role.id)}
                    className="ml-0.5 hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            {selectedGoals.map(goal => (
              <span
                key={goal.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 border-green-500 text-green-700 rounded-full text-xs font-medium whitespace-nowrap shadow-sm"
                style={{ border: '1.5px solid' }}
              >
                <Target className="w-3 h-3" />
                {goal.title}
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className="ml-0.5 hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap px-2"
            >
              Clear all
            </button>
          </>
        )}
      </div>

      {showFilters && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-3">
          <div>
            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Filter by Role</h3>
            <div className="flex flex-wrap gap-2">
              {roles.map(role => {
                const isSelected = selectedRoleIds.includes(role.id);
                const IconComponent = (Icons as any)[role.icon] || Icons.Circle;
                return (
                  <button
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isSelected ? 'shadow-sm' : 'hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${role.color}15` : '#f3f4f6',
                      borderColor: isSelected ? role.color : 'transparent',
                      color: isSelected ? role.color : '#4b5563',
                      border: '2px solid',
                    }}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    {role.name}
                  </button>
                );
              })}
            </div>
          </div>

          {goals.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Filter by Goal</h3>
              <div className="flex flex-wrap gap-2">
                {goals.map(goal => {
                  const isSelected = selectedGoalIds.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-green-100 border-2 border-green-500 text-green-700 shadow-sm'
                          : 'bg-gray-100 border-2 border-transparent text-gray-700 hover:shadow-sm'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      {goal.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
