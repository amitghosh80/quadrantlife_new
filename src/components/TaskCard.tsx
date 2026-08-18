import { Trash2, Check, Calendar, Pencil, Target } from 'lucide-react';
import { Task } from '../lib/supabase';
import { Role, Goal } from '../types';
import * as Icons from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  roles?: Role[];
  goals?: Goal[];
}

export default function TaskCard({ task, onDelete, onToggleComplete, onEdit, roles = [], goals = [] }: TaskCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString || task.completed) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const overdue = isOverdue(task.due_date);

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border-2 p-2 hover:shadow-md transition ${
      task.completed ? 'border-green-200 bg-green-50/90' : overdue ? 'border-red-200 bg-red-50/90' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold text-gray-800 mb-0.5 break-words ${
            task.completed ? 'line-through text-gray-500' : ''
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-xs text-gray-600 break-words mb-0.5 ${
              task.completed ? 'line-through text-gray-400' : ''
            }`}>
              {task.description}
            </p>
          )}
          {task.due_date && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${
              task.completed
                ? 'text-gray-400'
                : overdue
                ? 'text-red-600 font-medium'
                : 'text-gray-500'
            }`}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.due_date)}</span>
              {overdue && <span className="ml-1 text-red-600">(Overdue)</span>}
            </div>
          )}
          {(roles.length > 0 || goals.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {roles.length > 0 && roles.map(role => {
                const IconComponent = (Icons as any)[role.icon] || Icons.Circle;
                return (
                  <span
                    key={role.id}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: `${role.color}10`,
                      color: role.color,
                      opacity: 0.75,
                    }}
                  >
                    <IconComponent className="w-2.5 h-2.5" />
                    <span className="text-[10px]">{role.name}</span>
                  </span>
                );
              })}
              {goals.length > 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-md">
                  <Target className="w-3 h-3 text-green-600 flex-shrink-0" />
                  <span className="text-[10px] font-medium text-green-700">
                    {goals.map(g => g.title).join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onToggleComplete(task.id, !task.completed)}
            className={`p-1.5 rounded-lg transition touch-manipulation ${
              task.completed
                ? 'bg-green-100 text-green-600 hover:bg-green-200 active:bg-green-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
            }`}
            title={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 active:bg-blue-300 rounded-lg transition touch-manipulation"
            title="Edit task"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300 rounded-lg transition touch-manipulation"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
