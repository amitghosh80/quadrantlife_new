import { useState, useEffect } from 'react';
import { X, Gem, Check, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Task } from '../lib/supabase';
import { loadTodayRocks, saveTodayRocks } from '../utils/dailyRocks';

interface BigRocksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onCreateTask?: () => void;
}

const MAX_ROCKS = 3;

export default function BigRocksModal({ isOpen, onClose, onComplete, onCreateTask }: BigRocksModalProps) {
  const [q2Tasks, setQ2Tasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTaskIds([]);
      loadData();
    }
  }, [isOpen]);

  async function loadData() {
    setLoading(true);
    try {
      const [suggestionsRes, existingRocks] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('completed', false)
          .eq('is_urgent', false)
          .eq('is_important', true)
          .order('created_at', { ascending: false }),
        loadTodayRocks(),
      ]);

      setQ2Tasks(suggestionsRes.data || []);
      setSelectedTaskIds(existingRocks.map(rock => rock.task_id));
    } catch (error) {
      console.error('Error loading rock suggestions:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleTask(taskId: string) {
    setSelectedTaskIds(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      }
      if (prev.length >= MAX_ROCKS) return prev;
      return [...prev, taskId];
    });
  }

  function removeFromSlot(taskId: string) {
    setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
  }

  async function handleSave() {
    if (selectedTaskIds.length === 0) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await saveTodayRocks(user.id, selectedTaskIds);
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving rocks:', error);
      alert('Failed to save your rocks. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  const remainingSlots = MAX_ROCKS - selectedTaskIds.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Gem className="w-7 h-7 text-indigo-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Today's Big Rocks</h2>
              <p className="text-sm text-gray-600">
                Put the important, not-urgent work in first — before the day fills up.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition flex-shrink-0">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-500 py-16">Loading rocks...</div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Your jar</h3>
                  <span className="text-sm text-gray-500">
                    {selectedTaskIds.length}/{MAX_ROCKS} rocks committed
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Array.from({ length: MAX_ROCKS }).map((_, index) => {
                    const taskId = selectedTaskIds[index];
                    const task = q2Tasks.find(t => t.id === taskId);
                    return (
                      <div
                        key={index}
                        className={`rounded-lg border-2 p-3 min-h-[72px] flex items-center gap-2 ${
                          taskId ? 'border-indigo-400 bg-indigo-50' : 'border-dashed border-gray-300 bg-gray-50'
                        }`}
                      >
                        {taskId && task ? (
                          <>
                            <Gem className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                            <p className="text-sm font-medium text-gray-800 flex-1 min-w-0 break-words">{task.title}</p>
                            <button
                              onClick={() => removeFromSlot(taskId)}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white transition flex-shrink-0"
                              aria-label={`Remove ${task.title} from rocks`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400 w-full">
                            <Gem className="w-5 h-5 flex-shrink-0 opacity-40" />
                            <span className="text-sm">Empty slot</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Suggested from your Q2 tasks</h3>
                  <span className="text-sm text-gray-500">
                    {remainingSlots > 0 ? `${remainingSlots} slot${remainingSlots !== 1 ? 's' : ''} remaining` : 'Jar is full'}
                  </span>
                </div>

                {q2Tasks.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-600 mb-1">No suggested Q2 tasks yet.</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Big Rocks are important but not urgent — tasks that grow your roles and goals.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {q2Tasks.map(task => {
                      const isSelected = selectedTaskIds.includes(task.id);
                      return (
                        <div
                          key={task.id}
                          className={`flex items-center gap-3 rounded-lg border-2 p-3 ${
                            isSelected ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 break-words">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-gray-500 line-clamp-1 break-words">{task.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => toggleTask(task.id)}
                            disabled={!isSelected && selectedTaskIds.length >= MAX_ROCKS}
                            className={`p-2 rounded-lg transition touch-manipulation flex-shrink-0 disabled:opacity-40 ${
                              isSelected
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            aria-label={`Toggle ${task.title} as a rock`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {onCreateTask && (
                  <button
                    onClick={onCreateTask}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Create a new Q2 task
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-6 border-t flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={selectedTaskIds.length === 0 || saving}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Plan My Day'}
          </button>
        </div>
      </div>
    </div>
  );
}