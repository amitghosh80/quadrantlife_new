import { useState } from 'react';
import { AlertCircle, Calendar, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { Task } from '../lib/supabase';

interface NotificationBannerProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function NotificationBanner({ tasks, onTaskClick }: NotificationBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const getNotificationTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const overdue: Task[] = [];
    const dueToday: Task[] = [];
    const dueThisWeek: Task[] = [];

    tasks.forEach(task => {
      if (!task.due_date || task.completed) return;

      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        overdue.push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        dueToday.push(task);
      } else if (dueDate < endOfWeek) {
        dueThisWeek.push(task);
      }
    });

    dueThisWeek.sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

    return { overdue, dueToday, dueThisWeek };
  };

  const { overdue, dueToday, dueThisWeek } = getNotificationTasks();

  if (overdue.length === 0 && dueToday.length === 0 && dueThisWeek.length === 0) {
    return null;
  }

  const getQuadrantLabel = (task: Task) => {
    if (task.is_urgent && task.is_important) return 'Do First';
    if (!task.is_urgent && task.is_important) return 'Schedule';
    if (task.is_urgent && !task.is_important) return 'Delegate';
    return 'Eliminate';
  };

  const getQuadrantColor = (task: Task) => {
    if (task.is_urgent && task.is_important) return 'bg-red-500';
    if (!task.is_urgent && task.is_important) return 'bg-blue-500';
    if (task.is_urgent && !task.is_important) return 'bg-amber-500';
    return 'bg-gray-500';
  };

  return (
    <div className="mb-6 md:mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between bg-white border-2 border-gray-300 rounded-lg px-4 py-3 mb-3 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h2 className="font-semibold text-gray-900">Overdue Tasks</h2>
          <span className="text-sm text-gray-600">
            ({overdue.length + dueToday.length + dueThisWeek.length} total)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {isExpanded && (
        <>
          {overdue.length > 0 && (
            <div className="bg-red-100 border-2 border-red-400 rounded-xl p-4 sm:p-5 mb-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="bg-red-700 text-white p-2 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-red-950 mb-2">
                Overdue Tasks ({overdue.length})
              </h3>
              <div className="space-y-2">
                {overdue.map(task => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="w-full text-left bg-white border border-red-300 rounded-lg p-3 hover:bg-red-50 hover:border-red-400 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getQuadrantColor(task)}`}></div>
                          <span className="text-xs text-red-800 font-medium">{getQuadrantLabel(task)}</span>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-red-900 break-words">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-700 font-medium flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {new Date(task.due_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {dueToday.length > 0 && (
        <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-4 sm:p-5 mb-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="bg-amber-700 text-white p-2 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-amber-950 mb-2">
                Due Today ({dueToday.length})
              </h3>
              <div className="space-y-2">
                {dueToday.map(task => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="w-full text-left bg-white border border-amber-300 rounded-lg p-3 hover:bg-amber-50 hover:border-amber-400 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getQuadrantColor(task)}`}></div>
                          <span className="text-xs text-amber-800 font-medium">{getQuadrantLabel(task)}</span>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-amber-900 break-words">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-700 font-medium flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        <span className="hidden sm:inline">Today</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {dueThisWeek.length > 0 && (
        <div className="bg-blue-100 border-2 border-blue-400 rounded-xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="bg-blue-700 text-white p-2 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-blue-950 mb-2">
                Due This Week ({dueThisWeek.length})
              </h3>
              <div className="space-y-2">
                {dueThisWeek.map(task => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="w-full text-left bg-white border border-blue-300 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-400 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getQuadrantColor(task)}`}></div>
                          <span className="text-xs text-blue-800 font-medium">{getQuadrantLabel(task)}</span>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-blue-900 break-words">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-blue-700 font-medium flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {new Date(task.due_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
