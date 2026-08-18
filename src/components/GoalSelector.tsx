import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Goal } from '../types';
import { Target, X } from 'lucide-react';

interface GoalSelectorProps {
  selectedGoalIds: string[];
  onChange: (goalIds: string[]) => void;
  quadrant: 1 | 2 | 3 | 4;
  label?: string;
  showLabel?: boolean;
}

export function GoalSelector({ selectedGoalIds, onChange, quadrant, label = 'Link to Goals', showLabel = true }: GoalSelectorProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const isQ1OrQ2 = quadrant === 1 || quadrant === 2;

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleGoal(goalId: string) {
    if (selectedGoalIds.includes(goalId)) {
      onChange([]);
    } else {
      onChange([goalId]);
    }
  }

  if (!isQ1OrQ2) {
    return null;
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading goals...</div>;
  }

  if (goals.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
        <p className="font-medium mb-1">No active goals yet</p>
        <p className="text-yellow-700">
          Create goals in the Goals section to link them to your important tasks.
        </p>
      </div>
    );
  }

  const selectedGoals = goals.filter(g => selectedGoalIds.includes(g.id));

  return (
    <div>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          <span className="ml-2 text-xs font-normal text-gray-500">(Quadrant {quadrant} tasks)</span>
        </label>
      )}

      {selectedGoals.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedGoals.map((goal) => (
            <div
              key={goal.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border-2 border-green-500 rounded-full text-sm font-medium text-green-700"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="max-w-[200px] truncate">{goal.title}</span>
              <button
                onClick={() => toggleGoal(goal.id)}
                className="ml-0.5 hover:opacity-70 transition-opacity"
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {goals.map((goal) => {
          const isSelected = selectedGoalIds.includes(goal.id);

          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'bg-green-50 border-green-500 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-2">
                <Target
                  className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    isSelected ? 'text-green-600' : 'text-gray-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isSelected ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {goal.title}
                  </p>
                  {goal.description && (
                    <p className={`text-xs mt-0.5 ${
                      isSelected ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedGoalIds.length === 0 && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
          <p className="font-medium mb-0.5">Recommended: Link this task to a goal</p>
          <p className="text-blue-700">
            Important tasks should ladder up to your meaningful goals. Select one or more above.
          </p>
        </div>
      )}
    </div>
  );
}
