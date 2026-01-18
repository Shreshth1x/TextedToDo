import { Check, Clock, MoreHorizontal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Todo } from '../../types';
import { useToggleTodoComplete } from '../../hooks/useTodos';

interface TimelineTaskCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

const priorityColors = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-gray-400',
};

export function TimelineTaskCard({ todo, onEdit }: TimelineTaskCardProps) {
  const toggleComplete = useToggleTodoComplete();
  const classColor = todo.classes?.color || '#6366f1';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComplete.mutate({ id: todo.id, completed: !todo.completed, todo });
  };

  return (
    <div
      onClick={() => onEdit(todo)}
      className={`
        group relative bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md
        transition-all cursor-pointer p-3
        ${priorityColors[todo.priority]}
        ${todo.completed ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          className={`
            flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center
            transition-colors
            ${
              todo.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-indigo-500'
            }
          `}
        >
          {todo.completed && <Check size={12} />}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium text-gray-900 truncate ${
              todo.completed ? 'line-through text-gray-500' : ''
            }`}
          >
            {todo.title}
          </p>

          <div className="flex items-center gap-2 mt-1">
            {todo.classes && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${classColor}20`,
                  color: classColor,
                }}
              >
                {todo.classes.icon || '📚'} {todo.classes.name}
              </span>
            )}
            {todo.due_date && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Clock size={10} />
                {format(parseISO(todo.due_date), 'h:mm a')}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(todo);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 rounded transition-opacity"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
