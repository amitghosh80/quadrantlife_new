import { Gem, Check, X, Plus } from 'lucide-react';
import { TodayRock } from '../utils/dailyRocks';

interface TodayRocksBarProps {
  rocks: TodayRock[];
  hasPlan: boolean;
  onToggleComplete: (rock: TodayRock, completed: boolean) => void;
  onRemove: (rock: TodayRock) => void;
  onEdit: () => void;
}

export default function TodayRocksBar({ rocks, hasPlan, onToggleComplete, onRemove, onEdit }: TodayRocksBarProps) {
  if (!hasPlan) return null;

  const completedCount = rocks.filter(rock => rock.completed_at || rock.task.completed).length;

  return (
    <div className="mb-6 md:mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg px-4 sm:px-6 py-4 text-white">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Gem className="w-5 h-5 flex-shrink-0" />
          <h2 className="font-semibold whitespace-nowrap">Today's Big Rocks</h2>
          {rocks.length > 0 && (
            <span className="text-sm text-indigo-100 whitespace-nowrap">
              {completedCount}/{rocks.length} done
            </span>
          )}
        </div>
        <button
          onClick={onEdit}
          className="px-3 py-1.5 bg-white text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-50 transition flex-shrink-0"
          title="Edit today's rocks"
        >
          {rocks.length > 0 ? 'Edit Rocks' : 'Choose Rocks'}
        </button>
      </div>

      {rocks.length === 0 ? (
        <div className="bg-white/10 rounded-lg p-4 text-sm text-indigo-100">
          No rocks chosen yet today. Pick 1-3 important, not-urgent tasks to commit to first.
        </div>
      ) : (
        <div className="space-y-2">
          {rocks.map((rock, index) => {
            const completed = !!rock.completed_at || rock.task.completed;
            return (
              <div
                key={rock.id}
                className={`flex items-center gap-3 bg-white/10 rounded-lg px-3 py-2.5 ${completed ? 'opacity-70' : ''}`}
              >
                <span className="text-xs font-bold text-indigo-200 flex-shrink-0">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium break-words ${completed ? 'line-through text-indigo-200' : ''}`}>
                    {rock.task.title}
                  </p>
                </div>
                <button
                  onClick={() => onToggleComplete(rock, !completed)}
                  className={`p-2 rounded-lg transition touch-manipulation flex-shrink-0 ${
                    completed
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-white text-indigo-700 hover:bg-indigo-50'
                  }`}
                  title={completed ? 'Mark rock incomplete' : 'Mark rock complete'}
                >
                  <Check className="w-4 h-4" />
                </button>
                {!completed && (
                  <button
                    onClick={() => onRemove(rock)}
                    className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition touch-manipulation flex-shrink-0"
                    title="Remove rock"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rocks.length > 0 && rocks.length < 3 && (
        <button
          onClick={onEdit}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add Rock
        </button>
      )}
    </div>
  );
}