import { Check, Clock, MoreHorizontal, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Todo } from '../../types';
import { useToggleTodoComplete, useDeleteTodo } from '../../hooks/useTodos';

interface TimelineTaskCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  compact?: boolean;
}

const priorityColors = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-gray-400',
};

const priorityDots = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-gray-400',
};

export function TimelineTaskCard({ todo, onEdit, compact }: TimelineTaskCardProps) {
  const toggleComplete = useToggleTodoComplete();
  const deleteTodo = useDeleteTodo();
  const classColor = todo.classes?.color || '#6366f1';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComplete.mutate({ id: todo.id, completed: !todo.completed, todo });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTodo.mutate(todo.id);
  };

  // Compact view - just a pill with the task name
  if (compact) {
    return (
      <div
        onClick={() => onEdit(todo)}
        className={`
          group inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs
          cursor-pointer transition-all hover:shadow-md
          ${todo.completed ? 'opacity-50' : ''}
        `}
        style={{
          backgroundColor: `${classColor}15`,
          border: `1px solid ${classColor}40`,
        }}
      >
        {/* Priority dot */}
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDots[todo.priority]}`} />
        
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`
            flex-shrink-0 w-3.5 h-3.5 rounded-full border flex items-center justify-center
            transition-colors
            ${todo.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 hover:border-indigo-500'}
          `}
        >
          {todo.completed && <Check size={8} />}
        </button>

        {/* Title */}
        <span
          className={`font-medium truncate max-w-[150px] ${
            todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
          }`}
        >
          {todo.title}
        </span>

        {/* Time if available */}
        {todo.due_date && (
          <span className="text-gray-500 flex-shrink-0">
            {format(parseISO(todo.due_date), 'h:mm a')}
          </span>
        )}

        {/* Delete on hover */}
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity flex-shrink-0"
        >
          <Trash2 size={12} />
        </button>
      </div>
    );
  }

  // Full view
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
          role="checkbox"
          aria-checked={todo.completed}
          aria-label={todo.completed ? `Mark "${todo.title}" as incomplete` : `Mark "${todo.title}" as complete`}
          className={`
            flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center
            transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            ${
              todo.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-indigo-500'
            }
          `}
        >
          {todo.completed && <Check size={12} aria-hidden="true" />}
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
                <Clock size={10} aria-hidden="true" />
                <span className="sr-only">Due at </span>
                {format(parseISO(todo.due_date), 'h:mm a')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            aria-label={`Delete "${todo.title}"`}
            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            aria-label={`Edit "${todo.title}"`}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <MoreHorizontal size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
