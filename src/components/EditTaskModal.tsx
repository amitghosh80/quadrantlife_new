import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { RoleSelector } from './RoleSelector';
import { GoalSelector } from './GoalSelector';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, title: string, description: string, isUrgent: boolean, isImportant: boolean, dueDate: string | null, roleIds: string[], goalIds: string[]) => void;
  task: Task | null;
}

export default function EditTaskModal({ isOpen, onClose, onUpdate, task }: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDueDate(task.due_date || '');
      setIsUrgent(task.is_urgent);
      setIsImportant(task.is_important);
      loadTaskRelations(task.id);
    }
  }, [task]);

  async function loadTaskRelations(taskId: string) {
    try {
      const rolesRes = await supabase.from('task_roles').select('role_id').eq('task_id', taskId);

      if (rolesRes.data) {
        setSelectedRoleIds(rolesRes.data.map(r => r.role_id));
      }

      const goalsRes = await supabase.from('task_goals').select('goal_id').eq('task_id', taskId);

      if (goalsRes.data) {
        setSelectedGoalIds(goalsRes.data.map(g => g.goal_id));
      } else {
        setSelectedGoalIds([]);
      }
    } catch (error) {
      console.error('Error loading task relations:', error);
    }
  }

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onUpdate(task.id, title, description, isUrgent, isImportant, dueDate || null, selectedRoleIds, selectedGoalIds);
      onClose();
    }
  };

  const getQuadrantName = () => {
    if (isUrgent && isImportant) return 'Do First';
    if (!isUrgent && isImportant) return 'Schedule';
    if (isUrgent && !isImportant) return 'Delegate';
    return 'Eliminate';
  };

  const getQuadrantColor = () => {
    if (isUrgent && isImportant) return 'bg-red-500';
    if (!isUrgent && isImportant) return 'bg-blue-500';
    if (isUrgent && !isImportant) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getQuadrantColor()}`}></div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Task</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-gray-600">
              Quadrant: <span className="font-semibold text-gray-900">{getQuadrantName()}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Urgent</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Important</span>
            </label>
          </div>

          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter task title"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (optional)
            </label>
            <input
              id="edit-dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <RoleSelector
              selectedRoleIds={selectedRoleIds}
              onChange={setSelectedRoleIds}
              label="Assign to Life Roles"
            />
          </div>

          {(isUrgent && isImportant || !isUrgent && isImportant) && (
            <div>
              <GoalSelector
                selectedGoalIds={selectedGoalIds}
                onChange={setSelectedGoalIds}
                quadrant={isUrgent && isImportant ? 1 : 2}
                label="Link to Goals"
              />
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition font-medium touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition font-medium touch-manipulation"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
