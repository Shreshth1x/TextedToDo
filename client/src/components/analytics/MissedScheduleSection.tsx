import { AlertCircle, Clock } from 'lucide-react';
import { parseISO, formatDistanceToNow } from 'date-fns';
import type { Todo } from '../../types';

interface MissedScheduleSectionProps {
  missedTasks: Todo[];
  onTaskClick: (todo: Todo) => void;
}

export function MissedScheduleSection({ missedTasks, onTaskClick }: MissedScheduleSectionProps) {
  if (missedTasks.length === 0) {
    return (
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2 text-green-700">
          <Clock size={18} />
          <span className="text-sm font-medium">All caught up!</span>
        </div>
        <p className="text-xs text-green-600 mt-1">No overdue tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle size={18} />
        <span className="text-sm font-medium">Overdue ({missedTasks.length})</span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {missedTasks.slice(0, 5).map((task) => (
          <button
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="w-full text-left p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
            <div className="flex items-center gap-2 mt-1">
              {task.classes && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: `${task.classes.color}20`,
                    color: task.classes.color,
                  }}
                >
                  {task.classes.name}
                </span>
              )}
              {task.due_date && (
                <span className="text-xs text-red-600">
                  {formatDistanceToNow(parseISO(task.due_date), { addSuffix: true })}
                </span>
              )}
            </div>
          </button>
        ))}

        {missedTasks.length > 5 && (
          <p className="text-xs text-gray-500 text-center py-2">
            +{missedTasks.length - 5} more overdue tasks
          </p>
        )}
      </div>
    </div>
  );
}
