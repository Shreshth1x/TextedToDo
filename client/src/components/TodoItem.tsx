import { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Check, Clock, MoreHorizontal, Pencil, Trash2, Repeat } from 'lucide-react';
import { ClassBadge } from './ClassBadge';
import { useToggleTodoComplete, useDeleteTodo } from '../hooks/useTodos';
import type { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

const priorityStyles = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-gray-400',
};

export function TodoItem({ todo, onEdit }: TodoItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleComplete = useToggleTodoComplete();
  const deleteTodo = useDeleteTodo();

  const handleToggle = () => {
    toggleComplete.mutate({
      id: todo.id,
      completed: !todo.completed,
      todo,
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      deleteTodo.mutate(todo.id);
    }
    setMenuOpen(false);
  };

  const getDueDateStyles = () => {
    if (!todo.due_date || todo.completed) return 'text-gray-500';
    const dueDate = new Date(todo.due_date);
    if (isPast(dueDate) && !isToday(dueDate)) return 'text-red-600';
    if (isToday(dueDate)) return 'text-amber-600';
    return 'text-gray-500';
  };

  return (
    <div
      className={`
        group bg-white border border-gray-200 rounded-lg
        border-l-4 ${priorityStyles[todo.priority]}
        transition-all hover:shadow-sm
        ${todo.completed ? 'opacity-60' : ''}
      `}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={toggleComplete.isPending}
          className={`
            mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0
            flex items-center justify-center transition-colors
            ${
              todo.completed
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-300 hover:border-indigo-500'
            }
          `}
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed && <Check size={12} strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`
                text-gray-900 font-medium break-words
                ${todo.completed ? 'line-through text-gray-500' : ''}
              `}
            >
              {todo.title}
            </h3>

            {/* Actions menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && menuOpen) {
                    setMenuOpen(false);
                  }
                }}
                className="p-1 text-gray-400 hover:text-gray-600 focus:text-gray-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Task options"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
                    role="menu"
                    aria-label="Task actions"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setMenuOpen(false);
                      }
                    }}
                  >
                    <button
                      onClick={() => {
                        onEdit(todo);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      role="menuitem"
                    >
                      <Pencil size={14} aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                      role="menuitem"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {todo.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {todo.description}
            </p>
          )}

          {/* Meta info */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {/* Class badge */}
            {todo.classes && <ClassBadge classInfo={todo.classes} />}

            {/* Due date */}
            {todo.due_date && (
              <span className={`flex items-center gap-1 ${getDueDateStyles()}`}>
                <Clock size={14} />
                {format(new Date(todo.due_date), 'MMM d, yyyy')}
                {todo.due_date.includes('T') && !todo.due_date.includes('T00:00:00') && (
                  <span className="text-xs">
                    {format(new Date(todo.due_date), 'h:mm a')}
                  </span>
                )}
              </span>
            )}

            {/* Recurring indicator */}
            {todo.recurrence_type && (
              <span className="flex items-center gap-1 text-gray-500">
                <Repeat size={14} />
                {todo.recurrence_type}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
