import { useState } from 'react';
import { X } from 'lucide-react';
import { RoleSelector } from './RoleSelector';
import { GoalSelector } from './GoalSelector';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string, isUrgent: boolean, isImportant: boolean, dueDate: string | null, roleIds: string[], goalIds: string[]) => void;
  quadrant: { urgent: boolean; important: boolean } | null;
}

export default function AddTaskModal({ isOpen, onClose, onAdd, quadrant }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  if (!isOpen || !quadrant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title, description, quadrant.urgent, quadrant.important, dueDate || null, selectedRoleIds, selectedGoalIds);
      setTitle('');
      setDescription('');
      setDueDate('');
      setSelectedRoleIds([]);
      setSelectedGoalIds([]);
      onClose();
    }
  };

  const getQuadrantName = () => {
    if (quadrant.urgent && quadrant.important) return 'Do First';
    if (!quadrant.urgent && quadrant.important) return 'Schedule';
    if (quadrant.urgent && !quadrant.important) return 'Delegate';
    return 'Eliminate';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate pr-2">
            Add Task - {getQuadrantName()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0 touch-manipulation"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter task title"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (optional)
            </label>
            <input
              id="dueDate"
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

          {quadrant && (quadrant.urgent && quadrant.important || !quadrant.urgent && quadrant.important) && (
            <div>
              <GoalSelector
                selectedGoalIds={selectedGoalIds}
                onChange={setSelectedGoalIds}
                quadrant={quadrant.urgent && quadrant.important ? 1 : 2}
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
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
